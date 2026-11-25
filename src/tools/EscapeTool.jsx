import { useState } from 'react'
import { Panel, TextArea, CopyBtn, Segmented, Check, ErrorBar } from './Panel'

// 各语言/场景的字符串转义与反转义
const TYPES = [
  ['json', 'JSON'],
  ['html', 'HTML'],
  ['sql', 'SQL'],
  ['shell', 'Shell'],
  ['csv', 'CSV'],
  ['regex', '正则']
]

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '©', reg: '®', hellip: '…', mdash: '—', ndash: '–', times: '×', divide: '÷' }

const escapeMap = {
  json: s => JSON.stringify(s).slice(1, -1),
  html: s => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;'),
  sql: s => s.replace(/'/g, "''"),
  shell: s => "'" + s.replace(/'/g, `'\\''`) + "'",
  csv: s => (/[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s),
  regex: s => s.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&')
}

const unescapeMap = {
  json: s => JSON.parse('"' + s.replace(/\r/g, '\\r').replace(/\n/g, '\\n') + '"'),
  html: s => s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : m
    }
    const v = ENTITIES[body.toLowerCase()]
    return v === undefined ? m : v
  }),
  sql: s => s.replace(/''/g, "'"),
  shell: s => s.replace(/'\\''/g, "'").replace(/^'|'$/g, ''),
  csv: s => s.replace(/^"|"$/g, '').replace(/""/g, '"'),
  regex: s => s.replace(/\\([.*+?^${}()|[\]\\/-])/g, '$1')
}

export default function EscapeTool() {
  const [type, setType] = useState('json')
  const [mode, setMode] = useState('escape')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [loose, setLoose] = useState(false)

  const run = (t, m, s) => {
    if (!s) return { output: '', error: '' }
    const fn = m === 'escape' ? escapeMap[t] : unescapeMap[t]
    try {
      return { output: fn(s), error: '' }
    } catch (e) {
      return { output: '', error: m === 'escape' ? '转义失败：' + e.message : '反转义失败，输入可能不是合法的 ' + t.toUpperCase() + ' 转义字符串' }
    }
  }

  const res = run(type, mode, input)
  const output = res.error ? '' : res.output
  // 宽松模式：逐行处理，跳过失败行
  const looseOutput = (() => {
    if (!loose || !res.error) return ''
    return input.split(/\r?\n/).map(line => {
      if (!line) return ''
      const r = run(type, mode, line)
      return r.error ? line : r.output
    }).join('\n')
  })()

  const shown = looseOutput || output

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={mode} onChange={setMode} options={[['escape', '转义'], ['unescape', '反转义']]} />
        <Segmented value={type} onChange={setType} options={TYPES} />
      </div>

      <Panel title="输入">
        <TextArea
          value={input}
          onChange={setInput}
          rows={8}
          placeholder={mode === 'escape' ? '待转义的原始文本…' : '待反转义的转义文本…'}
        />
      </Panel>

      {res.error && (
        <div className="space-y-2">
          <ErrorBar>{res.error}</ErrorBar>
          <Check checked={loose} onChange={setLoose} label="逐行宽松处理" hint="跳过无法解析的行" />
        </div>
      )}

      <Panel title="结果">
        <div className="relative">
          <TextArea value={shown} onChange={() => {}} rows={8} />
          {shown && <div className="absolute top-2 right-2"><CopyBtn text={shown} /></div>}
        </div>
        {shown && (
          <div className="mt-3 text-xs text-gray-500">
            {type === 'shell' && mode === 'escape'
              ? 'Shell 模式会为整段文本套上单引号，可直接粘贴到终端使用。'
              : type === 'csv' && mode === 'escape'
                ? 'CSV 模式仅在包含逗号、引号或换行时加引号，并转义内部引号。'
                : `输入 ${input.length} 字符 → 输出 ${shown.length} 字符`}
          </div>
        )}
      </Panel>
    </div>
  )
}
