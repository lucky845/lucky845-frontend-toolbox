import { useMemo, useState } from 'react'
import { Panel, CopyBtn, Stat } from './Panel'

const NAMED = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', blue: '#0000ff',
  yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff', gray: '#808080', grey: '#808080',
  orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', brown: '#a52a2a',
  transparent: '#00000000', teal: '#008080', navy: '#000080', olive: '#808000',
  silver: '#c0c0c0', lime: '#00ff00', maroon: '#800000', aqua: '#00ffff', fuchsia: '#ff00ff'
}

const parseColor = (raw) => {
  const s = raw.trim().toLowerCase()
  if (!s) throw new Error('请输入颜色值')
  if (NAMED[s]) return parseColor(NAMED[s])
  // #rgb / #rgba / #rrggbb / #rrggbbaa
  let m = /^#?([0-9a-f]{3,8})$/i.exec(s)
  if (m) {
    let hex = m[1]
    if (hex.length === 3 || hex.length === 4) hex = hex.split('').map(c => c + c).join('')
    if (hex.length !== 6 && hex.length !== 8) throw new Error('十六进制颜色位数不正确')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
    return { r, g, b, a }
  }
  // rgb() / rgba() / hsl() / hsla()
  m = /^(rgba?|hsla?)\(([^)]+)\)$/.exec(s)
  if (m) {
    const parts = m[2].split(/[,\s/]+/).filter(Boolean)
    if (parts.length < 3) throw new Error('颜色分量不足')
    const nums = parts.slice(0, 3).map(p => parseFloat(p))
    if (nums.some(n => Number.isNaN(n))) throw new Error('颜色分量不是数字')
    let alpha = parts[3] !== undefined ? parseFloat(parts[3]) : 1
    if (parts[3] !== undefined && parts[3].endsWith('%')) alpha = parseFloat(parts[3]) / 100
    if (Number.isNaN(alpha)) alpha = 1
    if (m[1].startsWith('rgb')) {
      return { r: clamp(nums[0], 0, 255), g: clamp(nums[1], 0, 255), b: clamp(nums[2], 0, 255), a: clamp(alpha, 0, 1) }
    }
    const [h, sat, light] = [nums[0], nums[1], nums[2]]
    return { ...hslToRgb(h, sat, light), a: clamp(alpha, 0, 1) }
  }
  throw new Error('无法识别的颜色格式：' + raw)
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const round = n => Math.round(n)

const rgbToHex = ({ r, g, b, a }) => {
  const h = (n) => round(clamp(n, 0, 255)).toString(16).padStart(2, '0')
  return '#' + h(r) + h(g) + h(b) + (a < 1 ? h(a * 255) : '')
}

const rgbToHsl = ({ r, g, b }) => {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
    else if (max === gn) h = ((bn - rn) / d + 2) / 6
    else h = ((rn - gn) / d + 4) / 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

const hslToRgb = (h, s, l) => {
  const hh = ((h % 360) + 360) % 360 / 360
  const ss = clamp(s, 0, 100) / 100
  const ll = clamp(l, 0, 100) / 100
  if (ss === 0) {
    const v = round(ll * 255)
    return { r: v, g: v, b: v }
  }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss
  const p = 2 * ll - q
  const hue2rgb = t => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  return {
    r: round(hue2rgb(hh + 1 / 3) * 255),
    g: round(hue2rgb(hh) * 255),
    b: round(hue2rgb(hh - 1 / 3) * 255)
  }
}

const rgbToHsv = ({ r, g, b }) => {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
    else if (max === gn) h = ((bn - rn) / d + 2) / 6
    else h = ((rn - gn) / d + 4) / 6
  }
  return { h: h * 360, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 }
}

const rgbToCmyk = ({ r, g, b }) => {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const k = 1 - Math.max(rn, gn, bn)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  return {
    c: ((1 - rn - k) / (1 - k)) * 100,
    m: ((1 - gn - k) / (1 - k)) * 100,
    y: ((1 - bn - k) / (1 - k)) * 100,
    k: k * 100
  }
}

// WCAG 相对亮度与对比度
const luminance = ({ r, g, b }) => {
  const f = c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

const contrast = (a, b) => {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

// 生成 tint / shade 色阶
const tint = (c, amount) => ({
  r: round(c.r + (255 - c.r) * amount),
  g: round(c.g + (255 - c.g) * amount),
  b: round(c.b + (255 - c.b) * amount),
  a: 1
})
const shade = (c, amount) => ({
  r: round(c.r * (1 - amount)),
  g: round(c.g * (1 - amount)),
  b: round(c.b * (1 - amount)),
  a: 1
})

const LEVELS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]

export default function ColorTool() {
  const [input, setInput] = useState('#4EC2C6')

  const { parsed, error } = useMemo(() => {
    try {
      return { parsed: parseColor(input), error: '' }
    } catch (e) {
      return { parsed: null, error: e.message }
    }
  }, [input])

  const derived = useMemo(() => {
    if (!parsed) return null
    const hsl = rgbToHsl(parsed)
    const hsv = rgbToHsv(parsed)
    const cmyk = rgbToCmyk(parsed)
    return {
      hex: rgbToHex(parsed),
      hexShort: (() => {
        const h = rgbToHex({ ...parsed, a: 1 })
        return h[1] === h[2] && h[3] === h[4] && h[5] === h[6] ? '#' + h[1] + h[3] + h[5] : h
      })(),
      rgb: `rgb(${round(parsed.r)}, ${round(parsed.g)}, ${round(parsed.b)})`,
      rgba: `rgba(${round(parsed.r)}, ${round(parsed.g)}, ${round(parsed.b)}, ${Number(parsed.a.toFixed(3))})`,
      hsl: `hsl(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%)`,
      hsv: `hsv(${round(hsv.h)}, ${round(hsv.s)}%, ${round(hsv.v)}%)`,
      cmyk: `cmyk(${round(cmyk.c)}%, ${round(cmyk.m)}%, ${round(cmyk.y)}%, ${round(cmyk.k)}%)`,
      hslRaw: hsl,
      contrastWhite: contrast(parsed, { r: 255, g: 255, b: 255 }),
      contrastBlack: contrast(parsed, { r: 0, g: 0, b: 0 }),
      luminance: luminance(parsed),
      int: (round(parsed.r) << 16) + (round(parsed.g) << 8) + round(parsed.b)
    }
  }, [parsed])

  const scale = useMemo(() => {
    if (!parsed) return []
    return LEVELS.map(level => {
      const c = level < 50 ? tint(parsed, (50 - level) / 50) : shade(parsed, (level - 50) / 55)
      return { level, hex: rgbToHex(c) }
    })
  }, [parsed])

  const swatches = [
    ['Hex', derived?.hex],
    ['RGB', derived?.rgb],
    ['RGBA', derived?.rgba],
    ['HSL', derived?.hsl],
    ['HSV', derived?.hsv],
    ['CMYK', derived?.cmyk]
  ]

  return (
    <div className="space-y-4">
      <Panel title="输入颜色">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            value={parsed && parsed.a > 0 ? rgbToHex({ ...parsed, a: 1 }).slice(0, 7) : '#000000'}
            onChange={e => setInput(e.target.value)}
            className="w-14 h-11 rounded-lg bg-gray-950 border border-gray-800 cursor-pointer p-1"
          />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
            placeholder="#4EC2C6 / rgb(78,194,198) / hsl(182,48%,54%) / teal"
            className="flex-1 min-w-52 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 font-mono text-sm text-gray-100 focus:outline-none focus:border-teal/60"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {['#4EC2C6', '#0F7C81', '#A96F1A', '#F472B6', '#6366F1', 'tomato', 'hsl(120, 60%, 45%)'].map(c => (
            <button
              key={c}
              onClick={() => setInput(c)}
              className="text-xs px-2 py-1 rounded-md bg-gray-900 border border-gray-800 text-gray-400 hover:text-teal hover:border-teal/40 font-mono"
            >
              {c}
            </button>
          ))}
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </Panel>

      {parsed && (
        <>
          <div className="rounded-xl overflow-hidden border border-gray-800">
            <div className="h-28" style={{ background: derived.hex }} />
            <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-gray-800 bg-gray-900/50">
              {swatches.map(([label, value]) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2">
                  <span className="text-[11px] text-gray-500 w-10 flex-none">{label}</span>
                  <code className="flex-1 text-xs font-mono text-teal truncate" title={value}>{value}</code>
                  <CopyBtn text={value} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Stat label="整数色值" value={'0x' + derived.int.toString(16).toUpperCase().padStart(6, '0')} />
            <Stat label="相对亮度" value={derived.luminance.toFixed(3)} />
            <Stat label="对白字对比度" value={derived.contrastWhite.toFixed(2)} />
            <Stat label="对黑字对比度" value={derived.contrastBlack.toFixed(2)} />
          </div>

          <Panel title="对比度检测（WCAG）">
            <div className="space-y-2">
              {[
                ['白字 / 当前底色', derived.contrastWhite],
                ['黑字 / 当前底色', derived.contrastBlack]
              ].map(([label, ratio]) => {
                const passAA = ratio >= 4.5
                const passAAA = ratio >= 7
                const passLarge = ratio >= 3
                return (
                  <div key={label} className="flex flex-wrap items-center gap-3 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-300 flex-1">{label}</span>
                    <span className="font-mono text-sm text-teal">{ratio.toFixed(2)}:1</span>
                    {[[passAA, 'AA 正文'], [passLarge, 'AA 大字'], [passAAA, 'AAA']].map(([ok, name]) => (
                      <span key={name} className={`text-[11px] px-1.5 py-0.5 rounded ${ok ? 'bg-teal/20 text-teal' : 'bg-red-500/15 text-red-400'}`}>
                        {ok ? '✓' : '✗'} {name}
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel title="色阶（浅 → 深）">
            <div className="grid grid-cols-6 sm:grid-cols-11 gap-1">
              {scale.map(({ level, hex }) => (
                <button
                  key={level}
                  onClick={() => { setInput(hex); navigator.clipboard?.writeText(hex).catch(() => {}) }}
                  className="group relative rounded-lg overflow-hidden border border-gray-800 hover:border-teal/60 transition"
                  title={`点击复制 ${hex}`}
                >
                  <div className="h-12" style={{ background: hex }} />
                  <div className="text-[10px] text-gray-400 py-0.5 text-center bg-gray-950 font-mono">{level}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">点击色块可复制该色值；50 为原始颜色。</p>
          </Panel>

          <Panel title="色相变体">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[0, 30, 60, 120, 180, 240, 270, 300, 330].map(shift => {
                const h = (derived.hslRaw.h + shift) % 360
                const c = { ...hslToRgb(h, derived.hslRaw.s, derived.hslRaw.l), a: 1 }
                return (
                  <button
                    key={shift}
                    onClick={() => setInput(rgbToHex(c))}
                    className="rounded-lg border border-gray-800 overflow-hidden hover:border-teal/60 transition"
                    title={`${shift === 0 ? '原色' : '色相 +' + shift + '°'} · ${rgbToHex(c)}`}
                  >
                    <div className="h-10" style={{ background: rgbToHex(c) }} />
                    <div className="text-[10px] text-gray-500 py-0.5 text-center bg-gray-950 font-mono">{shift === 0 ? '原色' : '+' + shift}</div>
                  </button>
                )
              })}
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}
