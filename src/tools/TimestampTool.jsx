import { useState } from 'react'
import { Panel, CopyBtn } from './Panel'

const pad = n => String(n).padStart(2, '0')
const fmt = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())

export default function TimestampTool() {
  const [ts, setTs] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [result, setResult] = useState('')
  const [now, setNow] = useState(Date.now())

  const tsToDate = t => {
    const n = Number(t)
    if (!t.trim() || isNaN(n)) { setResult(''); return }
    const ms = String(n).length >= 13 ? n : n * 1000
    setResult(fmt(new Date(ms)))
  }
  const dateToTs = s => {
    if (!s.trim()) { setResult(''); return }
    const d = new Date(s)
    if (isNaN(d.getTime())) { setResult('无效日期格式 (支持 ISO: 2024-01-01T12:00:00)'); return }
    setResult('秒: ' + Math.floor(d.getTime() / 1000) + '\n毫秒: ' + d.getTime())
  }

  return (
    <div className="space-y-4">
      <Panel title="当前时间">
        <div className="flex items-center gap-4">
          <span className="font-mono text-lg text-teal">{fmt(new Date(now))}</span>
          <button onClick={() => setNow(Date.now())} className="px-3 py-1.5 rounded-lg text-xs bg-teal/20 text-teal hover:bg-teal/30">刷新</button>
        </div>
      </Panel>
      <Panel title="时间戳 → 日期">
        <div className="flex gap-3">
          <input value={ts} onChange={e => { setTs(e.target.value); tsToDate(e.target.value) }}
            placeholder="1730000000 或 1730000000000" spellCheck={false}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-teal/60" />
          {result && <button onClick={() => navigator.clipboard.writeText(result.split('\\n')[0])} className="px-3 py-2 rounded-lg text-xs bg-teal/20 text-teal hover:bg-teal/30 shrink-0">复制</button>}
        </div>
        {result && !result.startsWith('无效') && <pre className="mt-3 font-mono text-teal bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm">{result}</pre>}
      </Panel>
      <Panel title="日期 → 时间戳">
        <div className="flex gap-3">
          <input value={dateStr} onChange={e => { setDateStr(e.target.value); dateToTs(e.target.value) }}
            placeholder="2024-01-01T12:00:00" spellCheck={false}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-teal/60" />
        </div>
        {result && result.startsWith('无效') && <p className="mt-3 text-red-400 text-sm">{result}</p>}
        {result && !result.startsWith('无效') && <pre className="mt-3 font-mono text-teal bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm whitespace-pre-wrap">{result}</pre>}
      </Panel>
    </div>
  )
}
