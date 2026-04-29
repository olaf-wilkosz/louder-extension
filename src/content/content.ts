import { Readability } from "@mozilla/readability";

// ── Highlight style ──────────────────────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent =
  ".readflow-highlight { background: #ffe066; border-radius: 2px; }";
document.head.appendChild(styleEl);

// ── State ────────────────────────────────────────────────────────────────────
let sentences: string[] = [];
let currentIndex = 0;
let isPaused = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentMark: HTMLElement | null = null;
let voiceURI = "";
let speed = 1.0;

// ── Text extraction ──────────────────────────────────────────────────────────
function extractText(): string {
  try {
    const docClone = document.cloneNode(true) as Document;
    const reader = new Readability(docClone);
    const article = reader.parse();
    if (article && article.textContent && article.textContent.trim().length > 200) {
      return article.textContent.trim();
    }
  } catch (_) {
    // fall through
  }
  return document.body.innerText.trim();
}

function splitSentences(text: string): string[] {
  // Split on . ! ? followed by whitespace or end-of-string
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ── Highlight helpers ────────────────────────────────────────────────────────
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

  // Walk text nodes to find the sentence
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
      } catch (_) {
        // surroundContents can fail if range crosses element boundaries — skip
      }
      return;
    }
  }
}

// ── Speech ───────────────────────────────────────────────────────────────────
function getVoice(): SpeechSynthesisVoice | null {
  if (!voiceURI) return null;
  return speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI) ?? null;
}

function sendStatus(sentence: string, index: number, total: number): void {
  chrome.runtime.sendMessage({
    type: "STATUS",
    sentence,
    index,
    total,
  }).catch(() => {
    // Popup may be closed — ignore
  });
}

function speakFrom(index: number): void {
  if (index >= sentences.length) {
    removeHighlight();
    sendStatus("Done", sentences.length, sentences.length);
    return;
  }

  currentIndex = index;
  const sentence = sentences[index];

  highlightSentence(sentence);
  sendStatus(sentence, index, sentences.length);

  const utt = new SpeechSynthesisUtterance(sentence);
  utt.rate = speed;
  const voice = getVoice();
  if (voice) utt.voice = voice;

  utt.onend = () => {
    removeHighlight();
    if (!isPaused) {
      speakFrom(currentIndex + 1);
    }
  };

  utt.onerror = (e) => {
    if (e.error !== "interrupted") {
      speakFrom(currentIndex + 1);
    }
  };

  currentUtterance = utt;
  speechSynthesis.speak(utt);
}

function startReading(text?: string): void {
  speechSynthesis.cancel();
  removeHighlight();
  isPaused = false;

  const raw = text ?? extractText();
  sentences = splitSentences(raw);
  speakFrom(0);
}

// ── Message listener ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  switch (msg.type) {
    case "START":
      voiceURI = msg.voiceURI ?? voiceURI;
      speed = msg.speed ?? speed;
      startReading();
      break;

    case "PAUSE":
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        isPaused = true;
        speechSynthesis.pause();
      }
      break;

    case "RESUME":
      if (speechSynthesis.paused) {
        isPaused = false;
        speechSynthesis.resume();
      }
      break;

    case "STOP":
      isPaused = false;
      speechSynthesis.cancel();
      removeHighlight();
      sentences = [];
      currentIndex = 0;
      break;

    case "READ_SELECTION": {
      voiceURI = msg.voiceURI ?? voiceURI;
      speed = msg.speed ?? speed;
      const sel = window.getSelection()?.toString().trim();
      if (sel) startReading(sel);
      break;
    }

    case "SET_VOICE":
      voiceURI = msg.voiceURI;
      break;

    case "SET_SPEED":
      speed = msg.speed;
      if (currentUtterance) currentUtterance.rate = speed;
      break;
  }
});
