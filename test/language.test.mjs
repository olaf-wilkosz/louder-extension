// Unit tests for the text-based language guess (src/content/language.ts). It decides which
// voice gets picked automatically, so the thresholds are pinned here.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { detectLanguageFromText } from "../src/content/language.ts";

describe("detectLanguageFromText", () => {
  test("a short Polish selection is caught by a low diacritics threshold (3 under 200 chars)", () => {
    assert.equal(detectLanguageFromText("Cześć, świecie"), "pl");
  });

  test("Polish prose", () => {
    assert.equal(detectLanguageFromText("Wakacje się kończą, a w Shelter.pl właśnie ruszamy z promocją. To dobry moment, żeby zadbać o swoje stanowisko przed powrotem do szkoły, na uczelnię czy do biura."), "pl");
  });

  test("English prose (two or more English stopwords)", () => {
    assert.equal(detectLanguageFromText("This is a text that you can read in the browser."), "en");
  });

  test("a long text needs 8 Polish diacritics, not 3", () => {
    const filler = "x".repeat(250);
    assert.equal(detectLanguageFromText(`${filler} ąęćńłó`), null); // 6 diacritics, no English
    assert.equal(detectLanguageFromText(`${filler} ąęćńłóśż`), "pl"); // 8
  });

  test("Polish wins over English stopwords once the diacritics threshold is met", () => {
    assert.equal(detectLanguageFromText("To jest the best ąęć"), "pl");
  });

  test("one English stopword is not enough", () => {
    assert.equal(detectLanguageFromText("Kup teraz"), null);
    assert.equal(detectLanguageFromText("Item and"), null);
  });

  test("inconclusive text returns null so the caller can use the page/browser language", () => {
    assert.equal(detectLanguageFromText("12345"), null);
    assert.equal(detectLanguageFromText(""), null);
  });

  test("only the first 1500 characters are sampled", () => {
    const text = "x".repeat(1500) + "ąęćńłóśżźąęćń";
    assert.equal(detectLanguageFromText(text), null);
  });
});
