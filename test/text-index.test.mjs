// Unit tests for the text-matching core of the highlighter (src/content/text-index.ts).
// Pure logic, no browser: `npm test`. Several tests are regressions for bugs that were found
// on real pages; the comment on each says which.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { TextIndex, WordCursor } from "../src/content/text-index.ts";

const text = (index, span) => index.fullText.slice(span.start, span.end);

describe("TextIndex.findSentenceRange", () => {
  test("tier 1: finds an exact sentence and advances the anchor past it", () => {
    const index = new TextIndex("Intro. Second sentence. Third one.");
    const span = index.findSentenceRange("Second sentence.");
    assert.deepEqual(span, { start: 7, end: 23 });
    assert.equal(index.searchAnchor, 23);
  });

  test("tier 1: a non-breaking space in the page matches a normal space in the sentence", () => {
    const page = "Do 13.09 trwa promocja.";
    const index = new TextIndex(page);
    const span = index.findSentenceRange("Do 13.09 trwa promocja.");
    assert.equal(text(index, span), page); // the span points into the ORIGINAL text
  });

  // Regression: a "Buy now" under every item of an email list used to resolve to the FIRST
  // one every time, so the highlight (and the scroll) kept jumping back to the top.
  test("identical sentences resolve in reading order", () => {
    const index = new TextIndex("Buy now. Item B. Buy now. Item C. Buy now.");
    const starts = ["Buy now.", "Item B.", "Buy now.", "Item C.", "Buy now."]
      .map((s) => index.findSentenceRange(s).start);
    assert.deepEqual(starts, [0, 9, 17, 26, 34]);
  });

  test("no further occurrence ahead: fails instead of wrapping to an earlier one", () => {
    const index = new TextIndex("Buy now. Item B.");
    assert.ok(index.findSentenceRange("Buy now."));
    assert.equal(index.findSentenceRange("Buy now."), null);
  });

  test("a failed lookup leaves the anchor where it was", () => {
    const index = new TextIndex("One. Two.");
    index.findSentenceRange("One.");
    const before = index.searchAnchor;
    assert.equal(index.findSentenceRange("Missing."), null);
    assert.equal(index.searchAnchor, before);
  });

  test("tier 2: <br>/<p> gaps in the page (several newlines) match a single space", () => {
    const index = new TextIndex("Hello\n\nworld. Next.");
    const span = index.findSentenceRange("Hello world.");
    assert.equal(text(index, span), "Hello\n\nworld.");
  });

  test("tier 3: emoji that Gmail renders as <img> are absent from the page text", () => {
    const index = new TextIndex("Hi there. Bye.");
    const span = index.findSentenceRange("Hi \u{1F590}️ there.");
    assert.equal(text(index, span), "Hi there.");
  });

  // Regression: Gmail's spoken text inlines image alt text, but the search index used to be
  // built from text nodes only. A "sentence" that was just a logo's alt text then matched the
  // same words inside the first real paragraph, pushed the anchor past that paragraph's start,
  // and the real sentence found nothing (no highlight until the next one).
  describe("alt text inlined into the spoken text", () => {
    const body = "Wakacje się kończą, a w Shelter.pl właśnie ruszamy z Back to School - promocją, do 13.09.";
    const spoken = ["Shelter.pl", "Back to School", body, "To dobry moment."];

    test("index that includes the alt text: every sentence lands on its own position", () => {
      const index = new TextIndex(`Shelter.pl Back to School ${body} To dobry moment.`);
      const spans = spoken.map((s) => index.findSentenceRange(s));
      assert.deepEqual(spans.map((s) => s.start), [0, 11, 26, 26 + body.length + 1]);
      assert.equal(text(index, spans[2]), body);
    });

    test("index WITHOUT the alt text (the old behaviour): the real sentence is lost", () => {
      const index = new TextIndex(`${body} To dobry moment.`);
      const spans = spoken.map((s) => index.findSentenceRange(s));
      assert.ok(spans[0] && spans[1], "the phantom sentences match words inside the paragraph");
      assert.equal(spans[2], null, "…which moves the anchor past the paragraph start");
    });
  });

  test("resume: rewinding to the last match finds the same occurrence again", () => {
    const index = new TextIndex("Buy now. Item B. Buy now. Item C.");
    index.findSentenceRange("Buy now.");
    index.findSentenceRange("Item B.");
    const second = index.findSentenceRange("Buy now.");
    index.lastMatchStart = second.start; // what content.ts records after a successful match

    index.rewindToLastMatch();
    assert.deepEqual(index.findSentenceRange("Buy now."), second);
  });

  test("resume without rewinding would skip to the next repeat (why rewindToLastMatch exists)", () => {
    const index = new TextIndex("Buy now. Item B. Buy now.");
    index.findSentenceRange("Buy now.");
    const second = index.findSentenceRange("Buy now.");
    assert.equal(index.findSentenceRange("Buy now."), null);
    assert.ok(second);
  });

  test("resetAnchor (skip-back) allows matching from the start again", () => {
    const index = new TextIndex("Buy now. Item B. Buy now.");
    index.findSentenceRange("Buy now.");
    index.findSentenceRange("Buy now.");
    index.resetAnchor();
    assert.equal(index.findSentenceRange("Buy now.").start, 0);
  });

  test("rewindToLastMatch does nothing before any match", () => {
    const index = new TextIndex("Anything.");
    index.searchAnchor = 5;
    index.rewindToLastMatch();
    assert.equal(index.searchAnchor, 5);
  });

  test("tier 2/3 respect the anchor too (no silent wrap to the start)", () => {
    const index = new TextIndex("Same\nline. Other. Same\nline.");
    assert.equal(index.findSentenceRange("Same line.").start, 0);
    assert.equal(index.findSentenceRange("Same line.").start, 18);
    assert.equal(index.findSentenceRange("Same line."), null);
  });
});

describe("TextIndex.collapsedIndexFrom", () => {
  const index = new TextIndex("ab  cd"); // collapsed "ab cd", positions 0,1,2,4,5
  test("0 maps to 0", () => assert.equal(index.collapsedIndexFrom(0), 0));
  test("maps a text position to the first collapsed index at or after it", () => {
    assert.equal(index.collapsedIndexFrom(1), 1);
    assert.equal(index.collapsedIndexFrom(3), 3); // 3 is inside the whitespace run: next is position 4
  });
  test("beyond the end returns the length, so the search fails instead of wrapping", () => {
    assert.equal(index.collapsedIndexFrom(99), index.collapsedPosMap.length);
  });
});

describe("WordCursor", () => {
  const sentence = "To dobry moment, żeby zadbać o swoje stanowisko przed powrotem do szkoły, na uczelnię czy do biura.";
  const boundaries = [...sentence.matchAll(/\p{L}+/gu)].map((m) => ({ word: m[0], charIndex: m.index }));

  // Regression: the short words "o" and "do" were matched from the sentence start every time,
  // so they highlighted the "o" inside "dobry" (and its "do") instead of the standalone words.
  test("short words resolve to their own occurrence, not to a prefix of an earlier word", () => {
    const cursor = new WordCursor(sentence, 0);
    const found = boundaries.map((b) => ({ word: b.word, at: cursor.match(b.word, b.charIndex) }));
    // every word is found exactly where the speech engine said it was
    assert.deepEqual(found.map((f) => f.at), boundaries.map((b) => b.charIndex));
  });

  test("a duplicate boundary event is ignored (null) and does not move the cursor", () => {
    const cursor = new WordCursor("promocją, do 13.09. Dalej", 0);
    const first = cursor.match("do 13.09", 10);
    assert.equal(first, 10);
    assert.deepEqual([cursor.match("do 13.09", 10), cursor.match("do 13.09", 10), cursor.match("do 13.09", 10)], [null, null, null]);
    assert.equal(cursor.match("Dalej", 20), 20);
  });

  test("a word that is not on the page returns -1 and does not move the cursor", () => {
    const cursor = new WordCursor("alpha beta gamma", 0);
    assert.equal(cursor.match("alpha", 0), 0);
    assert.equal(cursor.match("\u{1F590}", 6), -1);
    assert.equal(cursor.match("beta", 6), 6);
  });

  test("the same word repeated moves forward through the text", () => {
    const cursor = new WordCursor("na na na", 0);
    assert.deepEqual([cursor.match("na", 0), cursor.match("na", 3), cursor.match("na", 6)], [0, 3, 6]);
  });

  test("starts searching at the sentence start, not at the beginning of the page", () => {
    const page = "do do do. Real sentence do it.";
    const cursor = new WordCursor(page, 10);
    assert.equal(cursor.match("do", 14), 24);
  });
});
