/**
 * Time formatting and timezone handling for the workspace clock.
 */

import { DEFAULT_TIMEZONE } from "./config.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormattedTime {
  /** Full HH:MM string ready for injection, e.g. "01:17" */
  display: string;
  /** Two-digit hour component, e.g. "01" */
  hours: string;
  /** Two-digit minute component, e.g. "17" */
  minutes: string;
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Left-pad a number to two digits with a leading zero when needed.
 *
 * @example padTwo(7)  // "07"
 * @example padTwo(14) // "14"
 */
export function padTwo(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Format a Date object into { display, hours, minutes } for the given
 * IANA timezone.
 *
 * Uses `Intl.DateTimeFormat` so it works in both Node.js (v18+) and
 * browser environments without external libraries.
 *
 * @param date     - The moment to format (defaults to `new Date()`)
 * @param timezone - IANA timezone string (defaults to DEFAULT_TIMEZONE)
 */
export function formatTime(
  date: Date = new Date(),
  timezone: string = DEFAULT_TIMEZONE
): FormattedTime {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const raw: Record<string, string> = {};
  for (const part of parts) {
    raw[part.type] = part.value;
  }

  // `Intl` may return "24" for midnight in some engines; normalise to "00".
  const hourNum = parseInt(raw["hour"] ?? "0", 10) % 24;
  const minNum = parseInt(raw["minute"] ?? "0", 10);

  const hours = padTwo(hourNum);
  const minutes = padTwo(minNum);

  return {
    display: `${hours}:${minutes}`,
    hours,
    minutes,
  };
}

/**
 * Return the current time formatted for the given timezone.
 * Convenience wrapper around `formatTime(new Date(), timezone)`.
 */
export function currentTime(
  timezone: string = DEFAULT_TIMEZONE
): FormattedTime {
  return formatTime(new Date(), timezone);
}

/**
 * Validate an IANA timezone string.
 * Returns `true` when the string is a recognised timezone, `false` otherwise.
 */
export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
