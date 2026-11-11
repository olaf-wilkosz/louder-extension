# Store submission checklist

What is in this folder:

- `listing-copy.md`: the text for both stores (summary, description, supported browsers, category, privacy URL). The summary must equal `manifest.json` `description`; `npm run check` verifies it, and the character count.
- `icon-128.png`, `promo-small-440x280.png`, `promo-marquee-1400x560.png`: Chrome Web Store graphics.
- `screenshots/`: the store screenshots.

## Before every submission

1. Everything is merged to `main` and CI is green.
2. Bump the version in `manifest.json` **and** `package.json`; date the version's section in `CHANGELOG.md`.
3. Run the manual passes that apply: [accessibility](../docs/accessibility-testing.md) if the UI changed; load `dist/chrome` (and `dist/firefox`) and read a page, an email and a selection.
4. `git tag vX.Y.Z && git push --tags`. The release workflow builds both zips and attaches them to a GitHub Release.
5. Upload **from the GitHub Release**, not from a local build, so the store gets exactly what CI built.

## Chrome Web Store

- Upload `louder-X.Y.Z-chrome.zip`.
- Category: Productivity (or Accessibility, if offered). Language: English.
- Paste the summary and description from `listing-copy.md`.
- Privacy tab: single purpose (read web text aloud); one justification per permission (see "Permission justifications" below); declare **no data collected** and none sold or used for unrelated purposes; privacy policy URL `https://olaf-wilkosz.github.io/louder-extension/privacy.html`.
- Graphics: the icon, the small promo tile, the marquee, and the screenshots (1280x800 or 640x400).

## Firefox Add-ons (AMO)

- Upload `louder-X.Y.Z-firefox.zip`; the add-on id and the "no data collected" declaration are already in the manifest.
- Test first in Firefox 140+ (and Zen): the Firefox build comes from the same code but is newer and not yet in daily use. Load `dist/firefox/manifest.json` through `about:debugging`.
- AMO reviewers may ask for the source: the repository is public; point them at the tag and `npm ci && npm run build:firefox`.
- Paste the summary and description; use the same permission justifications as below.

## Permission justifications

Keep these in line with the [privacy policy](https://olaf-wilkosz.github.io/louder-extension/privacy.html), which explains the same permissions (`npm run check` fails if the policy stops mentioning one).

- **storage**: remembers your preferences (voice, speed, theme, highlight colours, panel position) and which tab is currently reading, locally in the browser. Nothing is transmitted.
- **contextMenus**: adds the "Read it louder!" right-click item for selected text.
- **activeTab** and **scripting**: read the text of the current page and show the Louder panel when you use the toolbar button, the shortcut or the context menu.
- **Host access (`<all_urls>`)**: the panel and the selection trigger must work on any page you choose to read, not on a fixed list of sites. Louder does not collect data from those pages and makes no network requests of its own.

## After publishing

- Add the store links to the README and the website.
- Check the listing renders (screenshots in the right order, no truncated text).
