import { Readability } from "@mozilla/readability";

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════════ */
const ACCENT           = "#46edd5";
const ACCENT_GLOW      = "#46edd555";
const ACCENT_TINT      = "#46edd521";
const ACCENT_LIGHT      = "#007d6f";
const ACCENT_LIGHT_GLOW = "#007d6f55";
const ACCENT_LIGHT_TINT = "#007d6f21";
const SPEED_STOPS = [5, 4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25];
const BASE_WPM    = 180;

const PRESETS = {
  amber:    { dotColor: "#FF9500", wordBg: "rgba(255,149,0,0.65)",  wordColor: "#fff",    sentenceBg: "rgba(255,149,0,0.15)"  },
  midnight: { dotColor: "#3A5A8C", wordBg: "rgba(58,90,140,0.65)", wordColor: "#fff",    sentenceBg: "rgba(58,90,140,0.2)"   },
  forest:   { dotColor: "#2D6A4F", wordBg: "rgba(45,106,79,0.65)", wordColor: "#fff",    sentenceBg: "rgba(45,106,79,0.12)"  },
  paper:    { dotColor: "#111111", wordBg: "rgba(0,0,0,0.75)",     wordColor: "#FFFF00", sentenceBg: "rgba(255,255,0,0.3)"   },
} as const;
type PresetKey = keyof typeof PRESETS;

type ThemeVars = {
  bg: string; panelBg: string; border: string; divider: string;
  icon: string; iconHover: string; text: string; subtext: string;
  timer: string; closeBg: string; closeBorder: string; trackBg: string;
  chipBg: string; chipBgHover: string; panelShadow: string;
  pillBg: string; pillBgHover: string;
};

const DARK: ThemeVars = {
  bg: "#252528",       panelBg: "rgba(37,37,40,0.50)",
  pillBg: "rgba(37,37,40,0.5)", pillBgHover: "rgba(37,37,40,0.8)",
  border: "rgba(255,255,255,0.08)",  divider: "rgba(255,255,255,0.08)",
  icon: "rgba(255,255,255,0.48)",    iconHover: "rgba(255,255,255,0.9)",
  text: "rgba(255,255,255,0.85)",    subtext: "rgba(255,255,255,0.5)", /* was 0.32 — only 2.87:1 against the panel, below WCAG AA's 4.5:1 for text */
  timer: "rgba(255,255,255,0.72)",
  closeBg: "#3a3a3e",   closeBorder: "rgba(255,255,255,0.1)",
  trackBg: "rgba(255,255,255,0.1)",
  chipBg: "rgba(255,255,255,0.06)",  chipBgHover: "rgba(255,255,255,0.12)",
  panelShadow: "0 8px 32px rgba(0,0,0,0.5)",
};

const LIGHT: ThemeVars = {
  bg: "#dddde3",        panelBg: "rgba(221,221,227,0.50)",
  pillBg: "rgba(221,221,227,0.5)", pillBgHover: "rgba(221,221,227,0.8)",
  border: "rgba(0,0,0,0.08)",        divider: "rgba(0,0,0,0.07)",
  icon: "rgba(0,0,0,0.42)",          iconHover: "rgba(0,0,0,0.85)",
  text: "rgba(0,0,0,0.85)",          subtext: "rgba(0,0,0,0.6)", /* was 0.3 — only ~2:1 against the panel, below WCAG AA's 4.5:1 for text */
  timer: "rgba(0,0,0,0.62)",
  closeBg: "#c4c4cc",   closeBorder: "rgba(0,0,0,0.08)",
  trackBg: "rgba(0,0,0,0.11)",
  chipBg: "rgba(0,0,0,0.05)",        chipBgHover: "rgba(0,0,0,0.09)",
  panelShadow: "0 4px 16px rgba(0,0,0,0.08), 0 12px 36px rgba(0,0,0,0.10)",
};

/* ═══════════════════════════════════════════════════════════════════
   SVG ICONS
═══════════════════════════════════════════════════════════════════ */
const I = {
  play:    `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 3.2 13 8 5.5 12.8V3.2z"/></svg>`,
  pause:   `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2.5" width="3.2" height="11" rx="1.5"/><rect x="9.8" y="2.5" width="3.2" height="11" rx="1.5"/></svg>`,
  sliders: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"><line x1="2" y1="4" x2="14" y2="4"/><circle cx="5.5" cy="4" r="1.6" fill="currentColor" stroke="none"/><line x1="2" y1="8" x2="14" y2="8"/><circle cx="10.5" cy="8" r="1.6" fill="currentColor" stroke="none"/><line x1="2" y1="12" x2="14" y2="12"/><circle cx="6.5" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>`,
  readSel: `<svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="5" width="6.5" height="8" rx="1.2" opacity="0.85"/><rect x="10.5" y="5" width="6.5" height="8" rx="1.2" opacity="0.28"/><path d="M7.5 3.5 Q9 3.5 10.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/><line x1="9" y1="3.5" x2="9" y2="14.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M7.5 14.5 Q9 14.5 10.5 14.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>`,
  person:  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35"><circle cx="8" cy="5.5" r="2.5"/><path d="M2.5 14c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke-linecap="round"/></svg>`,
  // Single right-pointing chevron; CSS rotates it 180° in collapsed state
  chev:    `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2l4 4-4 4"/></svg>`,
  close:   `<svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M1 1l6 6M7 1L1 7"/></svg>`,
  // Sentence navigation: undo/redo-style arcs — arrowhead at the arc's start, pointing in travel direction
  stepBack: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 5.5h7a4 4 0 0 1 0 8"/><polyline points="5.5,3 3.5,5.5 5.5,8"/></svg>`,
  stepFwd:  `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 5.5h-7a4 4 0 0 0 0 8"/><polyline points="10.5,3 12.5,5.5 10.5,8"/></svg>`,
  // Voice pin: star outline (unpinned) / filled (pinned)
  starOut: `<svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M7 1l1.5 4 4.5.7-3.3 3.1.8 4.7L7 11.5l-3.5 1.9.8-4.7L1 5.7 5.5 5z"/></svg>`,
  star:    `<svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1l1.5 4 4.5.7-3.3 3.1.8 4.7L7 11.5l-3.5 1.9.8-4.7L1 5.7 5.5 5z"/></svg>`,
};

/* ═══════════════════════════════════════════════════════════════════
   SHADOW CSS  —  all state driven by [data-state] on .root
═══════════════════════════════════════════════════════════════════ */
const SHADOW_CSS = `
@keyframes popIn {
  from { opacity:0; transform:scale(0.93) translateY(-4px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes widgetFadeOut {
  from { opacity:1; transform:scale(1)    translateY(0px); }
  to   { opacity:0; transform:scale(0.95) translateY(3px); }
}
:host([data-hiding]) .root {
  animation: widgetFadeOut 0.28s cubic-bezier(0.4,0,1,1) forwards;
  pointer-events: none;
}

:host {
  all: initial;
  position: fixed;
  z-index: 2147483647;
  right: 80px;
  top: 240px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 13px;
  user-select: none;
  display: block;
  width: fit-content;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.root { position: relative; }

/* ── pill ── */
.pill {
  display: flex; align-items: center; gap: 1px;
  background: var(--pill-bg); border-radius: 100px;
  box-shadow: 0 0 0 1px var(--border), 0 8px 28px rgba(0,0,0,0.45);
  position: relative; width: fit-content;
  padding: 6px 4px 6px 6px;
  transition: background 0.2s ease;
}
.pill:hover { background: var(--pill-bg-hover); }
/* pill stays hovered while mouse is anywhere over root (pill or open panel) */
.root[data-panel-open]:hover .pill { background: var(--pill-bg-hover); }

/* ── close button ── */
.close-btn {
  position: absolute; top: -8px; right: -8px; z-index: 20;
  width: 19px; height: 19px; border-radius: 50%;
  background-color: var(--pill-bg);
  background-image: none;
  border: 1px solid var(--border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--icon);
  opacity: 0; pointer-events: none;
  transition: opacity .15s, background-color .15s, background-image .15s, transform .15s, color .15s;
}
/* Shared hover: root hovered → background and icon both brighten, matching the pill */
.root:hover .close-btn { background-color: var(--pill-bg-hover); color: var(--icon-hover); }
/* Direct hover: add chip overlay as background-image; background-color stays from base rule */
.close-btn:hover { background-image: linear-gradient(var(--chip-bg-hover), var(--chip-bg-hover)); color: var(--icon-hover); transform: scale(1.15); }
/* Active: X icon flips to blue */
.close-btn:active,
.root:hover .close-btn:active { color: var(--accent); }
/* close button: reveal on hover in all states, when panel is open, or on
   keyboard focus — without :focus-visible here, a keyboard user tabbing to
   this control would land on something invisible with no visual feedback. */
[data-state="collapsed"] .pill:hover .close-btn,
[data-state="expanded"]  .pill:hover .close-btn,
[data-state="playing"]   .pill:hover .close-btn,
[data-panel-open] .close-btn,
.close-btn:focus-visible { opacity: 1; pointer-events: auto; }
.close-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }

/* ── chevron button ── */
.chev-btn {
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: transparent; color: var(--icon);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  /* collapsed: takes no space, invisible */
  max-width: 0; overflow: hidden; opacity: 0; pointer-events: none;
  transition: max-width .2s ease, opacity .2s ease, background .14s, color .14s;
}
.chev-btn:hover { background: var(--chip-bg-hover); color: var(--icon-hover); }

/* chevron: reveal on hover in all states, when panel is open, or on keyboard
   focus (same reasoning as .close-btn above — max-width:0 alone would make
   a focused-but-unrevealed chevron effectively invisible to a sighted
   keyboard user). */
[data-state="collapsed"] .pill:hover .chev-btn,
[data-state="expanded"]  .pill:hover .chev-btn,
[data-state="playing"]   .pill:hover .chev-btn,
[data-panel-open] .chev-btn,
.chev-btn:focus-visible {
  max-width: 28px; opacity: 1; pointer-events: auto;
}
.chev-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }

/* chevron direction: rotate the inner icon */
.chev-icon {
  display: block;
  transition: transform .25s ease;
}
[data-state="collapsed"] .chev-icon { transform: rotate(180deg); }
[data-state="expanded"]  .chev-icon,
[data-state="playing"]   .chev-icon { transform: rotate(0deg); }

/* ── expandable section (hidden in collapsed) ── */
.expandable {
  display: flex; align-items: center; gap: 1px;
  max-width: 0; overflow: hidden; opacity: 0; pointer-events: none;
  transition: max-width .22s cubic-bezier(0.4,0,0.2,1), opacity .18s ease;
}
[data-state="expanded"] .expandable,
[data-state="playing"]  .expandable {
  max-width: 400px; opacity: 1; pointer-events: auto;
}

/* ── icon buttons ── */
.icon-btn {
  width: 34px; height: 34px; border-radius: 50%; border: none;
  background: transparent; color: var(--icon);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background .14s, color .14s;
  font-family: inherit;
}
.icon-btn:hover  { background: var(--chip-bg-hover); color: var(--icon-hover); }
.icon-btn.active { background: var(--accent-tint); color: var(--accent); }
/* Visible focus ring — shared by every icon/control button in the widget,
   since none of them had any :focus-visible treatment before. */
.icon-btn:focus-visible,
.play-btn:focus-visible,
.skip-btn:focus-visible,
.pin-btn:focus-visible,
.panel-close:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}

/* speed badge inside icon-btn */
.speed-badge {
  font-size: 11.5px; font-weight: 700; letter-spacing: -.02em;
  min-width: 22px; text-align: center;
}

/* ── divider ── */
.divider {
  width: 1px; height: 18px; background: var(--divider);
  flex-shrink: 0; margin: 0 3px;
}

/* ── timer slot (hidden unless playing) ── */
.timer-slot {
  width: 80px; height: 34px; position: relative;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
  max-width: 0; opacity: 0; pointer-events: none;
  transition: max-width .22s cubic-bezier(0.4,0,0.2,1), opacity .18s ease;
}
[data-state="playing"] .timer-slot {
  max-width: 90px; opacity: 1; pointer-events: auto;
}
.timer-val {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; letter-spacing: .04em;
  color: var(--timer); font-variant-numeric: tabular-nums;
  opacity: 1; transition: opacity .18s; pointer-events: none;
}
.skip-btns {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center; gap: 4px;
  opacity: 0; transition: opacity .18s;
}
.timer-slot:hover .timer-val { opacity: 0; }
.timer-slot:hover .skip-btns { opacity: 1; }
.skip-btn {
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: transparent; color: var(--icon);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background .14s, color .14s;
}
.skip-btn:hover  { background: var(--chip-bg-hover); color: var(--icon-hover); }
.skip-btn:active { background: var(--accent-tint); color: var(--accent); }

/* ── play button ── */
.play-btn {
  width: 36px; height: 36px; border-radius: 50%; border: none;
  background: var(--accent); box-shadow: 0 0 16px var(--accent-glow);
  color: #fff; display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; position: relative; z-index: 1;
  transition: filter .15s;
}
.play-btn:hover  { filter: brightness(1.12); }
.play-btn:active { transform: scale(0.92); }

/* ── play wrapper ── */
.play-wrap {
  position: relative; display: flex; align-items: center;
  justify-content: center; width: 36px; height: 36px; flex-shrink: 0;
}

/* ── progress ring (hidden unless TTS active) ── */
.progress-ring {
  position: absolute; inset: -6px; z-index: 0; pointer-events: none;
  opacity: 0; transition: opacity .2s ease;
}
[data-tts-active] .progress-ring { opacity: 1; }
.ring-track { stroke: var(--track-bg); }
.ring-arc   { stroke: var(--accent); }

/* ── drag dots ── */
.drag-dots {
  display: flex; flex-direction: column; gap: 3px;
  padding: 8px 8px 8px 4px; cursor: grab;
  opacity: .42; transition: opacity .15s;
}
.drag-dots:active { cursor: grabbing; }
.drag-dots:hover  { opacity: .78; }
.drag-row { display: flex; gap: 3px; }
.drag-dot { width: 3px; height: 3px; border-radius: 50%; background: #fff; }
[data-state] .drag-dot { background: var(--drag-dot); }

/* ── panels container — horizontal position set by JS per trigger button ── */
.panels-wrap {
  position: absolute; top: calc(100% + 8px); z-index: 50;
}
/* Transparent bridge fills the 8px gap so :hover doesn't break crossing from pill to panel */
.panels-wrap::before {
  content: ''; position: absolute; top: -8px; left: 0; right: 0; height: 8px;
}

/* ── panel base ── */
.panel {
  background: var(--panel-bg); border: 1px solid var(--border); border-radius: 16px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  transition: background 0.2s ease;
  animation: popIn .18s cubic-bezier(0.34,1.56,0.64,1) both;
}
/* Symmetric hover: root hovered (via pill, bridge, or panel) lights up panel too */
.panel:hover,
.root[data-panel-open]:hover .panel { background: var(--pill-bg-hover); }

/* ── speed panel ── */
.speed-panel { padding: 14px 16px 14px 14px; }
.speed-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.speed-hdr-val { font-size: 14px; font-weight: 600; color: var(--text); letter-spacing: -.01em; }
.speed-hdr-wpm { font-size: 10.5px; color: var(--subtext); margin-top: 2px; }
.speed-body { display: flex; gap: 16px; }
.speed-track-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.step-btn {
  width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--border);
  background: var(--chip-bg); color: var(--text); font-size: 16px; font-weight: 300;
  line-height: 1; cursor: pointer; display: flex; align-items: center;
  justify-content: center; transition: background .12s; flex-shrink: 0; font-family: inherit;
}
.step-btn:hover { background: var(--chip-bg-hover); }
.speed-track { position: relative; width: 20px; height: 200px; cursor: pointer; flex-shrink: 0; }
.speed-track-bg {
  position: absolute; left: 50%; transform: translateX(-50%);
  width: 4px; height: 100%; background: var(--track-bg); border-radius: 2px;
}
.speed-track-fill {
  position: absolute; left: 50%; transform: translateX(-50%);
  width: 4px; border-radius: 2px; background: var(--accent); bottom: 0;
}
.speed-handle {
  position: absolute; left: 50%; transform: translate(-50%, -50%);
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 8px var(--accent-glow); z-index: 2;
}
.speed-labels {
  display: flex; flex-direction: column; justify-content: space-between;
  height: 200px; margin-top: 34px;
}
.speed-label {
  background: none; border: none; cursor: pointer; padding: 0;
  font-size: 11.5px; line-height: 1; letter-spacing: -.01em;
  transition: color .12s; text-align: left; font-family: inherit;
  color: var(--subtext); font-weight: 400;
}
.speed-label:not(.active):hover { color: var(--icon-hover); }
.speed-label.active { font-weight: 600; color: var(--text); }

/* ── voice panel ── */
.voice-panel { padding: 10px 8px; min-width: 220px; }
@keyframes louder-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.voice-item-enter { animation: louder-fade-in .15s ease forwards; }
.voice-list  { max-height: 260px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--subtext) transparent; }
.voice-list::-webkit-scrollbar { width: 4px; }
.voice-list::-webkit-scrollbar-track { background: transparent; }
.voice-list::-webkit-scrollbar-thumb { background: var(--subtext); border-radius: 2px; }
.voice-list::-webkit-scrollbar-thumb:hover { background: var(--icon); }
.panel-hdr { display: flex; align-items: center; justify-content: space-between; padding: 2px 8px 8px; }
.panel-lbl { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--subtext); }
.panel-close {
  cursor: pointer; color: var(--subtext); display: flex;
  border-radius: 50%; padding: 3px; margin: -3px;
  transition: color .12s, background .12s;
}
.panel-close:hover { color: var(--icon-hover); background: var(--chip-bg); }
.voice-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border-radius: 10px; cursor: pointer; transition: background .12s;
}
.voice-item:hover:not(.active) { background: var(--chip-bg); }
.voice-item.active { background: var(--accent-tint); }
.voice-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--chip-bg); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--icon);
}
.voice-item.active .voice-avatar { background: var(--accent-tint); color: var(--accent); }
.voice-name { font-size: 13px; line-height: 1.2; color: var(--icon); }
.voice-item.active .voice-name { font-weight: 600; color: var(--text); }
.voice-hint   { font-size: 10px; color: var(--subtext); margin-top: 1px; }
.voice-accent { margin-left: auto; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.pin-btn {
  width: 22px; height: 22px; border-radius: 50%; border: none; background: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--subtext); opacity: 0;
  transition: color .12s, background .12s, opacity .12s;
}
.voice-item:hover .pin-btn { opacity: 1; }
.pin-btn.pinned { opacity: 1; color: var(--accent); }
.pin-btn:hover { background: var(--chip-bg-hover); color: var(--icon-hover); }
.pin-btn.pinned:hover { color: var(--accent); }
.voice-divider { height: 1px; background: var(--divider); margin: 4px 8px; }
.show-more-btn {
  width: 100%; padding: 5px 10px; border: none; background: none; cursor: pointer;
  font-family: inherit; font-size: 11px; color: var(--subtext);
  display: flex; align-items: center; justify-content: center; gap: 4px;
  border-radius: 8px; transition: color .12s, background .12s;
}
.show-more-btn:hover { color: var(--icon-hover); background: var(--chip-bg); }

/* ── settings panel ── */
.settings-panel { padding: 10px 8px; min-width: 220px; }
.section-lbl { font-size: 10px; color: var(--subtext); display: block; margin-bottom: 4px; }
.theme-seg { display: flex; gap: 4px; background: var(--chip-bg); border-radius: 10px; padding: 3px; }
.theme-btn {
  flex: 1; padding: 5px 4px; border-radius: 7px; border: none; cursor: pointer;
  font-size: 11.5px; font-family: inherit; transition: all .15s; text-transform: capitalize;
  background: transparent; color: var(--subtext); font-weight: 400;
}
.theme-btn:not(.active):hover { background: var(--chip-bg); color: var(--icon-hover); }
.theme-btn.active { background: var(--chip-bg-hover); font-weight: 600; color: var(--text); }

/* ── highlight presets ── */
.preset-section { margin-top: 8px; }
.preset-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4px;
  background: var(--chip-bg); border-radius: 10px; padding: 3px;
}
.preset-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 5px 6px; border-radius: 7px; border: none; cursor: pointer;
  background: transparent; font-family: inherit; transition: all .15s;
}
.preset-item:not(.active):hover { background: var(--chip-bg); color: var(--icon-hover); }
.preset-item.active { background: var(--chip-bg-hover); }
.preset-name { font-size: 11px; color: var(--subtext); font-weight: 400; }
.preset-item:not(.active):hover .preset-name { color: var(--icon-hover); }
.preset-item.active .preset-name { font-weight: 600; color: var(--text); }
.preset-mini { display: flex; border-radius: 4px; overflow: hidden; flex-shrink: 0; }
.mini-s, .mini-w { width: 12px; height: 12px; }
`;

/* ═══════════════════════════════════════════════════════════════════
   TTS ENGINE
═══════════════════════════════════════════════════════════════════ */
// ── CSS Custom Highlight API (Chrome 105+, always available at our target Chrome 112) ──
const HL_SENTENCE = "louder-sentence";
const HL_WORD     = "louder-word";
const useHighlightAPI = typeof CSS !== "undefined" && "highlights" in CSS;

const highlightStyle = document.createElement("style");
document.head.appendChild(highlightStyle);

function applyHighlightColors(preset: PresetKey): void {
  const p = PRESETS[preset];
  highlightStyle.textContent = useHighlightAPI
    ? `::highlight(${HL_SENTENCE}){background-color:${p.sentenceBg};color:inherit;}
       ::highlight(${HL_WORD}){background-color:${p.wordBg};color:${p.wordColor};}`
    : `.louder-highlight{background:${p.wordBg};border-radius:2px;}`;
}
applyHighlightColors("amber");

let sentences: string[] = [];
let currentIndex = 0;
let isPaused = false;
let voiceURI = "";
let ttsSpeed = 1.0;
let ttsLang  = "";
let pageFingerprint = "";
let sentenceStartTime = 0;
let realElapsedBase  = 0;     // real seconds accumulated for completed sentences
let calculatedTotalSecs = 0;
let ttsGeneration = 0;
let ttsOnDone: (() => void) | undefined;
// Per-sentence actual durations, filled as each sentence finishes.
// Persists across skips so we can use real timings when jumping back to heard sentences.
let realSentenceDurations: number[] = [];

// Cross-tab coordination — speechSynthesis is a browser-global singleton so
// any tab starting playback cancels every other tab's audio silently.
// We use storage to broadcast ownership so displaced tabs can update their UI.
const INSTANCE_ID      = Math.random().toString(36).slice(2, 10);
const PLAYING_OWNER_KEY = "louder_playing_owner";

// Cache voices at module level — getVoices() returns [] until the async load completes.
// We keep this updated so speakFrom always has a full list to pick from.
let voiceCache: SpeechSynthesisVoice[] = speechSynthesis.getVoices();
speechSynthesis.addEventListener("voiceschanged", () => {
  voiceCache = speechSynthesis.getVoices();
});

/** Detect language from text content. Falls back to page/browser lang. */
function detectTextLang(text: string): string {
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
  // Last resort: page declared lang, then browser lang
  const declared = document.documentElement.lang;
  return declared ? declared.split("-")[0].toLowerCase() : navigator.language.split("-")[0].toLowerCase();
}

/** Returns real elapsed seconds: actual time spent on completed sentences
 *  plus wall-clock time into the current sentence. No word-count estimation —
 *  accurate regardless of how fast Chrome's TTS actually speaks at the set rate. */
function calcElapsed(): number {
  if (!sentences.length || sentenceStartTime === 0) return 0;
  if (isPaused || currentIndex >= sentences.length) return realElapsedBase;
  return realElapsedBase + (Date.now() - sentenceStartTime) / 1000;
}

/** Walk a Gmail .ii.gt body element and return its text, including emoji
 *  characters that Gmail converts to <img> elements (innerText misses those). */
function gmailBodyText(root: HTMLElement): string {
  // innerText gives us the rendered text respecting CSS, block boundaries, etc.
  // We then patch in any emoji that Gmail rendered as <img alt="🖐️" ...>.
  // Strategy: build a parallel walker result that inserts img alt values for
  // images whose alt contains emoji, then merge with the innerText positions.
  // Simpler alternative that works well in practice: replace each emoji <img>
  // placeholder in innerText with the alt value. Gmail's innerText leaves a
  // space or nothing where the image was, so we can't rely on position —
  // instead we rebuild text via a TreeWalker (same as bodyTextFromNodes) and
  // include img emoji alt inline.
  const BLOCK = new Set([
    "P","DIV","BR","LI","TR","TD","TH","H1","H2","H3","H4","H5","H6",
    "BLOCKQUOTE","PRE","TABLE","THEAD","TBODY","TFOOT","CAPTION",
    "ARTICLE","SECTION","HEADER","FOOTER","MAIN",
  ]);
  const parts: string[] = [];
  let lastWasBlock = false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, visibleFilter);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.ELEMENT_NODE) {
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

/** Extract email body text from Gmail's stable DOM containers.
 *  Returns null if not on Gmail or no body found. */
function extractGmailText(): string | null {
  if (!location.hostname.includes("mail.google.com")) return null;

  // .ii.gt is Gmail's rendered email body wrapper — present in both single
  // and threaded views. Collect all expanded messages in the thread.
  const bodies = document.querySelectorAll<HTMLElement>(".ii.gt");
  if (!bodies.length) return null;

  const parts = Array.from(bodies)
    .map(el => gmailBodyText(el))
    .filter(t => t.length > 30);

  return parts.length ? parts.join("\n\n") : null;
}

/** Score Readability output quality: 0 (bad) → 1 (good).
 *  Penalises extractions that are suspiciously short or have no sentence structure. */
function scoreExtraction(text: string, rawLength: number): number {
  if (text.length < 200) return 0;
  const sentences = (text.match(/[.!?]+/g) ?? []).length;
  if (sentences < 3) return 0.2;                          // probably grabbed a fragment
  if (rawLength > 5000 && text.length < rawLength * 0.08) return 0.4; // Readability missed a lot
  return 1;
}

/** Extract from SPA conversation UIs that wrap each message turn in a
 *  repeating semantic element. Tries <article> first (Claude.ai, newer
 *  ChatGPT builds), then content-dense <section> elements (ChatGPT thread
 *  structure). Requires 2+ qualifying elements so a single article/section
 *  blog post still goes to Readability. */
function extractConversationText(): string | null {
  // <article> per turn — common in newer AI chat UIs
  const articles = document.querySelectorAll<HTMLElement>("article");
  if (articles.length >= 2) {
    const parts = Array.from(articles)
      .map(el => el.innerText.trim())
      .filter(t => t.length > 20);
    const joined = parts.join("\n\n");
    if (joined.length > 100) return joined;
  }

  // <section> per turn — ChatGPT thread and similar.
  // Filter to sections with real content (>80 chars) so nav/footer sections
  // don't count toward the 2+ threshold.
  const sections = Array.from(document.querySelectorAll<HTMLElement>("section"))
    .filter(el => el.innerText.trim().length > 80);
  if (sections.length >= 2) {
    const parts = sections.map(el => el.innerText.trim());
    const joined = parts.join("\n\n");
    if (joined.length > 100) return joined;
  }

  return null;
}

function extractText(): string {
  // 1. Gmail — bypasses Readability which misreads Gmail's complex SPA DOM
  const gmailText = extractGmailText();
  if (gmailText) return gmailText;

  // 2. SPA conversations: ChatGPT, Claude.ai, etc. — multiple <article> per turn
  const convText = extractConversationText();
  if (convText) return convText;

  // 3. HTML email / newsletter layout — <font> tags or 3+ levels of nested
  //    tables are the hallmark of newsletter HTML. Readability strips button
  //    text and small-font content from these layouts; go straight to our
  //    node-walker which stays in sync with buildNodeCache().
  const isEmailLayout = !!document.querySelector("font[face], font[color], font[size]")
    || document.querySelectorAll("table table table").length >= 3;
  if (isEmailLayout) return bodyTextFromNodes();

  // 4. Readability for article/blog pages — score before trusting it
  try {
    const clone = document.cloneNode(true) as Document;
    const article = new Readability(clone).parse();
    const text = article?.textContent?.trim() ?? "";
    if (scoreExtraction(text, document.body.innerText.length) >= 0.8) return text;
  } catch (_) { /* fall through */ }

  // 5. Semantic main content — better scoped than full body
  const mainEl = document.querySelector<HTMLElement>("main, [role='main']");
  const mainText = mainEl?.innerText.trim() ?? "";
  if (mainText.length > 200) return mainText;

  // 6. Raw fallback — walk text nodes directly (same as buildNodeCache) so
  //    alt attributes, <script>, and <style> content are never included,
  //    keeping extractText() in sync with the highlight node cache.
  return bodyTextFromNodes();
}

/** Walk document.body text nodes and join them, inserting a newline whenever
 *  a block-level element boundary is crossed. This produces text that is
 *  semantically equivalent to innerText for content purposes but excludes
 *  img alt text and other non-text-node content, keeping it in sync with
 *  buildNodeCache(). */
function bodyTextFromNodes(): string {
  const BLOCK = new Set([
    "P","DIV","BR","LI","TR","TD","TH","H1","H2","H3","H4","H5","H6",
    "BLOCKQUOTE","PRE","ARTICLE","SECTION","HEADER","FOOTER","MAIN",
    "NAV","ASIDE","FIGURE","FIGCAPTION","TABLE","THEAD","TBODY","TFOOT",
    "CAPTION","DL","DT","DD","OL","UL","FORM","FIELDSET","ADDRESS","HR",
  ]);
  const parts: string[] = [];
  let lastWasBlock = false;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, visibleFilter);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.ELEMENT_NODE) {
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

const MAX_WORDS_PER_CHUNK = 60;

function splitSentences(text: string): string[] {
  // Step 0: split on double+ newlines (block section / paragraph boundaries)
  // first, so content from different email sections / paragraphs never gets
  // merged into one utterance. Single \n (e.g. from <br>) stays within a chunk.
  const sections = text.split(/\n{2,}/).map(s => s.trim()).filter(s => s.length > 0);

  const result: string[] = [];
  for (const section of sections) {
    // Primary split on sentence-ending punctuation within each section
    const primary = section.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);

    // Secondary split: break chunks longer than MAX_WORDS_PER_CHUNK at
    // commas/semicolons/colons/newlines so a block of numbers or code
    // doesn't create a single utterance lasting minutes.
    for (const chunk of primary) {
      if (chunk.split(/\s+/).length <= MAX_WORDS_PER_CHUNK) {
        result.push(chunk);
        continue;
      }
      const sub = chunk.split(/(?<=[,;:\n])\s+/).map(s => s.trim()).filter(s => s.length > 0);
      let current = "";
      for (const piece of sub) {
        const candidate = current ? `${current} ${piece}` : piece;
        if (candidate.split(/\s+/).length > MAX_WORDS_PER_CHUNK && current) {
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

// ── Text-node cache for CSS Highlight API ─────────────────────────────────
// Rebuilt once per TTS session; reused for every sentence + word highlight.
let nodeCache: { node: Text; start: number }[] = [];
let fullText   = ""; // raw concatenated text node content — positions match DOM offsets
let searchText = ""; // fullText with U+00A0 → U+0020 (same length, positions preserved)
let collapsedText   = ""; // searchText with all \s+ → single space (for <br>/<p> mismatch)
let collapsedPosMap: number[] = []; // collapsedText[i] → fullText position
let sentencePos = -1; // start of current sentence in fullText (for word offsets)
// Lower bound for findSentenceRange() lookups. Repeated text (e.g. a "Buy now"
// button on every item in an email list) has multiple matches in fullText —
// searching from position 0 (or from sentencePos, which removeHighlight()
// resets to -1 right before every search) always re-finds the *first* one
// regardless of which item is actually being read. This tracks the end of
// the last successful match instead, independent of sentencePos/removeHighlight,
// so lookups stay pinned to "at or after where we already are" and repeated
// text resolves to the next occurrence in reading order. Reset to 0 on new
// content or a real discontinuity (skip) — see buildNodeCache()/speakFrom().
let searchAnchor = 0;
// Start position of the last successfully matched sentence. Unlike
// sentencePos (cleared to -1 by removeHighlight(), including on pause),
// this survives a pause so resume can rewind searchAnchor to it — see
// speakFrom() — landing back on the same occurrence instead of skipping
// past it to the next repeat of identical text.
let lastMatchStart = -1;

// Auto-scroll suppression: track last user-initiated scroll so we don't fight
// manual scrolling. autoScrolling is true while our own scrollTo animation runs
// (scroll events during that window are programmatic, not user-initiated).
let lastUserScrollTime = 0;
let autoScrolling = false;
document.addEventListener("scroll", () => {
  if (!autoScrolling) lastUserScrollTime = Date.now();
}, { passive: true, capture: true });

/** NodeFilter shared by buildNodeCache() and bodyTextFromNodes().
 *  FILTER_REJECT on hidden elements prunes them AND all their children from
 *  the walk — keeps both functions in sync with what the browser renders,
 *  and prevents display:none preheader text from leaking into TTS or highlights. */
const visibleFilter: NodeFilter = {
  acceptNode(node: Node): number {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const st = window.getComputedStyle(node as Element);
      if (st.display === "none" || st.visibility === "hidden") return NodeFilter.FILTER_REJECT;
    }
    return NodeFilter.FILTER_ACCEPT;
  }
};

/** Returns the same root element used by extractText() so the node cache
 *  is scoped to content only — avoids false indexOf() hits in Gmail's email
 *  preview list, ChatGPT UI chrome, etc. */
function getHighlightRoot(): Element {
  // Gmail: scope to the email body container
  if (location.hostname.includes("mail.google.com")) {
    return document.querySelector(".ii.gt") ?? document.body;
  }
  // Conversation SPAs: scope to the common parent of the article/section elements
  const articles = document.querySelectorAll("article");
  if (articles.length >= 2 && articles[0].parentElement) return articles[0].parentElement;
  const sections = Array.from(document.querySelectorAll("section"))
    .filter(el => el.textContent && el.textContent.trim().length > 80);
  if (sections.length >= 2 && sections[0].parentElement) return sections[0].parentElement;
  return document.body;
}

function buildNodeCache(): void {
  const root = getHighlightRoot();
  nodeCache = [];
  searchAnchor = 0; lastMatchStart = -1; // new content — previous anchor position is meaningless
  let pos = 0;
  // SHOW_ELEMENT is required so visibleFilter can FILTER_REJECT hidden subtrees;
  // element nodes themselves are skipped in the body below.
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, visibleFilter);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeType !== Node.TEXT_NODE) continue; // element nodes visited only for filtering
    const textNode = n as Text;
    const parent = textNode.parentElement;
    if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE")) continue;
    const len = textNode.textContent?.length ?? 0;
    if (len) nodeCache.push({ node: textNode, start: pos });
    pos += len;
  }
  fullText   = nodeCache.map(e => e.node.textContent ?? "").join("");
  // NBSP-normalised — same positions as fullText (U+00A0 → U+0020, 1-to-1 swap)
  searchText = fullText.replace(/ /g, " ");
  // Whitespace-collapsed — for matching sentences where <br>/<p> gaps are missing
  collapsedText   = "";
  collapsedPosMap = [];
  let inWS = false;
  for (let i = 0; i < searchText.length; i++) {
    if (/\s/.test(searchText[i])) {
      if (!inWS) { collapsedPosMap.push(i); collapsedText += " "; }
      inWS = true;
    } else {
      collapsedPosMap.push(i); collapsedText += searchText[i];
      inWS = false;
    }
  }
}

/** Three-tier sentence search — returns { start, end } positions in fullText, or null.
 *  Tier 1: exact NBSP-normalised match (positions identical to fullText).
 *  Tier 2: whitespace-collapsed match — handles <br>/<p> boundaries that
 *          innerText renders as 
 but raw text nodes have no character for. */
/** First index in collapsedPosMap whose fullText position is >= pos.
 *  collapsedPosMap is built in increasing order, so this lets tier 2/3
 *  lookups apply the same forward bias as tier 1's searchText.indexOf(s, pos).
 *  Returns collapsedPosMap.length ("past the end") when pos is beyond every
 *  entry, so a too-far-forward anchor correctly fails instead of silently
 *  wrapping a tier 2/3 search back to the start. */
function collapsedIndexFrom(pos: number): number {
  if (pos === 0) return 0;
  const i = collapsedPosMap.findIndex(p => p >= pos);
  return i >= 0 ? i : collapsedPosMap.length;
}

function findSentenceRange(sentence: string): { start: number; end: number } | null {
  const s = sentence.replace(/ /g, " ");

  // Tier 1 — NBSP-normalised exact match
  let start = searchText.indexOf(s, searchAnchor);
  if (start >= 0) {
    const end = start + s.length;
    searchAnchor = end;
    return { start, end };
  }

  // Tier 2 — collapse all whitespace and search collapsed text
  const sc = s.replace(/\s+/g, " ").trim();
  const ci = collapsedText.indexOf(sc, collapsedIndexFrom(searchAnchor));
  if (ci >= 0) {
    start = collapsedPosMap[ci];
    const endCollapsed = ci + sc.length - 1;
    const end = endCollapsed < collapsedPosMap.length
      ? collapsedPosMap[endCollapsed] + 1
      : fullText.length;
    searchAnchor = end;
    return { start, end };
  }

  // Tier 3 — strip emoji from search term: handles Gmail where emoji are
  // rendered as <img> (captured in extraction from alt text) but have no
  // corresponding text node in the DOM for the highlight to land on.
  const se = sc
    .replace(/\p{Extended_Pictographic}/gu, "") // strip base emoji codepoints
    .replace(/[︀-️‍]/g, "")      // strip variation selectors (FE0F etc.) + ZWJ
    .replace(/\s+/g, " ").trim();
  if (!se || se === sc) return null; // no emoji present — already failed above
  const ci3 = collapsedText.indexOf(se, collapsedIndexFrom(searchAnchor));
  if (ci3 < 0) return null;
  start = collapsedPosMap[ci3];
  const endC3 = ci3 + se.length - 1;
  const end3 = endC3 < collapsedPosMap.length
    ? collapsedPosMap[endC3] + 1
    : fullText.length;
  searchAnchor = end3;
  return { start, end: end3 };
}
function rangeAt(start: number, end: number): Range | null {
  let sNode: Text | null = null, sOff = 0, eNode: Text | null = null, eOff = 0;
  for (const { node, start: ns } of nodeCache) {
    const ne = ns + (node.textContent?.length ?? 0);
    if (!sNode && ne > start) { sNode = node; sOff = start - ns; }
    if (!eNode && ne >= end)  { eNode = node; eOff = end   - ns; break; }
  }
  if (!sNode || !eNode) return null;
  try {
    const r = document.createRange();
    r.setStart(sNode, Math.max(0, sOff));
    r.setEnd(eNode, Math.min(eNode.textContent?.length ?? 0, eOff));
    return r;
  } catch { return null; }
}

function scrollRangeIntoView(range: Range): void {
  // Back off for 2.5 s after any user-initiated scroll so manual navigation
  // isn't constantly overridden by the auto-follow.
  if (Date.now() - lastUserScrollTime < 2500) return;

  try {
    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) return; // invisible / not rendered

    // Walk up to find the actual scrollable container (Gmail uses its own pane, not window)
    let scroller: Element | null = (range.startContainer as Node).parentElement;
    while (scroller && scroller !== document.documentElement) {
      const st = window.getComputedStyle(scroller);
      if (/auto|scroll/.test(st.overflow + st.overflowY) && scroller.scrollHeight > scroller.clientHeight) break;
      scroller = scroller.parentElement;
    }

    // Mark our programmatic scroll so the capture listener doesn't treat it as user scroll.
    // scrollend clears the flag; timeout is a fallback if the element doesn't actually scroll.
    const beginAutoScroll = (target: Element | Window) => {
      autoScrolling = true;
      const reset = () => { autoScrolling = false; };
      target.addEventListener("scrollend", reset, { once: true });
      setTimeout(reset, 1500);
    };

    // Always target true vertical center rather than a margin band — a margin
    // band lets the highlight drift, then jumps a full screen to re-center,
    // which reads as "page-downing". Centering every sentence instead keeps
    // a smooth, continuous follow. Skip only when the delta is trivial
    // (adjacent short sentences landing at nearly the same spot) to avoid jitter.
    const jitterFloor = 24;
    if (scroller && scroller !== document.documentElement) {
      // Scroll the container pane (e.g. Gmail reading pane)
      const cr = scroller.getBoundingClientRect();
      const relTop = rect.top - cr.top;
      const delta = relTop - cr.height / 2 + rect.height / 2;
      if (Math.abs(delta) < jitterFloor) return;
      beginAutoScroll(scroller);
      scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: "smooth" });
    } else {
      // Scroll the window
      const delta = rect.top - window.innerHeight / 2 + rect.height / 2;
      if (Math.abs(delta) < jitterFloor) return;
      beginAutoScroll(window);
      window.scrollTo({ top: window.scrollY + delta, behavior: "smooth" });
    }
  } catch { /* stale range */ }
}

function removeHighlight(): void {
  sentencePos = -1;
  if (useHighlightAPI) {
    CSS.highlights.delete(HL_SENTENCE);
    CSS.highlights.delete(HL_WORD);
  }
}

function highlightSentence(sentence: string): void {
  if (!sentence.trim()) { removeHighlight(); return; }

  if (useHighlightAPI) {
    const result = findSentenceRange(sentence);
    // No forward match — e.g. a repeated "Buy now" sentence with no more
    // occurrences ahead of where we already are. Leave the existing
    // highlight in place instead of clearing it or snapping back to an
    // earlier occurrence; sentencePos stays -1 so onboundary() skips word
    // highlighting for this sentence too, until a later one resyncs.
    if (!result) { sentencePos = -1; return; }
    removeHighlight();
    sentencePos = result.start;
    lastMatchStart = result.start;
    const range = rangeAt(result.start, result.end);
    if (!range) return;
    CSS.highlights.set(HL_SENTENCE, new Highlight(range));
    scrollRangeIntoView(range);
  }
  // Fallback: old DOM-wrapping approach (kept for environments without Highlight API)
  else {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const idx = node.textContent?.indexOf(sentence) ?? -1;
      if (idx < 0) continue;
      const r = document.createRange();
      r.setStart(node, idx); r.setEnd(node, idx + sentence.length);
      const mark = document.createElement("mark");
      mark.className = "louder-highlight";
      try { r.surroundContents(mark); mark.scrollIntoView({ behavior: "smooth", block: "center" }); }
      catch { /* boundary crossing — mark not inserted */ }
      return;
    }
  }
}

function getVoice(): SpeechSynthesisVoice | null {
  if (!voiceURI) return null;
  return speechSynthesis.getVoices().find(v => v.voiceURI === voiceURI) ?? null;
}

function speakFrom(index: number, onDone?: () => void): void {
  if (index >= sentences.length) { removeHighlight(); onDone?.(); return; }
  // A backward or discontinuous jump (skip-back, or a skip-forward that
  // leapfrogs a sentence) invalidates the forward search anchor.
  if (index === currentIndex) {
    // Re-playing the same sentence (pause/resume) — rewind the anchor to
    // where that sentence was last found, so it lands on the same
    // occurrence again instead of advancing past it to the next repeat.
    if (lastMatchStart >= 0) searchAnchor = lastMatchStart;
  } else if (index !== currentIndex + 1) {
    searchAnchor = 0;
  }
  currentIndex = index;
  sentenceStartTime = Date.now();
  const sentence = sentences[index];
  const gen = ttsGeneration; // capture — stale callbacks from old chains will differ
  highlightSentence(sentence);

  const utt = new SpeechSynthesisUtterance(sentence);
  utt.rate = ttsSpeed;
  const v = getVoice();
  if (v) {
    utt.voice = v;
  } else if (ttsLang) {
    const candidates = voiceCache.filter(vv => vv.lang.toLowerCase().startsWith(ttsLang));
    const auto = candidates.find(vv => vv.default) ?? candidates[0];
    if (auto) utt.voice = auto;
    else utt.lang = ttsLang;
  }
  // Word highlighting — fires at each word boundary if the voice supports it
  if (useHighlightAPI) {
    utt.onboundary = (e: SpeechSynthesisEvent) => {
      if (e.name !== "word" || sentencePos < 0 || ttsGeneration !== gen) return;
      const charLen = (e as SpeechSynthesisEvent & { charLength?: number }).charLength
                   ?? sentence.slice(e.charIndex).match(/^\S+/)?.[0]?.length ?? 1;
      const word = sentence.slice(e.charIndex, e.charIndex + charLen)
                           .replace(/ /g, " ").trim();
      if (!word) return;
      // Search from sentencePos in searchText — avoids charIndex drift when
      // sentence whitespace and fullText whitespace differ (e.g. <br> boundaries)
      const wi = searchText.indexOf(word, sentencePos);
      if (wi < 0) { CSS.highlights.delete(HL_WORD); return; } // emoji expansion or img-alt word — clear stale highlight
      const range = rangeAt(wi, wi + word.length);
      if (range) CSS.highlights.set(HL_WORD, new Highlight(range));
    };
  }
  utt.onend = () => {
    removeHighlight();
    if (!isPaused && ttsGeneration === gen) {
      const realDur = (Date.now() - sentenceStartTime) / 1000;
      realSentenceDurations[currentIndex] = realDur; // remember for future skip calculations
      realElapsedBase += realDur;
      // Recalibrate total from measured speaking rate so the ring stays honest
      const wordsRead = sentences.slice(0, currentIndex + 1).reduce((s, t) => s + t.split(/\s+/).length, 0);
      const totalWords = sentences.reduce((s, t) => s + t.split(/\s+/).length, 0);
      if (wordsRead > 0) {
        const actualWps = wordsRead / realElapsedBase;
        calculatedTotalSecs = realElapsedBase + (totalWords - wordsRead) / Math.max(0.1, actualWps);
      }
      const estDur = (sentence.split(/\s+/).length) / Math.max(0.1, ttsSpeed * BASE_WPM / 60);
      speakFrom(currentIndex + 1, onDone);
    }
  };
  utt.onerror = e => { if (e.error !== "interrupted" && ttsGeneration === gen) speakFrom(currentIndex + 1, onDone); };
  speechSynthesis.speak(utt);
}

function startTTS(text?: string, onDone?: () => void): void {
  ttsGeneration++;
  ttsOnDone = onDone; // persist so skip-restarted chains can still call it
  speechSynthesis.cancel(); removeHighlight(); isPaused = false;
  if (chrome.runtime?.id) chrome.storage.local.set({ [PLAYING_OWNER_KEY]: INSTANCE_ID });
  const raw = text ?? extractText();
  pageFingerprint = text ? "" : raw.slice(0, 120);
  sentences = splitSentences(raw);
  buildNodeCache(); // cache text nodes for CSS Highlight API sentence+word lookup
  realElapsedBase = 0; realSentenceDurations = [];
  const wps = Math.max(0.1, ttsSpeed * BASE_WPM / 60);
  calculatedTotalSecs = sentences.reduce((s, sent) => s + sent.split(/\s+/).length / wps, 0);
  speakFrom(0, onDone);
}

function stopTTS(): void {
  ttsGeneration++;
  ttsOnDone = undefined;
  isPaused = false; speechSynthesis.cancel(); removeHighlight();
  sentences = []; currentIndex = 0; sentenceStartTime = 0;
  realElapsedBase = 0; calculatedTotalSecs = 0; realSentenceDurations = [];
  nodeCache = []; fullText = ""; searchText = ""; collapsedText = ""; collapsedPosMap = [];
  searchAnchor = 0; lastMatchStart = -1;
}

function pauseTTS(): void {
  ttsGeneration++;
  isPaused = true;
  speechSynthesis.cancel();
  removeHighlight();
}

function resumeTTS(onDone?: () => void): void {
  ttsGeneration++;
  ttsOnDone = onDone;
  if (chrome.runtime?.id) chrome.storage.local.set({ [PLAYING_OWNER_KEY]: INSTANCE_ID });
  if (pageFingerprint) {
    const current = extractText();
    if (current.slice(0, 120) !== pageFingerprint) {
      pageFingerprint = current.slice(0, 120);
      ttsLang = detectTextLang(current);
      sentences = splitSentences(current);
      buildNodeCache(); // content changed (e.g. translated) — rebuild node cache
      currentIndex = 0;
      isPaused = false;
      speakFrom(0, onDone);
      return;
    }
  }
  isPaused = false;
  speakFrom(currentIndex, onDone);
}


/* ═══════════════════════════════════════════════════════════════════
   WIDGET
═══════════════════════════════════════════════════════════════════ */
type WidgetState = "collapsed" | "expanded" | "playing";
type PopupId     = "speed" | "voice" | "settings";
type ThemeChoice = "dark" | "light" | "system";

class LouderWidget {
  private host: HTMLElement;
  private shadow: ShadowRoot;

  // State
  private wState: WidgetState = "collapsed";
  private ttsActive = false; // true while TTS is actually speaking (independent of visual state)
  private popup: PopupId | null = null;
  private highlightPreset: PresetKey = "amber";
  private domReady = false;
  private pendingSelection: string | null = null;
  private themeChoice: ThemeChoice = "dark";
  private speed = 1;
  private activeVoiceURI = "";
  private totalSecs = 300; // fallback estimate used before sentences are loaded
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Stable DOM refs (set in buildDOM, never reassigned)
  private root!: HTMLElement;
  private panelsCont!: HTMLElement;
  private playBtnEl!: HTMLButtonElement;
  private speedBadgeEl!: HTMLSpanElement;
  private timerEl!: HTMLSpanElement;
  private ringArc!: SVGCircleElement;
  private settingsBtnEl!: HTMLButtonElement;
  private speedBtnEl!: HTMLButtonElement;
  private voiceBtnEl!: HTMLButtonElement;
  private chevBtnEl!: HTMLButtonElement;

  // Drag
  private dragStartX = 0; private dragStartY = 0;
  private hostStartRight = 0; private hostStartTop = 0;
  private hasDragged = false;
  private saveDebounce: ReturnType<typeof setTimeout> | null = null;
  private lastTrigger: HTMLElement | undefined;
  private spRefs: { hdrVal: HTMLElement; hdrWpm: HTMLElement; fill: HTMLElement; handle: HTMLElement; labels: HTMLButtonElement[] } | null = null;
  private pinnedVoices: string[] = [];
  private voiceListExpanded = false;
  private voiceListEl: HTMLElement | null = null;

  constructor() {
    // Remove any orphaned host left by a previous extension load (reload / re-install)
    document.getElementById("louder-host")?.remove();

    this.host = document.createElement("div");
    this.host.id = "louder-host";
    this.host.style.display = "none"; // revealed on first toggle()
    this.shadow = this.host.attachShadow({ mode: "open" });
    document.documentElement.appendChild(this.host);

    this.injectFont();
    this.loadSettings().then(() => {
      this.applyThemeVars();
      this.buildDOM();
      this.setupDrag();
      speechSynthesis.addEventListener("voiceschanged", () => {
        if (this.popup === "voice") this.refreshVoiceList();
      });
      this.domReady = true;
      if (this.pendingSelection) {
        this.readSelection(this.pendingSelection);
        this.pendingSelection = null;
      }
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (this.themeChoice === "system") this.applyThemeVars();
    });
  }

  // ── Font ─────────────────────────────────────────────────────────
  private injectFont(): void {
    if (document.getElementById("louder-font")) return;
    const link = document.createElement("link");
    link.id = "louder-font"; link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }

  // ── Theme ─────────────────────────────────────────────────────────
  private resolvedTheme(): "dark" | "light" {
    if (this.themeChoice === "system")
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return this.themeChoice;
  }

  private applyThemeVars(): void {
    const theme = this.resolvedTheme();
    const t = theme === "light" ? LIGHT : DARK;
    const s = this.host.style;
    s.setProperty("--accent",      theme === "light" ? ACCENT_LIGHT      : ACCENT);
    s.setProperty("--accent-glow", theme === "light" ? ACCENT_LIGHT_GLOW : ACCENT_GLOW);
    s.setProperty("--accent-tint", theme === "light" ? ACCENT_LIGHT_TINT : ACCENT_TINT);
    s.setProperty("--bg",            t.bg);
    s.setProperty("--panel-bg",      t.panelBg);
    s.setProperty("--border",        t.border);
    s.setProperty("--divider",       t.divider);
    s.setProperty("--icon",          t.icon);
    s.setProperty("--icon-hover",    t.iconHover);
    s.setProperty("--text",          t.text);
    s.setProperty("--subtext",       t.subtext);
    s.setProperty("--timer",         t.timer);
    s.setProperty("--close-bg",      t.closeBg);
    s.setProperty("--close-border",  t.closeBorder);
    s.setProperty("--track-bg",      t.trackBg);
    s.setProperty("--chip-bg",       t.chipBg);
    s.setProperty("--chip-bg-hover", t.chipBgHover);
    s.setProperty("--panel-shadow",  t.panelShadow);

    s.setProperty("--pill-bg",       t.pillBg);
    s.setProperty("--pill-bg-hover", t.pillBgHover);
    s.setProperty("--drag-dot",      this.resolvedTheme() === "light" ? "#444" : "#fff");
  }

  // ── Persistence ───────────────────────────────────────────────────
  private async loadSettings(): Promise<void> {
    if (!chrome.runtime?.id) return; // extension context invalidated (tab survived a reload)
    return new Promise(resolve => {
      chrome.storage.local.get(
        ["selectedVoiceURI", "speed", "themeChoice", "panelRight", "panelTop", "pinnedVoices", "highlightPreset"],
        r => {
          if (typeof r.speed === "number" && SPEED_STOPS.includes(r.speed)) this.speed = r.speed;
          if (typeof r.selectedVoiceURI === "string") this.activeVoiceURI = r.selectedVoiceURI;
          if (r.themeChoice === "dark" || r.themeChoice === "light" || r.themeChoice === "system")
            this.themeChoice = r.themeChoice;
          if (Array.isArray(r.pinnedVoices)) this.pinnedVoices = r.pinnedVoices;
          if (typeof r.highlightPreset === "string" && r.highlightPreset in PRESETS) {
            this.highlightPreset = r.highlightPreset as PresetKey;
            applyHighlightColors(this.highlightPreset);
          }
          if (typeof r.panelRight === "number" && typeof r.panelTop === "number") {
            this.host.style.bottom = ""; this.host.style.left = "";
            this.host.style.right  = `${r.panelRight}px`;
            this.host.style.top    = `${r.panelTop}px`;
            this.hasDragged = true;
          }
          voiceURI = this.activeVoiceURI;
          ttsSpeed = this.speed;
          resolve();
        }
      );
    });
  }

  private saveSettings(): void {
    if (!chrome.runtime?.id) return;
    chrome.storage.local.set({
      selectedVoiceURI: this.activeVoiceURI,
      speed: this.speed,
      themeChoice: this.themeChoice,
      pinnedVoices: this.pinnedVoices,
      highlightPreset: this.highlightPreset,
    });
  }

  private scheduleSavePosition(): void {
    if (!chrome.runtime?.id) return;
    if (this.saveDebounce) clearTimeout(this.saveDebounce);
    this.saveDebounce = setTimeout(() => {
      chrome.storage.local.set({
        panelRight: parseInt(this.host.style.right, 10),
        panelTop:   parseInt(this.host.style.top,   10),
      });
    }, 300);
  }

  // ── Build DOM (called once) ───────────────────────────────────────
  private buildDOM(): void {
    this.shadow.innerHTML = "";

    const styleEl = document.createElement("style");
    styleEl.textContent = SHADOW_CSS;
    this.shadow.appendChild(styleEl);

    this.root = document.createElement("div");
    this.root.className = "root";
    this.root.dataset.state = this.wState;
    this.shadow.appendChild(this.root);

    // Panels container (rebuilt on popup toggle, pill never touched)
    this.panelsCont = document.createElement("div");
    this.root.appendChild(this.panelsCont);

    // ── Pill ──────────────────────────────────────────────────────
    const pill = document.createElement("div");
    pill.className = "pill";
    this.root.appendChild(pill);

    // Close button — was a plain <div>, not keyboard-operable at all
    const closeBtn = document.createElement("div");
    closeBtn.className = "close-btn";
    closeBtn.innerHTML = I.close;
    closeBtn.setAttribute("role", "button");
    closeBtn.setAttribute("tabindex", "0");
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("click", e => { e.stopPropagation(); this.handleClose(); });
    closeBtn.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); this.handleClose(); }
    });
    pill.appendChild(closeBtn);

    // Chevron — single icon rotated by CSS
    this.chevBtnEl = document.createElement("button");
    this.chevBtnEl.className = "chev-btn";
    this.chevBtnEl.setAttribute("aria-label", "Expand");
    const chevIcon = document.createElement("span");
    chevIcon.className = "chev-icon";
    chevIcon.innerHTML = I.chev;
    this.chevBtnEl.appendChild(chevIcon);
    this.chevBtnEl.addEventListener("click", () => {
      if (this.wState === "collapsed") {
        // Expand: if TTS is running show playing state, otherwise expanded-idle
        if (this.ttsActive) this.goPlaying();
        else this.goExpanded();
      } else {
        // Collapse: purely visual — TTS keeps playing
        this.goCollapsed();
      }
    });
    pill.appendChild(this.chevBtnEl);

    // ── Expandable section ─────────────────────────────────────────
    const expandable = document.createElement("div");
    expandable.className = "expandable";

    // Settings
    this.settingsBtnEl = document.createElement("button");
    this.settingsBtnEl.className = "icon-btn";
    this.settingsBtnEl.title = "Settings";
    this.settingsBtnEl.setAttribute("aria-label", "Settings");
    this.settingsBtnEl.setAttribute("aria-haspopup", "dialog");
    this.settingsBtnEl.innerHTML = I.sliders;
    this.settingsBtnEl.addEventListener("click", () => this.togglePopup("settings", this.settingsBtnEl));
    expandable.appendChild(this.settingsBtnEl);

    // Read selection
    const readSelBtn = document.createElement("button");
    readSelBtn.className = "icon-btn";
    readSelBtn.title = "Read it louder!";
    readSelBtn.setAttribute("aria-label", "Read selection aloud");
    readSelBtn.innerHTML = I.readSel;
    readSelBtn.addEventListener("click", () => {
      const sel = window.getSelection()?.toString().trim();
      this.startPlaying(sel || undefined);
    });
    expandable.appendChild(readSelBtn);

    // Speed badge
    this.speedBtnEl = document.createElement("button");
    this.speedBtnEl.className = "icon-btn";
    this.speedBtnEl.title = "Speed";
    this.speedBtnEl.setAttribute("aria-haspopup", "dialog");
    this.speedBadgeEl = document.createElement("span");
    this.speedBadgeEl.className = "speed-badge";
    this.speedBadgeEl.textContent = `${this.speed}×`;
    this.speedBtnEl.setAttribute("aria-label", `Speed: ${this.speed}×`);
    this.speedBtnEl.appendChild(this.speedBadgeEl);
    this.speedBtnEl.addEventListener("click", () => this.togglePopup("speed", this.speedBtnEl));
    expandable.appendChild(this.speedBtnEl);

    // Voice
    this.voiceBtnEl = document.createElement("button");
    this.voiceBtnEl.className = "icon-btn";
    this.voiceBtnEl.title = "Voice";
    this.voiceBtnEl.setAttribute("aria-label", "Voice");
    this.voiceBtnEl.setAttribute("aria-haspopup", "dialog");
    this.voiceBtnEl.innerHTML = I.person;
    this.voiceBtnEl.addEventListener("click", () => this.togglePopup("voice", this.voiceBtnEl));
    expandable.appendChild(this.voiceBtnEl);

    // Divider
    const divider = document.createElement("div");
    divider.className = "divider";
    expandable.appendChild(divider);

    pill.appendChild(expandable);

    // ── Timer slot ────────────────────────────────────────────────
    const timerSlot = document.createElement("div");
    timerSlot.className = "timer-slot";

    this.timerEl = document.createElement("span");
    this.timerEl.className = "timer-val";
    this.timerEl.textContent = "00:00";
    timerSlot.appendChild(this.timerEl);

    const skipBtns = document.createElement("div");
    skipBtns.className = "skip-btns";

    const skipBack = document.createElement("button");
    skipBack.className = "skip-btn";
    skipBack.title = "Previous sentence";
    skipBack.setAttribute("aria-label", "Previous sentence");
    skipBack.innerHTML = I.stepBack;
    skipBack.addEventListener("click", () => {
      if (!sentences.length) return;
      const newIdx = Math.max(0, currentIndex - 1);
      const newElapsed = Array.from({ length: newIdx }, (_, j) => realSentenceDurations[j] ?? 0)
                              .reduce((s, d) => s + d, 0);
      ttsGeneration++; realElapsedBase = newElapsed;
      speechSynthesis.cancel(); speakFrom(newIdx, ttsOnDone);
      this.patchTimer();
    });
    skipBtns.appendChild(skipBack);

    const skipFwd = document.createElement("button");
    skipFwd.className = "skip-btn";
    skipFwd.title = "Next sentence";
    skipFwd.setAttribute("aria-label", "Next sentence");
    skipFwd.innerHTML = I.stepFwd;
    skipFwd.addEventListener("click", () => {
      if (!sentences.length) return;
      const newIdx = Math.min(sentences.length - 1, currentIndex + 1);
      const newElapsed = Array.from({ length: newIdx }, (_, j) => realSentenceDurations[j] ?? 0)
                              .reduce((s, d) => s + d, 0);
      ttsGeneration++; realElapsedBase = newElapsed;
      speechSynthesis.cancel(); speakFrom(newIdx, ttsOnDone);
      this.patchTimer();
    });
    skipBtns.appendChild(skipFwd);

    timerSlot.appendChild(skipBtns);
    pill.appendChild(timerSlot);

    // ── Play wrap + ring ──────────────────────────────────────────
    const playWrap = document.createElement("div");
    playWrap.className = "play-wrap";

    // Progress ring (always in DOM, opacity controlled by CSS)
    const R = 20, SIZE = 48, CIRC = 2 * Math.PI * R;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
    svg.classList.add("progress-ring");
    svg.setAttribute("width",  String(SIZE));
    svg.setAttribute("height", String(SIZE));
    svg.style.transform = "rotate(-90deg)";

    const trackCircle = document.createElementNS(ns, "circle");
    trackCircle.setAttribute("cx", String(SIZE / 2)); trackCircle.setAttribute("cy", String(SIZE / 2));
    trackCircle.setAttribute("r", String(R)); trackCircle.setAttribute("fill", "none");
    trackCircle.setAttribute("stroke-width", "2.2");
    trackCircle.classList.add("ring-track");
    svg.appendChild(trackCircle);

    this.ringArc = document.createElementNS(ns, "circle") as SVGCircleElement;
    this.ringArc.setAttribute("cx", String(SIZE / 2)); this.ringArc.setAttribute("cy", String(SIZE / 2));
    this.ringArc.setAttribute("r", String(R)); this.ringArc.setAttribute("fill", "none");
    this.ringArc.classList.add("ring-arc"); this.ringArc.setAttribute("stroke-width", "2.2");
    this.ringArc.setAttribute("stroke-linecap", "round");
    this.ringArc.setAttribute("stroke-dasharray", `0 ${CIRC}`);
    this.ringArc.style.transition = "stroke-dasharray 1s linear";
    svg.appendChild(this.ringArc);

    playWrap.appendChild(svg);

    this.playBtnEl = document.createElement("button");
    this.playBtnEl.className = "play-btn";
    this.setPlayIcon(false);
    this.playBtnEl.addEventListener("click", () => this.handlePlayClick());
    playWrap.appendChild(this.playBtnEl);

    pill.appendChild(playWrap);

    // Spacer + drag dots
    const spacer = document.createElement("div");
    spacer.style.width = "6px";
    pill.appendChild(spacer);
    pill.appendChild(this.makeDragDots());

    // Close panel on outside click
    document.addEventListener("mousedown", (e: MouseEvent) => {
      if (this.popup && !this.host.contains(e.target as Node)) this.setPopup(null);
    });
    // Close panel on Escape and return focus to whichever button opened it —
    // without this, a keyboard user had no way to close a popup at all.
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.popup) {
        e.stopPropagation();
        const trigger = this.lastTrigger;
        this.setPopup(null);
        trigger?.focus();
      }
    });
  }

  // ── State transitions — purely visual, never touch TTS ───────────
  private goCollapsed(): void {
    this.wState = "collapsed";
    this.root.dataset.state = "collapsed";
    this.chevBtnEl.setAttribute("aria-label", "Expand");
    this.setPopup(null);
  }

  private goExpanded(): void {
    this.wState = "expanded";
    this.root.dataset.state = "expanded";
    this.chevBtnEl.setAttribute("aria-label", "Collapse");
    this.setPopup(null);
  }

  private goPlaying(): void {
    this.wState = "playing";
    this.root.dataset.state = "playing";
    this.chevBtnEl.setAttribute("aria-label", "Collapse");
  }

  // ── Popup ─────────────────────────────────────────────────────────
  private setPopup(id: PopupId | null, trigger?: HTMLElement): void {
    if (trigger) this.lastTrigger = trigger;
    this.popup = id;
    this.settingsBtnEl.classList.toggle("active", id === "settings");
    this.speedBtnEl.classList.toggle("active",    id === "speed");
    this.voiceBtnEl.classList.toggle("active",    id === "voice");

    this.root.toggleAttribute("data-panel-open", !!id);
    this.panelsCont.innerHTML = "";
    if (!id) { this.spRefs = null; return; }

    const wrap = document.createElement("div");
    wrap.className = "panels-wrap";
    const panelEl = this.buildPanel(id);
    wrap.appendChild(panelEl);
    this.panelsCont.appendChild(wrap);
    // Move focus into the panel so keyboard/screen-reader users land somewhere
    // meaningful instead of staying on the trigger button with no indication
    // anything opened. tabIndex=-1 on the panel (set in each builder) makes it
    // programmatically focusable without adding it to normal tab order.
    panelEl.focus();

    // Position panel horizontally centered below the trigger button
    const triggerEl = trigger ?? this.lastTrigger;
    if (triggerEl) {
      requestAnimationFrame(() => {
        const trigRect  = triggerEl.getBoundingClientRect();
        const rootRect  = this.root.getBoundingClientRect();
        const center    = trigRect.left + trigRect.width / 2 - rootRect.left;
        const wrapW     = wrap.offsetWidth;
        const maxLeft   = rootRect.width - wrapW;
        wrap.style.left = `${Math.max(0, Math.min(center - wrapW / 2, maxLeft))}px`;
      });
    }
  }

  private togglePopup(id: PopupId, trigger: HTMLElement): void {
    if (this.popup === id) this.setPopup(null);
    else this.setPopup(id, trigger);
  }

  // ── Panel builders ────────────────────────────────────────────────
  private buildPanel(id: PopupId): HTMLElement {
    if (id === "speed")    return this.buildSpeedPanel();
    if (id === "voice")    return this.buildVoicePanel();
    return this.buildSettingsPanel();
  }

  private buildSpeedPanel(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "panel speed-panel";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Speed");
    wrap.tabIndex = -1;

    const idx  = SPEED_STOPS.indexOf(this.speed);
    const pct  = idx / (SPEED_STOPS.length - 1);
    const wpm  = Math.round(this.speed * BASE_WPM);

    const hdr = document.createElement("div");
    hdr.className = "speed-hdr";
    const hdrInfo = document.createElement("div");
    const hdrVal = document.createElement("div"); hdrVal.className = "speed-hdr-val"; hdrVal.textContent = `${this.speed}×`;
    const hdrWpm = document.createElement("div"); hdrWpm.className = "speed-hdr-wpm"; hdrWpm.textContent = `${wpm} wpm`;
    hdrInfo.appendChild(hdrVal); hdrInfo.appendChild(hdrWpm); hdr.appendChild(hdrInfo);
    const hdrClose = document.createElement("div");
    hdrClose.className = "panel-close"; hdrClose.innerHTML = I.close;
    hdrClose.setAttribute("aria-label", "Close");
    hdrClose.addEventListener("click", () => this.setPopup(null));
    hdr.appendChild(hdrClose);
    wrap.appendChild(hdr);

    const body = document.createElement("div");
    body.className = "speed-body";

    const trackCol = document.createElement("div");
    trackCol.className = "speed-track-col";

    const stepUp = document.createElement("button");
    stepUp.className = "step-btn"; stepUp.textContent = "+";
    stepUp.addEventListener("click", () => { const n = SPEED_STOPS.indexOf(this.speed) - 1; if (n >= 0) this.applySpeed(SPEED_STOPS[n]); });
    trackCol.appendChild(stepUp);

    const track = document.createElement("div");
    track.className = "speed-track";
    const trackBg = document.createElement("div"); trackBg.className = "speed-track-bg"; track.appendChild(trackBg);
    const trackFill = document.createElement("div"); trackFill.className = "speed-track-fill";
    trackFill.style.top = `${pct*100}%`; trackFill.style.height = `${(1-pct)*100}%`; track.appendChild(trackFill);
    const trackHandle = document.createElement("div"); trackHandle.className = "speed-handle";
    trackHandle.style.top = `${pct*100}%`; track.appendChild(trackHandle);

    const pickFromY = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      this.applySpeed(SPEED_STOPS[Math.round(ratio * (SPEED_STOPS.length - 1))]);
    };
    track.addEventListener("mousedown", e => {
      e.preventDefault(); pickFromY(e.clientY);
      const onMove = (ev: MouseEvent) => pickFromY(ev.clientY);
      const onUp   = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
      window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    });
    trackCol.appendChild(track);

    const stepDn = document.createElement("button");
    stepDn.className = "step-btn"; stepDn.textContent = "−";
    stepDn.addEventListener("click", () => { const n = SPEED_STOPS.indexOf(this.speed) + 1; if (n < SPEED_STOPS.length) this.applySpeed(SPEED_STOPS[n]); });
    trackCol.appendChild(stepDn);
    body.appendChild(trackCol);

    const labelsCol = document.createElement("div");
    labelsCol.className = "speed-labels";
    const labelEls: HTMLButtonElement[] = [];
    SPEED_STOPS.forEach(s => {
      const lbl = document.createElement("button");
      lbl.className = `speed-label${s === this.speed ? " active" : ""}`;
      lbl.textContent = `${s}×`;
      lbl.addEventListener("click", () => this.applySpeed(s));
      labelEls.push(lbl);
      labelsCol.appendChild(lbl);
    });
    body.appendChild(labelsCol);
    wrap.appendChild(body);

    // Store refs so applySpeed can update values without rebuilding the panel
    this.spRefs = { hdrVal, hdrWpm, fill: trackFill, handle: trackHandle, labels: labelEls };
    return wrap;
  }

  private detectPageLang(): string {
    const raw = document.documentElement.lang || "";
    if (raw) return raw.split("-")[0].toLowerCase();
    return navigator.language.split("-")[0].toLowerCase();
  }

  /** Returns all installed voices sorted by relevance: system lang first, then alphabetically.
   *  Deduplicates by voiceURI — some Microsoft voices share the same URI, which would cause
   *  multiple entries to appear pinned when only one was selected. */
  private getRelevantVoices(): SpeechSynthesisVoice[] {
    const sysLang = navigator.language.split("-")[0].toLowerCase();
    const sys   = voiceCache.filter(v =>  v.lang.toLowerCase().startsWith(sysLang));
    const other = voiceCache.filter(v => !v.lang.toLowerCase().startsWith(sysLang))
                            .sort((a, b) => a.lang.localeCompare(b.lang));
    const seen = new Set<string>();
    return [...sys, ...other].filter(v => {
      if (seen.has(v.voiceURI)) return false;
      seen.add(v.voiceURI); return true;
    });
  }

  private buildVoicePanel(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "panel voice-panel";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Voice");
    wrap.tabIndex = -1;

    const hdr = document.createElement("div");
    hdr.className = "panel-hdr";
    hdr.innerHTML = `<span class="panel-lbl">Voices</span>`;
    const hdrClose = document.createElement("div");
    hdrClose.className = "panel-close"; hdrClose.innerHTML = I.close;
    hdrClose.setAttribute("aria-label", "Close");
    hdrClose.addEventListener("click", () => this.setPopup(null));
    hdr.appendChild(hdrClose);
    wrap.appendChild(hdr);

    const list = document.createElement("div");
    list.className = "voice-list";
    this.voiceListEl = list;
    this.refreshVoiceList();

    wrap.appendChild(list);
    return wrap;
  }

  private refreshVoiceList(flipURI?: string): void {
    const list = this.voiceListEl;
    if (!list) return;

    const fmt = (v: SpeechSynthesisVoice) =>
      v.name.replace(/^Microsoft\s+/i, "").replace(/\s+Desktop.*$/i, "");

    // ── FLIP: snapshot positions before clearing ──────────────────────
    const before = new Map<string, DOMRect>();
    list.querySelectorAll<HTMLElement>(".voice-item[data-uri]").forEach(el => {
      before.set(el.dataset.uri!, el.getBoundingClientRect());
    });

    list.innerHTML = "";

    const allVoices = this.getRelevantVoices().filter(v => v.voiceURI);
    const pinnedSet = new Set(this.pinnedVoices);
    const pinned   = allVoices.filter(v =>  pinnedSet.has(v.voiceURI));
    const unpinned = allVoices.filter(v => !pinnedSet.has(v.voiceURI));
    const hasPinned = pinned.length > 0;

    const makeItem = (uri: string, name: string, hint: string, isPinned: boolean): HTMLElement => {
      const item = document.createElement("div");
      item.className = `voice-item${this.activeVoiceURI === uri ? " active" : ""}`;
      if (uri) item.dataset.uri = uri;

      const avatar  = document.createElement("div"); avatar.className = "voice-avatar"; avatar.innerHTML = I.person;
      const textDiv = document.createElement("div"); textDiv.style.flex = "1";
      const nameEl  = document.createElement("div"); nameEl.className = "voice-name"; nameEl.textContent = name;
      const hintEl  = document.createElement("div"); hintEl.className = "voice-hint"; hintEl.textContent = hint;
      textDiv.appendChild(nameEl); textDiv.appendChild(hintEl);
      item.appendChild(avatar); item.appendChild(textDiv);

      if (uri) {
        const pinBtn = document.createElement("button");
        pinBtn.className = `pin-btn${isPinned ? " pinned" : ""}`;
        pinBtn.title     = isPinned ? "Unpin" : "Pin to top";
        pinBtn.innerHTML = isPinned ? I.star : I.starOut;
        pinBtn.addEventListener("click", e => {
          e.stopPropagation();
          this.togglePinVoice(uri);
        });
        item.appendChild(pinBtn);
      }

      item.addEventListener("click", () => {
        this.activeVoiceURI = uri; voiceURI = uri;
        this.saveSettings();
        list.querySelectorAll<HTMLElement>(".voice-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
      });
      return item;
    };

    list.appendChild(makeItem("", "Default", "Browser default", false));
    pinned.forEach(v => list.appendChild(makeItem(v.voiceURI, fmt(v), v.lang, true)));

    if (allVoices.length === 0) {
      const loading = document.createElement("div");
      loading.style.cssText = "padding:6px 10px 10px;font-size:12px;color:var(--subtext);";
      loading.textContent = "Loading voices…";
      list.appendChild(loading);
    } else if (unpinned.length > 0) {
      if (hasPinned) list.appendChild(Object.assign(document.createElement("div"), { className: "voice-divider" }));

      if (hasPinned && !this.voiceListExpanded) {
        const btn = document.createElement("button");
        btn.className = "show-more-btn";
        btn.textContent = `Show ${unpinned.length} more ▾`;
        btn.addEventListener("click", () => { this.voiceListExpanded = true; this.refreshVoiceList(); });
        list.appendChild(btn);
      } else {
        unpinned.forEach(v => list.appendChild(makeItem(v.voiceURI, fmt(v), v.lang, false)));
        if (hasPinned) {
          const btn = document.createElement("button");
          btn.className = "show-more-btn";
          btn.textContent = "Show less ▴";
          btn.addEventListener("click", () => { this.voiceListExpanded = false; this.refreshVoiceList(); });
          list.appendChild(btn);
        }
      }
    }

    // ── FLIP: play animations ─────────────────────────────────────────
    list.querySelectorAll<HTMLElement>(".voice-item[data-uri]").forEach(el => {
      const uri = el.dataset.uri!;
      const prev = before.get(uri);
      if (!prev) {
        // New item entering the visible list (e.g. show-more expanded)
        el.classList.add("voice-item-enter");
        return;
      }
      const curr = el.getBoundingClientRect();
      const dy = prev.top - curr.top;
      if (Math.abs(dy) < 1) return; // didn't move
      // Snap to old position, then transition to natural position
      el.style.transform  = `translateY(${dy}px)`;
      el.style.transition = "none";
      requestAnimationFrame(() => {
        el.style.transition = "transform .22s cubic-bezier(.25,.46,.45,.94)";
        el.style.transform  = "translateY(0)";
        el.addEventListener("transitionend", () => {
          el.style.transform = ""; el.style.transition = "";
        }, { once: true });
      });
    });
  }

  private togglePinVoice(uri: string): void {
    const idx = this.pinnedVoices.indexOf(uri);
    if (idx >= 0) this.pinnedVoices.splice(idx, 1);
    else        { this.pinnedVoices.push(uri); this.voiceListExpanded = true; }
    this.saveSettings();
    this.refreshVoiceList(uri);
  }

  private buildSettingsPanel(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "panel settings-panel";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Settings");
    wrap.tabIndex = -1;

    const hdr = document.createElement("div");
    hdr.className = "panel-hdr";
    hdr.innerHTML = `<span class="panel-lbl">Settings</span>`;
    const hdrClose = document.createElement("div");
    hdrClose.className = "panel-close"; hdrClose.innerHTML = I.close;
    hdrClose.setAttribute("aria-label", "Close");
    hdrClose.addEventListener("click", () => this.setPopup(null));
    hdr.appendChild(hdrClose);
    wrap.appendChild(hdr);

    const themeLbl = document.createElement("span");
    themeLbl.className = "section-lbl";
    themeLbl.textContent = "Theme";
    wrap.appendChild(themeLbl);

    const seg = document.createElement("div");
    seg.className = "theme-seg";
    (["dark", "light", "system"] as ThemeChoice[]).forEach(opt => {
      const btn = document.createElement("button");
      btn.className = `theme-btn${this.themeChoice === opt ? " active" : ""}`;
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        this.themeChoice = opt; this.saveSettings();
        this.applyThemeVars();
        seg.querySelectorAll<HTMLElement>(".theme-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
      seg.appendChild(btn);
    });
    wrap.appendChild(seg);

    const presetSection = document.createElement("div");
    presetSection.className = "preset-section";
    const presetLbl = document.createElement("span");
    presetLbl.className = "section-lbl";
    presetLbl.textContent = "Highlight";
    presetSection.appendChild(presetLbl);

    const grid = document.createElement("div");
    grid.className = "preset-grid";
    (Object.keys(PRESETS) as PresetKey[]).forEach(key => {
      const p = PRESETS[key];
      const item = document.createElement("button");
      item.className = `preset-item${this.highlightPreset === key ? " active" : ""}`;
      const name = document.createElement("span");
      name.className = "preset-name";
      name.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      const mini = document.createElement("div");
      mini.className = "preset-mini";
      const miniS = document.createElement("div");
      miniS.className = "mini-s";
      miniS.style.background = p.sentenceBg;
      const miniW = document.createElement("div");
      miniW.className = "mini-w";
      miniW.style.background = p.dotColor;
      mini.appendChild(miniS);
      mini.appendChild(miniW);
      item.appendChild(name);
      item.appendChild(mini);
      item.addEventListener("click", () => {
        this.highlightPreset = key;
        this.saveSettings();
        applyHighlightColors(key);
        grid.querySelectorAll<HTMLElement>(".preset-item").forEach(s => s.classList.remove("active"));
        item.classList.add("active");
      });
      grid.appendChild(item);
    });
    presetSection.appendChild(grid);
    wrap.appendChild(presetSection);
    return wrap;
  }

  // ── Helpers ───────────────────────────────────────────────────────
  private makeDragDots(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "drag-dots";
    for (let r = 0; r < 3; r++) {
      const row = document.createElement("div");
      row.className = "drag-row";
      for (let c = 0; c < 2; c++) {
        const dot = document.createElement("div");
        dot.className = "drag-dot";
        row.appendChild(dot);
      }
      wrap.appendChild(row);
    }
    return wrap;
  }

  // ── Playback ──────────────────────────────────────────────────────
  private handlePlayClick(): void {
    if (this.ttsActive) {
      // Pause
      pauseTTS();
      this.setTTSActive(false);
      this.setPlayIcon(false);
      // If the pill was showing the playing (expanded) view, drop back to expanded-idle
      if (this.wState === "playing") {
        this.stopTimer();
        this.goExpanded();
      }
    } else if (isPaused && sentences.length > 0) {
      // Resume paused session from wherever the widget sits visually
      this.setTTSActive(true);
      this.setPlayIcon(true);
      if (this.wState !== "collapsed") {
        this.goPlaying();
        this.startTimer();
      } else {
        // Stay collapsed — timer still ticks in background so expanding later shows correct time
        this.startTimer();
      }
      resumeTTS(() => this.onTTSDone());
    } else {
      // Fresh start
      this.startPlaying();
    }
  }

  /** Called when TTS finishes naturally (not paused/stopped). */
  private onTTSDone(): void {
    this.setTTSActive(false);
    this.stopTimer();
    this.setPlayIcon(false);
    if (this.wState === "playing") this.goExpanded();
  }

  private startPlaying(text?: string): void {
    const raw = text ?? extractText();
    const wordCount = raw.split(/\s+/).length;
    this.totalSecs = Math.max(10, Math.round(wordCount / (this.speed * BASE_WPM) * 60));
    this.setTTSActive(true);
    this.setPlayIcon(true);
    this.startTimer();

    // Only expand to playing view if already expanded; stay collapsed if collapsed
    if (this.wState !== "collapsed") this.goPlaying();

    ttsSpeed = this.speed;
    voiceURI = this.activeVoiceURI;
    ttsLang  = detectTextLang(raw); // detect from actual content, not page UI lang
    startTTS(text, () => this.onTTSDone());
  }

  private applySpeed(s: number): void {
    const oldSpeed = this.speed;
    this.speed = s; ttsSpeed = s;
    this.speedBadgeEl.textContent = `${s}×`;
    this.speedBtnEl.setAttribute("aria-label", `Speed: ${s}×`);
    if (sentences.length > 0) {
      const wps = Math.max(0.1, s * BASE_WPM / 60);
      calculatedTotalSecs = sentences.reduce((sum, sent) => sum + sent.split(/\s+/).length / wps, 0);
    } else {
      this.totalSecs = Math.max(10, Math.round(this.totalSecs * (oldSpeed / s)));
    }
    this.saveSettings();

    // Update speed panel in-place — avoids the popIn blink from a full rebuild
    if (this.spRefs) {
      const idx = SPEED_STOPS.indexOf(s);
      const pct = idx / (SPEED_STOPS.length - 1);
      this.spRefs.hdrVal.textContent = `${s}×`;
      this.spRefs.hdrWpm.textContent = `${Math.round(s * BASE_WPM)} wpm`;
      this.spRefs.fill.style.top    = `${pct * 100}%`;
      this.spRefs.fill.style.height = `${(1 - pct) * 100}%`;
      this.spRefs.handle.style.top  = `${pct * 100}%`;
      this.spRefs.labels.forEach((lbl, i) => lbl.classList.toggle("active", SPEED_STOPS[i] === s));
    } else {
      this.setPopup("speed");
    }
  }

  private handleClose(): void {
    stopTTS();
    this.setTTSActive(false);
    this.stopTimer();
    this.setPlayIcon(false);
    this.wState = "collapsed";
    if (this.root) this.root.dataset.state = "collapsed";
    this.setPopup(null);
    this.hideWidget();
    window.getSelection()?.removeAllRanges(); // E3: clear selection so trigger doesn't re-surface
  }

  private setTTSActive(v: boolean): void {
    this.ttsActive = v;
    if (v) this.root.dataset.ttsActive = "true";
    else   delete this.root.dataset.ttsActive;
  }

  // ── Timer ─────────────────────────────────────────────────────────
  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.patchTimer();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval !== null) { clearInterval(this.timerInterval); this.timerInterval = null; }
  }

  /** Swaps the play/pause icon AND its accessible name together — title
   *  was previously set once at creation and never updated, so screen
   *  readers always announced "Play" even while actively playing. */
  private setPlayIcon(playing: boolean): void {
    this.playBtnEl.innerHTML = playing ? I.pause : I.play;
    this.playBtnEl.title = playing ? "Pause" : "Play";
    this.playBtnEl.setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  private hideWidget(): void {
    this.host.setAttribute("data-hiding", "");
    setTimeout(() => {
      this.host.style.display = "none";
      this.host.removeAttribute("data-hiding");
    }, 280);
  }

  private patchTimer(): void {
    const e     = Math.floor(calcElapsed());
    const total = calculatedTotalSecs > 0 ? Math.ceil(calculatedTotalSecs) : this.totalSecs;
    const m = Math.floor(e / 60);
    const s = e % 60;
    this.timerEl.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    const CIRC  = 2 * Math.PI * 20;
    const ratio = Math.min(1, e / Math.max(1, total));
    this.ringArc.setAttribute("stroke-dasharray", `${ratio * CIRC} ${CIRC}`);
  }

  // ── Drag ─────────────────────────────────────────────────────────
  private setupDrag(): void {
    this.shadow.addEventListener("mousedown", (e: Event) => {
      const me = e as MouseEvent;
      if (!(me.target as HTMLElement).closest(".drag-dots")) return;
      e.preventDefault();

      if (!this.hasDragged) {
        const rect = this.host.getBoundingClientRect();
        this.host.style.left = ""; this.host.style.bottom = "";
        this.host.style.right = `${window.innerWidth - rect.right}px`;
        this.host.style.top   = `${rect.top}px`;
        this.hasDragged = true;
      }

      this.dragStartX     = me.clientX;
      this.dragStartY     = me.clientY;
      this.hostStartRight = parseInt(this.host.style.right, 10);
      this.hostStartTop   = parseInt(this.host.style.top,   10);

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - this.dragStartX;
        const dy = ev.clientY - this.dragStartY;
        this.host.style.right = `${Math.max(0, Math.min(window.innerWidth - 60, this.hostStartRight - dx))}px`;
        this.host.style.top   = `${Math.max(0, Math.min(window.innerHeight - 50, this.hostStartTop + dy))}px`;
        this.scheduleSavePosition();
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup",   onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup",   onUp);
    });
  }

  // ── Public API ────────────────────────────────────────────────────
  /** Called when another tab claimed TTS ownership. Speech is already gone —
   *  just fake-pause so the user can click play to resume here if they return. */
  notifyExternalStop(): void {
    if (!this.ttsActive) return;
    isPaused = true;       // keep sentences[] so user can resume
    removeHighlight();
    this.setTTSActive(false);
    this.stopTimer();
    this.setPlayIcon(false);
    if (this.wState === "playing") this.goExpanded();
  }

  /** Estimate total reading time from the current page so the progress ring
   *  has a meaningful total before the user presses play. Runs async so it
   *  doesn't block the widget appearing. Skipped if TTS is already active. */
  private preCalculateTotalTime(): void {
    if (this.ttsActive || isPaused) return;
    setTimeout(() => {
      try {
        const raw = extractText();
        const words = raw.split(/\s+/).length;
        this.totalSecs = Math.max(10, Math.round(words / (this.speed * BASE_WPM) * 60));
      } catch { /* non-critical */ }
    }, 0);
  }

  toggle(): void {
    if (this.host.style.display === "none") {
      this.host.style.display = "";
      this.preCalculateTotalTime();
    } else {
      this.hideWidget();
    }
  }

  readSelection(text?: string): void {
    const sel = text?.trim() || window.getSelection()?.toString().trim();
    if (!sel) return;
    if (!this.domReady) {
      this.host.style.display = "";
      this.pendingSelection = sel;
      return;
    }
    if (this.host.style.display === "none") {
      this.host.style.display = "";
      this.preCalculateTotalTime();
    }
    this.startPlaying(sel);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   BOOTSTRAP
═══════════════════════════════════════════════════════════════════ */
let widget: LouderWidget | null = null;

function getWidget(): LouderWidget {
  if (!widget) widget = new LouderWidget();
  return widget;
}

chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {
    case "TOGGLE_PANEL":    getWidget().toggle(); break;
    case "READ_SELECTION":  getWidget().readSelection(msg.text); break;
  }
});

// Cross-tab coordination: when another instance claims TTS ownership,
// fake-pause this tab so its UI doesn't get stuck in a playing state.
chrome.storage.onChanged.addListener((changes, area) => {
  if (!chrome.runtime?.id) return; // context invalidated — ignore
  if (area !== "local" || !changes[PLAYING_OWNER_KEY]) return;
  const newOwner = changes[PLAYING_OWNER_KEY].newValue;
  if (newOwner && newOwner !== INSTANCE_ID && widget) {
    widget.notifyExternalStop();
  }
});

// Detect extension removal via a keepalive port.
// The port disconnects when the service worker sleeps (normal — reconnect)
// or when the extension is removed (connect() throws — clean up).
function connectKeepalive(): void {
  try {
    const port = chrome.runtime.connect({ name: "louder-keepalive" });
    port.onDisconnect.addListener(() => {
      // Wait briefly then try to reconnect; if extension is gone connect() throws.
      setTimeout(connectKeepalive, 200);
    });
  } catch {
    // Extension removed or reloaded — tear everything down.
    stopTTS();
    document.getElementById("louder-host")?.remove();
    widget = null;
  }
}
connectKeepalive();

/* ═══════════════════════════════════════════════════════════════════
   SELECTION TRIGGER
   Fixed-position pill near selected text. Outside Shadow DOM so it
   can position relative to any page selection.
═══════════════════════════════════════════════════════════════════ */

// ── Icons ────────────────────────────────────────────────────────
const T_PLAY  = `<svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><path d="M2 1.5l8 4.5-8 4.5V1.5z"/></svg>`;
const T_CLOSE = `<svg width="8" height="8" viewBox="0 0 8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M1 1l6 6M7 1L1 7"/></svg>`;

// ── Shadow root ──────────────────────────────────────────────────
// Trigger lives in a closed shadow root so its label text ("Read it louder!")
// never surfaces in document.body.innerText / textContent — page-analysis
// tools (including our own get_page_text-style extractors) read the page's
// visible text via innerText, which does not cross shadow boundaries. This
// keeps the trigger pixel-identical on screen while stopping it from being
// scooped up alongside real page content and misread as an embedded instruction.
const tRootHost = document.createElement("div");
tRootHost.id = "louder-trigger-root";
document.body.appendChild(tRootHost);
const tShadow = tRootHost.attachShadow({ mode: "closed" });

// ── Styles ───────────────────────────────────────────────────────
(() => {
  const s = document.createElement("style");
  s.id = "louder-trigger-style";
  s.textContent = `
  #louder-trigger {
    position: fixed; z-index: 2147483647;
    display: flex; align-items: center; justify-content: flex-start; gap: 0;
    background: rgba(0,125,111,0.92);
    border: 1.5px solid rgba(70,237,213,0.5);
    border-radius: 100px; height: 32px;
    box-sizing: border-box !important;
    box-shadow: 0 2px 10px rgba(0,125,111,0.45);
    cursor: pointer; user-select: none; white-space: nowrap;
    font-family: 'DM Sans', system-ui, sans-serif;
    transition: gap .22s cubic-bezier(.4,0,.2,1), background .18s, box-shadow .18s, opacity .18s;
    opacity: 0; pointer-events: none;
  }
  #louder-trigger[data-side="right"] { flex-direction: row-reverse; }
  #louder-trigger.lt-on { opacity: 1; pointer-events: auto; }
  #louder-trigger:hover {
    background: #1a2d2a; gap: 6px;
    box-shadow: 0 4px 20px rgba(0,125,111,0.65), 0 0 0 1px rgba(70,237,213,0.25);
  }
  /* Padding only on the dismiss side — icon badge fills its edge */
  #louder-trigger[data-side="left"]:hover  { padding-right: 12px; }
  #louder-trigger[data-side="right"]:hover { padding-left: 12px; }
  /* Icon becomes a distinct teal badge — same border as the pill */
  #louder-trigger:hover #louder-trigger-icon {
    background: rgba(0,125,111,0.95);
    border-radius: 50%;
    box-shadow: 0 0 0 1.5px rgba(70,237,213,0.5);
  }
  /* Label hover: bright text + whole pill lights up */
  #louder-trigger:hover #louder-trigger-label:hover { color: #fff; }
  #louder-trigger:has(#louder-trigger-label:hover) {
    background: #243b37;
    box-shadow: 0 4px 24px rgba(70,237,213,0.3), 0 0 0 1.5px rgba(70,237,213,0.55);
  }
  #louder-trigger-icon {
    color: #fff; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; width: 32px; height: 32px;
  }
  #louder-trigger-label {
    color: #46edd5; font-size: 11.5px; font-weight: 600; line-height: 1; flex-shrink: 0;
    max-width: 0; overflow: hidden; opacity: 0;
    transition: max-width .22s cubic-bezier(.4,0,.2,1), opacity .14s .06s, color .18s;
  }
  #louder-trigger-dismiss {
    color: rgba(70,237,213,0.6); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    max-width: 0; overflow: hidden; opacity: 0;
    transition: max-width .22s cubic-bezier(.4,0,.2,1), opacity .14s .06s, color .12s;
  }
  #louder-trigger:hover #louder-trigger-label,
  #louder-trigger:focus-visible #louder-trigger-label { max-width: 160px; opacity: 1; }
  #louder-trigger:hover #louder-trigger-dismiss,
  #louder-trigger:focus-visible #louder-trigger-dismiss { max-width: 18px; opacity: 1; }
  #louder-trigger-dismiss:hover { color: #fff; }
  #louder-trigger.lt-light:hover { background: #006057; }
  /* Keyboard focus: same expanded state as hover, plus a visible ring —
     otherwise a keyboard user tabbing here sees nothing change at all. */
  #louder-trigger:focus-visible {
    background: #1a2d2a; gap: 6px;
    outline: 2px solid #46edd5; outline-offset: 2px;
  }
  #louder-trigger-dismiss:focus-visible {
    outline: 2px solid #46edd5; outline-offset: 1px; border-radius: 4px;
  }
  `;
  tShadow.appendChild(s);
})();

// ── DOM ──────────────────────────────────────────────────────────
const tHost    = document.createElement("div");  tHost.id = "louder-trigger";
const tIcon    = document.createElement("div");  tIcon.id = "louder-trigger-icon";    tIcon.innerHTML = T_PLAY;
const tLabel   = document.createElement("span"); tLabel.id = "louder-trigger-label";  tLabel.textContent = "Read it louder!";
const tDismiss = document.createElement("div");  tDismiss.id = "louder-trigger-dismiss"; tDismiss.innerHTML = T_CLOSE;

// Keyboard-operable + properly named for assistive tech. The accessible name
// leads with "Louder extension:" — real, visible-adjacent context (not hidden
// deceptively; it's the standard visually-hidden-label pattern) so a screen
// reader announces this as extension chrome, not page content, and so an AI
// agent reading the accessibility tree doesn't mistake the imperative phrase
// "Read it louder!" for an instruction embedded in the page.
tHost.setAttribute("role", "button");
tHost.setAttribute("tabindex", "0");
tHost.setAttribute("aria-label", "Louder extension: Read it louder!");
tIcon.setAttribute("aria-hidden", "true"); // decorative — meaning is in tHost's aria-label
tDismiss.setAttribute("role", "button");
tDismiss.setAttribute("tabindex", "0");
tDismiss.setAttribute("aria-label", "Dismiss");

tHost.appendChild(tIcon); tHost.appendChild(tLabel); tHost.appendChild(tDismiss);
tShadow.appendChild(tHost);

// ── State ────────────────────────────────────────────────────────
let tText    = "";
let tVisible = false;
let tLastX   = 0;
let tLastY   = 0;
document.addEventListener("mousemove", (e: MouseEvent) => { tLastX = e.clientX; tLastY = e.clientY; }, { passive: true });

// ── Helpers ──────────────────────────────────────────────────────
function tApplyTheme(): void {
  tHost.classList.toggle("lt-light", !window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function tPlace(selRect: DOMRect): void {
  const PAD = 10, W = 32, H = 32;
  const vw = window.innerWidth, vh = window.innerHeight;
  const mx = tLastX, my = tLastY;

  // Vertical uses selection rect (accurately above/below the text block)
  // Horizontal uses mouse endpoint (cursor X = where user actually stopped)
  const hasRect = selRect.width > 0 && selRect.height > 0;
  const rTop    = hasRect ? selRect.top    : my - 20;
  const rBottom = hasRect ? selRect.bottom : my + 4;

  // Horizontal: which half of viewport did the cursor end in?
  const side: "left" | "right" = mx > vw / 2 ? "right" : "left";

  // Vertical: cursor at bottom of selection → trigger below; cursor at top → above
  const cursorAtBottom = my >= (rTop + rBottom) / 2;
  let y = cursorAtBottom ? rBottom + PAD : rTop - PAD - H;
  y = Math.max(0, Math.min(vh - H, y));

  tHost.dataset.side = side;
  tHost.style.top = `${Math.round(y)}px`;

  if (side === "right") {
    // Anchor trigger's right edge at cursor X; pill expands leftward (row-reverse)
    tHost.style.left  = "";
    tHost.style.right = `${Math.round(Math.max(0, vw - mx))}px`;
  } else {
    // Anchor trigger's left edge at cursor X; pill expands rightward
    tHost.style.right = "";
    tHost.style.left  = `${Math.round(Math.max(0, mx))}px`;
  }
}

function tShow(text: string, selRect: DOMRect): void {
  tText = text;
  tApplyTheme();
  tPlace(selRect);
  tHost.classList.add("lt-on");
  tVisible = true;
}

function tHide(): void {
  if (!tVisible) return;
  tHost.classList.remove("lt-on");
  tVisible = false;
}

// ── Interactions ─────────────────────────────────────────────────
// Stop mouseup from bubbling to document — prevents the 60ms timer from
// re-showing the trigger at the click position after tHide() is called.
tHost.addEventListener("mouseup", (e: MouseEvent) => e.stopPropagation());

tHost.addEventListener("click", () => {
  const text = tText;
  tHide();
  getWidget().readSelection(text);
});
tHost.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tHost.click(); }
});

tDismiss.addEventListener("click", (e) => {
  e.stopPropagation();
  tHide();
  window.getSelection()?.removeAllRanges();
});
tDismiss.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); tDismiss.click(); }
});

// ── Detection ────────────────────────────────────────────────────
document.addEventListener("mouseup", () => {
  setTimeout(() => {
    const sel  = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (text.split(/\s+/).filter(Boolean).length < 2 || !sel?.rangeCount) { tHide(); return; }
    tShow(text, sel.getRangeAt(0).getBoundingClientRect());
  }, 60);
});

document.addEventListener("selectionchange", () => {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.toString().trim()) tHide();
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", tApplyTheme);
