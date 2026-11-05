import { useState } from 'react'
import { Panel, TextArea, CopyBtn } from './Panel'

function formatXml(xml) {
  // 去掉多余空白但保留结构所需
  xml = xml.replace(/>\s*</g, '><')
  let formatted = '', indent = ''
  const parts = xml.split(/(?<=>)(?=<)/)
  for (let i = 0; i < parts.length; i++) {
    const node = parts[i]
    if (node.match(/^<\/?[^!?]/)) {
      if (node.match(/^<\//)) {
        indent = indent.slice(2)
        formatted += indent + node + '\n'
      } else if (node.match(/^<[^!?][^>]*\/>/)) {
        formatted += indent + node + '\n'
      } else {
        formatted += indent + node + '\n'
        indent += '  '
      }
    } else {
      formatted += indent + node + '\n'
    }
  }
  return formatted.trim()
}

export default function XmlTool() {
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')
  const [mode, setMode] = useState('format')

  const run = () => {
    try {
      if (!input.trim()) { setOut(''); setErr(''); return }
      const doc = new DOMParser().parseFromString(input, 'text/xml')
      if (doc.querySelector('parsererror')) throw new Error('XML 语法错误')
      if (mode === 'format') setOut(formatXml(input))
      else setOut(input.replace(/>\s*</g, '><').trim())
      setErr('')
    } catch (e) {
      setOut(''); setErr(e.message)
    }
  }

  return (
    <div className="space-y-4">
      <Panel title="输入 XML">
        <TextArea value={input} onChange={setInput} rows={9} placeholder={'<root>\n  <item>hello</item>\n</root>'} />
      </Panel>
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-800 overflow-hidden">
          {['format', 'compress'].map(k => (
            <button key={k} onClick={() => setMode(k)}
              className={mode === k ? 'px-4 py-1.5 text-sm bg-teal/20 text-teal' : 'px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200'}>
              {k === 'format' ? '格式化' : '压缩'}
            </button>
          ))}
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
