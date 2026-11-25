import React from 'react'
export function Panel({ title, children }) {
  return (
    <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-300 mb-3">{title}</h2>
      {children}
    </section>
  )
}

export function TextArea({ value, onChange, rows = 8, placeholder, className = '', readOnly = false, mono = true }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      readOnly={readOnly}
      spellCheck={false}
      className={`w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-gray-100 focus:outline-none focus:border-teal/60 resize-y ${mono ? 'font-mono' : ''} ${readOnly ? 'text-gray-300' : ''} ${className}`}
    />
  )
}

export function CopyBtn({ text, className = '' }) {
  const [done, setDone] = React.useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1500)
    } catch {}
  }
  return (
    <button onClick={copy} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition bg-teal/20 text-teal hover:bg-teal/30 ${className}`}>
      {done ? '✓ 已复制' : '复制'}
    </button>
  )
}

// 勾选框：与整体暗色风格统一
export function Check({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 flex-none rounded border-gray-700 bg-gray-950 accent-teal"
      />
      <span>{label}</span>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  )
}

// 分段切换器：等价于原来的假按钮组
export function Segmented({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap rounded-lg overflow-hidden border border-gray-700 w-fit">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-3.5 py-2 text-sm transition ${
            value === v ? 'bg-teal text-gray-950 font-medium' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function Select({ value, onChange, options, className = '' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-teal/60 ${className}`}
    >
      {options.map(([v, label]) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  )
}

export function Field({ label, children, className = '' }) {
  return (
    <label className={`flex items-center gap-2 text-sm text-gray-300 ${className}`}>
      <span className="flex-none whitespace-nowrap">{label}</span>
      {children}
    </label>
  )
}

export function NumInput({ value, onChange, min, max, step = 1, className = '' }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={e => onChange(e.target.value)}
      className={`w-20 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 text-sm text-gray-100 focus:outline-none focus:border-teal/60 ${className}`}
    />
  )
}

export function ErrorBar({ children }) {
  return (
    <div className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg p-3 whitespace-pre-wrap break-all">
      {children}
    </div>
  )
}

// 结果统计卡片
export function Stat({ label, value }) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-center min-w-0">
      <div className="text-lg font-bold text-teal truncate">{value}</div>
      <div className="text-[11px] text-gray-500 mt-0.5 truncate">{label}</div>
    </div>
  )
}
