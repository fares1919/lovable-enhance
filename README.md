# Lovable Enhance

**A Chrome extension that enhances your [lovable.dev](https://lovable.dev) experience with additional features and a streamlined workflow.**

> ⚠️ **Disclaimer:** This extension is a third-party tool for educational purposes. Use it responsibly and in accordance with lovable.dev's terms of service.

## Features

- **Unlimited Chat** — Send prompts directly through lovable.dev's own API using your existing session
- **Local License** — Fully offline license validation, no remote servers required
- **No Backend Dependency** — All proxy servers and remote APIs have been removed; the extension works entirely with the official lovable.dev endpoints
- **Side Panel** — Quick-access side panel for managing projects, settings, and notifications
- **Project Management** — Create, download, and manage projects with direct Lovable API integration
- **Watermark Removal** — Remove watermarks from generated projects (local mode)
- **Credit Bypass** — Built-in credit bypass system (local, no external calls)
- **Security Hardening** — Anti-tampering protections (right-click, F12, console, copy) with intelligent mode — no self-destruct or data wiping

## How It Works

The extension injects a floating UI into lovable.dev pages, providing:

1. A prompt input for sending messages to your current project
2. Quick access to project management features
3. Real-time notification badges
4. Theme customization (light/dark mode)
5. Side panel for detailed project settings and history

Chat messages are sent directly to **`api.lovable.dev`** using your own session token — no intermediate proxy servers.

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/fares1919/lovable-enhance.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked** and select the `lovable-enhance` folder
5. Navigate to [lovable.dev](https://lovable.dev) and open a project — the floating UI will appear

### From GitHub Releases

1. Go to the [Releases page](https://github.com/fares1919/lovable-enhance/releases)
2. Download the latest `.zip` archive
3. Unpack it to a folder
4. Follow steps 2–4 from *From Source* above

## Architecture

```
lovable-enhance/
├── manifest.json          # Extension manifest (v3)
├── background.js          # Service worker: proxy fetch, message routing
├── content.js             # Main content script: business logic, UI
├── content-templates.js   # HTML templates for the floating UI
├── extension-config.js    # Extension constants and configuration
├── pageHook.js            # Early page hook (MAIN world)
├── security-hardening.js  # Anti-tampering protections
├── lovable-auth.js        # Lovable session token helpers
├── lovable-feature-api.js # Feature-level API helpers
├── hwFingerprint.js       # Device fingerprinting
├── user-messages.js       # User-facing copy and branding
├── content-bridge.js      # Content script ↔ page communication
├── sounds.js              # Audio feedback system
├── sidepanel.js           # Side panel business logic
├── sidepanel.html         # Side panel layout
├── sidepanel-templates.js # Side panel HTML templates
├── sidepanel.css          # Side panel styles
├── theme.css              # Theme variables (light/dark)
├── floating.css           # Floating UI styles
├── assets/                # Icons and brand assets
└── hwFingerprint.js       # Hardware fingerprinting
```

### Key Design Decisions

- **No external proxy** — All network calls go directly to `api.lovable.dev` using your session's Bearer token
- **Local session** — License validation uses `INTERNAL_LICENSE_MODE=true`, generating local sessions with no backend calls
- **Intelligent hardening** — Security protections detect DevTools without self-destruct, data clearing, or page reloads
- **Mock fallbacks** — Features like watermark removal, plan approval, and cloud enablement fall back to local mocks when the Lovable API doesn't expose equivalent endpoints

## Technical Details

### Session Flow

1. Extension detects your active Lovable session by reading Bearer tokens from page fetch requests
2. Tokens are stored in `chrome.storage.local` and used for direct API calls
3. License validation is handled locally via `powerkitsInternalSessionStorage()` — no remote validation server needed
4. Chat messages are forwarded from the floating UI through the service worker to `api.lovable.dev`

### Chat API

Prompts are sent using your existing session token via:

```
POST https://api.lovable.dev/projects/{projectId}/chat
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "message": "your prompt",
  "files": [],
  "optimisticImageUrls": []
}
```

### Permissions

The extension requires:
- `storage` — for local session and settings persistence
- `activeTab` / `tabs` — for interacting with lovable.dev pages
- `scripting` — for feature injection
- `cookies` — for reading Lovable session cookies
- `sidePanel` — for the side panel UI
- Host access to `*.lovable.dev` and `api.lovable.dev`

## Development

```bash
# Install dependencies (if any)
npm install

# Load unpacked in Chrome
# chrome://extensions/ → Developer mode → Load unpacked → select folder
```

No build step is required — the extension is vanilla JavaScript. Simply reload the extension in Chrome after making changes.

## Version

**v2.0** — Major update: removed license/Discord/WhatsApp gates, 100% local mode, sidepanel-only.

## License

This project is provided for **educational and research purposes only**. The authors are not affiliated with lovable.dev.
