// ── State ────────────────────────────────────────────────────────────────────
type PlayState = "idle" | "playing" | "paused";
let playState: PlayState = "idle";

// ── DOM refs ─────────────────────────────────────────────────────────────────
const btnPlay = document.getElementById("btn-play") as HTMLButtonElement;
const btnStop = document.getElementById("btn-stop") as HTMLButtonElement;
const btnSel = document.getElementById("btn-sel") as HTMLButtonElement;
const speedInput = document.getElementById("speed") as HTMLInputElement;
const speedVal = document.getElementById("speed-val") as HTMLSpanElement;
const voiceSelect = document.getElementById("voice") as HTMLSelectElement;
const statusEl = document.getElementById("status") as HTMLDivElement;

// ── Helpers ──────────────────────────────────────────────────────────────────
function truncate(s: string, max = 60): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

function setStatus(text: string): void {
  statusEl.textContent = truncate(text);
}

function updatePlayButton(): void {
  if (playState === "playing") {
    btnPlay.textContent = "⏸ Pause";
  } else if (playState === "paused") {
    btnPlay.textContent = "▶ Resume";
  } else {
    btnPlay.textContent = "▶ Play";
  }
}

async function getActiveTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

async function sendToContent(msg: Record<string, unknown>): Promise<void> {
  const tabId = await getActiveTabId();
  if (tabId == null) return;
  chrome.tabs.sendMessage(tabId, msg).catch(() => {
    setStatus("Could not reach content script.");
  });
}

function saveSettings(): void {
  chrome.storage.local.set({
    selectedVoiceURI: voiceSelect.value,
    speed: parseFloat(speedInput.value),
  });
}

// ── Voices ───────────────────────────────────────────────────────────────────
function populateVoices(): void {
  const voices = speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith("pl") || v.lang.startsWith("en"));

  // Preserve current selection
  const currentURI = voiceSelect.value;
  voiceSelect.innerHTML = '<option value="">Default</option>';

  for (const v of voices) {
    const opt = document.createElement("option");
    opt.value = v.voiceURI;
    opt.textContent = v.name;
    if (v.voiceURI === currentURI) opt.selected = true;
    voiceSelect.appendChild(opt);
  }
}

speechSynthesis.addEventListener("voiceschanged", populateVoices);
populateVoices();

// ── Restore persisted settings ────────────────────────────────────────────────
chrome.storage.local.get(["selectedVoiceURI", "speed"], (result) => {
  if (result.speed != null) {
    speedInput.value = String(result.speed);
    speedVal.textContent = `${result.speed}×`;
  }
  if (result.selectedVoiceURI) {
    const savedURI = String(result.selectedVoiceURI);
    // voices may not be loaded yet — set after populateVoices
    const trySet = () => {
      const opt = voiceSelect.querySelector<HTMLOptionElement>(
        `option[value="${CSS.escape(savedURI)}"]`
      );
      if (opt) opt.selected = true;
    };
    trySet();
    speechSynthesis.addEventListener("voiceschanged", trySet, { once: true });
  }
});

// ── Controls ─────────────────────────────────────────────────────────────────
btnPlay.addEventListener("click", async () => {
  if (playState === "idle") {
    playState = "playing";
    updatePlayButton();
    setStatus("Starting…");
    await sendToContent({
      type: "START",
      voiceURI: voiceSelect.value,
      speed: parseFloat(speedInput.value),
    });
  } else if (playState === "playing") {
    playState = "paused";
    updatePlayButton();
    setStatus("Paused");
    await sendToContent({ type: "PAUSE" });
  } else {
    playState = "playing";
    updatePlayButton();
    setStatus("Resuming…");
    await sendToContent({ type: "RESUME" });
  }
});

btnStop.addEventListener("click", async () => {
  playState = "idle";
  updatePlayButton();
  setStatus("Stopped");
  await sendToContent({ type: "STOP" });
});

btnSel.addEventListener("click", async () => {
  playState = "playing";
  updatePlayButton();
  setStatus("Reading selection…");
  await sendToContent({
    type: "READ_SELECTION",
    voiceURI: voiceSelect.value,
    speed: parseFloat(speedInput.value),
  });
});

speedInput.addEventListener("input", () => {
  const v = parseFloat(speedInput.value).toFixed(1);
  speedVal.textContent = `${v}×`;
  saveSettings();
  sendToContent({ type: "SET_SPEED", speed: parseFloat(v) });
});

voiceSelect.addEventListener("change", () => {
  saveSettings();
  sendToContent({ type: "SET_VOICE", voiceURI: voiceSelect.value });
});

// ── Status messages from content script ──────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "STATUS") {
    if (msg.sentence === "Done") {
      playState = "idle";
      updatePlayButton();
      setStatus("Done");
    } else {
      setStatus(`[${msg.index + 1}/${msg.total}] ${msg.sentence}`);
    }
  }
});
