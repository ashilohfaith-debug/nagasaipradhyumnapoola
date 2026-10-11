/**
 * Central configuration for the dynamic workspace SVG.
 * All clock position, style, and runtime values live here.
 */

// ---------------------------------------------------------------------------
// Canvas / image dimensions (must match the source artwork)
// ---------------------------------------------------------------------------
export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

// ---------------------------------------------------------------------------
// Timezone
// ---------------------------------------------------------------------------
/** IANA timezone used for the clock.  Override with the TZ env-var. */
export const DEFAULT_TIMEZONE = "Asia/Kolkata";

// ---------------------------------------------------------------------------
// Clock bezel (dark rounded rectangle behind the digits)
// ---------------------------------------------------------------------------

/**
 * The clock in the reference artwork sits on the shelf, roughly centre-right.
 * Pixel measurements taken from the actual 1920 × 1080 source image.
 *
 *   Shelf top edge  ≈ y 229
 *   Clock bezel:
 *     left edge     ≈ x 915
 *     right edge    ≈ x 1166  → width  ≈ 251
 *     top edge      ≈ y 229
 *     bottom edge   ≈ y 315   → height ≈  86
 */
export const CLOCK_BEZEL_X = 915;
export const CLOCK_BEZEL_Y = 229;
export const CLOCK_BEZEL_WIDTH = 251;
export const CLOCK_BEZEL_HEIGHT = 86;
export const CLOCK_BEZEL_RX = 6; // corner radius (px)
export const CLOCK_BEZEL_FILL = "#0a0005";
export const CLOCK_BEZEL_STROKE = "#3a0020";
export const CLOCK_BEZEL_STROKE_WIDTH = 2;
export const CLOCK_BEZEL_OPACITY = 0.88;

// ---------------------------------------------------------------------------
// Clock digit text
// ---------------------------------------------------------------------------

/** Horizontal centre of the bezel */
export const CLOCK_TEXT_X = CLOCK_BEZEL_X + CLOCK_BEZEL_WIDTH / 2; // 1040
/** Vertical baseline of the digit text (optical centre of bezel) */
export const CLOCK_TEXT_Y = CLOCK_BEZEL_Y + CLOCK_BEZEL_HEIGHT * 0.72; // ≈ 291
export const CLOCK_FONT_SIZE = 52; // px – scaled for 1920×1080
/**
 * Font stack for the digital display look.
 * "Digital-7" is the most authentic pixel-clock face; we fall back to
 * "Share Tech Mono" (available via Google Fonts) and then generic monospace.
 * The preview page loads both from Google Fonts.
 */
export const CLOCK_FONT_FAMILY =
  "'Digital-7', 'Share Tech Mono', 'Courier New', monospace";

/** Primary digit colour – red-pink matching the reference clock glow */
export const CLOCK_DIGIT_COLOR = "#FF2040";

/** Dim ghost colour for segments that are "off" (gives LED look) */
export const CLOCK_DIGIT_DIM_COLOR = "#3a0010";

// ---------------------------------------------------------------------------
// Glow filter
// ---------------------------------------------------------------------------
export const GLOW_FILTER_ID = "clockGlow";
export const GLOW_STD_DEVIATION = 6; // blur radius – scaled for 1920×1080
export const GLOW_COLOR = "#FF2040";
export const GLOW_FLOOD_OPACITY = 0.9;

// ---------------------------------------------------------------------------
// Cache / HTTP
// ---------------------------------------------------------------------------
export const CACHE_CONTROL = "no-cache, no-store, must-revalidate";
export const PRAGMA = "no-cache";
export const EXPIRES = "0";
