// LinkedPilot Session Connector — Popup Logic

const API_BASE = "http://localhost:3000";

// ─── State management ───────────────────────────────────────────────────────────
function showState(stateId) {
    document.querySelectorAll(".state").forEach((el) => (el.style.display = "none"));
    const el = document.getElementById(`state-${stateId}`);
    if (el) {
        el.style.display = "block";
        el.classList.add("active");
    }
}

function showError(msg) {
    document.getElementById("error-message").textContent = msg;
    showState("error");
}

// ─── On load: check if we're on LinkedIn ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.includes("linkedin.com")) {
            showState("connected");
        } else {
            showState("not-linkedin");
        }
    } catch (err) {
        showState("not-linkedin");
    }
});

// ─── Extract Session button ─────────────────────────────────────────────────────
document.getElementById("btn-extract").addEventListener("click", async () => {
    showState("checking");

    try {
        // 1. Get all LinkedIn cookies
        const cookies = await chrome.cookies.getAll({ domain: ".linkedin.com" });
        const cookieMap = {};
        for (const c of cookies) {
            cookieMap[c.name] = c.value;
        }

        const liAt = cookieMap["li_at"];
        if (!liAt) {
            showError("Not logged in to LinkedIn. Please log in first and try again.");
            return;
        }

        const jsessionid = cookieMap["JSESSIONID"] || "";
        const liap = cookieMap["liap"] || "";
        const liGc = cookieMap["li_gc"] || "";
        const liRm = cookieMap["li_rm"] || "";

        // 2. Get user agent from current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let userAgent = "";
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => navigator.userAgent,
            });
            userAgent = results[0]?.result || "";
        } catch {
            // Fallback — no scripting permission on this tab
            userAgent = navigator.userAgent;
        }

        // 3. Get stored target accountId (set by onboarding flow)
        const stored = await chrome.storage.local.get(["targetAccountId"]);
        const accountId = stored.targetAccountId || "";

        // 4. POST to LinkedPilot API
        const res = await fetch(`${API_BASE}/api/linkedin/session/ingest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                li_at: liAt,
                jsessionid,
                liap,
                li_gc: liGc,
                li_rm: liRm,
                userAgent,
                accountId,
            }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Server error: ${res.status}`);
        }

        showState("success");
    } catch (err) {
        showError(err.message || "Failed to extract session. Check that LinkedPilot is running.");
    }
});

// ─── Go to LinkedIn button ──────────────────────────────────────────────────────
document.getElementById("btn-goto").addEventListener("click", () => {
    chrome.tabs.create({ url: "https://www.linkedin.com" });
});

// ─── Retry button ───────────────────────────────────────────────────────────────
document.getElementById("btn-retry").addEventListener("click", () => {
    showState("checking");
    // Re-check state after a brief delay
    setTimeout(async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.includes("linkedin.com")) {
            showState("connected");
        } else {
            showState("not-linkedin");
        }
    }, 300);
});
