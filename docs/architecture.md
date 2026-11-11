# Architecture

Louder reads a web page (or a selection) aloud with the browser's own speech engine and highlights the sentence and word being spoken. There is no server, no account and no network request of its own: everything happens in the page and in the browser.

## Pieces

| Part | Source | Runs in | Job |
|---|---|---|---|
| Content script | `src/content/content.ts` (bundled to `content.js`) | every page, isolated world | widget UI, text extraction, speech, highlighting, selection trigger |
| Text index | `src/content/text-index.ts` | (pure, imported by the content script) | find where a spoken sentence / word lives in the page text |
| Sentence splitter | `src/content/sentences.ts` | (pure) | cut text into speakable chunks (max 60 words) |
| Language detection | `src/content/language.ts` | (pure) | guess Polish / English from the text, else `null` |
| DOM text | `src/content/dom-text.ts` | (DOM, no `chrome.*`) | walk visible text nodes; Gmail body text; offsets -> `Range` |
| Background | `src/background/background.ts` | service worker (Chrome) / event page (Firefox) | context menu, toolbar button, injects the content script on demand, keepalive port |

The pure modules and `dom-text.ts` import nothing from the page or from `chrome.*` and use only erasable TypeScript, so `npm test` runs them directly under Node (type stripping, jsdom for the DOM parts). `content.ts` is the glue and is not unit-tested; keep logic that can be tested out of it.

The widget lives in a Shadow DOM (CSS isolation). The selection trigger has its own closed Shadow DOM so its text never leaks into page-content extraction tools. Highlighting uses the CSS Custom Highlight API (`CSS.highlights`), so nothing is inserted into the page's DOM.

## Reading a page

1. **Extract** (`extractText`), first rule that yields text wins:
   1. Gmail message bodies (`.ii.gt`), with image `alt` text inlined;
   2. conversation UIs (two or more `<article>` / content-dense `<section>` elements);
   3. newsletter-style HTML (`<font>` tags, deeply nested tables): the plain node walker, because Readability drops button and small-font text there;
   4. Readability, trusted only if `scoreExtraction` says it kept enough text;
   5. `<main>` / `[role=main]`;
   6. the node walker over `document.body`.
2. **Split** into sentence chunks (`splitSentences`).
3. **Index** (`buildNodeCache`): collect the visible text nodes under `getHighlightRoot()` (the same root the extraction used) and build a `TextIndex` over their concatenated text.
4. **Speak** sentence by sentence (`speakFrom`): look the sentence up in the index, highlight its range, speak it with `SpeechSynthesisUtterance`, and on each `onboundary` word event highlight the word. `onend` moves on to the next sentence.

A `ttsGeneration` counter is captured by every utterance's callbacks; a stop, skip or restart bumps it so callbacks of an old chain do nothing.

## Why the matching is shaped the way it is

The spoken text and the page's text nodes are not the same string, and the page may repeat itself. Each rule below exists because of a real page that broke without it (and is pinned by a test in `test/`).

- **Three-tier sentence lookup** (`TextIndex.findSentenceRange`). Tier 1 is an exact match on the text with U+00A0 mapped to a space (same length, so positions stay valid). Tier 2 collapses whitespace runs, because `<br>` / `<p>` boundaries are a newline in the spoken text but no character in the text nodes. Tier 3 also strips emoji from the search term, because Gmail renders emoji as `<img alt>`: the spoken text has them, no text node does.
- **`searchAnchor`: always search forward.** A "Buy now" repeated on every item of an email must highlight the item being read, not the first one. The anchor is the end of the last match; lookups start there. There is deliberately **no wrap-around**: a repeat with no further occurrence must fail (no highlight) rather than jump back to an earlier copy.
- **`lastMatchStart` / `rewindToLastMatch`: pause and resume.** Resuming re-speaks the current sentence; the anchor is rewound to that sentence's own start so it lands on the same occurrence instead of the next repeat.
- **`resetAnchor`: real discontinuities.** A skip back, or a skip forward that leapfrogs a sentence, makes "forward from the last match" meaningless, so the next lookup may match anywhere.
- **`WordCursor`: words are also searched forward.** The engine reports each word as `(charIndex, text)`. Searching from the sentence start made a short word such as "do" match the "do" inside the earlier "dobry". The cursor searches from the end of the previous word, and returns `null` for an exact repeat of the previous event (some engines fire a boundary twice) and `-1` for a word that is not in the page text (emoji expansion, alt text), which clears the stale word highlight.
- **Alt text must be in both places or neither.** For Gmail the spoken text includes image alt text (marketing emails are mostly images with good alt text), so `collectTextNodes({ inlineImageAlt: true })` puts the same alt text, with the same trailing space, into the indexed text, and `rangeInNodes` maps offsets that fall inside alt text to the surrounding nodes. If the two texts drift apart, every later highlight is shifted. A test builds the same DOM both ways and asserts the invariant.

## Scrolling

The current sentence is scrolled into view, but once the user scrolls by hand (to look at an image while listening) the following stops, with no timeout, and resumes only when the highlight is back in their viewport. Our own scroll animation is flagged (`autoScrolling`) so it does not count as the user's.

## Several tabs and the service worker

- Starting playback in a tab writes `louder_playing_owner` (a per-instance id) to `chrome.storage.local`; other tabs see the change and pause.
- Preferences (voice, speed, theme, highlight preset, position) are in `chrome.storage.local`. Nothing is synced or sent anywhere.
- The content script keeps a port open to the background script (`louder-keepalive`). The port closing is normal (the worker went to sleep, or the page entered the back/forward cache), so it reconnects; if `connect()` throws, the extension was removed or reloaded and the old script removes its widget and stops speaking. Every disconnect handler reads `chrome.runtime.lastError` so the browser does not log it as unchecked.
- The context menu entry is re-created from scratch on install (`removeAll`, then `create`), because `onInstalled` also fires on reload and a duplicate id would be an error.
- The toolbar button and the context menu message the content script; if it is not there yet (a tab opened before the extension was installed) the background script injects `content.js` and retries. Browser-internal pages (`chrome://`, `about:`) are skipped.

## Chrome and Firefox from one source

`manifest.json` is the Chrome (service worker) manifest. `scripts/manifest-targets.mjs` derives the Firefox one: `background.scripts` (an event page) instead of `service_worker`, the add-on id, `strict_min_version`, and `data_collection_permissions` declaring that nothing is collected. The code is the same; the minimum versions live in `scripts/build-config.mjs`.

## What is guarded automatically

`npm run check` (CI on every push) freezes the permission list and host patterns, requires the privacy page to explain each permission, requires every bundled third-party package to be credited, and forbids network APIs, `eval`, HTML injection (apart from static icon constants) and remote URLs in `src/`. `npm run audit:site` holds the website to Lighthouse 100 for accessibility, best practices and SEO.

## Known limits (pinned by tests, not bugs we are hiding)

- The sentence splitter breaks after abbreviations such as "np." and a chunk of more than 60 words with no comma is cut at the limit.
- Social-icon `alt` text in emails is read as if it were a sentence, and an image's alt text is read before the product name next to it.
- Word highlighting needs a voice that fires `onboundary` word events; without one only the sentence is highlighted.
