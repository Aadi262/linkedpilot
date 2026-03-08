# LinkedPilot Session Connector — Chrome Extension

Connect your LinkedIn account to LinkedPilot securely, without sharing your password.

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the `chrome-extension/` folder from the LinkedPilot project
5. The LinkedPilot icon will appear in your Chrome toolbar

## Usage

1. Go to [linkedin.com](https://www.linkedin.com) and make sure you are **logged in**
2. Click the **LinkedPilot icon** in the Chrome toolbar
3. You'll see a green "LinkedIn Connected" badge
4. Click **"Extract Session → LinkedPilot"**
5. Wait for the success confirmation
6. Return to the **LinkedPilot dashboard** to see your account as Active

## How It Works

- The extension reads your `li_at` session cookie from LinkedIn (this is how LinkedIn keeps you logged in)
- The cookie is sent to the LinkedPilot backend over HTTPS and encrypted with AES-256-GCM before storage
- **Your LinkedIn password is never collected or stored**
- The session cookie allows LinkedPilot to act on your behalf for automated outreach

## Troubleshooting

- **"Not logged in to LinkedIn"**: Visit linkedin.com and log in first
- **"Open LinkedIn First"**: Navigate to a LinkedIn page before clicking Extract
- **Server error**: Make sure LinkedPilot dev server is running (`npm run dev` in the project root)
- **Session expired**: Your LinkedIn session expires periodically. Re-extract when needed.

## Security

- All cookies are encrypted with AES-256-GCM before database storage
- Each account gets a dedicated residential proxy IP
- Session cookies are never logged or exposed in plain text
