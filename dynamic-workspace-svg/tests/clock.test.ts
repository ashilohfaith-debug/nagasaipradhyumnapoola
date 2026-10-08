/**
 * Tests for the dynamic-workspace-svg project.
 * Run with:  npm test  (vitest)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { padTwo, formatTime, currentTime, isValidTimezone } from "../src/clock.js";
import { bustTemplateCache, renderSVG } from "../src/renderer.js";
import {
  CACHE_CONTROL,
  CLOCK_DIGIT_COLOR,
  GLOW_FILTER_ID,
} from "../src/config.js";

// ─────────────────────────────────────────────────────────────────────────────
// padTwo
// ─────────────────────────────────────────────────────────────────────────────

describe("padTwo", () => {
  it("pads single-digit numbers with a leading zero", () => {
    expect(padTwo(0)).toBe("00");
    expect(padTwo(1)).toBe("01");
    expect(padTwo(9)).toBe("09");
  });

  it("leaves two-digit numbers unchanged", () => {
    expect(padTwo(10)).toBe("10");
    expect(padTwo(23)).toBe("23");
    expect(padTwo(59)).toBe("59");
  });

  it("handles midnight (0) correctly", () => {
    expect(padTwo(0)).toBe("00");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatTime – HH:MM format
// ─────────────────────────────────────────────────────────────────────────────

describe("formatTime – output format", () => {
  it("always returns HH:MM with exactly 5 characters", () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 7) {
        // Build a UTC date for the given hour/minute
        const d = new Date(Date.UTC(2024, 0, 1, h, m, 0));
        const { display } = formatTime(d, "UTC");
        expect(display).toHaveLength(5);
        expect(display).toMatch(/^\d{2}:\d{2}$/);
      }
    }
  });

  it("separates hours and minutes with a colon", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 13, 37, 0));
    const { display } = formatTime(d, "UTC");
    expect(display[2]).toBe(":");
  });

  it("returns an object with hours, minutes, and display", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 1, 17, 0));
    const result = formatTime(d, "UTC");
    expect(result).toHaveProperty("hours");
    expect(result).toHaveProperty("minutes");
    expect(result).toHaveProperty("display");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatTime – leading zeros
// ─────────────────────────────────────────────────────────────────────────────

describe("formatTime – leading zeros", () => {
  it("pads hours below 10 with a leading zero", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 1, 17, 0));
    const { hours, display } = formatTime(d, "UTC");
    expect(hours).toBe("01");
    expect(display).toBe("01:17");
  });

  it("pads minutes below 10 with a leading zero", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 14, 5, 0));
    const { minutes, display } = formatTime(d, "UTC");
    expect(minutes).toBe("05");
    expect(display).toBe("14:05");
  });

  it("pads both hours and minutes at midnight", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));
    const { display } = formatTime(d, "UTC");
    expect(display).toBe("00:00");
  });

  it("pads both hours and minutes at 00:09", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 0, 9, 0));
    const { display } = formatTime(d, "UTC");
    expect(display).toBe("00:09");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatTime – 24-hour format
// ─────────────────────────────────────────────────────────────────────────────

describe("formatTime – 24-hour (no AM/PM)", () => {
  it("represents noon as 12:00, not 12:00 PM", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
    const { display } = formatTime(d, "UTC");
    expect(display).toBe("12:00");
    expect(display).not.toContain("PM");
    expect(display).not.toContain("AM");
  });

  it("represents 1 AM as 01:00", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 1, 0, 0));
    const { display } = formatTime(d, "UTC");
    expect(display).toBe("01:00");
  });

  it("represents 1 PM as 13:00", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 13, 0, 0));
    const { display } = formatTime(d, "UTC");
    expect(display).toBe("13:00");
  });

  it("represents 11 PM as 23:00", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 23, 0, 0));
    const { display } = formatTime(d, "UTC");
    expect(display).toBe("23:00");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatTime – timezone conversion
// ─────────────────────────────────────────────────────────────────────────────

describe("formatTime – timezone handling", () => {
  it("converts UTC time to Asia/Kolkata (UTC+5:30)", () => {
    // 20:00 UTC → 01:30 IST next day
    const d = new Date(Date.UTC(2024, 0, 1, 20, 0, 0));
    const { display } = formatTime(d, "Asia/Kolkata");
    expect(display).toBe("01:30");
  });

  it("converts UTC time to America/New_York (UTC-5 in winter)", () => {
    // 18:00 UTC → 13:00 ET (UTC-5)
    const d = new Date(Date.UTC(2024, 0, 1, 18, 0, 0)); // Jan = winter
    const { display } = formatTime(d, "America/New_York");
    expect(display).toBe("13:00");
  });

  it("converts UTC time to Europe/London (UTC+0 in winter)", () => {
    // 08:30 UTC → 08:30 London (winter, no DST)
    const d = new Date(Date.UTC(2024, 0, 1, 8, 30, 0));
    const { display } = formatTime(d, "Europe/London");
    expect(display).toBe("08:30");
  });

  it("defaults to DEFAULT_TIMEZONE when no timezone is provided", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 20, 0, 0));
    // Should not throw
    expect(() => formatTime(d)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// currentTime
// ─────────────────────────────────────────────────────────────────────────────

describe("currentTime", () => {
  it("returns a HH:MM formatted string for the default timezone", () => {
    const { display } = currentTime();
    expect(display).toMatch(/^\d{2}:\d{2}$/);
  });

  it("returns a HH:MM formatted string for a given timezone", () => {
    const { display } = currentTime("America/Chicago");
    expect(display).toMatch(/^\d{2}:\d{2}$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isValidTimezone
// ─────────────────────────────────────────────────────────────────────────────

describe("isValidTimezone", () => {
  it("returns true for valid IANA timezones", () => {
    expect(isValidTimezone("UTC")).toBe(true);
    expect(isValidTimezone("Asia/Kolkata")).toBe(true);
    expect(isValidTimezone("America/New_York")).toBe(true);
    expect(isValidTimezone("Europe/London")).toBe(true);
    expect(isValidTimezone("Asia/Tokyo")).toBe(true);
  });

  it("returns false for invalid timezone strings", () => {
    expect(isValidTimezone("Not/ATimezone")).toBe(false);
    expect(isValidTimezone("")).toBe(false);
    expect(isValidTimezone("gibberish")).toBe(false);
    // Note: "EST5EDT" is a POSIX-style TZ string that V8's Intl accepts;
    // isValidTimezone only guarantees rejection of truly unknown strings.
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// renderSVG – SVG generation
// ─────────────────────────────────────────────────────────────────────────────

describe("renderSVG", () => {
  // Bust the template cache before each test so mocks take effect
  beforeEach(() => {
    bustTemplateCache();
  });

  it("injects the time into the SVG (replaces {{TIME}})", () => {
    const fixedDate = new Date(Date.UTC(2024, 0, 1, 19, 47, 0)); // 01:17 IST
    const { svg } = renderSVG({ at: fixedDate, timezone: "Asia/Kolkata" });
    expect(svg).toContain("01:17");
    expect(svg).not.toContain("{{TIME}}");
  });

  it("replaces ALL occurrences of {{TIME}}", () => {
    const fixedDate = new Date(Date.UTC(2024, 0, 1, 7, 30, 0)); // 13:00 IST
    const { svg } = renderSVG({ at: fixedDate, timezone: "Asia/Kolkata" });
    // Template has {{TIME}} in title and in the digit text
    const occurrences = (svg.match(/\{\{TIME\}\}/g) || []).length;
    expect(occurrences).toBe(0);
  });

  it("returns valid SVG (starts with XML / SVG tag)", () => {
    const { svg } = renderSVG();
    expect(svg.trim()).toMatch(/^(<\?xml|<svg)/);
  });

  it("contains the glow filter id from config", () => {
    const { svg } = renderSVG();
    expect(svg).toContain(GLOW_FILTER_ID);
  });

  it("contains the digit colour from config", () => {
    const { svg } = renderSVG();
    expect(svg).toContain(CLOCK_DIGIT_COLOR);
  });

  it("contains the background image element", () => {
    const { svg } = renderSVG();
    expect(svg).toContain('id="background-art"');
  });

  it("contains the clock layer group", () => {
    const { svg } = renderSVG();
    expect(svg).toContain('id="clock-layer"');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// renderSVG – HTTP headers
// ─────────────────────────────────────────────────────────────────────────────

describe("renderSVG – response headers", () => {
  it("sets Content-Type to image/svg+xml", () => {
    const { headers } = renderSVG();
    expect(headers["Content-Type"]).toContain("image/svg+xml");
  });

  it("sets Cache-Control to no-cache, no-store", () => {
    const { headers } = renderSVG();
    expect(headers["Cache-Control"]).toBe(CACHE_CONTROL);
    expect(headers["Cache-Control"]).toContain("no-cache");
    expect(headers["Cache-Control"]).toContain("no-store");
  });

  it("sets Pragma: no-cache", () => {
    const { headers } = renderSVG();
    expect(headers["Pragma"]).toBe("no-cache");
  });

  it("sets Expires: 0", () => {
    const { headers } = renderSVG();
    expect(headers["Expires"]).toBe("0");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("handles midnight correctly (00:00)", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));
    const { display } = formatTime(d, "UTC");
    expect(display).toBe("00:00");
    const { svg } = renderSVG({ at: d, timezone: "UTC" });
    expect(svg).toContain("00:00");
  });

  it("handles end-of-day correctly (23:59)", () => {
    const d = new Date(Date.UTC(2024, 0, 1, 23, 59, 0));
    const { display } = formatTime(d, "UTC");
    expect(display).toBe("23:59");
    const { svg } = renderSVG({ at: d, timezone: "UTC" });
    expect(svg).toContain("23:59");
  });

  it("accepts a date passed as an ISO-8601 string to renderSVG", () => {
    const { svg } = renderSVG({ at: "2024-01-01T01:17:00Z", timezone: "UTC" });
    expect(svg).toContain("01:17");
  });

  it("formatTime treats 24:xx as 00:xx (midnight wrap)", () => {
    // Some Intl implementations return "24" for midnight; we normalise to "00"
    // Simulate by passing exactly midnight UTC
    const d = new Date(Date.UTC(2024, 0, 2, 0, 0, 0)); // midnight next day
    const { hours } = formatTime(d, "UTC");
    expect(parseInt(hours, 10)).toBeLessThan(24);
  });
});
