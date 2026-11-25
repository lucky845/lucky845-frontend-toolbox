import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Field, NumInput, Select, Check, Segmented } from './Panel'

// CSS box-shadow / text-shadow 可视化生成
const PRESETS = [
  ['柔和卡片', '0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.24)'],
  ['悬浮层', '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)'],
  ['浮起', '0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)'],
  ['霓虹青', '0 0 8px rgba(78,194,198,.9), 0 0 24px rgba(78,194,198,.5)'],
  ['内阴影', 'inset 0 2px 4px rgba(0,0,0,.4)']
]

let uid = 0
const newLayer = (init = {}) => ({
  id: ++uid,
  x: 0,
  y: 4,
  blur: 8,
  spread: 0,
  color: '#000000',
  opacity: 0.25,
  inset: false,
  ...init
})

const hexToRgba = (hex, alpha) => {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const r = parseInt(full.slice(0, 2), 16) || 0
  const g = parseInt(full.slice(2, 4), 16) || 0
  const b = parseInt(full.slice(4, 6), 16) || 0
  const a = Math.round(alpha * 100) / 100
  return `rgba(${r},${g},${b},${a})`
}

const layerToCss = l =>
  `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity)}`

export default function ShadowTool() {
  const [layers, setLayers] = useState(() => [newLayer()])
  const [mode, setMode] = useState('box')
  const [textColor, setTextColor] = useState('#4EC2C6')
  const [bgColor, setBgColor] = useState('#0C1216')

  const css = useMemo(() => layers.map(layerToCss).join(', '), [layers])
  const declaration = `${mode === 'box' ? 'box-shadow' : 'text-shadow'}: ${css};`

  const snippets = useMemo(() => {
    const prop = mode === 'box' ? 'box-shadow' : 'text-shadow'
    return [
      ['CSS 声明', declaration],
      ['Tailwind', `shadow-[${css.replace(/\s+/g, '_')}]`],
      ['React 内联', `style={{ ${mode === 'box' ? 'boxShadow' : 'textShadow'}: '${css}' }}`],
      ['CSS 变量', `--shadow: ${css};`]
    ]
  }, [css, declaration, mode])

  const update = (id, patch) => setLayers(prev => prev.map(l => (l.id === id ? { ...l, ...patch } : l)))
  const remove = id => setLayers(prev => (prev.length > 1 ? prev.filter(l => l.id !== id) : prev))
  const add = () => setLayers(prev => [...prev, newLayer({ y: (prev.length + 1) * 2, blur: 8 + prev.length * 4 })])

  const loadPreset = raw => {
    // 从预设字符串里粗略解析多层
    const parsed = raw.split(/,\s*(?![^()]*\))/).map(seg => {
      const inset = /inset/.test(seg)
      const nums = seg.replace(/rgba?\([^)]*\)/g, '').match(/-?\d+(?:\.\d+)?px/g) || []
      const toNum = i => (nums[i] ? parseFloat(nums[i]) : 0)
      const colorMatch = seg.match(/rgba?\(([^)]*)\)/)
      let color = '#000000'
      let opacity = 0.25
      if (colorMatch) {
        const parts = colorMatch[1].split(',').map(s => s.trim())
        const toHex = v => Number(v).toString(16).padStart(2, '0')
        color = '#' + toHex(parts[0]) + toHex(parts[1]) + toHex(parts[2])
        opacity = parts[3] !== undefined ? parseFloat(parts[3]) : 1
      }
      return newLayer({ x: toNum(0), y: toNum(1), blur: toNum(2), spread: toNum(3), color, opacity, inset })
    })
    setLayers(parsed.length ? parsed : [newLayer()])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={mode} onChange={setMode} options={[['box', '盒子阴影'], ['text', '文字阴影']]} />
        <button
          onClick={add}
          className="px-3 py-1.5 rounded-lg text-sm bg-teal/20 text-teal hover:bg-teal/30 transition-colors"
        >
          + 添加图层
        </button>
      </div>

      {/* 预览区 */}
      <Panel title="预览">
        <div
          className="rounded-xl flex items-center justify-center py-14"
          style={{ background: bgColor }}
        >
          <div
            className="px-10 py-8 rounded-xl bg-gray-800 text-xl font-semibold transition-all"
            style={mode === 'box'
              ? { boxShadow: css, color: textColor }
              : { textShadow: css, color: textColor, background: 'transparent' }}
          >
            前端工具箱
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Field label="文字颜色">
            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-12 h-9 bg-transparent rounded cursor-pointer" />
          </Field>
          <Field label="背景颜色">
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-12 h-9 bg-transparent rounded cursor-pointer" />
          </Field>
          <Field label="预设">
            <Select
              value=""
              onChange={v => { if (v) loadPreset(v) }}
              options={[['', '选择预设…'], ...PRESETS]}
            />
          </Field>
        </div>
      </Panel>

      {/* 图层编辑 */}
      <div className="space-y-3">
        {layers.map((l, i) => (
          <Panel key={l.id} title={`图层 ${i + 1}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="水平偏移 x">
                <NumInput value={l.x} onChange={v => update(l.id, { x: Number(v) || 0 })} />
              </Field>
              <Field label="垂直偏移 y">
                <NumInput value={l.y} onChange={v => update(l.id, { y: Number(v) || 0 })} />
              </Field>
              <Field label="模糊半径 blur">
                <NumInput value={l.blur} onChange={v => update(l.id, { blur: Math.max(0, Number(v) || 0) })} min={0} />
              </Field>
              <Field label="扩展 spread">
                <NumInput value={l.spread} onChange={v => update(l.id, { spread: Number(v) || 0 })} />
              </Field>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <Field label="颜色">
                <input type="color" value={l.color} onChange={e => update(l.id, { color: e.target.value })} className="w-12 h-9 bg-transparent rounded cursor-pointer" />
              </Field>
              <Field label={`不透明度 ${Math.round(l.opacity * 100)}%`}>
                <input
                  type="range" min="0" max="1" step="0.01" value={l.opacity}
                  onChange={e => update(l.id, { opacity: parseFloat(e.target.value) })}
                  className="w-full accent-teal"
                />
              </Field>
              <div className="text-xs font-mono text-teal/80 break-all md:col-span-1">{layerToCss(l)}</div>
              <div className="flex justify-end gap-2">
                {l.inset && <span className="px-2 py-1 rounded text-xs bg-amber/20 text-amber">inset</span>}
                <button
                  onClick={() => remove(l.id)}
                  disabled={layers.length === 1}
                  className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
            {mode === 'box' && (
              <div className="mt-2">
                <Check checked={l.inset} onChange={v => update(l.id, { inset: v })} label="内阴影 inset" />
              </div>
            )}
          </Panel>
        ))}
      </div>

      <Panel title="代码">
        <div className="space-y-3">
          {snippets.map(([label, code]) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{label}</span>
                <CopyBtn text={code} />
              </div>
              <pre className="bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs font-mono text-gray-200 overflow-x-auto whitespace-pre-wrap break-all">
                {code}
              </pre>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
