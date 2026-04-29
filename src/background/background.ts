chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readflow-selection",
    title: "Read selected text with ReadFlow",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readflow-selection" && tab?.id != null) {
    injectAndSend(tab.id, { type: "READ_SELECTION" });
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
