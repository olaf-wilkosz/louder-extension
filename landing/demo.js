// ── Live demo: real Web Speech API, same mechanics as the extension ──
const DEMO_TEXT = "This is Louder actually reading these words out loud, live, in your browser. "
  + "No installation needed — just press play and listen. "
  + "Word and sentence highlighting happens exactly like this, wherever you're reading online.";

const demoTextEl = document.getElementById('demoText');
const demoPlayBtn = document.getElementById('demoPlay');
const demoStatusEl = document.getElementById('demoStatus');
const playIcon = document.getElementById('demoPlayIcon');
const pauseIcon = document.getElementById('demoPauseIcon');

const voiceBtn = document.getElementById('demoVoiceBtn');
const voicePanel = document.getElementById('demoVoicePanel');
const voiceListEl = document.getElementById('demoVoiceList');
const speedBtn = document.getElementById('demoSpeedBtn');
const speedPanel = document.getElementById('demoSpeedPanel');
const speedBadge = document.getElementById('demoSpeedBadge');
const speedValueEl = document.getElementById('demoSpeedValue');
const speedInput = document.getElementById('demoSpeed');

// ── Popovers: same one-open-at-a-time behavior as the extension's own
// Settings/Voice/Speed buttons — opening one closes the other, clicking
// outside or pressing Escape closes whichever is open, and (Escape/item
// selection only) focus returns to whichever button opened it — a
// keyboard user shouldn't lose their place when a popup closes.
let lastPanelTrigger = null;
function closePanels(returnFocus) {
  voicePanel.hidden = true; voiceBtn.classList.remove('active'); voiceBtn.setAttribute('aria-expanded', 'false');
  speedPanel.hidden = true; speedBtn.classList.remove('active'); speedBtn.setAttribute('aria-expanded', 'false');
  if (returnFocus && lastPanelTrigger) lastPanelTrigger.focus();
}
function togglePanel(btn, panel) {
  const opening = panel.hidden;
  closePanels(false);
  if (opening) {
    panel.hidden = false;
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    lastPanelTrigger = btn;
    panel.focus();
  }
}
voiceBtn.addEventListener('click', e => { e.stopPropagation(); togglePanel(voiceBtn, voicePanel); });
speedBtn.addEventListener('click', e => { e.stopPropagation(); togglePanel(speedBtn, speedPanel); });
document.addEventListener('click', e => {
  if (!e.target.closest('.demo-popover-wrap')) closePanels(false);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanels(true); });

// Many mobile browsers (Chrome for Android, Safari) never fire onboundary
// at all — a known Web Speech API gap, not something detectable in advance.
// If no boundary arrives shortly after speech starts, fall back to an
// estimated word-by-word timer instead of leaving the demo looking broken.
let boundaryReceived = false;
let fallbackTimer = null;
function stopFallbackHighlight() {
  if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null; }
}
function startFallbackHighlight(rate) {
  const words = [...demoTextEl.querySelectorAll('.demo-word')];
  if (!words.length) return;
  // Advancing one word per fixed-length tick drifts out of sync on any word
  // that isn't exactly average length — "recognize" takes longer to speak
  // than "a". Instead, pace by character position against elapsed wall-clock
  // time, so long and short words each get roughly the reading time they need.
  const wordsPerSecond = Math.max(0.1, rate * BASE_WPM / 60);
  const totalChars = +words[words.length - 1].dataset.end;
  const charsPerSecond = wordsPerSecond * (totalChars / words.length);
  const startTime = performance.now();
  let i = 0;
  highlightDemoAt(+words[0].dataset.start); // show the first word immediately
  fallbackTimer = setInterval(() => {
    if (!window.speechSynthesis.speaking) { stopFallbackHighlight(); return; }
    const elapsedChars = (performance.now() - startTime) / 1000 * charsPerSecond;
    while (i < words.length - 1 && elapsedChars >= +words[i + 1].dataset.start) i++;
    highlightDemoAt(+words[i].dataset.start);
    if (i >= words.length - 1) stopFallbackHighlight();
  }, 90);
}

let selectedVoiceKey = '';
function voiceKey(v) { return `${v.name}|${v.lang}`; }

// Voice list loads asynchronously in most browsers — cache it and re-render
// the panel so it isn't stuck empty or racing an empty list. Some browsers
// (privacy-focused ones, headless/minimal setups) never report any voices
// at all, so the panel always shows *something* meaningful either way.
let demoVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
function renderVoiceList() {
  voiceListEl.innerHTML = '';
  if (!demoVoices.length) {
    const msg = document.createElement('div');
    msg.className = 'demo-voice-empty';
    msg.textContent = "No voices detected on this device — playback will use your browser's default voice.";
    voiceListEl.appendChild(msg);
    return;
  }
  const sorted = [...demoVoices].sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));
  if (!selectedVoiceKey || !sorted.some(v => voiceKey(v) === selectedVoiceKey)) {
    const enVoice = sorted.find(v => v.lang.toLowerCase().startsWith('en'));
    selectedVoiceKey = voiceKey(enVoice || sorted[0]);
  }
  sorted.forEach(v => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'demo-voice-row' + (voiceKey(v) === selectedVoiceKey ? ' selected' : '');
    row.innerHTML = `<span class="demo-voice-avatar"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35"><circle cx="8" cy="5.5" r="2.5"/><path d="M2.5 14c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke-linecap="round"/></svg></span>`
      + `<span class="demo-voice-row-text"><span>${v.name}</span><small>${v.lang}</small></span>`;
    row.addEventListener('click', () => {
      selectedVoiceKey = voiceKey(v);
      renderVoiceList();
      closePanels(true);
    });
    voiceListEl.appendChild(row);
  });
}
renderVoiceList();
if (window.speechSynthesis) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    demoVoices = window.speechSynthesis.getVoices();
    renderVoiceList();
  });
}

// Same discrete stops and base rate as the extension (content.ts:
// SPEED_STOPS / BASE_WPM) — fastest-to-slowest for display, reversed for
// the slider itself since a higher <input> value renders higher up under
// writing-mode:vertical-lr + direction:rtl, and "up" should mean "faster".
const SPEED_STOPS = [5, 4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25];
const SPEED_STOPS_ASC = [...SPEED_STOPS].reverse();
const BASE_WPM = 180;

const speedWpmEl = document.getElementById('demoSpeedWpm');
const speedLabelsEl = document.getElementById('demoSpeedLabels');
const speedUpBtn = document.getElementById('demoSpeedUp');
const speedDownBtn = document.getElementById('demoSpeedDown');

function currentSpeed() { return SPEED_STOPS_ASC[+speedInput.value]; }

SPEED_STOPS.forEach(s => {
  const lbl = document.createElement('button');
  lbl.type = 'button';
  lbl.className = 'demo-speed-label';
  lbl.textContent = `${s}×`;
  lbl.addEventListener('click', () => {
    speedInput.value = SPEED_STOPS_ASC.indexOf(s);
    updateSpeedLabel();
  });
  speedLabelsEl.appendChild(lbl);
});

function updateSpeedLabel() {
  const s = currentSpeed();
  const label = `${s}×`;
  speedBadge.textContent = label;
  speedValueEl.textContent = label;
  speedWpmEl.textContent = `${Math.round(s * BASE_WPM)} wpm`;
  speedLabelsEl.querySelectorAll('.demo-speed-label').forEach(lbl => {
    lbl.classList.toggle('active', lbl.textContent === label);
  });
}
speedInput.addEventListener('input', updateSpeedLabel);
speedUpBtn.addEventListener('click', () => {
  speedInput.value = Math.min(8, +speedInput.value + 1);
  updateSpeedLabel();
});
speedDownBtn.addEventListener('click', () => {
  speedInput.value = Math.max(0, +speedInput.value - 1);
  updateSpeedLabel();
});
updateSpeedLabel();

// Split into sentences, then words, wrapping each in a span with its
// [start,end) offset into the source text so onboundary's charIndex can
// be mapped straight back to a DOM node — same approach the extension's
// CSS Highlight API lookup uses, just via <span> instead of Highlight().
// Takes the *current* text (default sample or whatever the visitor typed)
// rather than a fixed constant, since the box is editable.
function buildDemoDom(text) {
  const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)/g) || [text];
  let offset = 0;
  demoTextEl.innerHTML = '';
  sentences.forEach(sentence => {
    const sEl = document.createElement('span');
    sEl.className = 'demo-sentence';
    const tokens = sentence.match(/\S+|\s+/g) || [];
    tokens.forEach(tok => {
      if (/\S/.test(tok)) {
        const wEl = document.createElement('span');
        wEl.className = 'demo-word';
        wEl.dataset.start = offset;
        wEl.dataset.end = offset + tok.length;
        wEl.textContent = tok;
        sEl.appendChild(wEl);
      } else {
        sEl.appendChild(document.createTextNode(tok));
      }
      offset += tok.length;
    });
    demoTextEl.appendChild(sEl);
  });
}
buildDemoDom(DEMO_TEXT);

function clearDemoHighlight() {
  demoTextEl.querySelectorAll('.demo-word.active, .demo-sentence.active')
    .forEach(el => el.classList.remove('active'));
}

function highlightDemoAt(charIndex) {
  const words = demoTextEl.querySelectorAll('.demo-word');
  let match = null;
  words.forEach(w => {
    w.classList.remove('active');
    if (charIndex >= +w.dataset.start && charIndex < +w.dataset.end) match = w;
  });
  if (!match) return;
  match.classList.add('active');
  demoTextEl.querySelectorAll('.demo-sentence.active').forEach(s => s.classList.remove('active'));
  match.parentElement.classList.add('active');
}

function resetDemoUI() {
  stopFallbackHighlight();
  demoPlayBtn.classList.remove('playing');
  demoPlayBtn.setAttribute('aria-label', 'Play demo');
  playIcon.style.display = ''; pauseIcon.style.display = 'none';
  demoStatusEl.textContent = 'Press play to listen';
  clearDemoHighlight();
  demoTextEl.contentEditable = 'true';
}

function playDemo() {
  if (!('speechSynthesis' in window)) {
    demoStatusEl.textContent = "Your browser doesn't support speech synthesis";
    return;
  }
  const text = (demoTextEl.textContent || '').trim();
  if (!text) { demoStatusEl.textContent = 'Type something to read first'; return; }

  window.speechSynthesis.cancel();
  buildDemoDom(text); // rebuild spans from whatever's in the box right now
  demoTextEl.contentEditable = 'false'; // offsets would desync if edited mid-read

  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = currentSpeed();

  const chosen = demoVoices.find(v => voiceKey(v) === selectedVoiceKey);
  if (chosen) {
    utt.voice = chosen;
    utt.lang = chosen.lang;
  } else {
    // No selection yet (voices still loading) — fall back to English so the
    // default sample text doesn't get read in the browser's system language.
    utt.lang = 'en-US';
    const enVoice = demoVoices.find(v => v.lang.toLowerCase().startsWith('en'));
    if (enVoice) utt.voice = enVoice;
  }

  boundaryReceived = false;
  utt.onboundary = e => {
    if (e.name !== 'word') return;
    boundaryReceived = true;
    stopFallbackHighlight(); // real boundary data arrived after all — trust it over the estimate
    highlightDemoAt(e.charIndex);
  };
  utt.onend = resetDemoUI;
  utt.onerror = resetDemoUI;
  closePanels(false);
  window.speechSynthesis.speak(utt);
  setTimeout(() => {
    if (!boundaryReceived && window.speechSynthesis.speaking) startFallbackHighlight(utt.rate);
  }, 600);
  demoPlayBtn.classList.add('playing');
  demoPlayBtn.setAttribute('aria-label', 'Pause demo');
  playIcon.style.display = 'none'; pauseIcon.style.display = '';
  demoStatusEl.textContent = 'Reading…';
}

demoPlayBtn.addEventListener('click', () => {
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    resetDemoUI();
  } else {
    playDemo();
  }
});

// Stop the demo if it's mid-read and the visitor navigates away.
window.addEventListener('beforeunload', () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
});
