# Changelog

Format: one `## <version>` section per release, newest first. While a version is being prepared its heading says `(unreleased)`; the release workflow refuses to publish a tag whose section still says so. `npm run check` fails when the manifest version has no section here.

## 1.0.0 (unreleased)

The first version. It reads any page, email or selection aloud with the browser's own voices and highlights each sentence and word as it goes.

### Reading
- **Read anything:** full pages, Gmail messages (extraction tuned for Gmail's DOM, including image alt text and emoji), conversation layouts, or just a selection. Readability is used for articles, plain text-node walking for HTML emails.
- **Sentence and word highlighting** with the CSS Custom Highlight API, so nothing is injected into the page DOM. Four colour presets (Amber, Midnight, Forest, Paper).
- **Selection trigger:** select two or more words and a small "Read it louder!" pill appears next to the cursor; it lives in a closed shadow root so its text never leaks into page extraction. Keyboard operable.
- **Voices:** every voice the browser offers, automatic language detection (Polish and English from the text itself, then the page language), pinned favourites, speed from 0.25x to 5x.
- **Sentence navigation** (previous / next sentence) with a reading-time estimate that is recalibrated from the measured speaking rate.
- **Cross-tab aware:** starting playback in one tab pauses the others.
- **Keyboard shortcut** `Alt+Shift+L` shows or hides the panel.

### Highlighting that stays on the right text
- Repeated text (a "Buy now" under every item of an email list) now resolves in reading order instead of jumping back to the first occurrence.
- Word highlighting follows the spoken word: a short word such as "do" no longer lights up inside an earlier word such as "dobry"; duplicate boundary events from the speech engine are ignored.
- On Gmail the search index includes the same image alt text as the spoken text, so image-only content (logos, banners) no longer throws off the highlight of the paragraphs after it.
- Following the highlight keeps the active sentence centred, but gets out of the way as soon as you scroll yourself and resumes only once the reading has caught up with where you scrolled to.

### Interface
- A draggable floating widget (collapsed pill, control bar, settings, voice and speed panels) in dark, light or system theme, built in a Shadow DOM so page CSS cannot touch it.
- Accessibility pass: labelled controls, keyboard navigation, focus management for the popovers, WCAG AA text contrast.
- Voices can be chosen with the keyboard (each voice is a real button; the pin button shows when focused), the popup buttons report whether their popup is open (`aria-expanded`), and the selected speed, theme, highlight colour and voice are announced (`aria-pressed`).
- Honours the OS "reduce motion" setting: panel animations are skipped and the page follows the reading without smooth scrolling.

### Privacy and security
- Preferences are stored locally with `chrome.storage.local` and nothing is ever transmitted. The widget no longer loads a web font from Google (it uses the system font stack).
- Permissions: `storage`, `contextMenus`, `activeTab`, `scripting` and access to all sites (needed to read whichever page you choose). The list is frozen by a release check and explained on the privacy page.
- No network APIs, `eval` or HTML injection other than static icons are allowed in the source (checked in CI).

### Browsers
- Chrome, Edge and Brave 112+. A Firefox / Zen 140+ build is produced from the same code (new, not yet in daily use).

### Project
- MIT licence, third-party notices for the bundled Readability (Apache-2.0).
- TypeScript, esbuild; unit tests (`node:test`, jsdom) for the text matching, sentence splitting, language detection and DOM text extraction, including a real marketing email as a fixture; CI with release checks; Dependabot.
- Landing page with a live demo and a privacy policy page.
- Store screenshots, promo tiles, the social preview and the website images are rendered by `npm run render` from the real extension running on a demo article (no third-party content), so they can be re-taken whenever the UI changes.
