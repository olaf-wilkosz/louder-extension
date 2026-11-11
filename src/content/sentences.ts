/**
 * Splits extracted page text into the utterances that are spoken one by one (and
 * highlighted one by one). Pure — no DOM — so it is unit-tested under plain Node
 * (`npm test`). Keep it free of non-erasable TypeScript (enums, namespaces,
 * constructor parameter properties): the tests import it directly.
 */

/** A chunk longer than this (in words) is broken at commas/semicolons/colons/newlines. */
export const MAX_WORDS_PER_CHUNK = 60;

export function splitSentences(text: string, maxWords: number = MAX_WORDS_PER_CHUNK): string[] {
  // Step 0: split on double+ newlines (block section / paragraph boundaries)
  // first, so content from different email sections / paragraphs never gets
  // merged into one utterance. Single \n (e.g. from <br>) stays within a chunk.
  const sections = text.split(/\n{2,}/).map(s => s.trim()).filter(s => s.length > 0);

  const result: string[] = [];
  for (const section of sections) {
    // Primary split on sentence-ending punctuation within each section
    const primary = section.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);

    // Secondary split: break chunks longer than maxWords at
    // commas/semicolons/colons/newlines so a block of numbers or code
    // doesn't create a single utterance lasting minutes.
    for (const chunk of primary) {
      if (chunk.split(/\s+/).length <= maxWords) {
        result.push(chunk);
        continue;
      }
      const sub = chunk.split(/(?<=[,;:\n])\s+/).map(s => s.trim()).filter(s => s.length > 0);
      let current = "";
      for (const piece of sub) {
        const candidate = current ? `${current} ${piece}` : piece;
        if (candidate.split(/\s+/).length > maxWords && current) {
          result.push(current);
          current = piece;
        } else {
          current = candidate;
        }
      }
      if (current) result.push(current);
    }
  }
  return result;
}
