// Tests for the DOM side of text extraction (src/content/dom-text.ts), run against jsdom.
// The marketing-email fixture is a trimmed, anonymised real Gmail message; the pipeline tests
// walk it end to end: spoken text -> sentences -> search index -> DOM Ranges.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { bodyTextFromNodes, collectTextNodes, gmailBodyText, rangeInNodes } from "../src/content/dom-text.ts";
import { splitSentences } from "../src/content/sentences.ts";
import { TextIndex } from "../src/content/text-index.ts";

const emailHtml = readFileSync(new URL("./fixtures/marketing-email.html", import.meta.url), "utf8");

const page = (bodyHtml, url = "https://example.com/") =>
  new JSDOM(`<!doctype html><html><body>${bodyHtml}</body></html>`, { url }).window.document;
const email = () => page(emailHtml, "https://mail.google.com/").querySelector(".ii.gt");
const norm = (s) => s.replace(/[\s ]+/g, " ").trim();

describe("visibility: hidden content is neither spoken nor indexed", () => {
  const doc = page(`
    <div id="r">
      <p>Visible</p>
      <p style="display:none">Gone by display</p>
      <p style="visibility:hidden">Gone by visibility</p>
      <div style="display:none"><p>Gone with its parent</p></div>
      <script>var secret = "script text";</script>
      <style>.x { color: red }</style>
      <p>Also visible</p>
    </div>`);
  const root = doc.getElementById("r");

  test("gmailBodyText", () => {
    assert.deepEqual(splitSentences(gmailBodyText(root)), ["Visible", "Also visible"]);
  });
  test("bodyTextFromNodes", () => {
    assert.deepEqual(splitSentences(bodyTextFromNodes(root)), ["Visible", "Also visible"]);
  });
  test("collectTextNodes", () => {
    const { text } = collectTextNodes(root, { inlineImageAlt: false });
    assert.ok(text.includes("Visible") && text.includes("Also visible"));
    assert.ok(!/Gone|script text|color: red/.test(text));
  });
});

describe("bodyTextFromNodes", () => {
  test("block boundaries become blank lines, inline elements do not", () => {
    const root = page(`<div id="r"><h1>Title</h1><p>One <b>two</b> three</p><ul><li>a</li><li>b</li></ul></div>`).getElementById("r");
    assert.equal(bodyTextFromNodes(root), "Title\n\nOne two three\n\na\n\nb");
  });

  test("whitespace right after a block boundary is dropped and runs of blank lines collapse", () => {
    const root = page(`<div id="r"><div>  </div>\n\n\n<div>A</div>\n   <div></div><div>B</div></div>`).getElementById("r");
    // the raw text keeps a trailing space before the blank line ("A \n\nB"); splitSentences trims it
    assert.deepEqual(splitSentences(bodyTextFromNodes(root)), ["A", "B"]);
  });

  test("img alt text is NOT part of it (the generic page path never speaks alt text)", () => {
    const root = page(`<div id="r"><p>Text</p><img alt="Logo"><p>More</p></div>`).getElementById("r");
    assert.equal(bodyTextFromNodes(root), "Text\n\nMore");
  });
});

describe("gmailBodyText", () => {
  test("inlines image alt text, each followed by a space so icon rows do not run together", () => {
    const root = page(`<div id="r"><div><img alt="facebook"><img alt="x"></div></div>`).getElementById("r");
    assert.equal(gmailBodyText(root), "facebook x");
  });

  test("images without alt text contribute nothing", () => {
    const root = page(`<div id="r"><p>A</p><img src="x.png"><img alt="  "><p>B</p></div>`).getElementById("r");
    assert.equal(gmailBodyText(root), "A\n\nB");
  });
});

describe("collectTextNodes", () => {
  const root = page(`<div id="r"><p>Before <b>bold</b></p><img alt="Banner"><p>After</p></div>`).getElementById("r");

  test("inlineImageAlt adds the alt text at its position, with no node entry of its own", () => {
    const { nodes, text } = collectTextNodes(root, { inlineImageAlt: true });
    assert.equal(text, "Before bold" + "Banner " + "After");
    assert.deepEqual(nodes.map((n) => [n.start, n.node.textContent]), [[0, "Before "], [7, "bold"], [18, "After"]]);
  });

  test("without it the text is the plain concatenation of the text nodes", () => {
    const { nodes, text } = collectTextNodes(root, { inlineImageAlt: false });
    assert.equal(text, "Before boldAfter");
    assert.deepEqual(nodes.map((n) => n.start), [0, 7, 11]);
  });

  test("every entry points at exactly its own text inside the combined text", () => {
    for (const inlineImageAlt of [true, false]) {
      const { nodes, text } = collectTextNodes(email(), { inlineImageAlt });
      for (const { node, start } of nodes) {
        assert.equal(text.slice(start, start + node.textContent.length), node.textContent);
      }
    }
  });
});

describe("rangeInNodes", () => {
  const root = page(`<div id="r"><p>Hello <b>big</b> world</p><img alt="Alt"><p>Tail</p></div>`).getElementById("r");
  const { nodes, text } = collectTextNodes(root, { inlineImageAlt: true }); // "Hello big worldAlt Tail"
  const at = (s) => text.indexOf(s);

  test("a span inside one text node", () => {
    const r = rangeInNodes(nodes, at("ello"), at("ello") + 4);
    assert.equal(r.toString(), "ello");
  });

  test("a span crossing several text nodes", () => {
    const r = rangeInNodes(nodes, at("big"), at("world") + 5);
    assert.equal(r.toString(), "big world");
    assert.equal(r.startContainer.textContent, "big");
    assert.equal(r.endContainer.textContent, " world");
  });

  test("a span ending exactly at the end of a node", () => {
    const r = rangeInNodes(nodes, at("Hello"), at("Hello") + 6);
    assert.equal(r.toString(), "Hello ");
  });

  test("a span that is only alt text has no DOM range", () => {
    assert.equal(rangeInNodes(nodes, at("Alt"), at("Alt") + 3), null);
  });

  test("a span past the end of the text has no DOM range", () => {
    assert.equal(rangeInNodes(nodes, text.length + 5, text.length + 9), null);
  });

  test("no nodes, no range", () => {
    assert.equal(rangeInNodes([], 0, 3), null);
  });
});

describe("marketing email: spoken text", () => {
  const spoken = splitSentences(gmailBodyText(email()));

  test("hidden preheader and UI injected by other extensions are not spoken", () => {
    const all = spoken.join("\n");
    assert.ok(!all.includes("Podgląd wiadomości"));
    assert.ok(!all.includes("Edytuj obraz") && !all.includes("Ukryj na razie"));
  });

  test("the full spoken sentence list, in reading order (image alt texts are their own sentences)", () => {
    assert.deepEqual(spoken, [
      "Shelter.pl",
      "Back to School",
      "Wakacje się kończą, a w Shelter.pl właśnie ruszamy z Back to School - promocją, do 13.09.",
      "To dobry moment, żeby zadbać o swoje stanowisko przed powrotem do szkoły, na uczelnię czy do biura.",
      "W akcji znajdziesz setki produktów, w tym sprzęt takich marek jak Gravastar, Nuphy, Akko, Aula, Keychron, Lofree i wiele innych.",
      "Sprawdź przecenione produkty",
      "Keychron - Q3 Max QMK/VIA Wireless Custom Mechanical Keyboard",
      "Keychron Q3 Max QMK",
      "1 149,00 zł 919,00 zł", // the &nbsp;s stay in the spoken text
      "Kup teraz",
      "Keychron - G3 Ultra Light Wireless Mouse",
      "Keychron - G3 Ultra Light",
      "549,00 zł 499,00 zł",
      "Kup teraz",
      "Nuphy - Air60 HE Magnetic Switch Gaming Keyboard",
      "Nuphy - Air60 HE Magnetic Switch",
      "529,00 zł 429,00 zł",
      "Kup teraz",
      "Kupuj, zbieraj XP i wymieniaj na rabaty!",
      "Dołącz do programu lojalnościowego i bądź Hero",
      "Sprawdź",
      "Sprawdź Bestsellery",
      "Sprawdź Nowości",
      "Odwiedź nasz sklep",
      "facebook",
      "instagram",
      "tiktok",
      "x",
      "youtube",
      "Shelter.pl  Ulica Przykładowa 1, 00-000 Miasto, Polska",
      "Nie chcesz już otrzymywać tych e-maili?",
      "Anuluj subskrypcję",
      "© 2026 Shelter.pl",
    ]);
  });
});

// The invariant the whole highlighter rests on: what is SPOKEN (gmailBodyText) and what is
// SEARCHED (collectTextNodes) are two walks of the same DOM, and must agree.
describe("marketing email: spoken text vs search index stay in sync", () => {
  const root = email();
  const spoken = splitSentences(gmailBodyText(root));
  const altTexts = new Set([...root.querySelectorAll("img[alt]")].map((i) => i.alt.trim()).filter(Boolean));

  const locate = (inlineImageAlt) => {
    const { nodes, text } = collectTextNodes(root, { inlineImageAlt });
    const index = new TextIndex(text);
    return spoken.map((sentence) => {
      const span = index.findSentenceRange(sentence);
      return { sentence, span, range: span ? rangeInNodes(nodes, span.start, span.end) : null };
    });
  };

  test("with alt text inlined (Gmail): every sentence is found, in reading order", () => {
    const found = locate(true);
    assert.deepEqual(found.filter((f) => !f.span).map((f) => f.sentence), []);
    const starts = found.map((f) => f.span.start);
    assert.deepEqual(starts, [...starts].sort((a, b) => a - b));
  });

  test("only alt-text-only sentences lack a DOM range; everything else highlights exactly its own text", () => {
    const found = locate(true);
    for (const { sentence, range } of found) {
      const isAltOnly = altTexts.has(sentence);
      if (isAltOnly && sentence !== "Shelter.pl") assert.equal(range, null, `${sentence} has no text node to highlight`);
      if (!isAltOnly) {
        assert.ok(range, `no range for: ${sentence}`);
        assert.equal(norm(range.toString()), norm(sentence));
      }
    }
  });

  test("the brand that is both a logo alt and body copy: first one is alt-only, the later ones highlight", () => {
    const found = locate(true).filter((f) => f.sentence.includes("Shelter.pl"));
    assert.equal(found[0].sentence, "Shelter.pl");
    assert.equal(found[0].range, null); // the logo's alt text
    assert.ok(found.slice(1).every((f) => f.range), "paragraph, address and footer all highlight");
  });

  // Regression for the reported bug: before the search index inlined alt text, the sentences that
  // were only alt text matched words inside the first paragraph, and the real paragraph was lost.
  test("WITHOUT inlining alt text (the old behaviour) the first real paragraph is not found", () => {
    const found = locate(false);
    const paragraph = found.find((f) => f.sentence.startsWith("Wakacje się kończą"));
    assert.equal(paragraph.span, null);
  });

  test("generic pages: bodyTextFromNodes + an index without alt text agree for every sentence", () => {
    const body = page(emailHtml).body;
    const sentences = splitSentences(bodyTextFromNodes(body));
    const { nodes, text } = collectTextNodes(body, { inlineImageAlt: false });
    const index = new TextIndex(text);
    for (const sentence of sentences) {
      const span = index.findSentenceRange(sentence);
      assert.ok(span, `not found: ${sentence}`);
      assert.equal(norm(rangeInNodes(nodes, span.start, span.end).toString()), norm(sentence));
    }
  });
});
