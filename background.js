chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        currentColor: 'yellow',
        highlights: {}
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, { action: 'reloadHighlights' })
            .catch(() => {}); 
    }
});