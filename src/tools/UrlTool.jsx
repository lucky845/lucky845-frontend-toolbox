import { useState } from 'react'
import { Panel, TextArea, CopyBtn } from './Panel'

export default function UrlTool() {
  const [mode, setMode] = useState('encode')
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const run = (m, t) => {
    if (!t) { setOutput(''); setError(''); return }
    try {
      setOutput(m === 'encode' ? encodeURIComponent(t) : decodeURIComponent(t))
      setError('')
    } catch {
      setError('无效的编码内容')
      setOutput('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg overflow-hidden border border-gray-700 w-fit">
        {[['encode', '编码'], ['decode', '解码']].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); run(m, text) }}
            className={`px-4 py-2 text-sm ${mode === m ? 'bg-teal text-base font-medium' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>
            {label}
          </button>
        ))}
      </div>
      <Panel title="输入">
        <TextArea value={text} onChange={v => { setText(v); run(mode, v) }} rows={4} placeholder="https://example.com?name=前端工具箱" />
      </Panel>
      {error && <div className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg p-3">{error}</div>}
      <Panel title="结果">
        <div className="relative">
          <TextArea value={output} onChange={() => {}} readOnly rows={4} />
          {output && <div className="absolute top-2 right-2"><CopyBtn text={output} /></div>}
        </div>
      </Panel>
    </div>
  )
}
