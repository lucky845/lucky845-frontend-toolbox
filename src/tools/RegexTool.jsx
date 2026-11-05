import { useState } from 'react'
import { Panel, TextArea } from './Panel'

export default function RegexTool() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [input, setInput] = useState('')
  const [matches, setMatches] = useState([])

  const run = (pat, fl, text) => {
    if (!pat || !text) { setMatches([]); return }
    try {
      const re = new RegExp(pat, fl)
      const m = []
      let mm, idx = 0
      while ((mm = re.exec(text)) !== null) {
        m.push({ index: mm.index, text: mm[0], groups: mm.slice(1).filter(g => g !== undefined) })
        if (mm.index === re.lastIndex) re.lastIndex++
        if (++idx > 10000) break
      }
      setMatches(m)
    } catch (e) {
      setMatches([{ error: e.message }])
    }
  }

  const count = matches[0] && matches[0].error ? 0 : matches.length
  return (
    <div className="space-y-4">
      <Panel title="正则表达式">
        <div className="flex gap-3 mb-3">
          <input value={pattern} onChange={e => { setPattern(e.target.value); run(e.target.value, flags, input) }}
            placeholder="/正则表达式/" spellCheck={false}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-teal/60" />
          <input value={flags} onChange={e => { setFlags(e.target.value); run(pattern, e.target.value, input) }}
            placeholder="gi" maxLength={6} spellCheck={false}
            className="w-16 bg-gray-950 border border-gray-800 rounded-lg px-3 text-center font-mono text-sm focus:outline-none focus:border-teal/60" />
        </div>
        <p className="text-xs text-gray-500">常用标志: g 全局 · i 忽略大小写 · m 多行 · s 单行(.匹配换行)</p>
      </Panel>
      <Panel title="测试文本">
        <TextArea value={input} onChange={v => { setInput(v); run(pattern, flags, v) }} rows={6} />
      </Panel>
      <Panel title={'匹配结果 (' + count + ')'}>
        {matches.length === 0 ? (
          <p className="text-sm text-gray-500">暂无可显示结果</p>
        ) : matches[0].error ? (
          <p className="text-red-400 text-sm">正则错误: {matches[0].error}</p>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto font-mono text-sm">
            {matches.slice(0, 200).map((m, i) => (
              <div key={i} className="flex gap-3 bg-gray-950 border border-gray-800 rounded px-3 py-1.5">
                <span className="text-gray-600 shrink-0">{m.index}</span>
                <code className="text-teal">{m.text}</code>
                {m.groups.length > 0 && <span className="text-gray-500">→ [{m.groups.join(', ')}]</span>}
              </div>
            ))}
            {matches.length > 200 && <p className="text-gray-500 text-xs">…仅显示前 200 条</p>}
          </div>
        )}
      </Panel>
    </div>
  )
}
