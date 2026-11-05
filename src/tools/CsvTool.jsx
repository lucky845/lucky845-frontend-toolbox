import { useState } from 'react'
import { Panel, TextArea, CopyBtn } from './Panel'

function escapeCsv(v) {
  const s = String(v ?? '')
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}
function jsonToCsv(json) {
  const arr = typeof json === 'string' ? JSON.parse(json) : json
  if (!Array.isArray(arr)) throw new Error('需要 JSON 数组')
  const cols = []
  for (const row of arr) if (row && typeof row === 'object') for (const k of Object.keys(row)) if (!cols.includes(k)) cols.push(k)
  const lines = [cols.map(escapeCsv).join(',')]
  for (const row of arr) lines.push(cols.map(c => escapeCsv(row ? row[c] : '')).join(','))
  return lines.join('\n')
}
function csvToJson(csv) {
  const lines = csv.split(/\r?\n/).filter(l => l.trim() !== '')
  if (lines.length < 2) throw new Error('至少需要表头和一行数据')
  const parse = line => {
    const out = []; let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQ) {
        if (ch === '"') { if (line[i+1] === '"') { cur += '"'; i++ } else inQ = false }
        else cur += ch
      } else {
        if (ch === '"') inQ = true
        else if (ch === ',') { out.push(cur); cur = '' }
        else cur += ch
      }
    }
    out.push(cur)
    return out
  }
  const headers = parse(lines[0])
  return lines.slice(1).map(l => {
    const row = {}; parse(l).forEach((v, i) => row[headers[i]] = v)
    return row
  })
}

export default function CsvTool() {
  const [mode, setMode] = useState('csv2json')
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')

  const run = () => {
    try {
      if (!input.trim()) { setOut(''); setErr(''); return }
      if (mode === 'csv2json') setOut(JSON.stringify(csvToJson(input), null, 2))
      else setOut(jsonToCsv(input))
      setErr('')
    } catch (e) { setOut(''); setErr(e.message) }
  }

  return (
    <div className="space-y-4">
      <Panel title={mode === 'csv2json' ? '输入 CSV' : '输入 JSON'}>
        <TextArea value={input} onChange={setInput} rows={9}
          placeholder={mode === 'csv2json' ? 'name,age\n张三,25\n李四,30' : '[{"name":"张三","age":25}]'} />
      </Panel>
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-800 overflow-hidden">
          <button onClick={() => setMode('csv2json')} className={mode === 'csv2json' ? 'px-4 py-1.5 text-sm bg-teal/20 text-teal' : 'px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200'}>CSV → JSON</button>
          <button onClick={() => setMode('json2csv')} className={mode === 'json2csv' ? 'px-4 py-1.5 text-sm bg-teal/20 text-teal' : 'px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200'}>JSON → CSV</button>
        </div>
        <button onClick={run} className="px-4 py-1.5 rounded-lg text-sm font-medium bg-teal text-gray-950 hover:bg-teal/90 transition">转换</button>
      </div>
      {err && <p className="text-amber text-xs">{err}</p>}
      <Panel title="结果">
        <div className="flex items-start gap-2">
          <TextArea value={out} onChange={setOut} rows={12} className="flex-1" />
          <CopyBtn text={out} />
        </div>
      </Panel>
    </div>
  )
}
