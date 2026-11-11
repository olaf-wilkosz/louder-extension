/**
 * The DOM side of text extraction: turning a page (or a Gmail message body) into the
 * text that is spoken, and into the list of text nodes that spoken positions are mapped
 * back onto for highlighting. Everything takes the root element and reaches the
 * document / window through it, so it runs unchanged against jsdom in `npm test`.
 *
 * IMPORTANT: gmailBodyText() (what is SPOKEN on Gmail) and collectTextNodes() (what is
 * SEARCHED and highlighted) are two walks of the same DOM that must stay in sync — e.g.
 * both inline image alt text on Gmail. The fixture-based tests assert that invariant.
 *
 * Keep this file free of non-erasable TypeScript (enums, namespaces, constructor
 * parameter properties): the tests import it directly and Node only strips types.
 */

// DOM constants, spelled out so this module needs no global NodeFilter / Node.
const SHOW_ELEMENT = 0x1;
const SHOW_TEXT = 0x4;
const FILTER_ACCEPT = 1;
const FILTER_REJECT = 2;
const ELEMENT_NODE = 1;

/** A text node and the position its first character has in the combined text. */
export interface TextNodeEntry { node: Text; start: number }

/**
 * NodeFilter shared by all the walkers here. FILTER_REJECT on hidden elements prunes
 * them AND all their children from the walk — keeps every walker in sync with what the
 * browser renders, and prevents display:none preheader text (or UI injected by other
 * extensions) from leaking into TTS or highlights.
 */
export const visibleFilter: NodeFilter = {
  acceptNode(node: Node): number {
    if (node.nodeType === ELEMENT_NODE) {
      const el = node as Element;
      const st = el.ownerDocument.defaultView!.getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden") return FILTER_REJECT;
    }
    return FILTER_ACCEPT;
  },
};

function walk(root: Element): TreeWalker {
  // SHOW_ELEMENT is required so visibleFilter can FILTER_REJECT hidden subtrees.
  return root.ownerDocument.createTreeWalker(root, SHOW_TEXT | SHOW_ELEMENT, visibleFilter);
}

/**
 * Walk a Gmail .ii.gt body element and return its text, including image alt text
 * (emoji that Gmail converts to <img>, but also banners/buttons/logos of newsletters,
 * which convey real content that way). innerText misses those.
 */
export function gmailBodyText(root: HTMLElement): string {
  const BLOCK = new Set([
    "P","DIV","BR","LI","TR","TD","TH","H1","H2","H3","H4","H5","H6",
    "BLOCKQUOTE","PRE","TABLE","THEAD","TBODY","TFOOT","CAPTION",
    "ARTICLE","SECTION","HEADER","FOOTER","MAIN",
  ]);
  const parts: string[] = [];
  let lastWasBlock = false;
  const walker = walk(root);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === ELEMENT_NODE) {
      const el = node as Element;
      if (BLOCK.has(el.tagName)) {
        if (!lastWasBlock && parts.length) parts.push("\n\n");
        lastWasBlock = true;
      }
      // Capture all meaningful alt text — not just emoji. Marketing/newsletter
      // emails often convey their actual content through images (banners,
      // buttons, icon rows) with properly authored alt text; skipping
      // non-emoji alts left those emails reading as nearly empty.
      // Trailing space guards against alt text running into adjacent text/alt
      // with no separating whitespace (e.g. icon rows with no gap between <img>s).
      if (el.tagName === "IMG") {
        const alt = ((el as HTMLImageElement).alt ?? "").trim();
        if (alt) {
          parts.push(`${alt} `);
          lastWasBlock = false;
        }
      }
    } else {
      const parent = (node as Text).parentElement;
      if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE")) continue;
      const t = (node as Text).textContent ?? "";
      const collapsed = t.replace(/\s+/g, " ");
      if (!collapsed.trim()) {
        if (lastWasBlock) continue;
        parts.push(collapsed);
      } else {
        parts.push(t);
        lastWasBlock = false;
      }
    }
  }
  return parts.join("").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Walk a root's text nodes and join them, inserting a newline whenever a block-level
 * element boundary is crossed. Semantically equivalent to innerText for content purposes
 * but excludes img alt text and other non-text-node content, keeping it in sync with
 * collectTextNodes() when `inlineImageAlt` is off.
 */
export function bodyTextFromNodes(root: Element): string {
  const BLOCK = new Set([
    "P","DIV","BR","LI","TR","TD","TH","H1","H2","H3","H4","H5","H6",
    "BLOCKQUOTE","PRE","ARTICLE","SECTION","HEADER","FOOTER","MAIN",
    "NAV","ASIDE","FIGURE","FIGCAPTION","TABLE","THEAD","TBODY","TFOOT",
    "CAPTION","DL","DT","DD","OL","UL","FORM","FIELDSET","ADDRESS","HR",
  ]);
  const parts: string[] = [];
  let lastWasBlock = false;
  const walker = walk(root);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === ELEMENT_NODE) {
      const tag = (node as Element).tagName;
      if (BLOCK.has(tag)) {
        if (!lastWasBlock && parts.length) parts.push("\n\n");
        lastWasBlock = true;
      }
    } else {
      // Text node — skip script/style content
      const parent = (node as Text).parentElement;
      if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE")) continue;
      const t = (node as Text).textContent ?? "";
      // Collapse whitespace-only runs at block boundaries
      const collapsed = t.replace(/\s+/g, " ");
      if (!collapsed.trim()) {
        if (lastWasBlock) continue; // skip leading space after block boundary
        parts.push(collapsed);
      } else {
        parts.push(t);
        lastWasBlock = false;
      }
    }
  }
  return parts.join("").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * The text nodes under `root` with the position of each in the combined text — the
 * search/highlight side (feeds TextIndex, and rangeInNodes turns positions back into DOM
 * Ranges).
 *
 * `inlineImageAlt`: on Gmail, gmailBodyText() (which builds the spoken sentences) inlines
 * meaningful img alt text into the extracted text. If that alt text isn't also reflected
 * here, a "sentence" containing it can't be found in the text at all — or worse,
 * coincidentally matches unrelated real text elsewhere (e.g. a brand name that is both a
 * logo's alt text and mentioned in the body copy), which throws off the forward search
 * anchor for every sentence after it. No node entry is added for the alt text itself
 * since there is no text node backing it to actually highlight.
 */
export function collectTextNodes(root: Element, opts: { inlineImageAlt: boolean }): { nodes: TextNodeEntry[]; text: string } {
  const nodes: TextNodeEntry[] = [];
  const parts: string[] = [];
  let pos = 0;
  const walker = walk(root);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeType === ELEMENT_NODE) {
      if (opts.inlineImageAlt && (n as Element).tagName === "IMG") {
        const alt = ((n as HTMLImageElement).alt ?? "").trim();
        if (alt) {
          const withSpace = `${alt} `;
          parts.push(withSpace);
          pos += withSpace.length;
        }
      }
      continue;
    }
    const textNode = n as Text;
    const parent = textNode.parentElement;
    if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE")) continue;
    const text = textNode.textContent ?? "";
    const len = text.length;
    if (len) { nodes.push({ node: textNode, start: pos }); parts.push(text); }
    pos += len;
  }
  return { nodes, text: parts.join("") };
}

/**
 * DOM Range covering [start, end) of the combined text, or null when the span has no
 * backing text node (alt text) or the Range cannot be built.
 */
export function rangeInNodes(nodes: TextNodeEntry[], start: number, end: number): Range | null {
  let sNode: Text | null = null, sOff = 0, eNode: Text | null = null, eOff = 0;
  for (const { node, start: ns } of nodes) {
    const ne = ns + (node.textContent?.length ?? 0);
    if (!sNode && ne > start) { sNode = node; sOff = start - ns; }
    if (!eNode && ne >= end)  { eNode = node; eOff = end   - ns; break; }
  }
  if (!sNode || !eNode) return null;
  try {
    const r = sNode.ownerDocument.createRange();
    r.setStart(sNode, Math.max(0, sOff));
    r.setEnd(eNode, Math.min(eNode.textContent?.length ?? 0, eOff));
    return r;
  } catch { return null; }
}
