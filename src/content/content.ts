import { Readability } from "@mozilla/readability";

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════════ */
const ACCENT      = "#3b9eff";
const ACCENT_GLOW = "#3b9eff55";
const SPEED_STOPS = [5, 4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25];
const BASE_WPM    = 180;

type ThemeVars = {
  bg: string; panelBg: string; border: string; divider: string;
  icon: string; iconHover: string; text: string; subtext: string;
  timer: string; closeBg: string; closeBorder: string; trackBg: string;
  chipBg: string; chipBgHover: string; voiceHover: string;
  pillBg: string; pillBgHover: string;
};

const DARK: ThemeVars = {
  bg: "#252528",       panelBg: "rgba(37,37,40,0.50)",
  pillBg: "rgba(37,37,40,0.5)", pillBgHover: "rgba(37,37,40,0.8)",
  border: "rgba(255,255,255,0.08)",  divider: "rgba(255,255,255,0.08)",
  icon: "rgba(255,255,255,0.48)",    iconHover: "rgba(255,255,255,0.9)",
  text: "rgba(255,255,255,0.85)",    subtext: "rgba(255,255,255,0.32)",
  timer: "rgba(255,255,255,0.72)",
  closeBg: "#3a3a3e",   closeBorder: "rgba(255,255,255,0.1)",
  trackBg: "rgba(255,255,255,0.1)",
  chipBg: "rgba(255,255,255,0.06)",  chipBgHover: "rgba(255,255,255,0.12)",
  voiceHover: "rgba(255,255,255,0.06)",
};

const LIGHT: ThemeVars = {
  bg: "#dddde3",        panelBg: "rgba(221,221,227,0.50)",
  pillBg: "rgba(221,221,227,0.5)", pillBgHover: "rgba(221,221,227,0.8)",
  border: "rgba(0,0,0,0.08)",        divider: "rgba(0,0,0,0.07)",
  icon: "rgba(0,0,0,0.42)",          iconHover: "rgba(0,0,0,0.85)",
  text: "rgba(0,0,0,0.85)",          subtext: "rgba(0,0,0,0.3)",
  timer: "rgba(0,0,0,0.62)",
  closeBg: "#c4c4cc",   closeBorder: "rgba(0,0,0,0.08)",
  trackBg: "rgba(0,0,0,0.11)",
  chipBg: "rgba(0,0,0,0.05)",        chipBgHover: "rgba(0,0,0,0.09)",
  voiceHover: "rgba(0,0,0,0.05)",
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
  /* Stable pre-background: always pill-hover opacity so chip-bg-hover overlay works the
     same as on icon buttons inside the pill — no longer depends on the page behind */
  background-color: var(--pill-bg-hover);
  background-image: none;
  border: 1px solid var(--border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--icon);
  opacity: 0; pointer-events: none;
  transition: opacity .15s, background-color .15s, background-image .15s, transform .15s, color .15s;
}
/* Shared hover: root hovered → icon brightens (background already at hover level) */
.root:hover .close-btn { color: var(--icon-hover); }
/* Direct hover: add chip overlay as background-image; background-color stays from base rule */
.close-btn:hover { background-image: linear-gradient(var(--chip-bg-hover), var(--chip-bg-hover)); color: var(--icon-hover); transform: scale(1.15); }
/* Active: X icon flips to blue */
.close-btn:active,
.root:hover .close-btn:active { color: ${ACCENT}; }
/* close button: reveal on hover in all states, or always when panel is open */
[data-state="collapsed"] .pill:hover .close-btn,
[data-state="expanded"]  .pill:hover .close-btn,
[data-state="playing"]   .pill:hover .close-btn,
[data-panel-open] .close-btn { opacity: 1; pointer-events: auto; }

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

/* chevron: reveal on hover in all states, or always when panel is open */
[data-state="collapsed"] .pill:hover .chev-btn,
[data-state="expanded"]  .pill:hover .chev-btn,
[data-state="playing"]   .pill:hover .chev-btn,
[data-panel-open] .chev-btn {
  max-width: 28px; opacity: 1; pointer-events: auto;
}

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
.icon-btn.active { background: rgba(59,158,255,0.13); color: ${ACCENT}; }

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
.skip-btn:active { background: rgba(59,158,255,0.13); color: ${ACCENT}; }

/* ── play button ── */
.play-btn {
  width: 36px; height: 36px; border-radius: 50%; border: none;
  background: ${ACCENT}; box-shadow: 0 0 16px ${ACCENT_GLOW};
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

/* ── progress ring (hidden unless playing) ── */
.progress-ring {
  position: absolute; inset: -6px; z-index: 0; pointer-events: none;
  opacity: 0; transition: opacity .2s ease;
}
[data-state="playing"] .progress-ring { opacity: 1; }
.ring-track { stroke: var(--track-bg); }

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
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
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
  width: 4px; border-radius: 2px; background: ${ACCENT}; bottom: 0;
}
.speed-handle {
  position: absolute; left: 50%; transform: translate(-50%, -50%);
  width: 14px; height: 14px; border-radius: 50%;
  background: ${ACCENT}; box-shadow: 0 0 8px ${ACCENT_GLOW}; z-index: 2;
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
.voice-list  { max-height: 260px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--subtext) transparent; }
.voice-list::-webkit-scrollbar { width: 4px; }
.voice-list::-webkit-scrollbar-track { background: transparent; }
.voice-list::-webkit-scrollbar-thumb { background: var(--subtext); border-radius: 2px; }
.voice-list::-webkit-scrollbar-thumb:hover { background: var(--icon); }
.panel-hdr { display: flex; align-items: center; justify-content: space-between; padding: 2px 8px 8px; }
.panel-lbl { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--subtext); }
.panel-close { cursor: pointer; color: var(--subtext); display: flex; }
.voice-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border-radius: 10px; cursor: pointer; transition: background .12s;
}
.voice-item:hover:not(.active) { background: var(--voice-hover); }
.voice-item.active { background: rgba(59,158,255,0.13); }
.voice-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--chip-bg); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--icon);
}
.voice-item.active .voice-avatar { background: rgba(59,158,255,0.13); color: ${ACCENT}; }
.voice-name { font-size: 13px; line-height: 1.2; color: var(--icon); }
.voice-item.active .voice-name { font-weight: 600; color: var(--text); }
.voice-hint   { font-size: 10px; color: var(--subtext); margin-top: 1px; }
.voice-accent { margin-left: auto; width: 6px; height: 6px; border-radius: 50%; background: ${ACCENT}; }
.pin-btn {
  width: 22px; height: 22px; border-radius: 50%; border: none; background: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--subtext); opacity: 0;
  transition: color .12s, background .12s, opacity .12s;
}
.voice-item:hover .pin-btn { opacity: 1; }
.pin-btn.pinned { opacity: 1; color: ${ACCENT}; }
.pin-btn:hover { background: var(--chip-bg-hover); color: var(--icon-hover); }
.pin-btn.pinned:hover { color: ${ACCENT}; }
.voice-divider { height: 1px; background: var(--divider); margin: 4px 8px; }
.show-more-btn {
  width: 100%; padding: 5px 10px; border: none; background: none; cursor: pointer;
  font-family: inherit; font-size: 11px; color: var(--subtext);
  display: flex; align-items: center; justify-content: center; gap: 4px;
  border-radius: 8px; transition: color .12s, background .12s;
}
.show-more-btn:hover { color: var(--icon-hover); background: var(--chip-bg); }

/* ── settings panel ── */
.settings-panel { padding: 12px 14px; min-width: 180px; }
.settings-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.theme-seg { display: flex; gap: 4px; background: var(--chip-bg); border-radius: 10px; padding: 3px; }
.theme-btn {
  flex: 1; padding: 5px 4px; border-radius: 7px; border: none; cursor: pointer;
  font-size: 11.5px; font-family: inherit; transition: all .15s; text-transform: capitalize;
  background: transparent; color: var(--subtext); font-weight: 400;
}
.theme-btn:not(.active):hover { background: var(--chip-bg); color: var(--icon-hover); }
.theme-btn.active { background: var(--chip-bg-hover); font-weight: 600; color: var(--text); }
`;

/* ═══════════════════════════════════════════════════════════════════
   TTS ENGINE
═══════════════════════════════════════════════════════════════════ */
// ── CSS Custom Highlight API (Chrome 105+, always available at our target Chrome 112) ──
const HL_SENTENCE = "readflow-sentence";
const HL_WORD     = "readflow-word";
const useHighlightAPI = typeof CSS !== "undefined" && "highlights" in CSS;

const highlightStyle = document.createElement("style");
highlightStyle.textContent = useHighlightAPI
  ? `::highlight(${HL_SENTENCE}){background-color:rgba(255,220,80,0.45);color:inherit;}
     ::highlight(${HL_WORD}){background-color:rgba(255,140,0,0.65);color:inherit;}`
  : `.readflow-highlight{background:#ffe066;border-radius:2px;}`;
document.head.appendChild(highlightStyle);

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
const PLAYING_OWNER_KEY = "readflow_playing_owner";

// Cache voices at module level — getVoices() returns [] until the async load completes.
// We keep this updated so speakFrom always has a full list to pick from.
let voiceCache: SpeechSynthesisVoice[] = speechSynthesis.getVoices();
speechSynthesis.addEventListener("voiceschanged", () => {
  voiceCache = speechSynthesis.getVoices();
});

/** Detect language from text content. Falls back to page/browser lang. */
function detectTextLang(text: string): string {
  const sample = text.slice(0, 1500);
  // Polish diacritics are a near-certain signal — but require enough of them to
  // avoid false positives from Polish UI text leaking into the extraction.
  // A real Polish email body will have 10+ per 1500 chars; UI contamination adds ~2-5.
  const plDiacritics = (sample.match(/[ąęóśżźćńłĄĘÓŚŻŹĆŃŁ]/g) ?? []).length;
  if (plDiacritics >= 8) return "pl";
  // English "the" is unique to English
  if ((sample.toLowerCase().match(/\bthe\b/g) ?? []).length > 2) return "en";
  // Fall back to page declared lang, then browser lang
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
      // Gmail renders email emoji as <img> — capture only emoji alt text
      if (el.tagName === "IMG") {
        const alt = (el as HTMLImageElement).alt ?? "";
        if (alt && /\p{Extended_Pictographic}/u.test(alt)) {
          parts.push(alt);
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
function findSentenceRange(sentence: string): { start: number; end: number } | null {
  const s = sentence.replace(/ /g, " ");

  // Tier 1 — NBSP-normalised exact match
  let start = searchText.indexOf(s);
  if (start >= 0) return { start, end: start + s.length };

  // Tier 2 — collapse all whitespace and search collapsed text
  const sc = s.replace(/\s+/g, " ").trim();
  const ci = collapsedText.indexOf(sc);
  if (ci >= 0) {
    start = collapsedPosMap[ci];
    const endCollapsed = ci + sc.length - 1;
    const end = endCollapsed < collapsedPosMap.length
      ? collapsedPosMap[endCollapsed] + 1
      : fullText.length;
    return { start, end };
  }

  // Tier 3 — strip emoji from search term: handles Gmail where emoji are
  // rendered as <img> (captured in extraction from alt text) but have no
  // corresponding text node in the DOM for the highlight to land on.
  const se = sc.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim();
  if (!se || se === sc) return null; // no emoji present — already failed above
  const ci3 = collapsedText.indexOf(se);
  if (ci3 < 0) return null;
  start = collapsedPosMap[ci3];
  const endC3 = ci3 + se.length - 1;
  const end3 = endC3 < collapsedPosMap.length
    ? collapsedPosMap[endC3] + 1
    : fullText.length;
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

    const margin = 100;
    if (scroller && scroller !== document.documentElement) {
      // Scroll the container pane (e.g. Gmail reading pane)
      const cr = scroller.getBoundingClientRect();
      const relTop = rect.top - cr.top;
      if (relTop >= margin && rect.bottom - cr.top <= cr.height - margin) return;
      scroller.scrollTo({ top: scroller.scrollTop + relTop - cr.height / 2 + rect.height / 2, behavior: "smooth" });
    } else {
      // Scroll the window
      if (rect.top >= margin && rect.bottom <= window.innerHeight - margin) return;
      window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2, behavior: "smooth" });
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
  removeHighlight();
  if (!sentence.trim()) return;

  if (useHighlightAPI) {
    const result = findSentenceRange(sentence);
    if (!result) return;
    sentencePos = result.start;
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
      mark.className = "readflow-highlight";
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
      if (wi < 0) return;
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
  chrome.storage.local.set({ [PLAYING_OWNER_KEY]: INSTANCE_ID });
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
  chrome.storage.local.set({ [PLAYING_OWNER_KEY]: INSTANCE_ID });
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

class ReadFlowWidget {
  private host: HTMLElement;
  private shadow: ShadowRoot;

  // State
  private wState: WidgetState = "collapsed";
  private ttsActive = false; // true while TTS is actually speaking (independent of visual state)
  private popup: PopupId | null = null;
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

  // Drag
  private dragStartX = 0; private dragStartY = 0;
  private hostStartRight = 0; private hostStartTop = 0;
  private hasDragged = false;
  private saveDebounce: ReturnType<typeof setTimeout> | null = null;
  private lastTrigger: HTMLElement | undefined;
  private spRefs: { hdrVal: HTMLElement; hdrWpm: HTMLElement; fill: HTMLElement; handle: HTMLElement; labels: HTMLButtonElement[] } | null = null;
  private pinnedVoices: string[] = [];
  private voiceListExpanded = false;

  constructor() {
    // Remove any orphaned host left by a previous extension load (reload / re-install)
    document.getElementById("readflow-host")?.remove();

    this.host = document.createElement("div");
    this.host.id = "readflow-host";
    this.host.style.display = "none"; // revealed on first toggle()
    this.shadow = this.host.attachShadow({ mode: "open" });
    document.documentElement.appendChild(this.host);

    this.injectFont();
    this.loadSettings().then(() => {
      this.applyThemeVars();
      this.buildDOM();
      this.setupDrag();
      // Rebuild voice panel if it's open when the browser finishes loading voices async
      speechSynthesis.addEventListener("voiceschanged", () => {
        if (this.popup === "voice") this.setPopup("voice");
      });
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (this.themeChoice === "system") this.applyThemeVars();
    });
  }

  // ── Font ─────────────────────────────────────────────────────────
  private injectFont(): void {
    if (document.getElementById("readflow-font")) return;
    const link = document.createElement("link");
    link.id = "readflow-font"; link.rel = "stylesheet";
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
    const t = this.resolvedTheme() === "light" ? LIGHT : DARK;
    const s = this.host.style;
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
    s.setProperty("--voice-hover",   t.voiceHover);
    s.setProperty("--pill-bg",       t.pillBg);
    s.setProperty("--pill-bg-hover", t.pillBgHover);
    s.setProperty("--drag-dot",      this.resolvedTheme() === "light" ? "#444" : "#fff");
  }

  // ── Persistence ───────────────────────────────────────────────────
  private async loadSettings(): Promise<void> {
    return new Promise(resolve => {
      chrome.storage.local.get(
        ["selectedVoiceURI", "speed", "themeChoice", "panelRight", "panelTop", "pinnedVoices"],
        r => {
          if (typeof r.speed === "number" && SPEED_STOPS.includes(r.speed)) this.speed = r.speed;
          if (typeof r.selectedVoiceURI === "string") this.activeVoiceURI = r.selectedVoiceURI;
          if (r.themeChoice === "dark" || r.themeChoice === "light" || r.themeChoice === "system")
            this.themeChoice = r.themeChoice;
          if (Array.isArray(r.pinnedVoices)) this.pinnedVoices = r.pinnedVoices;
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
    chrome.storage.local.set({
      selectedVoiceURI: this.activeVoiceURI,
      speed: this.speed,
      themeChoice: this.themeChoice,
      pinnedVoices: this.pinnedVoices,
    });
  }

  private scheduleSavePosition(): void {
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

    // Close button
    const closeBtn = document.createElement("div");
    closeBtn.className = "close-btn";
    closeBtn.innerHTML = I.close;
    closeBtn.addEventListener("click", e => { e.stopPropagation(); this.handleClose(); });
    pill.appendChild(closeBtn);

    // Chevron — single icon rotated by CSS
    const chevBtn = document.createElement("button");
    chevBtn.className = "chev-btn";
    const chevIcon = document.createElement("span");
    chevIcon.className = "chev-icon";
    chevIcon.innerHTML = I.chev;
    chevBtn.appendChild(chevIcon);
    chevBtn.addEventListener("click", () => {
      if (this.wState === "collapsed") {
        // Expand: if TTS is running show playing state, otherwise expanded-idle
        if (this.ttsActive) this.goPlaying();
        else this.goExpanded();
      } else {
        // Collapse: purely visual — TTS keeps playing
        this.goCollapsed();
      }
    });
    pill.appendChild(chevBtn);

    // ── Expandable section ─────────────────────────────────────────
    const expandable = document.createElement("div");
    expandable.className = "expandable";

    // Settings
    this.settingsBtnEl = document.createElement("button");
    this.settingsBtnEl.className = "icon-btn";
    this.settingsBtnEl.title = "Settings";
    this.settingsBtnEl.innerHTML = I.sliders;
    this.settingsBtnEl.addEventListener("click", () => this.togglePopup("settings", this.settingsBtnEl));
    expandable.appendChild(this.settingsBtnEl);

    // Read selection
    const readSelBtn = document.createElement("button");
    readSelBtn.className = "icon-btn";
    readSelBtn.title = "Read selection";
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
    this.speedBadgeEl = document.createElement("span");
    this.speedBadgeEl.className = "speed-badge";
    this.speedBadgeEl.textContent = `${this.speed}×`;
    this.speedBtnEl.appendChild(this.speedBadgeEl);
    this.speedBtnEl.addEventListener("click", () => this.togglePopup("speed", this.speedBtnEl));
    expandable.appendChild(this.speedBtnEl);

    // Voice
    this.voiceBtnEl = document.createElement("button");
    this.voiceBtnEl.className = "icon-btn";
    this.voiceBtnEl.title = "Voice";
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
    this.ringArc.setAttribute("stroke", ACCENT); this.ringArc.setAttribute("stroke-width", "2.2");
    this.ringArc.setAttribute("stroke-linecap", "round");
    this.ringArc.setAttribute("stroke-dasharray", `0 ${CIRC}`);
    this.ringArc.style.transition = "stroke-dasharray 1s linear";
    svg.appendChild(this.ringArc);

    playWrap.appendChild(svg);

    this.playBtnEl = document.createElement("button");
    this.playBtnEl.className = "play-btn";
    this.playBtnEl.innerHTML = I.play;
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
  }

  // ── State transitions — purely visual, never touch TTS ───────────
  private goCollapsed(): void {
    this.wState = "collapsed";
    this.root.dataset.state = "collapsed";
    this.setPopup(null);
  }

  private goExpanded(): void {
    this.wState = "expanded";
    this.root.dataset.state = "expanded";
    this.setPopup(null);
  }

  private goPlaying(): void {
    this.wState = "playing";
    this.root.dataset.state = "playing";
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
    wrap.appendChild(this.buildPanel(id));
    this.panelsCont.appendChild(wrap);

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

    const hdr = document.createElement("div");
    hdr.className = "panel-hdr";
    hdr.innerHTML = `<span class="panel-lbl">Voice</span>`;
    const hdrClose = document.createElement("div");
    hdrClose.className = "panel-close"; hdrClose.innerHTML = I.close;
    hdrClose.addEventListener("click", () => this.setPopup(null));
    hdr.appendChild(hdrClose);
    wrap.appendChild(hdr);

    const allVoices = this.getRelevantVoices().filter(v => v.voiceURI);
    const pinnedSet = new Set(this.pinnedVoices);
    const pinned   = allVoices.filter(v =>  pinnedSet.has(v.voiceURI));
    const unpinned = allVoices.filter(v => !pinnedSet.has(v.voiceURI));
    const hasPinned = pinned.length > 0;

    const list = document.createElement("div");
    list.className = "voice-list";

    const fmt = (v: SpeechSynthesisVoice) =>
      v.name.replace(/^Microsoft\s+/i, "").replace(/\s+Desktop.*$/i, "");

    const makeItem = (uri: string, name: string, hint: string, isPinned: boolean): HTMLElement => {
      const active = this.activeVoiceURI === uri;
      const item = document.createElement("div");
      item.className = `voice-item${active ? " active" : ""}`;

      const avatar = document.createElement("div"); avatar.className = "voice-avatar"; avatar.innerHTML = I.person;
      const textDiv = document.createElement("div"); textDiv.style.flex = "1";
      const nameEl = document.createElement("div"); nameEl.className = "voice-name"; nameEl.textContent = name;
      const hintEl = document.createElement("div"); hintEl.className = "voice-hint"; hintEl.textContent = hint;
      textDiv.appendChild(nameEl); textDiv.appendChild(hintEl);
      item.appendChild(avatar); item.appendChild(textDiv);

      if (uri) {
        const pinBtn = document.createElement("button");
        pinBtn.className = `pin-btn${isPinned ? " pinned" : ""}`;
        pinBtn.title = isPinned ? "Unpin" : "Pin to top";
        pinBtn.innerHTML = isPinned ? I.star : I.starOut;
        pinBtn.addEventListener("click", e => { e.stopPropagation(); this.togglePinVoice(uri); });
        item.appendChild(pinBtn);
      }

      item.addEventListener("click", () => {
        this.activeVoiceURI = uri; voiceURI = uri;
        this.saveSettings(); this.setPopup(null);
      });
      return item;
    };

    // Default is always first, never pinnable
    list.appendChild(makeItem("", "Default", "Browser default", false));

    // Pinned voices immediately below Default
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
        btn.addEventListener("click", () => { this.voiceListExpanded = true; this.setPopup("voice"); });
        list.appendChild(btn);
      } else {
        unpinned.forEach(v => list.appendChild(makeItem(v.voiceURI, fmt(v), v.lang, false)));
        if (hasPinned) {
          const btn = document.createElement("button");
          btn.className = "show-more-btn";
          btn.textContent = "Show less ▴";
          btn.addEventListener("click", () => { this.voiceListExpanded = false; this.setPopup("voice"); });
          list.appendChild(btn);
        }
      }
    }

    wrap.appendChild(list);
    return wrap;
  }

  private togglePinVoice(uri: string): void {
    const idx = this.pinnedVoices.indexOf(uri);
    if (idx >= 0) this.pinnedVoices.splice(idx, 1);
    else this.pinnedVoices.push(uri);
    this.saveSettings();
    if (this.popup === "voice") this.setPopup("voice");
  }

  private buildSettingsPanel(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "panel settings-panel";

    const hdr = document.createElement("div");
    hdr.className = "settings-hdr";
    hdr.innerHTML = `<span class="panel-lbl">Appearance</span>`;
    const hdrClose = document.createElement("div");
    hdrClose.className = "panel-close"; hdrClose.innerHTML = I.close;
    hdrClose.addEventListener("click", () => this.setPopup(null));
    hdr.appendChild(hdrClose);
    wrap.appendChild(hdr);

    const seg = document.createElement("div");
    seg.className = "theme-seg";
    (["dark", "light", "system"] as ThemeChoice[]).forEach(opt => {
      const btn = document.createElement("button");
      btn.className = `theme-btn${this.themeChoice === opt ? " active" : ""}`;
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        this.themeChoice = opt; this.saveSettings();
        this.applyThemeVars(); this.setPopup(null);
      });
      seg.appendChild(btn);
    });
    wrap.appendChild(seg);
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
      this.ttsActive = false;
      this.playBtnEl.innerHTML = I.play;
      // If the pill was showing the playing (expanded) view, drop back to expanded-idle
      if (this.wState === "playing") {
        this.stopTimer();
        this.goExpanded();
      }
    } else if (isPaused && sentences.length > 0) {
      // Resume paused session from wherever the widget sits visually
      this.ttsActive = true;
      this.playBtnEl.innerHTML = I.pause;
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
    this.ttsActive = false;
    this.stopTimer();
    this.playBtnEl.innerHTML = I.play;
    if (this.wState === "playing") this.goExpanded();
  }

  private startPlaying(text?: string): void {
    const raw = text ?? extractText();
    const wordCount = raw.split(/\s+/).length;
    this.totalSecs = Math.max(10, Math.round(wordCount / (this.speed * BASE_WPM) * 60));
    this.ttsActive = true;
    this.playBtnEl.innerHTML = I.pause;
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
    this.ttsActive = false;
    this.stopTimer();
    this.playBtnEl.innerHTML = I.play;
    this.wState = "collapsed";
    if (this.root) this.root.dataset.state = "collapsed";
    this.setPopup(null);
    this.hideWidget();
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
    this.ttsActive = false;
    this.stopTimer();
    this.playBtnEl.innerHTML = I.play;
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

  readSelection(): void {
    if (this.host.style.display === "none") {
      this.host.style.display = "";
      this.preCalculateTotalTime();
    }
    const sel = window.getSelection()?.toString().trim();
    if (sel) this.startPlaying(sel);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   BOOTSTRAP
═══════════════════════════════════════════════════════════════════ */
let widget: ReadFlowWidget | null = null;

function getWidget(): ReadFlowWidget {
  if (!widget) widget = new ReadFlowWidget();
  return widget;
}

chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {
    case "TOGGLE_PANEL":    getWidget().toggle(); break;
    case "READ_SELECTION":  getWidget().readSelection(); break;
  }
});

// Cross-tab coordination: when another instance claims TTS ownership,
// fake-pause this tab so its UI doesn't get stuck in a playing state.
chrome.storage.onChanged.addListener((changes, area) => {
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
    const port = chrome.runtime.connect({ name: "readflow-keepalive" });
    port.onDisconnect.addListener(() => {
      // Wait briefly then try to reconnect; if extension is gone connect() throws.
      setTimeout(connectKeepalive, 200);
    });
  } catch {
    // Extension removed or reloaded — tear everything down.
    stopTTS();
    document.getElementById("readflow-host")?.remove();
    widget = null;
  }
}
connectKeepalive();
