chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readflow-selection",
    title: "Read selected text with ReadFlow",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readflow-selection" && tab?.id != null) {
    chrome.tabs.sendMessage(tab.id, { type: "READ_SELECTION" });
  }
});
