import { Readability } from "@mozilla/readability";

// ── Page highlight style (injected into document, not shadow) ────────────────
const highlightStyle = document.createElement("style");
highlightStyle.textContent =
  ".readflow-highlight { background: #ffe066; border-radius: 2px; }";
document.head.appendChild(highlightStyle);

// ═══════════════════════════════════════════════════════════════════════════════
// Floating panel
// ═══════════════════════════════════════════════════════════════════════════════

const PANEL_CSS = `
  :host {
    all: initial;
    position: fixed;
    z-index: 2147483647;
    user-select: none;
  }
  .panel {
    background: #1a1a2e;
    color: #e0e0e0;
    border-radius: 10px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    width: 280px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    overflow: hidden;
  }
  .drag-handle {
    background: #12122a;
    padding: 7px 10px;
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #2a2a4a;
  }
  .drag-handle:active { cursor: grabbing; }
  .title {
    font-weight: 700;
    font-size: 13px;
    color: #ffe066;
    letter-spacing: 0.05em;
  }
  .close-btn {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 0 2px;
  }
  .close-btn:hover { color: #e0e0e0; }
  .body { padding: 10px; }
  .row {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }
  button {
    flex: 1;
    padding: 6px 8px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
    font-family: inherit;
  }
  button:hover { opacity: 0.82; }
  #btn-play  { background: #ffe066; color: #1a1a2e; }
  #btn-stop  { background: #ff6b6b; color: #fff; }
  #btn-sel   { background: #4ecdc4; color: #1a1a2e; flex: none; width: 100%; }
  .field { margin-bottom: 8px; }
  label {
    font-size: 11px;
    color: #888;
    display: block;
    margin-bottom: 3px;
  }
  .speed-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  input[type=range] {
    flex: 1;
    accent-color: #ffe066;
    cursor: pointer;
  }
  .speed-val {
    font-size: 11px;
    color: #ffe066;
    min-width: 32px;
    text-align: right;
  }
  select {
    width: 100%;
    padding: 4px 6px;
    border-radius: 6px;
    border: 1px solid #3a3a5a;
    background: #2a2a4a;
    color: #e0e0e0;
    font-size: 12px;
    font-family: inherit;
  }
  .status {
    font-size: 11px;
    color: #888;
    border-top: 1px solid #2a2a4a;
    padding: 6px 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 26px;
  }
`;

const PANEL_HTML = `
  <div class="panel">
    <div class="drag-handle">
      <span class="title">ReadFlow</span>
      <button class="close-btn" title="Close">✕</button>
    </div>
    <div class="body">
      <div class="row">
        <button id="btn-play">▶ Play</button>
        <button id="btn-stop">■ Stop</button>
      </div>
      <div class="row">
        <button id="btn-sel">Read selection</button>
      </div>
      <div class="field">
        <label>Speed</label>
        <div class="speed-row">
          <input type="range" id="speed" min="0.5" max="2.0" step="0.1" value="1.0" />
          <span class="speed-val" id="speed-val">1.0×</span>
        </div>
      </div>
      <div class="field">
        <label>Voice</label>
        <select id="voice"><option value="">Default</option></select>
      </div>
    </div>
    <div class="status" id="status">Ready</div>
  </div>
`;

// ── Panel bootstrap ───────────────────────────────────────────────────────────
let hostEl: HTMLElement | null = null;
let shadow: ShadowRoot | null = null;

function createPanel(): void {
  hostEl = document.createElement("div");
  hostEl.id = "readflow-host";
  shadow = hostEl.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = PANEL_CSS;
  shadow.appendChild(style);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = PANEL_HTML;
  shadow.appendChild(wrapper);

  document.documentElement.appendChild(hostEl);

  // Restore saved position
  chrome.storage.local.get(["panelX", "panelY", "selectedVoiceURI", "speed"], (r) => {
    const x = typeof r.panelX === "number" ? r.panelX : window.innerWidth - 300;
    const y = typeof r.panelY === "number" ? r.panelY : 80;
    setPosition(x, y);

    if (typeof r.speed === "number") {
      speed = r.speed;
      const sl = q<HTMLInputElement>("#speed");
      const sv = q<HTMLSpanElement>("#speed-val");
      if (sl) sl.value = String(r.speed);
      if (sv) sv.textContent = `${r.speed.toFixed(1)}×`;
    }

    populateVoices();
    if (typeof r.selectedVoiceURI === "string" && r.selectedVoiceURI) {
      voiceURI = r.selectedVoiceURI;
      const sel = q<HTMLSelectElement>("#voice");
      if (sel) {
        speechSynthesis.addEventListener("voiceschanged", () => {
          const opt = sel.querySelector<HTMLOptionElement>(
            `option[value="${CSS.escape(voiceURI)}"]`
          );
          if (opt) opt.selected = true;
        }, { once: true });
      }
    }
  });

  wirePanelEvents();
}

function q<T extends Element>(sel: string): T | null {
  return shadow?.querySelector<T>(sel) ?? null;
}

function setPosition(x: number, y: number): void {
  if (!hostEl) return;
  // Clamp to viewport
  const maxX = window.innerWidth - 290;
  const maxY = window.innerHeight - 50;
  const cx = Math.max(0, Math.min(x, maxX));
  const cy = Math.max(0, Math.min(y, maxY));
  hostEl.style.left = `${cx}px`;
  hostEl.style.top = `${cy}px`;
}

function showPanel(): void {
  if (!hostEl) createPanel();
  else hostEl.style.display = "";
}

function hidePanel(): void {
  if (hostEl) hostEl.style.display = "none";
  stop();
}

function togglePanel(): void {
  if (!hostEl || hostEl.style.display === "none") showPanel();
  else hidePanel();
}

// ── Drag ─────────────────────────────────────────────────────────────────────
function wirePanelEvents(): void {
  const handle = q<HTMLElement>(".drag-handle");
  const closeBtn = q<HTMLButtonElement>(".close-btn");

  closeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    hidePanel();
  });

  if (!handle || !hostEl) return;

  let startMouseX = 0, startMouseY = 0, startLeft = 0, startTop = 0;

  handle.addEventListener("mousedown", (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest(".close-btn")) return;
    e.preventDefault();
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startLeft = parseInt(hostEl!.style.left || "0", 10);
    startTop = parseInt(hostEl!.style.top || "0", 10);

    const onMove = (ev: MouseEvent) => {
      const x = startLeft + ev.clientX - startMouseX;
      const y = startTop + ev.clientY - startMouseY;
      setPosition(x, y);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      // Save position
      chrome.storage.local.set({
        panelX: parseInt(hostEl!.style.left, 10),
        panelY: parseInt(hostEl!.style.top, 10),
      });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Controls
  q<HTMLButtonElement>("#btn-play")?.addEventListener("click", () => {
    if (playState === "idle") {
      startReading();
    } else if (playState === "playing") {
      pauseReading();
    } else {
      resumeReading();
    }
  });

  q<HTMLButtonElement>("#btn-stop")?.addEventListener("click", stop);

  q<HTMLButtonElement>("#btn-sel")?.addEventListener("click", () => {
    const sel = window.getSelection()?.toString().trim();
    if (sel) startReading(sel);
  });

  const speedEl = q<HTMLInputElement>("#speed");
  const speedValEl = q<HTMLSpanElement>("#speed-val");
  speedEl?.addEventListener("input", () => {
    speed = parseFloat(speedEl.value);
    if (speedValEl) speedValEl.textContent = `${speed.toFixed(1)}×`;
    chrome.storage.local.set({ speed });
  });

  const voiceEl = q<HTMLSelectElement>("#voice");
  voiceEl?.addEventListener("change", () => {
    voiceURI = voiceEl.value;
    chrome.storage.local.set({ selectedVoiceURI: voiceURI });
  });

  speechSynthesis.addEventListener("voiceschanged", populateVoices);
}

// ── Voice population ──────────────────────────────────────────────────────────
function populateVoices(): void {
  const voiceEl = q<HTMLSelectElement>("#voice");
  if (!voiceEl) return;
  const voices = speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith("pl") || v.lang.startsWith("en"));

  voiceEl.innerHTML = '<option value="">Default</option>';
  for (const v of voices) {
    const opt = document.createElement("option");
    opt.value = v.voiceURI;
    opt.textContent = v.name;
    if (v.voiceURI === voiceURI) opt.selected = true;
    voiceEl.appendChild(opt);
  }
}

// ── Status ────────────────────────────────────────────────────────────────────
function setStatus(text: string): void {
  const el = q<HTMLElement>("#status");
  if (el) el.textContent = text.length > 65 ? text.slice(0, 64) + "…" : text;
}

function setPlayButton(state: PlayState): void {
  const btn = q<HTMLButtonElement>("#btn-play");
  if (!btn) return;
  btn.textContent = state === "playing" ? "⏸ Pause" : state === "paused" ? "▶ Resume" : "▶ Play";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TTS engine (same logic as before, now coupled to panel status)
// ═══════════════════════════════════════════════════════════════════════════════

type PlayState = "idle" | "playing" | "paused";
let playState: PlayState = "idle";
let sentences: string[] = [];
let currentIndex = 0;
let isPaused = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentMark: HTMLElement | null = null;
let voiceURI = "";
let speed = 1.0;

function extractText(): string {
  try {
    const docClone = document.cloneNode(true) as Document;
    const reader = new Readability(docClone);
    const article = reader.parse();
    if (article?.textContent && article.textContent.trim().length > 200) {
      return article.textContent.trim();
    }
  } catch (_) { /* fall through */ }
  return document.body.innerText.trim();
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function removeHighlight(): void {
  if (currentMark) {
    const parent = currentMark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(currentMark.textContent ?? ""), currentMark);
      parent.normalize();
    }
    currentMark = null;
  }
}

function highlightSentence(sentence: string): void {
  removeHighlight();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const idx = node.textContent?.indexOf(sentence) ?? -1;
    if (idx !== -1) {
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + sentence.length);
      const mark = document.createElement("mark");
      mark.className = "readflow-highlight";
      try {
        range.surroundContents(mark);
        currentMark = mark;
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (_) { /* boundary crossing — skip highlight */ }
      return;
    }
  }
}

function getVoice(): SpeechSynthesisVoice | null {
  if (!voiceURI) return null;
  return speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI) ?? null;
}

function speakFrom(index: number): void {
  if (index >= sentences.length) {
    removeHighlight();
    playState = "idle";
    setPlayButton("idle");
    setStatus("Done");
    return;
  }

  currentIndex = index;
  const sentence = sentences[index];
  highlightSentence(sentence);
  setStatus(`[${index + 1}/${sentences.length}] ${sentence}`);

  const utt = new SpeechSynthesisUtterance(sentence);
  utt.rate = speed;
  const voice = getVoice();
  if (voice) utt.voice = voice;

  utt.onend = () => {
    removeHighlight();
    if (!isPaused) speakFrom(currentIndex + 1);
  };

  utt.onerror = (e) => {
    if (e.error !== "interrupted") speakFrom(currentIndex + 1);
  };

  currentUtterance = utt;
  speechSynthesis.speak(utt);
}

function startReading(text?: string): void {
  speechSynthesis.cancel();
  removeHighlight();
  isPaused = false;
  playState = "playing";
  setPlayButton("playing");

  const raw = text ?? extractText();
  sentences = splitSentences(raw);
  setStatus("Starting…");
  speakFrom(0);
}

function pauseReading(): void {
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    isPaused = true;
    playState = "paused";
    setPlayButton("paused");
    speechSynthesis.pause();
    setStatus("Paused");
  }
}

function resumeReading(): void {
  if (speechSynthesis.paused) {
    isPaused = false;
    playState = "playing";
    setPlayButton("playing");
    speechSynthesis.resume();
  }
}

function stop(): void {
  isPaused = false;
  playState = "idle";
  setPlayButton("idle");
  speechSynthesis.cancel();
  removeHighlight();
  sentences = [];
  currentIndex = 0;
  setStatus("Stopped");
}

// ── Message listener ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {
    case "TOGGLE_PANEL":
      togglePanel();
      break;
    case "READ_SELECTION":
      showPanel();
      const sel = window.getSelection()?.toString().trim();
      if (sel) startReading(sel);
      break;
  }
});
