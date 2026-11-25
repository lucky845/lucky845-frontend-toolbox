import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Check, Stat, ErrorBar } from './Panel'

// 批量文本替换：支持正则、大小写敏感、整词匹配
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export default function ReplaceTool() {
  const [text, setText] = useState('')
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  const [useRegex, setUseRegex] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)

  const { output, count, error } = useMemo(() => {
    if (!text || !find) return { output: text, count: 0, error: '' }
    try {
      let pattern = useRegex ? find : escapeRe(find)
      if (wholeWord) pattern = `\\b(?:${pattern})\\b`
      const re = new RegExp(pattern, 'g' + (ignoreCase ? 'i' : ''))
      let n = 0
      const out = text.replace(re, (...args) => {
        n++
        // 正则模式下允许 $1 $2 这类捕获组引用
        if (!useRegex) return replace
        return replace.replace(/\$(\d+|\{(\d+)\}|&)/g, (m, g1) => {
          if (m === '$&') return args[0]
          const idx = Number(g1.replace(/[{}]/g, ''))
          return args[idx] ?? m
        })
      })
      return { output: out, count: n, error: '' }
    } catch (e) {
      return { output: '', count: 0, error: '正则表达式无效：' + e.message }
    }
  }, [text, find, replace, useRegex, ignoreCase, wholeWord])

  return (
    <div className="space-y-4">
      <Panel title="替换规则">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-xs text-gray-500 mb-1.5">查找内容</div>
            <input
              value={find}
              onChange={e => setFind(e.target.value)}
              spellCheck={false}
              placeholder={useRegex ? '\\d{11}' : '前端'}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 font-mono text-sm text-gray-100 focus:outline-none focus:border-teal/60"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1.5">替换为{useRegex && '（支持 $1 / $&）'}</div>
            <input
              value={replace}
              onChange={e => setReplace(e.target.value)}
              spellCheck={false}
              placeholder="工具箱"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 font-mono text-sm text-gray-100 focus:outline-none focus:border-teal/60"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Check checked={useRegex} onChange={setUseRegex} label="正则模式" />
          <Check checked={ignoreCase} onChange={setIgnoreCase} label="忽略大小写" />
          <Check checked={wholeWord} onChange={setWholeWord} label="整词匹配" />
        </div>
      </Panel>

      <Panel title="原始文本">
        <TextArea value={text} onChange={setText} rows={8} placeholder="粘贴需要批量替换的内容…" />
      </Panel>

      {error && <ErrorBar>{error}</ErrorBar>}

      <Panel title="替换结果">
        <div className="relative">
          <TextArea value={output} onChange={() => {}} rows={8} />
          {output && <div className="absolute top-2 right-2"><CopyBtn text={output} /></div>}
        </div>
      </Panel>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="原文长度" value={text.length} />
        <Stat label="替换处数" value={count} />
        <Stat label="结果长度" value={output.length} />
      </div>
    </div>
  )
}
