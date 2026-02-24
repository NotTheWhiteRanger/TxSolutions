# teee.html — Get a Quote Page

A new "Get a Quote" page for Texan Support & Solutions has been added to the repository root.

## Files added

| File | Purpose |
|------|---------|
| `teee.html` | Browser-viewable HTML page |
| `Teee.txt` | Plain-text copy of the same HTML content |

## How to preview locally

### Option 1 — Python (no install required on macOS / most Linux)

```bash
# From the repository root:
python3 -m http.server 8080
```

Then open <http://localhost:8080/teee.html> in your browser.

> **Why not just open the file directly?**  
> The page includes a `file://` guard that blocks the quote form from submitting when opened
> as a local file, because the `/quote` endpoint won't be available. A local HTTP server
> avoids that guard and lets you inspect the full page layout.

### Option 2 — VS Code Live Server extension

1. Open the repo folder in VS Code.
2. Right-click `teee.html` → **Open with Live Server**.

### Option 3 — Node.js `serve`

```bash
npx serve .
# Opens http://localhost:3000 — navigate to /teee.html
```

## Security notes

The page includes `Content-Security-Policy` and `Referrer-Policy` as `<meta>` tags for
basic browser hints. For real enforcement, these **must** be delivered as HTTP response
headers. See the inline comments at the top of `teee.html` for details and examples for
common static hosts (Netlify `_headers`, Vercel `vercel.json`, Apache `.htaccess`).

The `Permissions-Policy` directive cannot be set via a meta tag at all — it requires an
HTTP header.
