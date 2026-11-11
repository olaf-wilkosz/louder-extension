# Manual accessibility test

Automated checks (`npm run audit:site`) cover the website. The extension's widget runs inside other people's pages, so it needs a short manual pass before a release that touches the UI. About 10 minutes, any article page (for example a Wikipedia article).

## Keyboard

1. Press `Alt` + `Shift` + `L`: the panel appears. Press it again: it hides. (If it does nothing, check the shortcut in the browser's extension shortcuts page.)
2. `Tab` through the panel. Every control (play/pause, skip back/forward, speed, voice, settings, close) must be reachable, in a sensible order, with a **visible focus ring**.
3. `Enter` / `Space` activate the focused control; `Escape` closes the open popup (picker or settings panel) and returns focus to the button that opened it.
4. After closing the panel, focus must return to the page, not get stuck in a hidden element.

## Screen reader (NVDA on Windows, VoiceOver on macOS)

1. Every button has an accessible name (not "button"): play, pause, skip, speed, voice, settings, close.
2. Note whether toggles and the playing state are announced. **Known gap:** the widget's buttons have names but do not yet expose `aria-pressed` / `aria-expanded`, so state changes may not be announced; record what you hear rather than assuming.
3. Louder speaks through the browser's speech engine, not the screen reader: with a screen reader running, check that starting playback does not make the two talk over each other in a way that makes the panel unusable (a user who needs a screen reader can keep Louder's playback for later, but the panel itself must stay operable).

## Visual

1. Themes **Dark**, **Light** and **System**: text and icons readable in each; switch the OS theme with System selected and see the panel follow.
2. All four highlight presets (Amber, Midnight, Forest, Paper), on a light page and a dark page: the highlighted sentence and the highlighted word must both be clearly visible, and the word must be distinguishable from the sentence.
3. Browser zoom 200%: the panel stays on screen and usable; text zoom does not clip labels.
4. OS "reduce motion" on: **known gap:** the widget does not yet honour `prefers-reduced-motion` (the website does). Check that nothing important depends on animation.

## Pointer and touch

1. The selection trigger ("Read it louder!") appears after selecting two or more words, follows the selection, and disappears when the selection is cleared.
2. Controls are comfortably clickable (no tiny targets) and the panel can be dragged away from content it covers.

## Record

Note the browser, OS and version tested in the pull request or release notes, and open an issue for anything found. A failure here blocks a release that changed the widget.
