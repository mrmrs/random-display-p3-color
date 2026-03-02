const HUE_RANGES = {
  red: [[345, 360], [0, 15]],
  orange: [[15, 45]],
  yellow: [[45, 70]],
  green: [[70, 165]],
  cyan: [[165, 195]],
  blue: [[195, 260]],
  purple: [[260, 310]],
  pink: [[310, 345]],
  warm: [[0, 70]],
  cool: [[165, 310]],
}

function hslToRgb(h, s, l) {
  h = h / 360
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h * 12) % 12
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }
  return [f(0), f(8), f(4)]
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min)
}

function randomHue(hueOption) {
  if (hueOption == null) return Math.random() * 360

  if (Array.isArray(hueOption)) {
    const [min, max] = hueOption
    if (min <= max) return randomInRange(min, max)
    // Wrapping range like [350, 10]
    const arc = (360 - min) + max
    const v = min + Math.random() * arc
    return v >= 360 ? v - 360 : v
  }

  const ranges = HUE_RANGES[hueOption]
  if (!ranges) throw new Error(`Unknown hue name: "${hueOption}". Valid names: ${Object.keys(HUE_RANGES).join(', ')}`)

  // Pick a random sub-range weighted by arc length
  const arcs = ranges.map(([a, b]) => b - a)
  const totalArc = arcs.reduce((sum, a) => sum + a, 0)
  let pick = Math.random() * totalArc
  for (let i = 0; i < ranges.length; i++) {
    pick -= arcs[i]
    if (pick <= 0) return randomInRange(ranges[i][0], ranges[i][1])
  }
  return randomInRange(ranges[0][0], ranges[0][1])
}

function round(v, d = 4) {
  const f = Math.pow(10, d)
  return Math.round(v * f) / f
}

function formatP3(r, g, b, a) {
  const alpha = a < 1 ? ` / ${round(a, 3)}` : ''
  return `color(display-p3 ${round(r)} ${round(g)} ${round(b)}${alpha})`
}

export default function randomP3(options = {}) {
  const { hue, saturation, lightness, alpha: alphaOpt, format } = options
  const useHsl = hue != null || saturation != null || lightness != null

  const [aMin, aMax] = alphaOpt ?? [1, 1]
  const a = aMin === aMax ? aMin : randomInRange(aMin, aMax)

  let r, g, b, h, s, l

  if (useHsl) {
    h = randomHue(hue)
    const [sMin, sMax] = saturation ?? [0, 1]
    const [lMin, lMax] = lightness ?? [0, 1]
    s = sMin === sMax ? sMin : randomInRange(sMin, sMax)
    l = lMin === lMax ? lMin : randomInRange(lMin, lMax)
    ;[r, g, b] = hslToRgb(h, s, l)
  } else {
    r = Math.random()
    g = Math.random()
    b = Math.random()
  }

  const css = formatP3(r, g, b, a)

  if (format === 'object') {
    const result = { r: round(r), g: round(g), b: round(b), alpha: round(a, 3), css }
    if (useHsl) {
      result.h = round(h, 1)
      result.s = round(s, 3)
      result.l = round(l, 3)
    }
    return result
  }

  return css
}
