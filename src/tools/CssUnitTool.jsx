import { useState } from 'react'
import { Panel } from './Panel'

// 基准：1rem = 16px, 1rem = 10px@root(62.5%), 1em = 父元素字号(按 16 假设)
const BASE = {
  px: 1,
  rem: 16,   // 1rem = 16px
  em: 16,    // 假设父元素 16px
  pt: 96 / 72, // 1pt = 1/72 inch = 96/72 px (72dpi 下)
  vw: null,  // 需要视口宽度
  vh: null,
  vmin: null,
  vmax: null,
  '%': null
}
const PX_PER_PT = 96 / 72

export default function CssUnitTool() {
  const [value, setValue] = useState('16')
  const [fromUnit, setFromUnit] = useState('px')
  const [toUnit, setToUnit] = useState('rem')
  const [rootPx, setRootPx] = useState('16')
  const [parentPx, setParentPx] = useState('16')
  const [viewportW, setViewportW] = useState('1920')
  const [viewportH, setViewportH] = useState('1080')

  const units = ['px','rem','em','pt','vw','vh','vmin','vmax','%']

  const toPx = (val, u) => {
    const vw = parseFloat(viewportW) || 1920
    const vh = parseFloat(viewportH) || 1080
    const rp = parseFloat(rootPx) || 16
    const pp = parseFloat(parentPx) || 16
    switch (u) {
      case 'px': return val
      case 'rem': return val * rp
      case 'em': return val * pp
      case 'pt': return val * PX_PER_PT
      case 'vw': return val * vw / 100
      case 'vh': return val * vh / 100
      case 'vmin': return val * Math.min(vw, vh) / 100
      case 'vmax': return val * Math.max(vw, vh) / 100
      case '%': return val * vw / 100
      default: return null
    }
  }
  const fromPx = (px, u) => {
    const vw = parseFloat(viewportW) || 1920
    const vh = parseFloat(viewportH) || 1080
    const rp = parseFloat(rootPx) || 16
    const pp = parseFloat(parentPx) || 16
    switch (u) {
      case 'px': return px
      case 'rem': return px / rp
      case 'em': return px / pp
      case 'pt': return px / PX_PER_PT
      case 'vw': return px * 100 / vw
      case 'vh': return px * 100 / vh
      case 'vmin': return px * 100 / Math.min(vw, vh)
      case 'vmax': return px * 100 / Math.max(vw, vh)
      case '%': return px * 100 / vw
      default: return null
    }
  }

  const results = []
  let localError = ''
  if (value !== '' && !isNaN(value)) {
    const val = parseFloat(value)
    const px = toPx(val, fromUnit)
    if (px == null) { localError = '' }
    else {
      for (const u of units) {
        if (u === fromUnit) { results.push({ u, v: val, self: true }) }
        else { results.push({ u, v: fromPx(px, u), self: false }) }
      }
    }
  }

  const num = v => {
    if (!isFinite(v) || isNaN(v)) return '—'
    const r = Math.round(v * 10000) / 10000
    return String(r)
  }

  return (
    <div className="space-y-4">
      <Panel title="CSS 单位转换">
        <div className="flex flex-wrap items-end gap-3 mb-1">
          <div>
            <label className="block text-xs text-gray-400 mb-1">数值</label>
            <input type="number" step="any" value={value} onChange={e => setValue(e.target.value)}
              className="w-28 bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">从</label>
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-gray-100">
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">到</label>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-gray-100">
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="text-sm text-gray-300 mt-4 px-2">
            = <span className="text-teal font-mono font-medium">{value !== '' && !isNaN(value) ? (num(fromPx(toPx(parseFloat(value), fromUnit), toUnit)) + ' ' + toUnit) : '—'}</span>
          </div>
        </div>
      </Panel>
      <Panel title="参数">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">根字号 (rem=) px</label>
            <input type="number" value={rootPx} onChange={e => setRootPx(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">父元素字号 (em=) px</label>
            <input type="number" value={parentPx} onChange={e => setParentPx(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">视口宽度 px</label>
            <input type="number" value={viewportW} onChange={e => setViewportW(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">视口高度 px</label>
            <input type="number" value={viewportH} onChange={e => setViewportH(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-gray-100" />
          </div>
        </div>
      </Panel>
      {localError && <div className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg p-3">{localError}</div>}
      <Panel title="全部单位换算结果">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 text-xs">
              <th className="py-1 pr-2">单位</th>
              <th className="py-1">换算值</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className={'border-t border-gray-800/60 ' + (r.self ? 'text-teal' : 'text-gray-300')}>
                <td className={'py-1.5 pr-2 font-mono ' + (r.self ? 'text-teal' : '')}>{r.u}</td>
                <td className="py-1.5 font-mono">{num(r.v)} {r.self ? '（原值）' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-gray-500 mt-3">说明：vw/vh/vmin/vmax/% 依赖视口参数；% 按视口宽度换算（横向百分比）。em 假设父元素字号。</div>
      </Panel>
    </div>
  )
}
