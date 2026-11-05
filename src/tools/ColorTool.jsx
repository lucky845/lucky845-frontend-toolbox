import { useState } from 'react'
import { Panel } from './Panel'

function hexToRgb(hex) {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}
function hslToRgb(h, s, l) {
  s /= 100; l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) }
}
const clamp = v => Math.max(0, Math.min(255, Math.round(v)))

export default function ColorTool() {
  const [hex, setHex] = useState('#4EC2C6')
  const [rgb, setRgb] = useState({ r: 78, g: 194, b: 198 })
  const [hsl, setHsl] = useState({ h: 182, s: 51, l: 54 })

  const fromHex = v => {
    setHex(v)
    const c = hexToRgb(v)
    if (!c) return
    setRgb(c)
    setHsl(rgbToHsl(c.r, c.g, c.b))
  }
  const fromRgb = (r, g, b) => {
    setRgb({ r, g, b })
    const h = rgbToHex(r, g, b)
    setHex(h)
    setHsl(rgbToHsl(r, g, b))
  }
  const fromHsl = (h, s, l) => {
    setHsl({ h, s, l })
    const c = hslToRgb(h, s, l)
    setRgb(c)
    setHex(rgbToHex(c.r, c.g, c.b))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5 bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <div className="w-24 h-24 rounded-xl border border-gray-700" style={{ backgroundColor: hex }} />
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">当前颜色</p>
          <div className="flex gap-4 font-mono">
            <span className="text-teal">{hex.toUpperCase()}</span>
            <span className="text-gray-300">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
            <span className="text-gray-300">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</span>
          </div>
          <input type="color" value={hex} onChange={e => fromHex(e.target.value)}
            className="mt-3 w-16 h-8 bg-transparent cursor-pointer" />
        </div>
      </div>
      <Panel title="HEX">
        <input value={hex} onChange={e => fromHex(e.target.value)} spellCheck={false}
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-teal/60" />
      </Panel>
      <Panel title="RGB">
        <div className="flex gap-4">
          {[['r', 'R'], ['g', 'G'], ['b', 'B']].map(([k, label]) => (
            <label key={k} className="flex-1">
              <span className="text-xs text-gray-500 block mb-1">{label}</span>
              <input type="number" min={0} max={255} value={rgb[k]}
                onChange={e => { const v = clamp(+e.target.value); fromRgb(k === 'r' ? v : rgb.r, k === 'g' ? v : rgb.g, k === 'b' ? v : rgb.b) }}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-teal/60" />
            </label>
          ))}
        </div>
      </Panel>
      <Panel title="HSL">
        <div className="flex gap-4">
          {[['h', 'H', 360], ['s', 'S %', 100], ['l', 'L %', 100]].map(([k, label, max]) => (
            <label key={k} className="flex-1">
              <span className="text-xs text-gray-500 block mb-1">{label}</span>
              <input type="number" min={0} max={max} value={hsl[k]}
                onChange={e => { const v = Math.max(0, Math.min(max, +e.target.value)); fromHsl(k === 'h' ? v : hsl.h, k === 's' ? v : hsl.s, k === 'l' ? v : hsl.l) }}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-teal/60" />
            </label>
          ))}
        </div>
      </Panel>
    </div>
  )
}
