import { useMemo, useState } from 'react'
import { Panel, CopyBtn, Segmented, NumInput, Field } from './Panel'

const PRESETS = [
  ['#4EC2C6', '#0F7C81'],
  ['#0C1216', '#4EC2C6'],
  ['#A96F1A', '#4EC2C6'],
  ['#22D3EE', '#6366F1'],
  ['#F472B6', '#FBBF24'],
  ['#34D399', '#06B6D4'],
  ['#8B5CF6', '#EC4899'],
  ['#F59E0B', '#EF4444']
]

const DEFAULT_STOPS = [
  { color: '#4EC2C6', pos: 0 },
  { color: '#0F7C81', pos: 100 }
]

const randomHex = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')

export default function GradientTool() {
  const [type, setType] = useState('linear')
  const [angle, setAngle] = useState('135')
  const [stops, setStops] = useState(DEFAULT_STOPS)
  const [shape, setShape] = useState('circle')

  const css = useMemo(() => {
    const list = [...stops].sort((a, b) => a.pos - b.pos).map(s => `${s.color} ${s.pos}%`).join(', ')
    if (type === 'linear') return `linear-gradient(${angle}deg, ${list})`
    if (type === 'radial') return `radial-gradient(${shape} at center, ${list})`
    return `conic-gradient(from ${angle}deg at center, ${list})`
  }, [type, angle, stops, shape])

  const update = (i, patch) => setStops(stops.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const remove = i => setStops(stops.length > 2 ? stops.filter((_, idx) => idx !== i) : stops)

  const snippets = [
    ['CSS 属性', `background: ${css};`],
    ['background-image', `background-image: ${css};`],
    ['Tailwind 任意值', `bg-[${css.replace(/\s+/g, '_').replace(/#/g, '%23').replace(/,/g, '%2C')}]`],
    ['React 内联样式', `style={{ background: '${css}' }}`],
    ['Canvas', `const g = ctx.createLinearGradient(0, 0, w, h)`]
  ]

  return (
    <div className="space-y-4">
      <Panel title="预览">
        <div
          className="w-full h-40 rounded-xl border border-gray-800"
          style={{ background: css }}
        />
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <Segmented value={type} onChange={setType} options={[['linear', '线性'], ['radial', '径向'], ['conic', '圆锥']]} />
          {type !== 'radial' && (
            <Field label="角度">
              <NumInput value={angle} onChange={setAngle} min={0} max={360} />
              <span className="text-xs text-gray-500">deg</span>
            </Field>
          )}
          {type === 'radial' && (
            <Field label="形状">
              <Segmented value={shape} onChange={setShape} options={[['circle', '圆形'], ['ellipse', '椭圆']]} />
            </Field>
          )}
        </div>
      </Panel>

      <Panel title="色标">
        <div className="space-y-2">
          {stops.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="color"
                value={s.color}
                onChange={e => update(i, { color: e.target.value })}
                className="w-10 h-9 rounded-lg bg-gray-950 border border-gray-800 cursor-pointer p-0.5"
              />
              <input
                value={s.color}
                onChange={e => update(i, { color: e.target.value })}
                spellCheck={false}
                className="w-24 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1.5 font-mono text-sm text-gray-100 focus:outline-none focus:border-teal/60"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={s.pos}
                onChange={e => update(i, { pos: Number(e.target.value) })}
                className="flex-1 accent-teal"
              />
              <span className="text-xs text-gray-400 w-10 text-right font-mono">{s.pos}%</span>
              <button
                onClick={() => remove(i)}
                disabled={stops.length <= 2}
                className="text-xs px-2 py-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                删除
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setStops([...stops, { color: '#ffffff', pos: Math.min(100, Math.max(...stops.map(s => s.pos)) + 10) }])}
            className="text-sm px-3 py-1.5 rounded-lg bg-teal text-gray-950 font-medium hover:bg-teal/90"
          >
            + 添加色标
          </button>
          <button
            onClick={() => setStops(stops.map(s => ({ ...s, color: randomHex() })))}
            className="text-sm px-3 py-1.5 rounded-lg bg-teal/20 text-teal hover:bg-teal/30"
          >
            随机配色
          </button>
          <button
            onClick={() => setStops([...stops.map(s => ({ ...s, pos: 100 - s.pos }))].reverse())}
            className="text-sm px-3 py-1.5 rounded-lg bg-teal/20 text-teal hover:bg-teal/30"
          >
            反转
          </button>
        </div>
      </Panel>

      <Panel title="预设">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {PRESETS.map(([a, b]) => (
            <button
              key={a + b}
              onClick={() => setStops([{ color: a, pos: 0 }, { color: b, pos: 100 }])}
              className="h-12 rounded-lg border border-gray-800 hover:border-teal/60 transition"
              style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
              title={`${a} → ${b}`}
            />
          ))}
        </div>
      </Panel>

      <Panel title="代码">
        <div className="space-y-2">
          {snippets.map(([label, code]) => (
            <div key={label} className="bg-gray-950 border border-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{label}</span>
                <CopyBtn text={code} />
              </div>
              <pre className="font-mono text-xs text-teal whitespace-pre-wrap break-all">{code}</pre>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
