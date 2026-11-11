// Unit tests for splitting extracted page text into spoken sentences (src/content/sentences.ts).
// Some tests document known limitations on purpose ("characterization"): they pin the current
// behaviour so a future change to it is a conscious decision, not an accident.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { MAX_WORDS_PER_CHUNK, splitSentences } from "../src/content/sentences.ts";

const words = (n, from = 1) => Array.from({ length: n }, (_, i) => `w${from + i}`);
const wordCount = (s) => s.split(/\s+/).length;

describe("splitSentences: sentence boundaries", () => {
  test("splits after . ! ? followed by whitespace", () => {
    assert.deepEqual(splitSentences("One. Two! Three? Four."), ["One.", "Two!", "Three?", "Four."]);
  });

  test("does not split inside decimals or dotted numbers (no whitespace after the dot)", () => {
    assert.deepEqual(splitSentences("Cena 3.5 zł, wersja 1.2.0 jest gotowa."), ["Cena 3.5 zł, wersja 1.2.0 jest gotowa."]);
  });

  test("a date that ends a sentence still splits correctly", () => {
    assert.deepEqual(
      splitSentences("Promocja trwa do 13.09. To dobry moment."),
      ["Promocja trwa do 13.09.", "To dobry moment."],
    );
  });

  test("text without sentence punctuation stays one chunk", () => {
    assert.deepEqual(splitSentences("Sprawdź przecenione produkty"), ["Sprawdź przecenione produkty"]);
  });

  test("KNOWN LIMITATION: an abbreviation followed by a space is treated as a sentence end", () => {
    assert.deepEqual(splitSentences("Zobacz np. Gmail. Dalej."), ["Zobacz np.", "Gmail.", "Dalej."]);
  });
});

describe("splitSentences: blocks and whitespace", () => {
  test("a blank line is a hard boundary, even without punctuation (titles, buttons, list items)", () => {
    assert.deepEqual(splitSentences("Title\n\nBody text here\n\nKup teraz"), ["Title", "Body text here", "Kup teraz"]);
  });

  test("a single newline (a <br>) stays inside the sentence", () => {
    assert.deepEqual(splitSentences("Line one\nline two."), ["Line one\nline two."]);
  });

  test("trims chunks and drops empty ones", () => {
    assert.deepEqual(splitSentences("  \n\n   \n\n  A.  \n\n\n\n  B.  "), ["A.", "B."]);
  });

  test("empty and whitespace-only input give no sentences", () => {
    assert.deepEqual(splitSentences(""), []);
    assert.deepEqual(splitSentences(" \n\n \t "), []);
  });
});

describe("splitSentences: long chunks", () => {
  const commaEvery10 = (n) =>
    words(n).map((w, i) => ((i + 1) % 10 === 0 && i + 1 < n ? `${w},` : w)).join(" ");

  test("a chunk over the limit is broken at commas, never above the limit", () => {
    const chunks = splitSentences(commaEvery10(130));
    assert.deepEqual(chunks.map(wordCount), [60, 60, 10]);
    assert.ok(chunks.slice(0, -1).every((c) => c.endsWith(",")), "pieces end at the comma boundaries");
  });

  test("the limit is a parameter (default MAX_WORDS_PER_CHUNK)", () => {
    assert.equal(MAX_WORDS_PER_CHUNK, 60);
    assert.deepEqual(splitSentences(commaEvery10(30), 20).map(wordCount), [20, 10]);
  });

  test("a chunk at exactly the limit is left alone", () => {
    assert.deepEqual(splitSentences(commaEvery10(60)).map(wordCount), [60]);
  });

  test("KNOWN LIMITATION: a long chunk with no commas/newlines cannot be broken", () => {
    assert.deepEqual(splitSentences(words(100).join(" ")).map(wordCount), [100]);
  });

  test("no words are lost or reordered when breaking", () => {
    const input = commaEvery10(175);
    assert.equal(splitSentences(input).join(" "), input);
  });
});

// The sentence list that produced the real "highlight goes dark / jumps" report: Gmail's text
// extraction inlines image alt text, so the logo ("Shelter.pl"), the banner ("Back to School")
// and the product cards arrive as their own blocks and become their own spoken sentences.
describe("splitSentences: a marketing email as Gmail extraction delivers it", () => {
  const email = [
    "Shelter.pl",
    "Back to School",
    "Wakacje się kończą, a w Shelter.pl właśnie ruszamy z Back to School - promocją, do 13.09. To dobry moment, żeby zadbać o swoje stanowisko przed powrotem do szkoły, na uczelnię czy do biura.",
    "W akcji znajdziesz setki produktów, w tym sprzęt takich marek jak Gravastar, Nuphy, Akko, Aula, Keychron, Lofree i wiele innych.",
    "Sprawdź przecenione produkty",
    "Keychron Q3 Max QMK\n\n1 149,00 zł 919,00 zł\n\nKup teraz",
    "Keychron - G3 Ultra Light\n\n549,00 zł 499,00 zł\n\nKup teraz",
  ].join("\n\n");

  test("blocks become separate sentences, alt-text phantoms included, in reading order", () => {
    assert.deepEqual(splitSentences(email), [
      "Shelter.pl",
      "Back to School",
      "Wakacje się kończą, a w Shelter.pl właśnie ruszamy z Back to School - promocją, do 13.09.",
      "To dobry moment, żeby zadbać o swoje stanowisko przed powrotem do szkoły, na uczelnię czy do biura.",
      "W akcji znajdziesz setki produktów, w tym sprzęt takich marek jak Gravastar, Nuphy, Akko, Aula, Keychron, Lofree i wiele innych.",
      "Sprawdź przecenione produkty",
      "Keychron Q3 Max QMK",
      "1 149,00 zł 919,00 zł",
      "Kup teraz",
      "Keychron - G3 Ultra Light",
      "549,00 zł 499,00 zł",
      "Kup teraz",
    ]);
  });

  test("the repeated button text appears once per product card", () => {
    assert.equal(splitSentences(email).filter((s) => s === "Kup teraz").length, 2);
  });
});
