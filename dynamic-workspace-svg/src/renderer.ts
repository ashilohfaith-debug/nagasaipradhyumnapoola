/**
 * SVG renderer.
 * Loads template.svg, injects the current time, and returns the SVG string.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { formatTime, currentTime } from "./clock.js";
import {
  DEFAULT_TIMEZONE,
  CACHE_CONTROL,
  PRAGMA,
  EXPIRES,
} from "./config.js";

// ---------------------------------------------------------------------------
// Path helpers (works for both ESM and CJS)
// ---------------------------------------------------------------------------

function templatePath(): string {
  // In ESM context __dirname is not available; derive it from import.meta.url.
  // In CJS, use __dirname directly.
  let base: string;
  try {
    // ESM
    base = dirname(fileURLToPath(import.meta.url));
  } catch {
    // CJS fallback
    base = __dirname;
  }
  return join(base, "template.svg");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RenderOptions {
  /** IANA timezone.  Falls back to DEFAULT_TIMEZONE when omitted. */
  timezone?: string;
  /**
   * Override the current time (for testing / preview).
   * Provide a Date object or an ISO-8601 string.
   */
  at?: Date | string;
}

export interface RenderResult {
  /** The fully-rendered SVG string */
  svg: string;
  /** Recommended HTTP headers for the response */
  headers: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Template cache
// ---------------------------------------------------------------------------

let _templateCache: string | null = null;

/**
 * Load template.svg from disk.
 * The template is cached in memory after the first read so subsequent
 * requests inside the same serverless function invocation are fast.
 */
function loadTemplate(): string {
  if (_templateCache !== null) return _templateCache;
  _templateCache = readFileSync(templatePath(), "utf-8");
  return _templateCache;
}

/**
 * Bust the in-memory template cache.
 * Useful in tests that mock the filesystem.
 */
export function bustTemplateCache(): void {
  _templateCache = null;
}

// ---------------------------------------------------------------------------
// Core render function
// ---------------------------------------------------------------------------

/**
 * Render the workspace SVG with the current (or supplied) time.
 *
 * @example
 * const { svg, headers } = renderSVG({ timezone: "Europe/London" });
 *
 * @example – testing with a fixed time
 * const { svg } = renderSVG({ at: new Date("2024-01-01T01:17:00Z"), timezone: "UTC" });
 */
export function renderSVG(options: RenderOptions = {}): RenderResult {
  const timezone = options.timezone ?? DEFAULT_TIMEZONE;

  const date =
    options.at !== undefined
      ? options.at instanceof Date
        ? options.at
        : new Date(options.at)
      : undefined;

  const { display } = date ? formatTime(date, timezone) : currentTime(timezone);

  const template = loadTemplate();
  const svg = template.replaceAll("{{TIME}}", display);

  const headers: Record<string, string> = {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": CACHE_CONTROL,
    Pragma: PRAGMA,
    Expires: EXPIRES,
    // Ensure proxies / CDNs also skip caching
    "Surrogate-Control": "no-store",
    // Tell GitHub's camo proxy the content is fresh (advisory only –
    // GitHub still caches for up to 5 minutes regardless; see README).
    "X-Content-Type-Options": "nosniff",
  };

  return { svg, headers };
}
