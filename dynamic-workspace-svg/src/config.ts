/**
 * Central configuration for the dynamic workspace SVG.
 * All clock position, style, and runtime values live here.
 */

// ---------------------------------------------------------------------------
// Canvas / image dimensions (must match the source artwork)
// ---------------------------------------------------------------------------
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 576;

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
 * Pixel measurements were taken from the 1024 × 576 source image.
 *
 *   Shelf top edge  ≈ y 118
 *   Clock bezel:
 *     left edge     ≈ x 488
 *     right edge    ≈ x 622   → width  ≈ 134
 *     top edge      ≈ y 122
 *     bottom edge   ≈ y 168   → height ≈  46
 */
export const CLOCK_BEZEL_X = 488;
export const CLOCK_BEZEL_Y = 122;
export const CLOCK_BEZEL_WIDTH = 134;
export const CLOCK_BEZEL_HEIGHT = 46;
export const CLOCK_BEZEL_RX = 4; // corner radius (px)
export const CLOCK_BEZEL_FILL = "#0a0005";
export const CLOCK_BEZEL_STROKE = "#3a0020";
export const CLOCK_BEZEL_STROKE_WIDTH = 1;
export const CLOCK_BEZEL_OPACITY = 0.88;

// ---------------------------------------------------------------------------
// Clock digit text
// ---------------------------------------------------------------------------

/** Horizontal centre of the bezel */
export const CLOCK_TEXT_X = CLOCK_BEZEL_X + CLOCK_BEZEL_WIDTH / 2; // 555
/** Vertical baseline of the digit text (optical centre of bezel) */
export const CLOCK_TEXT_Y = CLOCK_BEZEL_Y + CLOCK_BEZEL_HEIGHT * 0.72; // ≈ 155
export const CLOCK_FONT_SIZE = 28; // px
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
export const GLOW_STD_DEVIATION = 3.5; // blur radius
export const GLOW_COLOR = "#FF2040";
export const GLOW_FLOOD_OPACITY = 0.9;

// ---------------------------------------------------------------------------
// Cache / HTTP
// ---------------------------------------------------------------------------
export const CACHE_CONTROL = "no-cache, no-store, must-revalidate";
export const PRAGMA = "no-cache";
export const EXPIRES = "0";
