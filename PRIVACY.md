# Privacy Policy for Louder

**Last updated:** 2026-08-23

Louder is a text-to-speech browser extension. This policy explains exactly what data it touches, and — just as importantly — what it doesn't.

## Summary

Louder does not collect, transmit, sell, or share any of your data. Everything it does happens locally, in your browser, on your device.

## What Louder stores, and where

Louder saves a small set of preferences using your browser's built-in `chrome.storage.local` API:

- Selected voice
- Playback speed
- Theme (dark / light / system)
- Pinned voices
- Highlight color preset
- Widget's on-screen position

This data is stored **only on your own device**. It is never transmitted anywhere — not to us, not to any third party. We don't operate a server, and Louder makes no network requests of its own.

## Page content

To read a page or selection aloud, Louder's content script reads the visible text of the page you're on (or the text you've selected) entirely within your browser, to pass it to the Web Speech API for synthesis and to compute word/sentence highlight positions. This text is processed in memory and is never stored, logged, or sent anywhere by Louder.

Louder requests broad host permissions (`<all_urls>`) because it needs to work on any page you choose to read — not to collect data from those pages. It does not track your browsing, build a history, or read pages you haven't asked it to read.

## Text-to-speech voices

Louder uses your browser's native Web Speech API (`speechSynthesis`) to generate audio. Depending on your operating system and browser, some voices are processed entirely on-device, while others (particularly certain browser-provided voices) may be processed by your browser vendor's own servers — this is standard behavior of the Web Speech API and outside Louder's control. Louder itself never sends text to any server. Check your browser's own privacy policy if you want details on how it handles voices that aren't fully on-device.

## Third parties

Louder does not include analytics, trackers, or advertising of any kind. No data is sold or shared with third parties, because none is collected in the first place.

## Permissions, explained

| Permission | Why Louder needs it |
|---|---|
| `storage` | Save your preferences locally (see above) |
| `activeTab` / `scripting` | Read the current page's text and display the widget when you use Louder |
| `contextMenus` | Add the "Read it louder!" right-click menu item |
| `host_permissions: <all_urls>` | Let Louder work on any page you choose to read, rather than a fixed list of sites |

## Changes to this policy

If this policy changes, the update will be reflected here with a new "Last updated" date.

## Contact

Questions or concerns? Open an issue at [github.com/olaf-wilkosz/louder-extension](https://github.com/olaf-wilkosz/louder-extension/issues).
