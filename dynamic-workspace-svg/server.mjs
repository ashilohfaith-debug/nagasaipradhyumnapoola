/**
 * server.mjs
 * ----------
 * Zero-dependency local development server.
 * Uses only Node.js built-ins (http, fs, path, url).
 *
 * Start with:  node server.mjs
 * Then open:
 *   http://localhost:3000/api/workspace.svg   – rendered SVG
 *   http://localhost:3000/preview             – interactive preview page
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// ── Helpers ────────────────────────────────────────────────────────────────

function parseQuery(search) {
  const params = {};
  new URLSearchParams(search).forEach((v, k) => { params[k] = v; });
  return params;
}

function isValidTimezone(tz) {
  try { Intl.DateTimeFormat(undefined, { timeZone: tz }); return true; }
  catch { return false; }
}

function formatTime(date, timezone) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const raw = {};
  for (const p of parts) raw[p.type] = p.value;
  const h = String(parseInt(raw["hour"] ?? "0", 10) % 24).padStart(2, "0");
  const m = String(parseInt(raw["minute"] ?? "0", 10)).padStart(2, "0");
  return `${h}:${m}`;
}

// ── Route handlers ─────────────────────────────────────────────────────────

function handleSVG(req, res) {
  const { searchParams } = new URL(req.url, `http://localhost:${PORT}`);
  const rawTz = searchParams.get("tz");
  const rawT  = searchParams.get("t");

  const timezone = rawTz && isValidTimezone(rawTz) ? rawTz : "Asia/Kolkata";

  let timeStr;
  if (rawT && /^([01]\d|2[0-3]):([0-5]\d)$/.test(rawT)) {
    timeStr = rawT;           // fixed override – use literally
  } else {
    timeStr = formatTime(new Date(), timezone);
  }

  const templatePath = path.join(__dirname, "src", "template.svg");
  let svg;
  try {
    svg = fs.readFileSync(templatePath, "utf-8").replaceAll("{{TIME}}", timeStr);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Could not read template.svg:\n${err.message}`);
    return;
  }

  res.writeHead(200, {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  });
  res.end(svg);
}

function handlePreview(req, res) {
  const previewPath = path.join(__dirname, "preview", "index.html");
  let html;
  try {
    html = fs.readFileSync(previewPath, "utf-8");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Could not read preview/index.html:\n${err.message}`);
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

// ── Server ──────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

  if (pathname === "/api/workspace.svg") return handleSVG(req, res);
  if (pathname === "/preview" || pathname === "/preview/") return handlePreview(req, res);

  // Root redirect → preview
  if (pathname === "/") {
    res.writeHead(302, { Location: "/preview" });
    res.end();
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n✅  Local dev server running\n`);
  console.log(`   Preview page  →  http://localhost:${PORT}/preview`);
  console.log(`   SVG endpoint  →  http://localhost:${PORT}/api/workspace.svg`);
  console.log(`   Test a time   →  http://localhost:${PORT}/api/workspace.svg?t=01:17`);
  console.log(`   Change tz     →  http://localhost:${PORT}/api/workspace.svg?tz=America/New_York`);
  console.log(`\n   Press Ctrl+C to stop.\n`);
});
