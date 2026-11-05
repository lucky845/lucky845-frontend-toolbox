import { useState } from 'react'
import { Panel, TextArea, CopyBtn } from './Panel'

export default function JsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)
  const [mode, setMode] = useState('format')

  const run = (data, m, ind = indent) => {
    if (!data.trim()) { setOutput(''); setError(''); return }
    try {
      const parsed = JSON.parse(data)
      setError('')
      if (m === 'minify') setOutput(JSON.stringify(parsed))
      else setOutput(JSON.stringify(parsed, null, ind))
    } catch (e) {
      setError('JSON 解析失败: ' + e.message)
      setOutput('')
    }
  }

  return (
    <div className="space-y-4">
      <Panel title="输入 JSON">
        <TextArea value={input} onChange={v => { setInput(v); run(v, mode, indent) }} placeholder='{"name": "工具箱", "tools": 8}' />
      </Panel>
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          {[['format', '格式化'], ['minify', '压缩']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); run(input, m) }}
              className={`px-4 py-2 text-sm ${mode === m ? 'bg-teal text-base font-medium' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="text-sm text-gray-400 flex items-center gap-2">
          缩进
          <select value={indent} onChange={e => { setIndent(+e.target.value); run(input, mode, +e.target.value) }}
            className="bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm">
            {[2, 4, 8].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      {error && <div className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg p-3">{error}</div>}
      <Panel title="输出">
        <div className="relative">
          <TextArea value={output} onChange={() => {}} readOnly rows={12} />
          {output && <div className="absolute top-2 right-2"><CopyBtn text={output} /></div>}
        </div>
      </Panel>
    </div>
  )
}
