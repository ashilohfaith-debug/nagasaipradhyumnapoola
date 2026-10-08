/**
 * Vercel Serverless Function – GET /api/workspace.svg
 *
 * Returns the workspace SVG with the current time injected.
 *
 * Query parameters
 * ----------------
 * tz   – IANA timezone string to override the default.
 *         e.g. /api/workspace.svg?tz=America/New_York
 * t    – Fixed HH:MM time for testing / screenshots.
 *         e.g. /api/workspace.svg?t=13:45
 *         When provided, the time is used as-is (no timezone conversion).
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isValidTimezone } from "../src/clock.js";
import { renderSVG } from "../src/renderer.js";
import { DEFAULT_TIMEZONE } from "../src/config.js";

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): void {
  // Only accept GET (and HEAD implicitly)
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).setHeader("Allow", "GET").send("Method Not Allowed");
    return;
  }

  // ── Timezone resolution ──────────────────────────────────────────────────
  const rawTz = Array.isArray(req.query["tz"])
    ? req.query["tz"][0]
    : req.query["tz"];

  const timezone =
    rawTz && isValidTimezone(rawTz) ? rawTz : DEFAULT_TIMEZONE;

  // ── Fixed-time override ──────────────────────────────────────────────────
  const rawT = Array.isArray(req.query["t"])
    ? req.query["t"][0]
    : req.query["t"];

  let overrideDate: Date | undefined;
  if (rawT) {
    // Validate HH:MM
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(rawT);
    if (match) {
      // Construct a Date whose hours/minutes in UTC match the literal string.
      // formatTime will then convert via Intl, but we use timezone "UTC" so
      // the displayed value is exactly what was requested.
      const today = new Date();
      overrideDate = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          parseInt(match[1], 10),
          parseInt(match[2], 10),
          0
        )
      );
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  try {
    const renderOptions = overrideDate
      ? { timezone: "UTC" as const, at: overrideDate }
      : { timezone };
    const { svg, headers } = renderSVG(renderOptions);

    // Apply all recommended headers
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }

    res.status(200).send(svg);
  } catch (err) {
    console.error("[workspace.svg] render error:", err);
    res.status(500).send("Internal Server Error");
  }
}
