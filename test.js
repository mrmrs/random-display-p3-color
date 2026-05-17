import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import randomP3 from './index.js'

const P3_REGEX = /^color\(display-p3 \d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?\)$/
const P3_ALPHA_REGEX = /^color\(display-p3 \d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)? \/ \d+(\.\d+)?\)$/

function parseP3(str) {
  const m = str.match(/color\(display-p3 ([\d.]+) ([\d.]+) ([\d.]+)/)
  return { r: +m[1], g: +m[2], b: +m[3] }
}

describe('randomP3()', () => {

  describe('default (no options)', () => {
    it('returns a valid display-p3 CSS string', () => {
      for (let i = 0; i < 50; i++) {
        const color = randomP3()
        assert.match(color, P3_REGEX)
      }
    })

    it('produces channel values in [0, 1]', () => {
      for (let i = 0; i < 200; i++) {
        const { r, g, b } = parseP3(randomP3())
        assert.ok(r >= 0 && r <= 1, `r=${r} out of range`)
        assert.ok(g >= 0 && g <= 1, `g=${g} out of range`)
        assert.ok(b >= 0 && b <= 1, `b=${b} out of range`)
      }
    })

    it('generates varying values', () => {
      const colors = new Set()
      for (let i = 0; i < 50; i++) colors.add(randomP3())
      assert.ok(colors.size > 40, `Expected variety, got ${colors.size} unique out of 50`)
    })

    it('does not include alpha when not specified', () => {
      for (let i = 0; i < 20; i++) {
        assert.ok(!randomP3().includes('/'))
      }
    })
  })

  describe('named hue constraints', () => {
    const hueNames = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink', 'warm', 'cool']

    for (const name of hueNames) {
      it(`"${name}" produces valid output`, () => {
        for (let i = 0; i < 20; i++) {
          assert.match(randomP3({ hue: name }), P3_REGEX)
        }
      })
    }

    it('blue hue produces colors with dominant blue channel', () => {
      let bluedominant = 0
      for (let i = 0; i < 100; i++) {
        const { r, g, b } = parseP3(randomP3({ hue: 'blue', saturation: [0.5, 1], lightness: [0.3, 0.7] }))
        if (b > r && b > g) bluedominant++
      }
      assert.ok(bluedominant > 60, `Expected mostly blue-dominant, got ${bluedominant}/100`)
    })

    it('red hue produces colors with red character', () => {
      let redPresent = 0
      for (let i = 0; i < 100; i++) {
        const { r, g, b } = parseP3(randomP3({ hue: 'red', saturation: [0.5, 1], lightness: [0.3, 0.7] }))
        if (r > g && r > b) redPresent++
      }
      assert.ok(redPresent > 60, `Expected mostly red-dominant, got ${redPresent}/100`)
    })

    it('throws on invalid hue name', () => {
      assert.throws(() => randomP3({ hue: 'chartreuse' }), /Unknown hue name/)
    })
  })

  describe('custom hue range', () => {
    it('accepts [min, max] degree range', () => {
      for (let i = 0; i < 20; i++) {
        assert.match(randomP3({ hue: [200, 260] }), P3_REGEX)
      }
    })

    it('handles wrapping range [350, 10]', () => {
      for (let i = 0; i < 50; i++) {
        const obj = randomP3({ hue: [350, 10], format: 'object' })
        assert.ok(obj.h >= 350 || obj.h <= 10, `h=${obj.h} not in wrapping range`)
      }
    })
  })

  describe('saturation constraint', () => {
    it('respects saturation range', () => {
      for (let i = 0; i < 50; i++) {
        const obj = randomP3({ saturation: [0.8, 1.0], hue: 'blue', format: 'object' })
        assert.ok(obj.s >= 0.799 && obj.s <= 1.001, `s=${obj.s} not in [0.8, 1.0]`)
      }
    })

    it('saturation 0 produces grays', () => {
      for (let i = 0; i < 20; i++) {
        const obj = randomP3({ saturation: [0, 0], hue: 'blue', format: 'object' })
        const diff = Math.abs(obj.r - obj.g) + Math.abs(obj.g - obj.b)
        assert.ok(diff < 0.01, `Expected gray, got r=${obj.r} g=${obj.g} b=${obj.b}`)
      }
    })
  })

  describe('lightness constraint', () => {
    it('respects lightness range', () => {
      for (let i = 0; i < 50; i++) {
        const obj = randomP3({ lightness: [0.6, 0.9], hue: 'green', format: 'object' })
        assert.ok(obj.l >= 0.599 && obj.l <= 0.901, `l=${obj.l} not in [0.6, 0.9]`)
      }
    })

    it('lightness 0 produces black', () => {
      for (let i = 0; i < 10; i++) {
        const { r, g, b } = parseP3(randomP3({ lightness: [0, 0], hue: 'blue' }))
        assert.ok(r < 0.01 && g < 0.01 && b < 0.01, `Expected black, got ${r} ${g} ${b}`)
      }
    })

    it('lightness 1 produces white', () => {
      for (let i = 0; i < 10; i++) {
        const { r, g, b } = parseP3(randomP3({ lightness: [1, 1], hue: 'blue' }))
        assert.ok(r > 0.99 && g > 0.99 && b > 0.99, `Expected white, got ${r} ${g} ${b}`)
      }
    })
  })

  describe('alpha', () => {
    it('includes alpha in CSS string when < 1', () => {
      for (let i = 0; i < 20; i++) {
        const color = randomP3({ alpha: [0.5, 0.5] })
        assert.match(color, P3_ALPHA_REGEX)
        assert.ok(color.includes('/ 0.5'))
      }
    })

    it('omits alpha when 1', () => {
      assert.ok(!randomP3({ alpha: [1, 1] }).includes('/'))
    })

    it('alpha range produces varying values', () => {
      const alphas = new Set()
      for (let i = 0; i < 50; i++) {
        const obj = randomP3({ alpha: [0, 1], format: 'object' })
        alphas.add(obj.alpha)
      }
      assert.ok(alphas.size > 20, `Expected alpha variety, got ${alphas.size} unique`)
    })
  })

  describe('input validation', () => {
    it('rejects invalid range shapes', () => {
      assert.throws(() => randomP3({ hue: [30] }), TypeError)
      assert.throws(() => randomP3({ saturation: [0.5, 0.75, 1] }), TypeError)
      assert.throws(() => randomP3({ lightness: 'bright' }), TypeError)
    })

    it('rejects non-finite range values', () => {
      assert.throws(() => randomP3({ hue: [0, Number.NaN] }), RangeError)
      assert.throws(() => randomP3({ saturation: [0, Infinity] }), RangeError)
      assert.throws(() => randomP3({ alpha: [-Infinity, 1] }), RangeError)
    })

    it('rejects ranges outside their supported domains', () => {
      assert.throws(() => randomP3({ hue: [-1, 20] }), RangeError)
      assert.throws(() => randomP3({ hue: [20, 361] }), RangeError)
      assert.throws(() => randomP3({ saturation: [-0.1, 0.5] }), RangeError)
      assert.throws(() => randomP3({ lightness: [0.2, 1.1] }), RangeError)
      assert.throws(() => randomP3({ alpha: [-0.1, 1] }), RangeError)
    })

    it('rejects inverted non-wrapping ranges', () => {
      assert.throws(() => randomP3({ saturation: [1, 0] }), RangeError)
      assert.throws(() => randomP3({ lightness: [0.7, 0.3] }), RangeError)
      assert.throws(() => randomP3({ alpha: [1, 0] }), RangeError)
    })

    it('rejects unknown output formats', () => {
      assert.throws(() => randomP3({ format: 'hex' }), TypeError)
    })
  })

  describe('format: object', () => {
    it('returns object with required keys', () => {
      const obj = randomP3({ format: 'object' })
      assert.ok('r' in obj)
      assert.ok('g' in obj)
      assert.ok('b' in obj)
      assert.ok('alpha' in obj)
      assert.ok('css' in obj)
    })

    it('includes HSL values when using hue constraints', () => {
      const obj = randomP3({ hue: 'blue', format: 'object' })
      assert.ok('h' in obj)
      assert.ok('s' in obj)
      assert.ok('l' in obj)
    })

    it('omits HSL values when no hue constraints', () => {
      const obj = randomP3({ format: 'object' })
      assert.equal(obj.h, undefined)
      assert.equal(obj.s, undefined)
      assert.equal(obj.l, undefined)
    })

    it('css property matches P3 regex', () => {
      for (let i = 0; i < 20; i++) {
        const obj = randomP3({ hue: 'green', format: 'object' })
        assert.match(obj.css, P3_REGEX)
      }
    })

    it('numeric values are in valid ranges', () => {
      for (let i = 0; i < 100; i++) {
        const obj = randomP3({ hue: 'purple', format: 'object' })
        assert.ok(obj.r >= 0 && obj.r <= 1)
        assert.ok(obj.g >= 0 && obj.g <= 1)
        assert.ok(obj.b >= 0 && obj.b <= 1)
        assert.ok(obj.h >= 0 && obj.h <= 360)
        assert.ok(obj.s >= 0 && obj.s <= 1)
        assert.ok(obj.l >= 0 && obj.l <= 1)
      }
    })
  })

  describe('combined constraints', () => {
    it('accepts hue + saturation + lightness + alpha', () => {
      const color = randomP3({
        hue: 'warm',
        saturation: [0.5, 0.8],
        lightness: [0.6, 0.9],
        alpha: [0.7, 1.0],
      })
      assert.ok(typeof color === 'string')
      assert.ok(color.startsWith('color(display-p3'))
    })

    it('single-value ranges produce exact values', () => {
      const obj = randomP3({
        hue: [180, 180],
        saturation: [0.5, 0.5],
        lightness: [0.5, 0.5],
        format: 'object',
      })
      assert.equal(obj.h, 180)
      assert.equal(obj.s, 0.5)
      assert.equal(obj.l, 0.5)
    })
  })

  describe('stress test', () => {
    it('10000 random colors all have valid channels', () => {
      for (let i = 0; i < 10000; i++) {
        const { r, g, b } = parseP3(randomP3())
        assert.ok(r >= 0 && r <= 1, `r=${r}`)
        assert.ok(g >= 0 && g <= 1, `g=${g}`)
        assert.ok(b >= 0 && b <= 1, `b=${b}`)
      }
    })

    it('10000 hue-constrained colors all have valid channels', () => {
      const hues = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink']
      for (let i = 0; i < 10000; i++) {
        const hue = hues[i % hues.length]
        const { r, g, b } = parseP3(randomP3({ hue }))
        assert.ok(r >= 0 && r <= 1, `${hue}: r=${r}`)
        assert.ok(g >= 0 && g <= 1, `${hue}: g=${g}`)
        assert.ok(b >= 0 && b <= 1, `${hue}: b=${b}`)
      }
    })
  })

  describe('edge cases', () => {
    it('empty options object behaves like no args', () => {
      assert.match(randomP3({}), P3_REGEX)
    })

    it('saturation alone triggers HSL path', () => {
      assert.match(randomP3({ saturation: [0.5, 1] }), P3_REGEX)
    })

    it('lightness alone triggers HSL path', () => {
      assert.match(randomP3({ lightness: [0.3, 0.7] }), P3_REGEX)
    })
  })
})
