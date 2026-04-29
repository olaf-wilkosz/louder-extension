import { Readability } from "@mozilla/readability";

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════════ */
const ACCENT      = "#3b9eff";
const ACCENT_GLOW = "#3b9eff55";
const SPEED_STOPS = [5, 4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25];
const BASE_WPM    = 180;
const DOT_COLORS  = ["#888", "#4ade80", "#60a5fa", "#f472b6"];

type ThemeVars = {
  bg: string; panelBg: string; border: string; divider: string;
  icon: string; iconHover: string; text: string; subtext: string;
  timer: string; closeBg: string; closeBorder: string; trackBg: string;
  chipBg: string; chipBgHover: string; voiceHover: string;
};

const DARK: ThemeVars = {
  bg: "#252528",       panelBg: "#1e1e22",
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
  bg: "#dddde3",        panelBg: "#ebebf0",
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
  play:  `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 3.2 13 8 5.5 12.8V3.2z"/></svg>`,
  pause: `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2.5" width="3.2" height="11" rx="1.5"/><rect x="9.8" y="2.5" width="3.2" height="11" rx="1.5"/></svg>`,
  sliders: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"><line x1="2" y1="4" x2="14" y2="4"/><circle cx="5.5" cy="4" r="1.6" fill="currentColor" stroke="none"/><line x1="2" y1="8" x2="14" y2="8"/><circle cx="10.5" cy="8" r="1.6" fill="currentColor" stroke="none"/><line x1="2" y1="12" x2="14" y2="12"/><circle cx="6.5" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>`,
  readSel: `<svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="5" width="6.5" height="8" rx="1.2" opacity="0.85"/><rect x="10.5" y="5" width="6.5" height="8" rx="1.2" opacity="0.28"/><path d="M7.5 3.5 Q9 3.5 10.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/><line x1="9" y1="3.5" x2="9" y2="14.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M7.5 14.5 Q9 14.5 10.5 14.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>`,
  person: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35"><circle cx="8" cy="5.5" r="2.5"/><path d="M2.5 14c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke-linecap="round"/></svg>`,
  chevR:  `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2l4 4-4 4"/></svg>`,
  chevL:  `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(180deg);display:block"><path d="M4 2l4 4-4 4"/></svg>`,
  close:  `<svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M1 1l6 6M7 1L1 7"/></svg>`,
};

/* ═══════════════════════════════════════════════════════════════════
   SHADOW CSS
═══════════════════════════════════════════════════════════════════ */
const SHADOW_CSS = `
@keyframes popIn {
  from { opacity:0; transform:scale(0.93) translateY(-4px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes expandLeft {
  from { opacity:0; transform:scaleX(0.6); }
  to   { opacity:1; transform:scaleX(1); }
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

/* ── root wrapper (relative for abs children) ── */
.root { position: relative; }

/* ── pill ── */
.pill {
  display: flex;
  align-items: center;
  background: var(--bg);
  border-radius: 100px;
  box-shadow: 0 0 0 1px var(--border), 0 8px 28px rgba(0,0,0,0.45);
  position: relative;
  width: fit-content;
}
.pill-collapsed { gap: 2px; padding: 6px 4px 6px 6px; }
.pill-expanded  { gap: 1px; padding: 6px 4px 6px 8px;
  animation: expandLeft .22s cubic-bezier(0.4,0,0.2,1) both;
  transform-origin: right center; }

/* ── close button ── */
.close-btn {
  position: absolute; top: -8px; right: -8px; z-index: 20;
  width: 19px; height: 19px; border-radius: 50%;
  background: var(--close-bg); border: 1px solid var(--close-border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--icon);
  transition: background .15s, transform .15s, opacity .15s;
}
.close-btn:hover { background: #666; transform: scale(1.15); }

/* ── collapsed hover-reveal (chevron + close) ── */
.hover-only {
  opacity: 0; pointer-events: none;
  max-width: 0; overflow: hidden;
  transition: opacity .2s ease, max-width .2s ease;
}
.pill-collapsed:hover .hover-only {
  opacity: 1; pointer-events: auto; max-width: 34px;
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
.icon-btn:hover { background: var(--chip-bg-hover); color: var(--icon-hover); }
.icon-btn.active { background: rgba(59,158,255,0.13); color: ${ACCENT}; }

/* ── chevron button ── */
.chev-btn {
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: transparent; color: var(--icon);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background .14s, color .14s;
}
.chev-btn:hover { background: var(--chip-bg-hover); color: var(--icon-hover); }
/* When chevron is also hover-only, the width/opacity transitions must win */
.chev-btn.hover-only {
  transition: opacity .2s ease, max-width .2s ease, background .14s, color .14s;
}

/* ── play button ── */
.play-btn {
  width: 36px; height: 36px; border-radius: 50%; border: none;
  background: ${ACCENT}; box-shadow: 0 0 16px ${ACCENT_GLOW};
  color: #fff; display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; position: relative; z-index: 1;
  transition: filter .15s;
}
.play-btn:hover { filter: brightness(1.12); }
.play-btn:active { transform: scale(0.92); }

/* ── play wrapper (holds ring + button) ── */
.play-wrap {
  position: relative; display: flex; align-items: center;
  justify-content: center; width: 36px; height: 36px; flex-shrink: 0;
}

/* ── drag dots ── */
.drag-dots {
  display: flex; flex-direction: column; gap: 3px;
  padding: 8px 8px 8px 4px; cursor: grab;
  opacity: .22; transition: opacity .15s;
}
.drag-dots:active { cursor: grabbing; }
.drag-dots:hover { opacity: .55; }
.drag-row { display: flex; gap: 3px; }
.drag-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text); }

/* ── divider ── */
.divider { width: 1px; height: 18px; background: var(--divider); flex-shrink: 0; margin: 0 3px; }

/* ── timer slot ── */
.timer-slot {
  width: 80px; height: 34px; position: relative;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.timer-val {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; letter-spacing: .04em; color: var(--timer);
  font-variant-numeric: tabular-nums;
  opacity: 1; transition: opacity .18s; pointer-events: none;
}
.skip-btns {
  position: absolute; inset: 0; display: flex; align-items: center;
  justify-content: center; gap: 4px;
  opacity: 0; transition: opacity .18s;
}
.timer-slot:hover .timer-val { opacity: 0; }
.timer-slot:hover .skip-btns { opacity: 1; }
.skip-btn {
  height: 26px; padding: 0 8px; border-radius: 13px;
  border: 1px solid var(--border); background: var(--chip-bg); color: var(--icon);
  font-size: 11px; font-weight: 600; font-family: inherit;
  cursor: pointer; display: flex; align-items: center; gap: 3px;
  transition: background .12s, color .12s;
}
.skip-btn:hover { background: var(--chip-bg-hover); color: var(--icon-hover); }

/* ── panels container ── */
.panels-wrap {
  position: absolute; top: calc(100% + 8px); z-index: 50;
}
.panels-wrap.left  { left: 0; }
.panels-wrap.right { right: 0; }

/* ── panel base ── */
.panel {
  background: var(--panel-bg); border: 1px solid var(--border); border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  animation: popIn .18s cubic-bezier(0.34,1.56,0.64,1) both;
}

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
.speed-label.active { font-weight: 600; color: var(--text); }

/* ── voice panel ── */
.voice-panel { padding: 10px 8px; min-width: 200px; }
.panel-hdr { display: flex; align-items: center; justify-content: space-between; padding: 2px 8px 8px; }
.panel-lbl { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--subtext); }
.panel-close { cursor: pointer; color: var(--subtext); display: flex; }
.voice-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border-radius: 10px; cursor: pointer; transition: background .12s;
}
.voice-item:hover:not(.active) { background: var(--voice-hover); }
.voice-item.active { background: rgba(59,158,255,0.13); }
.voice-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.voice-name { font-size: 13px; line-height: 1.2; color: var(--icon); }
.voice-item.active .voice-name { font-weight: 600; color: var(--text); }
.voice-hint { font-size: 10px; color: var(--subtext); margin-top: 1px; }
.voice-accent { margin-left: auto; width: 6px; height: 6px; border-radius: 50%; background: ${ACCENT}; }

/* ── settings panel ── */
.settings-panel { padding: 12px 14px; min-width: 180px; }
.settings-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.theme-seg { display: flex; gap: 4px; background: var(--chip-bg); border-radius: 10px; padding: 3px; }
.theme-btn {
  flex: 1; padding: 5px 4px; border-radius: 7px; border: none; cursor: pointer;
  font-size: 11.5px; font-family: inherit; transition: all .15s; text-transform: capitalize;
  background: transparent; color: var(--subtext); font-weight: 400;
}
.theme-btn.active { background: var(--chip-bg-hover); font-weight: 600; color: var(--text); }
`;

/* ═══════════════════════════════════════════════════════════════════
   TTS ENGINE
═══════════════════════════════════════════════════════════════════ */
const highlightStyle = document.createElement("style");
highlightStyle.textContent = ".readflow-highlight{background:#ffe066;border-radius:2px;}";
document.head.appendChild(highlightStyle);

let sentences: string[] = [];
let currentIndex = 0;
let isPaused = false;
let currentMark: HTMLElement | null = null;
let voiceURI = "";
let ttsSpeed = 1.0;

function extractText(): string {
  try {
    const clone = document.cloneNode(true) as Document;
    const article = new Readability(clone).parse();
    if (article?.textContent && article.textContent.trim().length > 200)
      return article.textContent.trim();
  } catch (_) { /* fall through */ }
  return document.body.innerText.trim();
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
}

function removeHighlight(): void {
  if (!currentMark) return;
  const p = currentMark.parentNode;
  if (p) { p.replaceChild(document.createTextNode(currentMark.textContent ?? ""), currentMark); p.normalize(); }
  currentMark = null;
}

function highlightSentence(sentence: string): void {
  removeHighlight();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const idx = node.textContent?.indexOf(sentence) ?? -1;
    if (idx === -1) continue;
    const range = document.createRange();
    range.setStart(node, idx); range.setEnd(node, idx + sentence.length);
    const mark = document.createElement("mark");
    mark.className = "readflow-highlight";
    try { range.surroundContents(mark); currentMark = mark; mark.scrollIntoView({ behavior: "smooth", block: "center" }); }
    catch (_) { /* boundary crossing */ }
    return;
  }
}

function getVoice(): SpeechSynthesisVoice | null {
  if (!voiceURI) return null;
  return speechSynthesis.getVoices().find(v => v.voiceURI === voiceURI) ?? null;
}

function speakFrom(index: number, onSentence?: (i: number) => void, onDone?: () => void): void {
  if (index >= sentences.length) { removeHighlight(); onDone?.(); return; }
  currentIndex = index;
  const sentence = sentences[index];
  highlightSentence(sentence);
  onSentence?.(index);

  const utt = new SpeechSynthesisUtterance(sentence);
  utt.rate = ttsSpeed;
  const v = getVoice(); if (v) utt.voice = v;
  utt.onend  = () => { removeHighlight(); if (!isPaused) speakFrom(currentIndex + 1, onSentence, onDone); };
  utt.onerror = e => { if (e.error !== "interrupted") speakFrom(currentIndex + 1, onSentence, onDone); };
  speechSynthesis.speak(utt);
}

function startTTS(text?: string, onSentence?: (i: number) => void, onDone?: () => void): void {
  speechSynthesis.cancel(); removeHighlight(); isPaused = false;
  sentences = splitSentences(text ?? extractText());
  speakFrom(0, onSentence, onDone);
}

function stopTTS(): void {
  isPaused = false; speechSynthesis.cancel(); removeHighlight();
  sentences = []; currentIndex = 0;
}

function pauseTTS(): void { isPaused = true; speechSynthesis.pause(); }

function resumeTTS(): void { isPaused = false; speechSynthesis.resume(); }

function skipSentences(delta: number): void {
  speechSynthesis.cancel();
  const next = Math.max(0, Math.min(sentences.length - 1, currentIndex + delta));
  speakFrom(next);
}

/* ═══════════════════════════════════════════════════════════════════
   WIDGET
═══════════════════════════════════════════════════════════════════ */
type WidgetState  = "collapsed" | "expanded" | "playing";
type PopupId      = "speed" | "voice" | "settings";
type ThemeChoice  = "dark" | "light" | "system";

class ReadFlowWidget {
  private host: HTMLElement;
  private shadow: ShadowRoot;

  // Widget state
  private wState: WidgetState = "collapsed";
  private popup: PopupId | null = null;
  private themeChoice: ThemeChoice = "dark";
  private speed = 1;
  private activeVoiceURI = "";

  // Playback timer
  private elapsed = 0;
  private totalSecs = 300;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Drag
  private dragging = false;
  private dragStartX = 0; private dragStartY = 0;
  private hostStartRight = 0; private hostStartTop = 0;
  private hasDragged = false;
  private saveDebounce: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.host = document.createElement("div");
    this.host.id = "readflow-host";
    this.shadow = this.host.attachShadow({ mode: "open" });
    document.documentElement.appendChild(this.host);

    this.injectFont();
    this.loadSettings().then(() => {
      this.applyThemeVars();
      this.render();
      this.setupDrag();
    });

    // Listen for system theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (this.themeChoice === "system") { this.applyThemeVars(); this.render(); }
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
    const t: ThemeVars = this.resolvedTheme() === "light" ? LIGHT : DARK;
    const s = this.host.style;
    s.setProperty("--bg",           t.bg);
    s.setProperty("--panel-bg",     t.panelBg);
    s.setProperty("--border",       t.border);
    s.setProperty("--divider",      t.divider);
    s.setProperty("--icon",         t.icon);
    s.setProperty("--icon-hover",   t.iconHover);
    s.setProperty("--text",         t.text);
    s.setProperty("--subtext",      t.subtext);
    s.setProperty("--timer",        t.timer);
    s.setProperty("--close-bg",     t.closeBg);
    s.setProperty("--close-border", t.closeBorder);
    s.setProperty("--track-bg",     t.trackBg);
    s.setProperty("--chip-bg",      t.chipBg);
    s.setProperty("--chip-bg-hover",t.chipBgHover);
    s.setProperty("--voice-hover",  t.voiceHover);
  }

  // ── Persistence ───────────────────────────────────────────────────
  private async loadSettings(): Promise<void> {
    return new Promise(resolve => {
      chrome.storage.local.get(
        ["selectedVoiceURI", "speed", "themeChoice", "panelRight", "panelTop"],
        r => {
          if (typeof r.speed === "number" && SPEED_STOPS.includes(r.speed)) this.speed = r.speed;
          if (typeof r.selectedVoiceURI === "string") this.activeVoiceURI = r.selectedVoiceURI;
          if (r.themeChoice === "dark" || r.themeChoice === "light" || r.themeChoice === "system")
            this.themeChoice = r.themeChoice;
          if (typeof r.panelRight === "number" && typeof r.panelTop === "number") {
            this.host.style.bottom = "";
            this.host.style.left   = "";
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

  // ── Render entry ──────────────────────────────────────────────────
  render(): void {
    this.shadow.innerHTML = "";

    const styleEl = document.createElement("style");
    styleEl.textContent = SHADOW_CSS;
    this.shadow.appendChild(styleEl);

    const root = document.createElement("div");
    root.className = "root";
    this.shadow.appendChild(root);

    if (this.wState === "collapsed") {
      root.appendChild(this.buildCollapsed());
    } else {
      const { pill, panels } = this.buildExpandedPlaying();
      root.appendChild(panels);
      root.appendChild(pill);
    }
  }

  // ── Collapsed pill ────────────────────────────────────────────────
  private buildCollapsed(): HTMLElement {
    const pill = document.createElement("div");
    pill.className = "pill pill-collapsed";

    // Close button (hover-only, abs positioned)
    const closeBtn = this.makeCloseBtn();
    closeBtn.classList.add("hover-only");
    pill.appendChild(closeBtn);

    // Chevron expand (hover-only)
    const chev = document.createElement("button");
    chev.className = "chev-btn hover-only";
    chev.title = "Expand";
    chev.innerHTML = I.chevL;
    chev.addEventListener("click", e => { e.stopPropagation(); this.transition("expanded"); });
    pill.appendChild(chev);

    // Play button
    const playBtn = document.createElement("button");
    playBtn.className = "play-btn";
    playBtn.innerHTML = I.play;
    playBtn.addEventListener("click", () => this.handlePlayClick());
    pill.appendChild(playBtn);

    const spacer = document.createElement("div");
    spacer.style.width = "4px";
    pill.appendChild(spacer);

    pill.appendChild(this.makeDragDots());
    return pill;
  }

  // ── Expanded / Playing pill ───────────────────────────────────────
  private buildExpandedPlaying(): { pill: HTMLElement; panels: HTMLElement } {
    const isPlaying = this.wState === "playing";

    const pill = document.createElement("div");
    pill.className = "pill pill-expanded";

    // Close button (always visible)
    pill.appendChild(this.makeCloseBtn());

    // Chevron collapse
    const chev = document.createElement("button");
    chev.className = "chev-btn";
    chev.title = "Collapse";
    chev.innerHTML = I.chevR;
    chev.addEventListener("click", () => this.transition("collapsed"));
    pill.appendChild(chev);

    // Settings
    const settingsBtn = this.makeIconBtn(I.sliders, "Settings", this.popup === "settings");
    settingsBtn.addEventListener("click", () => this.togglePopup("settings"));
    pill.appendChild(settingsBtn);

    // Read selection
    const readSelBtn = this.makeIconBtn(I.readSel, "Read selection", false);
    readSelBtn.addEventListener("click", () => {
      const sel = window.getSelection()?.toString().trim();
      if (sel) { this.startPlaying(sel); } else { this.startPlaying(); }
    });
    pill.appendChild(readSelBtn);

    // Speed badge
    const speedBtn = this.makeIconBtn(
      `<span style="font-size:11.5px;font-weight:700;letter-spacing:-.02em;min-width:22px;text-align:center">${this.speed}×</span>`,
      "Speed", this.popup === "speed"
    );
    speedBtn.addEventListener("click", () => this.togglePopup("speed"));
    pill.appendChild(speedBtn);

    // Voice
    const voiceBtn = this.makeIconBtn(I.person, "Voice", this.popup === "voice");
    voiceBtn.addEventListener("click", () => this.togglePopup("voice"));
    pill.appendChild(voiceBtn);

    // Divider
    const div = document.createElement("div");
    div.className = "divider";
    pill.appendChild(div);

    // Timer / skip slot (only while playing)
    if (isPlaying) {
      const slot = document.createElement("div");
      slot.className = "timer-slot";
      slot.id = "rf-timer-slot";

      const timerVal = document.createElement("span");
      timerVal.className = "timer-val";
      timerVal.id = "rf-timer";
      timerVal.textContent = this.fmtTime(this.elapsed);
      slot.appendChild(timerVal);

      const skipBtns = document.createElement("div");
      skipBtns.className = "skip-btns";
      skipBtns.innerHTML = `
        <button class="skip-btn" id="rf-skip-back"><span style="font-size:10px">◂</span>10</button>
        <button class="skip-btn" id="rf-skip-fwd">10<span style="font-size:10px">▸</span></button>
      `;
      slot.appendChild(skipBtns);
      pill.appendChild(slot);
    }

    // Play/pause + progress ring wrapper
    const playWrap = document.createElement("div");
    playWrap.className = "play-wrap";

    if (isPlaying) {
      const ring = this.buildProgressRing(this.elapsed, this.totalSecs);
      ring.id = "rf-ring";
      playWrap.appendChild(ring);
    }

    const playBtn = document.createElement("button");
    playBtn.className = "play-btn";
    playBtn.innerHTML = isPlaying ? I.pause : I.play;
    playBtn.addEventListener("click", () => this.handlePlayClick());
    playWrap.appendChild(playBtn);
    pill.appendChild(playWrap);

    const spacer = document.createElement("div");
    spacer.style.width = "6px";
    pill.appendChild(spacer);

    pill.appendChild(this.makeDragDots());

    // Build open panel (absolute positioned above pill area)
    const panelsWrap = document.createElement("div");
    if (this.popup) {
      const isRight = this.popup === "speed" || this.popup === "voice";
      panelsWrap.className = `panels-wrap ${isRight ? "right" : "left"}`;
      panelsWrap.appendChild(this.buildPanel(this.popup));
    }

    return { pill, panels: panelsWrap };
  }

  // ── Panel builder ─────────────────────────────────────────────────
  private buildPanel(id: PopupId): HTMLElement {
    if (id === "speed")    return this.buildSpeedPanel();
    if (id === "voice")    return this.buildVoicePanel();
    return this.buildSettingsPanel();
  }

  private buildSpeedPanel(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "panel speed-panel";

    const idx  = SPEED_STOPS.indexOf(this.speed);
    const pct  = idx / (SPEED_STOPS.length - 1);          // 0=top, 1=bottom
    const wpm  = Math.round(this.speed * BASE_WPM);

    // Header
    const hdr = document.createElement("div");
    hdr.className = "speed-hdr";
    hdr.innerHTML = `
      <div>
        <div class="speed-hdr-val">${this.speed}×</div>
        <div class="speed-hdr-wpm">${wpm} wpm</div>
      </div>`;
    const hdrClose = document.createElement("div");
    hdrClose.className = "panel-close";
    hdrClose.innerHTML = I.close;
    hdrClose.addEventListener("click", () => this.closePopup());
    hdr.appendChild(hdrClose);
    wrap.appendChild(hdr);

    // Body
    const body = document.createElement("div");
    body.className = "speed-body";

    // Track column
    const trackCol = document.createElement("div");
    trackCol.className = "speed-track-col";

    const stepUp = document.createElement("button");
    stepUp.className = "step-btn"; stepUp.textContent = "+";
    stepUp.addEventListener("click", () => {
      const n = SPEED_STOPS.indexOf(this.speed) - 1;
      if (n >= 0) this.setSpeed(SPEED_STOPS[n]);
    });
    trackCol.appendChild(stepUp);

    const track = document.createElement("div");
    track.className = "speed-track";
    track.innerHTML = `
      <div class="speed-track-bg"></div>
      <div class="speed-track-fill" style="top:${pct * 100}%;height:${(1 - pct) * 100}%"></div>
      <div class="speed-handle" style="top:${pct * 100}%"></div>`;

    // Track drag
    const onTrackPointer = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const i = Math.round(ratio * (SPEED_STOPS.length - 1));
      this.setSpeed(SPEED_STOPS[i]);
    };
    track.addEventListener("mousedown", e => {
      e.preventDefault();
      onTrackPointer(e.clientY);
      const onMove = (ev: MouseEvent) => onTrackPointer(ev.clientY);
      const onUp   = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup",   onUp);
    });
    trackCol.appendChild(track);

    const stepDn = document.createElement("button");
    stepDn.className = "step-btn"; stepDn.textContent = "−";
    stepDn.addEventListener("click", () => {
      const n = SPEED_STOPS.indexOf(this.speed) + 1;
      if (n < SPEED_STOPS.length) this.setSpeed(SPEED_STOPS[n]);
    });
    trackCol.appendChild(stepDn);
    body.appendChild(trackCol);

    // Labels column
    const labelsCol = document.createElement("div");
    labelsCol.className = "speed-labels";
    SPEED_STOPS.forEach(s => {
      const lbl = document.createElement("button");
      lbl.className = `speed-label${s === this.speed ? " active" : ""}`;
      lbl.textContent = `${s}×`;
      lbl.addEventListener("click", () => this.setSpeed(s));
      labelsCol.appendChild(lbl);
    });
    body.appendChild(labelsCol);
    wrap.appendChild(body);
    return wrap;
  }

  private buildVoicePanel(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "panel voice-panel";

    const hdr = document.createElement("div");
    hdr.className = "panel-hdr";
    hdr.innerHTML = `<span class="panel-lbl">Voice</span>`;
    const hdrClose = document.createElement("div");
    hdrClose.className = "panel-close";
    hdrClose.innerHTML = I.close;
    hdrClose.addEventListener("click", () => this.closePopup());
    hdr.appendChild(hdrClose);
    wrap.appendChild(hdr);

    // Build voice list from actual system voices
    const voices = speechSynthesis.getVoices()
      .filter(v => v.lang.startsWith("pl") || v.lang.startsWith("en"))
      .slice(0, 4);

    // Always show a Default entry
    const entries: Array<{ uri: string; name: string; hint: string; dot: string }> = [
      { uri: "", name: "Default", hint: "System voice", dot: DOT_COLORS[0] },
      ...voices.map((v, i) => ({
        uri:  v.voiceURI,
        name: v.name.replace(/^Microsoft\s+/i, "").replace(/\s+Desktop.*$/i, ""),
        hint: v.lang,
        dot:  DOT_COLORS[(i + 1) % DOT_COLORS.length],
      })),
    ];

    entries.forEach(entry => {
      const active = this.activeVoiceURI === entry.uri;
      const item = document.createElement("div");
      item.className = `voice-item${active ? " active" : ""}`;
      item.innerHTML = `
        <div class="voice-dot" style="background:${entry.dot}"></div>
        <div>
          <div class="voice-name">${entry.name}</div>
          <div class="voice-hint">${entry.hint}</div>
        </div>
        ${active ? `<div class="voice-accent"></div>` : ""}`;
      item.addEventListener("click", () => {
        this.activeVoiceURI = entry.uri;
        voiceURI = entry.uri;
        this.saveSettings();
        this.closePopup();
      });
      wrap.appendChild(item);
    });

    return wrap;
  }

  private buildSettingsPanel(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "panel settings-panel";

    const hdr = document.createElement("div");
    hdr.className = "settings-hdr";
    hdr.innerHTML = `<span class="panel-lbl">Appearance</span>`;
    const hdrClose = document.createElement("div");
    hdrClose.className = "panel-close";
    hdrClose.innerHTML = I.close;
    hdrClose.addEventListener("click", () => this.closePopup());
    hdr.appendChild(hdrClose);
    wrap.appendChild(hdr);

    const seg = document.createElement("div");
    seg.className = "theme-seg";
    (["dark", "light", "system"] as ThemeChoice[]).forEach(opt => {
      const btn = document.createElement("button");
      btn.className = `theme-btn${this.themeChoice === opt ? " active" : ""}`;
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        this.themeChoice = opt;
        this.saveSettings();
        this.applyThemeVars();
        this.render();
      });
      seg.appendChild(btn);
    });
    wrap.appendChild(seg);
    return wrap;
  }

  // ── Helpers ───────────────────────────────────────────────────────
  private makeCloseBtn(): HTMLElement {
    const btn = document.createElement("div");
    btn.className = "close-btn";
    btn.innerHTML = I.close;
    btn.addEventListener("click", e => { e.stopPropagation(); this.handleClose(); });
    return btn;
  }

  private makeIconBtn(content: string, title: string, active: boolean): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = `icon-btn${active ? " active" : ""}`;
    btn.title = title;
    btn.innerHTML = content;
    return btn;
  }

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

  private buildProgressRing(elapsed: number, total: number): SVGSVGElement {
    const R = 20, SIZE = 48, CIRC = 2 * Math.PI * R;
    const dash = Math.min(1, elapsed / Math.max(1, total)) * CIRC;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
    svg.setAttribute("width",  String(SIZE));
    svg.setAttribute("height", String(SIZE));
    svg.style.cssText = "position:absolute;inset:-6px;z-index:0;pointer-events:none;transform:rotate(-90deg)";

    const track = document.createElementNS(ns, "circle");
    track.setAttribute("cx", String(SIZE / 2)); track.setAttribute("cy", String(SIZE / 2));
    track.setAttribute("r", String(R)); track.setAttribute("fill", "none");
    track.setAttribute("stroke", "rgba(255,255,255,0.1)"); track.setAttribute("stroke-width", "2.2");
    svg.appendChild(track);

    const arc = document.createElementNS(ns, "circle");
    arc.setAttribute("cx", String(SIZE / 2)); arc.setAttribute("cy", String(SIZE / 2));
    arc.setAttribute("r", String(R)); arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", ACCENT); arc.setAttribute("stroke-width", "2.2");
    arc.setAttribute("stroke-linecap", "round");
    arc.setAttribute("stroke-dasharray", `${dash} ${CIRC}`);
    arc.style.transition = "stroke-dasharray 1s linear";
    svg.appendChild(arc);

    return svg;
  }

  private fmtTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  // ── State transitions ─────────────────────────────────────────────
  private transition(next: WidgetState): void {
    if (next !== "playing") { this.stopTimer(); }
    this.wState = next;
    this.popup  = null;
    this.render();
  }

  private handlePlayClick(): void {
    if (this.wState === "playing") {
      // Pause → back to expanded (per design spec)
      pauseTTS();
      this.stopTimer();
      this.wState = "expanded";
      this.render();
    } else {
      this.startPlaying();
    }
  }

  private startPlaying(text?: string): void {
    this.elapsed = 0;
    this.wState  = "playing";
    this.popup   = null;

    // Estimate total time
    const raw = text ?? extractText();
    const wordCount = raw.split(/\s+/).length;
    this.totalSecs = Math.max(10, Math.round(wordCount / (this.speed * BASE_WPM) * 60));

    this.render();
    this.startTimer();

    ttsSpeed = this.speed;
    voiceURI = this.activeVoiceURI;
    startTTS(text, undefined, () => {
      this.stopTimer();
      this.transition("expanded");
    });
  }

  private handleClose(): void {
    stopTTS();
    this.stopTimer();
    this.elapsed = 0;
    this.wState  = "collapsed";
    this.popup   = null;
    this.render();
    this.host.style.display = "none";
  }

  private togglePopup(id: PopupId): void {
    this.popup = this.popup === id ? null : id;
    this.render();
  }

  private closePopup(): void {
    this.popup = null;
    this.render();
  }

  private setSpeed(s: number): void {
    this.speed = s;
    ttsSpeed   = s;
    this.saveSettings();
    // Recalculate total
    const wordCount = sentences.join(" ").split(/\s+/).length;
    if (wordCount > 0) this.totalSecs = Math.max(10, Math.round(wordCount / (s * BASE_WPM) * 60));
    this.render();
  }

  // ── Timer ─────────────────────────────────────────────────────────
  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.elapsed = Math.min(this.elapsed + 1, this.totalSecs);
      this.patchTimer();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval !== null) { clearInterval(this.timerInterval); this.timerInterval = null; }
  }

  private patchTimer(): void {
    const timerEl = this.shadow.getElementById("rf-timer");
    if (timerEl) timerEl.textContent = this.fmtTime(this.elapsed);

    // Update progress ring arc
    const svg = this.shadow.getElementById("rf-ring");
    if (svg) {
      const arc = svg.querySelectorAll("circle")[1];
      if (arc) {
        const R = 20, CIRC = 2 * Math.PI * R;
        const dash = Math.min(1, this.elapsed / Math.max(1, this.totalSecs)) * CIRC;
        arc.setAttribute("stroke-dasharray", `${dash} ${CIRC}`);
      }
    }
  }

  // ── Drag ─────────────────────────────────────────────────────────
  private setupDrag(): void {
    this.shadow.addEventListener("mousedown", (e: Event) => {
      const me = e as MouseEvent;
      const target = me.target as HTMLElement;
      if (!target.closest(".drag-dots")) return;
      e.preventDefault();

      // Anchor by right+top so the widget always grows leftward
      if (!this.hasDragged) {
        const rect = this.host.getBoundingClientRect();
        this.host.style.left   = "";
        this.host.style.bottom = "";
        this.host.style.right  = `${window.innerWidth - rect.right}px`;
        this.host.style.top    = `${rect.top}px`;
        this.hasDragged = true;
      }

      this.dragStartX     = me.clientX;
      this.dragStartY     = me.clientY;
      this.hostStartRight = parseInt(this.host.style.right, 10);
      this.hostStartTop   = parseInt(this.host.style.top,   10);

      const onMove = (ev: MouseEvent) => {
        // Moving right → smaller right value; moving left → larger right value
        const dx = ev.clientX - this.dragStartX;
        const dy = ev.clientY - this.dragStartY;
        const r  = Math.max(0, Math.min(window.innerWidth  - 60, this.hostStartRight - dx));
        const y  = Math.max(0, Math.min(window.innerHeight - 50, this.hostStartTop   + dy));
        this.host.style.right = `${r}px`;
        this.host.style.top   = `${y}px`;
        this.scheduleSavePosition();
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup",   onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup",   onUp);
    });

    // Close panel when clicking outside widget
    document.addEventListener("mousedown", (e: MouseEvent) => {
      if (this.popup && !this.host.contains(e.target as Node)) {
        this.closePopup();
      }
    });
  }

  // ── Public API ────────────────────────────────────────────────────
  toggle(): void {
    if (this.host.style.display === "none") {
      this.host.style.display = "";
    } else if (this.wState === "collapsed") {
      this.host.style.display = "none";
    } else {
      this.host.style.display = "none";
    }
  }

  show(): void { this.host.style.display = ""; }

  readSelection(): void {
    const sel = window.getSelection()?.toString().trim();
    if (sel) { this.show(); this.startPlaying(sel); }
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
    case "TOGGLE_PANEL":
      getWidget().toggle();
      break;
    case "READ_SELECTION":
      getWidget().readSelection();
      break;
  }
});
