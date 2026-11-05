import { useState } from 'react'
import { Panel, TextArea } from './Panel'

export default function CountTool() {
  const [text, setText] = useState('')

  const stats = {
    char: text.length,
    charNoSpace: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split(/\r?\n/).length : 0,
    chinese: (text.match(/[\u4e00-\u9fff]/g) || []).length,
    punctuation: (text.match(/[，。！？；：""''（）《》——、,.!?;:'"()]/g) || []).length,
    bytes: new TextEncoder().encode(text).length
  }

  const items = [
    ['字符数', stats.char], ['不含空格', stats.charNoSpace], ['单词数', stats.words],
    ['行数', stats.lines], ['汉字数', stats.chinese], ['标点数', stats.punctuation],
    ['字节数', stats.bytes]
  ]

  return (
    <div className="space-y-4">
      <Panel title="输入文本">
        <TextArea value={text} onChange={setText} rows={10} placeholder="输入或粘贴文本，实时统计" />
      </Panel>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {items.map(([name, val]) => (
          <div key={name} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-teal">{val.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
