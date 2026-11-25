import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Check, Select, Stat } from './Panel'

// 行级文本清洗：去重 / 排序 / 去空行 / 反转
const SORTS = [
  ['none', '保持原序'],
  ['asc', '字典升序'],
  ['desc', '字典降序'],
  ['length', '按长度升序'],
  ['length-desc', '按长度降序']
]

export default function DedupTool() {
  const [text, setText] = useState('')
  const [dedup, setDedup] = useState(true)
  const [trim, setTrim] = useState(true)
  const [dropEmpty, setDropEmpty] = useState(true)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [sort, setSort] = useState('none')
  const [reverse, setReverse] = useState(false)

  const rawLines = useMemo(() => text.split(/\r?\n/), [text])

  const result = useMemo(() => {
    let lines = rawLines
    if (trim) lines = lines.map(l => l.trim())
    if (dropEmpty) lines = lines.filter(l => l !== '')
    if (dedup) {
      const seen = new Set()
      const out = []
      for (const line of lines) {
        const key = ignoreCase ? line.toLowerCase() : line
        if (seen.has(key)) continue
        seen.add(key)
        out.push(line)
      }
      lines = out
    }
    if (sort === 'asc') lines = [...lines].sort((a, b) => a.localeCompare(b, 'zh'))
    else if (sort === 'desc') lines = [...lines].sort((a, b) => b.localeCompare(a, 'zh'))
    else if (sort === 'length') lines = [...lines].sort((a, b) => a.length - b.length)
    else if (sort === 'length-desc') lines = [...lines].sort((a, b) => b.length - a.length)
    if (reverse) lines = [...lines].reverse()
    return lines
  }, [rawLines, dedup, trim, dropEmpty, ignoreCase, sort, reverse])

  const output = result.join('\n')
  const removed = Math.max(0, rawLines.length - result.length)

  return (
    <div className="space-y-4">
      <Panel title="选项">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Check checked={dedup} onChange={setDedup} label="去除重复行" />
          <Check checked={trim} onChange={setTrim} label="去除首尾空白" />
          <Check checked={dropEmpty} onChange={setDropEmpty} label="忽略空行" />
          <Check checked={ignoreCase} onChange={setIgnoreCase} label="忽略大小写" />
          <Check checked={reverse} onChange={setReverse} label="反转顺序" />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <span>排序</span>
            <Select value={sort} onChange={setSort} options={SORTS} />
          </label>
        </div>
      </Panel>

      <Panel title="输入（每行一条）">
        <TextArea value={text} onChange={setText} rows={9} placeholder={'苹果\n香蕉\n苹果\n  香蕉  \n橙子'} />
      </Panel>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="原始行数" value={rawLines.length} />
        <Stat label="结果行数" value={result.length} />
        <Stat label="已移除" value={removed} />
      </div>

      <Panel title="结果">
        <div className="relative">
          <TextArea value={output} onChange={() => {}} rows={9} />
          {output && <div className="absolute top-2 right-2"><CopyBtn text={output} /></div>}
        </div>
        {output && (
          <div className="mt-3 flex justify-end">
            <CopyBtn text={result.join(', ')} className="!bg-gray-800/60 !text-gray-400 hover:!bg-gray-700/60" />
          </div>
        )}
      </Panel>
    </div>
  )
}
