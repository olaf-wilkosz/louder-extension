/**
 * Language guess from the text itself. Pure — the caller (content.ts) falls back to the
 * page's declared language and then the browser's when this is inconclusive. Unit-tested
 * under plain Node (`npm test`); keep it free of non-erasable TypeScript.
 */
export function detectLanguageFromText(text: string): "pl" | "en" | null {
  const sample = text.slice(0, 1500);
  // Polish diacritics — scale threshold with text length so short selections
  // (e.g. "Cześć," with 3 diacritics) are caught without requiring 8+
  const plDiacritics = (sample.match(/[ąęóśżźćńłĄĘÓŚŻŹĆŃŁ]/g) ?? []).length;
  const plThreshold = sample.length < 200 ? 3 : 8;
  if (plDiacritics >= plThreshold) return "pl";
  // English stopwords — unique to English; 2+ in a sentence is reliable
  const enWords = (sample.toLowerCase()
    .match(/\b(the|and|of|to|is|it|in|that|you|for|are|was|this|with|have|from|they|be|or|but|not|we|can|an|at|by|as|do|go|if|no|so)\b/g) ?? []).length;
  if (enWords >= 2) return "en";
  return null;
}
