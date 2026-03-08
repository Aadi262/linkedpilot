// LinkedPilot Session Connector — Background Service Worker

// Update badge when user navigates to LinkedIn
function updateBadge(tabId, url) {
    if (url && url.includes("linkedin.com")) {
        chrome.action.setBadgeText({ tabId, text: "GO" });
        chrome.action.setBadgeBackgroundColor({ tabId, color: "#7c3aed" });
    } else {
        chrome.action.setBadgeText({ tabId, text: "" });
    }
}

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        updateBadge(tab.id, tab.url);
    } catch {
        // Tab may not exist
    }
});

// Listen for tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status === "complete") {
        updateBadge(tabId, tab.url);
    }
});
