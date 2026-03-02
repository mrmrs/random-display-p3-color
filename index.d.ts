/**
 * Named hue families mapped to HSL degree ranges.
 */
export type HueName =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'warm'
  | 'cool';

/**
 * A [min, max] numeric range.
 */
export type Range = [min: number, max: number];

/**
 * Options for generating a random Display-P3 color.
 */
export interface RandomP3Options {
  /**
   * Constrain the hue. Pass a named color family or a [min, max]
   * range in HSL degrees (0-360).
   *
   * Named hues: 'red', 'orange', 'yellow', 'green', 'cyan',
   * 'blue', 'purple', 'pink', 'warm', 'cool'
   *
   * @example 'blue'
   * @example [200, 260]
   */
  hue?: HueName | Range;

  /**
   * HSL saturation range [min, max] where 0 = gray, 1 = fully saturated.
   * Only applies when using hue-based generation.
   * @default [0, 1]
   * @example [0.6, 1.0]
   */
  saturation?: Range;

  /**
   * HSL lightness range [min, max] where 0 = black, 1 = white.
   * Only applies when using hue-based generation.
   * @default [0, 1]
   * @example [0.4, 0.8]
   */
  lightness?: Range;

  /**
   * Alpha (opacity) range [min, max] where 0 = transparent, 1 = opaque.
   * Alpha is only included in the CSS string when less than 1.
   * @default [1, 1]
   * @example [0.3, 1.0]
   */
  alpha?: Range;

  /**
   * Output format.
   * - 'css': CSS color string `color(display-p3 r g b)` (default)
   * - 'object': Object with r, g, b, alpha, css, and HSL values if applicable
   * @default 'css'
   */
  format?: 'css' | 'object';
}

/**
 * Color object returned when format is 'object'.
 */
export interface ColorObject {
  /** Display-P3 red channel (0-1) */
  r: number;
  /** Display-P3 green channel (0-1) */
  g: number;
  /** Display-P3 blue channel (0-1) */
  b: number;
  /** Alpha / opacity (0-1) */
  alpha: number;
  /** CSS `color(display-p3 ...)` string */
  css: string;
  /** HSL hue in degrees (0-360). Present when hue/saturation/lightness options are used. */
  h?: number;
  /** HSL saturation (0-1). Present when hue/saturation/lightness options are used. */
  s?: number;
  /** HSL lightness (0-1). Present when hue/saturation/lightness options are used. */
  l?: number;
}

/**
 * Generate a random color in the Display-P3 color space.
 *
 * Without options, generates 3 independent random floats in [0, 1] covering
 * the entire P3 gamut. With hue/saturation/lightness constraints, generates
 * via HSL and converts to P3 RGB.
 *
 * @param options - Optional constraints for hue, saturation, lightness, alpha, and format
 * @returns A CSS color string or ColorObject depending on format option
 *
 * @example
 * // Fully random P3 color
 * randomP3()
 * // => "color(display-p3 0.9312 0.1847 0.4502)"
 *
 * @example
 * // Random blue
 * randomP3({ hue: 'blue' })
 * // => "color(display-p3 0.1203 0.3841 0.9518)"
 *
 * @example
 * // Pastel warm tones
 * randomP3({ hue: 'warm', lightness: [0.7, 0.9], saturation: [0.3, 0.6] })
 * // => "color(display-p3 0.9401 0.8218 0.7512)"
 *
 * @example
 * // Object output
 * randomP3({ hue: 'green', format: 'object' })
 * // => { r: 0.2, g: 0.8, b: 0.3, alpha: 1, h: 130, s: 0.7, l: 0.5, css: "color(display-p3 ...)" }
 */
export default function randomP3(options?: RandomP3Options & { format?: 'css' }): string;
export default function randomP3(options: RandomP3Options & { format: 'object' }): ColorObject;
export default function randomP3(options?: RandomP3Options): string | ColorObject;
