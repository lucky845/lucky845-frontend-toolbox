import React from 'react'
export function Panel({ title, children }) {
  return (
    <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-300 mb-3">{title}</h2>
      {children}
    </section>
  )
}

export function TextArea({ value, onChange, rows = 8, placeholder, className = '' }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      spellCheck={false}
      className={`w-full bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-sm text-gray-100 focus:outline-none focus:border-teal/60 resize-y ${className}`}
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
