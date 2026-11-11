/**
 * Text-matching core of the highlighter: finds where each spoken sentence (and each
 * spoken word) lives inside the page's text. Pure — no DOM, no chrome.* — so it can be
 * unit-tested under plain Node (`npm test`). content.ts owns the DOM side: it builds
 * the text from the page's text nodes and turns the positions found here into Ranges.
 *
 * Keep this file free of non-erasable TypeScript (enums, namespaces, constructor
 * parameter properties): the tests import it directly and Node only strips types.
 */

export interface Span { start: number; end: number }

/**
 * Searchable view of the page text, plus a forward "anchor" that keeps repeated text
 * (a "Buy now" on every item of an email list) resolving in reading order.
 */
export class TextIndex {
  /** Raw concatenated text — positions match what content.ts maps back onto DOM nodes. */
  readonly fullText: string;
  /** fullText with U+00A0 → U+0020 (same length, positions preserved). */
  readonly searchText: string;
  /** searchText with every whitespace run collapsed to one space (for <br>/<p> gaps). */
  readonly collapsedText: string;
  /** collapsedText[i] → position in fullText. Strictly increasing. */
  readonly collapsedPosMap: number[];

  /**
   * Lower bound for sentence lookups: the end of the last successful match. Searching
   * from 0 every time would re-find the *first* of several identical sentences no matter
   * which one is being read. Advanced by findSentenceRange(); reset on a real
   * discontinuity (new content, skip-back) via resetAnchor().
   */
  searchAnchor = 0;
  /**
   * Start of the last matched sentence. Survives pauses, so a resume can rewind the
   * anchor to it (rewindToLastMatch) and land on the same occurrence again instead of
   * skipping to the next repeat.
   */
  lastMatchStart = -1;

  constructor(fullText = "") {
    this.fullText = fullText;
    this.searchText = fullText.replace(/ /g, " ");

    let collapsed = "";
    const map: number[] = [];
    let inWhitespace = false;
    for (let i = 0; i < this.searchText.length; i++) {
      if (/\s/.test(this.searchText[i])) {
        if (!inWhitespace) { map.push(i); collapsed += " "; }
        inWhitespace = true;
      } else {
        map.push(i);
        collapsed += this.searchText[i];
        inWhitespace = false;
      }
    }
    this.collapsedText = collapsed;
    this.collapsedPosMap = map;
  }

  /**
   * First index in collapsedPosMap whose fullText position is >= pos. Lets the tier 2/3
   * lookups apply the same forward bias as tier 1's indexOf(s, pos). Returns
   * collapsedPosMap.length ("past the end") when pos is beyond every entry, so a
   * too-far-forward anchor fails instead of silently wrapping back to the start.
   */
  collapsedIndexFrom(pos: number): number {
    if (pos === 0) return 0;
    const i = this.collapsedPosMap.findIndex(p => p >= pos);
    return i >= 0 ? i : this.collapsedPosMap.length;
  }

  /**
   * Three-tier sentence search, forward from the anchor. Returns { start, end } in
   * fullText positions and advances the anchor, or null (anchor untouched).
   *   Tier 1: exact match on the NBSP-normalised text.
   *   Tier 2: whitespace-collapsed match — <br>/<p> boundaries that innerText renders as
   *           "\n" have no character in the raw text nodes.
   *   Tier 3: as tier 2 with emoji stripped from the search term — Gmail renders emoji as
   *           <img alt="…">, which the spoken text contains but no text node does.
   * There is deliberately no wrap-around to the start: a repeated sentence with no
   * further occurrence ahead must fail, not jump back to an earlier one.
   */
  findSentenceRange(sentence: string): Span | null {
    const s = sentence.replace(/ /g, " ");

    // Tier 1
    let start = this.searchText.indexOf(s, this.searchAnchor);
    if (start >= 0) {
      const end = start + s.length;
      this.searchAnchor = end;
      return { start, end };
    }

    // Tier 2
    const sc = s.replace(/\s+/g, " ").trim();
    const ci = this.collapsedText.indexOf(sc, this.collapsedIndexFrom(this.searchAnchor));
    if (ci >= 0) {
      start = this.collapsedPosMap[ci];
      const endCollapsed = ci + sc.length - 1;
      const end = endCollapsed < this.collapsedPosMap.length
        ? this.collapsedPosMap[endCollapsed] + 1
        : this.fullText.length;
      this.searchAnchor = end;
      return { start, end };
    }

    // Tier 3
    const se = sc
      .replace(/\p{Extended_Pictographic}/gu, "") // base emoji code points
      .replace(/[︀-️‍]/g, "")      // variation selectors (FE0F etc.) + ZWJ
      .replace(/\s+/g, " ").trim();
    if (!se || se === sc) return null; // no emoji in the term — tier 2 already failed
    const ci3 = this.collapsedText.indexOf(se, this.collapsedIndexFrom(this.searchAnchor));
    if (ci3 < 0) return null;
    start = this.collapsedPosMap[ci3];
    const endC3 = ci3 + se.length - 1;
    const end3 = endC3 < this.collapsedPosMap.length
      ? this.collapsedPosMap[endC3] + 1
      : this.fullText.length;
    this.searchAnchor = end3;
    return { start, end: end3 };
  }

  /** Pause/resume of the sentence in progress: search from its own start again. */
  rewindToLastMatch(): void {
    if (this.lastMatchStart >= 0) this.searchAnchor = this.lastMatchStart;
  }

  /** A real discontinuity (skip-back, leapfrogging skip-forward): match anywhere again. */
  resetAnchor(): void {
    this.searchAnchor = 0;
  }
}

/**
 * Word-level matching inside one located sentence. The speech engine reports each word as
 * (charIndex, text); this finds it in the page text, always searching *forward* from the
 * end of the previous word. Searching from the sentence start every time made a short
 * word like "do" match its first occurrence — the "do" inside the earlier "dobry" —
 * instead of the standalone word later on.
 */
export class WordCursor {
  private readonly text: string;
  private pos: number;
  private lastKey = "";

  constructor(searchText: string, sentenceStart: number) {
    this.text = searchText;
    this.pos = sentenceStart;
  }

  /**
   * Position of `word` in the page text, or -1 when it is not found (emoji expansion,
   * alt-text word). Returns null for an exact repeat of the previous event — some engines
   * fire the same boundary several times — which the caller should ignore.
   */
  match(word: string, charIndex: number): number | null {
    const key = `${charIndex}:${word}`;
    if (key === this.lastKey) return null;
    this.lastKey = key;
    const at = this.text.indexOf(word, this.pos);
    if (at >= 0) this.pos = at + word.length;
    return at;
  }
}
