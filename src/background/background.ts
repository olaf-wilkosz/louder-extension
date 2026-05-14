// Accept keepalive ports from content scripts — no action needed, just prevent
// "Could not establish connection" errors and keep the SW awake while connected.
chrome.runtime.onConnect.addListener((_port) => { /* keepalive — no-op */ });

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "louder-selection",
    title: "Read it louder!",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "louder-selection" && tab?.id != null) {
    injectAndSend(tab.id, { type: "READ_SELECTION", text: info.selectionText ?? "" });
  }
});

// Toggle the floating panel when the toolbar button is clicked.
// (No default_popup in manifest so this fires.)
chrome.action.onClicked.addListener((tab) => {
  if (tab.id != null) {
    injectAndSend(tab.id, { type: "TOGGLE_PANEL" });
  }
});

async function injectAndSend(tabId: number, msg: object): Promise<void> {
  // Chrome forbids scripting or messaging chrome://, edge://, about:, etc.
  const tab = await chrome.tabs.get(tabId);
  const url = tab.url ?? "";
  if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("file://")) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tabId, msg);
  } catch {
    // Content script not yet present — inject then retry
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    await new Promise<void>((res) => setTimeout(res, 50));
    await chrome.tabs.sendMessage(tabId, msg);
  }
}
