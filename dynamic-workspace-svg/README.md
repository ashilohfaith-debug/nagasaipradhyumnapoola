# dynamic-workspace-svg

A production-ready **dynamic SVG** that overlays a live clock on a pixel-art
workspace scene.  The SVG is self-contained (artwork embedded as base64),
served by a Vercel serverless function, and designed to embed anywhere a
static image URL is accepted — including GitHub profile READMEs.

```
┌───────────────────────────────────────────────────────────┐
│  pixel-art background (GIF, base64-embedded)              │
│                                                           │
│          ┌──────────────────────────────────┐            │
│  shelf → │  🟥  01:17  🟥   (SVG overlay)  │            │
│          └──────────────────────────────────┘            │
└───────────────────────────────────────────────────────────┘
```

---

## Live demo

```
GET https://<your-vercel-domain>/api/workspace.svg
```

Embed in GitHub Markdown:

```markdown
![Workspace](https://<your-vercel-domain>/api/workspace.svg)
```

Or link it so clicks open a fresh copy:

```markdown
[![Workspace](https://<your-vercel-domain>/api/workspace.svg)](https://<your-vercel-domain>/api/workspace.svg)
```

---

## Features

| Feature | Detail |
|---|---|
| Self-contained SVG | Artwork embedded as `data:image/gif;base64,…` – no external image requests |
| Server-side time injection | No JavaScript in the SVG; `{{TIME}}` replaced at request time |
| Configurable timezone | IANA string via `?tz=` query param or `TZ` env-var (default `Asia/Kolkata`) |
| Time override | `?t=HH:MM` for testing / screenshots |
| Zero-JS clock SVG | Pure SVG + CSS; works in `<img>` tags that block scripts |
| No-cache headers | `Cache-Control: no-cache, no-store, must-revalidate` |
| Digital font | Digital-7 → Share Tech Mono → monospace fallback chain |
| Red glow effect | SVG `<filter>` with `feGaussianBlur` + `feMerge` |

---

## Project structure

```
dynamic-workspace-svg/
├── public/
│   └── artwork.gif          # Original pixel-art source (kept for reference)
├── src/
│   ├── config.ts            # All constants: position, colours, timezone
│   ├── clock.ts             # Time formatting + timezone helpers
│   ├── renderer.ts          # Template loader + {{TIME}} injection
│   └── template.svg         # SVG template with embedded artwork + {{TIME}}
├── api/
│   └── workspace.ts         # Vercel serverless function (GET /api/workspace.svg)
├── preview/
│   └── index.html           # Local dev preview (auto-refresh + manual time)
├── tests/
│   └── clock.test.ts        # Vitest suite
├── README.md
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## Quick start

### 1 – Install

```bash
npm install
```

### 2 – Local development

```bash
npm run dev          # starts vercel dev on http://localhost:3000
```

Then open **http://localhost:3000/preview** for the interactive preview page.

The SVG endpoint is at **http://localhost:3000/api/workspace.svg**.

### 3 – Type-check

```bash
npm run build
```

### 4 – Tests

```bash
npm test             # single run
npm run test:watch   # watch mode
npm run test:coverage
```

### 5 – Deploy to Vercel

```bash
npx vercel deploy
```

---

## Configuration

All tunable values live in **`src/config.ts`**.  No magic numbers elsewhere.

| Constant | Default | Description |
|---|---|---|
| `DEFAULT_TIMEZONE` | `"Asia/Kolkata"` | IANA timezone for the clock |
| `CANVAS_WIDTH` / `HEIGHT` | `1024` / `576` | Source image dimensions |
| `CLOCK_BEZEL_X/Y/WIDTH/HEIGHT` | `488, 122, 134, 46` | Bezel position (px) |
| `CLOCK_TEXT_X` / `Y` | `555` / `155` | Digit text anchor |
| `CLOCK_FONT_SIZE` | `28` | px |
| `CLOCK_DIGIT_COLOR` | `"#FF2040"` | Red-pink LED colour |
| `CLOCK_DIGIT_DIM_COLOR` | `"#3a0010"` | Ghost/dim segment colour |
| `GLOW_STD_DEVIATION` | `3.5` | Blur radius for glow filter |
| `CACHE_CONTROL` | `"no-cache, no-store, must-revalidate"` | HTTP header value |

### Timezone via environment variable

Set `TZ` in your Vercel project settings (or `.env.local`) to change the
default timezone without touching `config.ts`:

```
TZ=America/New_York
```

The serverless function reads `process.env["TZ"]` as a fallback after
`DEFAULT_TIMEZONE`.  (The `vercel.json` ships with `"TZ": "Asia/Kolkata"`.)

---

## API reference

### `GET /api/workspace.svg`

Returns the rendered SVG with the current time.

| Parameter | Type | Description |
|---|---|---|
| `tz` | string (optional) | IANA timezone, e.g. `?tz=Europe/London` |
| `t` | `HH:MM` (optional) | Fixed time override, e.g. `?t=01:17` |

**Response headers**

```
Content-Type:    image/svg+xml; charset=utf-8
Cache-Control:   no-cache, no-store, must-revalidate
Pragma:          no-cache
Expires:         0
Surrogate-Control: no-store
```

---

## Font choice: Digital-7 vs Share Tech Mono

The clock uses this CSS font stack:

```css
font-family: 'Digital-7', 'Share Tech Mono', 'Courier New', monospace;
```

**Digital-7** (by Sizenko Alexander, free for personal use) is the most
authentic seven-segment LED face. Download from
[dafont.com/digital-7.font](https://www.dafont.com/digital-7.font) and place
`Digital-7.ttf` alongside `template.svg` if you want local rendering.

The SVG does **not** embed the font file because:
1. It keeps the template size manageable.
2. When served from Vercel, the preview page loads **Share Tech Mono** from
   Google Fonts, which is an excellent monospaced digital fallback.
3. GitHub's camo proxy strips `<style>` and `@font-face` from SVGs served in
   `<img>` tags anyway, so Vercel serves the font instead.

If you need the font embedded for fully-offline use, base64-encode
`Digital-7.ttf` and add a `<style>@font-face{…}</style>` block to
`template.svg`.

---

## GitHub README caching — honest limitations

> **TL;DR:** The clock in a GitHub README will be up to **5 minutes stale**.
> This is a GitHub infrastructure constraint and cannot be worked around.

GitHub proxies all images in Markdown through **camo**, its image CDN.
Camo caches images for approximately 5 minutes regardless of the
`Cache-Control` headers your server sends.

- Direct URL visits (`https://your-domain/api/workspace.svg`) always return
  the freshest time because the browser respects `no-store`.
- GitHub `<img>` embeds are served from camo's cache and may show a time up
  to 5 minutes old.
- There is no public API to purge the camo cache; GitHub does not document a
  supported bypass.

For a live clock that updates every second, you would need a client-side
solution (e.g., a JavaScript widget), which GitHub README does not allow.

---

## Architecture decisions

### Why base64-embed the artwork?

A self-contained SVG means:
- One HTTP request (no second round-trip for the image).
- Works in `<img>` tags where cross-origin `<image href="">` may be blocked.
- No broken images if the asset host is unavailable.

Trade-off: the SVG response is ~1.3 MB.  For most README/profile use this is
fine.  If bandwidth is a concern, convert the source GIF to WebP/PNG first.

### Why server-side injection instead of `<script>`?

GitHub and most Markdown renderers do **not** execute JavaScript inside SVGs
embedded with `<img>`.  Server-side `{{TIME}}` replacement is the only
reliable approach for dynamic content in these contexts.

### Why Vercel?

- Zero-config TypeScript serverless functions.
- Generous free tier suitable for a personal profile widget.
- `vercel.json` route rules cleanly map `/api/workspace.svg` to the TS handler.

---

## Testing

The Vitest suite (`tests/clock.test.ts`) covers:

- `padTwo` – leading zero padding
- `formatTime` – HH:MM format, leading zeros, 24-hour clock, timezone conversion
- `currentTime` – live output sanity checks
- `isValidTimezone` – IANA string validation
- `renderSVG` – `{{TIME}}` injection, full replacement, valid SVG output,
  glow filter / digit colour presence, background image element
- HTTP headers – `Content-Type`, `Cache-Control`, `Pragma`, `Expires`
- Edge cases – midnight `00:00`, end-of-day `23:59`, ISO string input

Run with:

```bash
npm test
```

---

## License

MIT.  The pixel-art background artwork remains the property of its original
creator.
