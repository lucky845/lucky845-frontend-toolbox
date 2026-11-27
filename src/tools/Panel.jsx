import React from 'react'
import ReactDOM from 'react-dom'
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

// 提示气泡：鼠标悬停 / 键盘聚焦 / 触屏点按时显示说明，用于解释规则细节
// 用 position: fixed 定位而不是 absolute：气泡挂在滚动容器里，absolute 在窄屏会被边缘裁掉，
// fixed 不受祖先 overflow 影响，坐标在显示时按视口宽度夹紧。
const TIP_WIDTH = 208 // 与下面的 w-52 保持一致
export function Tip({ children, side = 'bottom', className = '' }) {
  const btnRef = React.useRef(null)
  const [pos, setPos] = React.useState(null)
  // 触屏没有 hover 概念：点击才切换显示；桌面走悬停，点击不额外切换，避免「点一下先开后关」
  const canHover = React.useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches,
    []
  )

  const place = React.useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect()
    if (!r) return
    const margin = 8
    const left = Math.max(margin, Math.min(r.left + r.width / 2 - TIP_WIDTH / 2, window.innerWidth - TIP_WIDTH - margin))
    const top = side === 'top' ? r.top - 8 : r.bottom + 8
    setPos({ left, top })
  }, [side])

  const hide = React.useCallback(() => setPos(null), [])

  React.useEffect(() => {
    if (!pos) return
    // 滚动或改变窗口尺寸时坐标已失效，直接收起
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [pos, hide])

  const handlers = canHover
    ? {
        onMouseEnter: place,
        onMouseLeave: hide,
        onFocus: place,
        onBlur: hide
      }
    : {
        onClick: e => {
          e.preventDefault()
          e.stopPropagation()
          pos ? hide() : place()
        },
        // 触屏点开后再点别处要能收起
        onBlur: hide
      }

  return (
    <span className={`inline-flex flex-none ${className}`}>
      <button
        ref={btnRef}
        type="button"
        aria-label="查看说明"
        {...handlers}
        className="w-4 h-4 flex items-center justify-center rounded-full text-gray-500 hover:text-teal focus:outline-none focus-visible:ring-1 focus-visible:ring-teal/60 transition cursor-help"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.6.2-.9.7-.9 1.3v.4" />
          <path d="M12 17h.01" />
        </svg>
      </button>
      {pos && ReactDOM.createPortal(
        <span
          role="tooltip"
          style={{
            position: 'fixed',
            left: pos.left,
            top: pos.top,
            width: TIP_WIDTH,
            transform: side === 'top' ? 'translateY(-100%)' : undefined
          }}
          className="pointer-events-none z-[60] px-2.5 py-2 rounded-lg bg-gray-800 border border-gray-700 text-[11px] leading-relaxed text-gray-200 font-normal normal-case tracking-normal text-left shadow-xl shadow-black/50"
        >
          {children}
        </span>,
        document.body
      )}
    </span>
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
