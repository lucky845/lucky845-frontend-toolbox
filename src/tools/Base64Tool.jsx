import { useState } from 'react'
import { Panel, TextArea, CopyBtn } from './Panel'

export default function Base64Tool() {
  const [mode, setMode] = useState('encode')
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const run = (m, t) => {
    if (!t) { setOutput(''); setError(''); return }
    try {
      if (m === 'encode') {
        const bytes = new TextEncoder().encode(t)
        let bin = ''
        for (const b of bytes) bin += String.fromCharCode(b)
        setOutput(btoa(bin))
      } else {
        const bin = atob(t.trim())
        const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
        setOutput(new TextDecoder().decode(bytes))
      }
      setError('')
    } catch (e) {
      setError(m === 'decode' ? '无效的 Base64 字符串' : '编码失败: ' + e.message)
      setOutput('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg overflow-hidden border border-gray-700 w-fit">
        {[['encode', '文本 → Base64'], ['decode', 'Base64 → 文本']].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); run(m, text) }}
            className={`px-4 py-2 text-sm ${mode === m ? 'bg-teal text-base font-medium' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>
            {label}
          </button>
        ))}
      </div>
      <Panel title={mode === 'encode' ? '输入文本' : '输入 Base64'}>
        <TextArea value={text} onChange={v => { setText(v); run(mode, v) }} rows={6} />
      </Panel>
      {error && <div className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg p-3">{error}</div>}
      <Panel title={mode === 'encode' ? 'Base64 结果' : '解码文本'}>
        <div className="relative">
          <TextArea value={output} onChange={() => {}} readOnly rows={6} />
          {output && <div className="absolute top-2 right-2"><CopyBtn text={output} /></div>}
        </div>
      </Panel>
    </div>
  )
}
