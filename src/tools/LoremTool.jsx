import { useState } from 'react'
import { Panel, CopyBtn } from './Panel'

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ')

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
function sentence() {
  const n = 5 + Math.floor(Math.random() * 9)
  let s = []
  for (let i = 0; i < n; i++) s.push(WORDS[Math.floor(Math.random() * WORDS.length)])
  return cap(s.join(' ')) + '.'
}
function para() {
  const n = 3 + Math.floor(Math.random() * 4)
  const s = []
  for (let i = 0; i < n; i++) s.push(sentence())
  return s.join(' ')
}

export default function LoremTool() {
  const [paras, setParas] = useState(3)
  const [text, setText] = useState(() => Array.from({length: 3}, para).join('\n\n'))

  const gen = () => setText(Array.from({length: paras}, para).join('\n\n'))

  return (
    <div className="space-y-4">
      <Panel title="参数">
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 text-gray-300">
            段落数
            <input type="number" min="1" max="20" value={paras} onChange={e => setParas(Math.max(1, Math.min(20, +e.target.value)))}
              className="w-20 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-100 focus:outline-none focus:border-teal/60" />
          </label>
          <button onClick={gen} className="px-4 py-1.5 rounded-lg text-sm font-medium bg-teal text-gray-950 hover:bg-teal/90 transition">生成</button>
        </div>
      </Panel>
      <Panel title="结果">
        <div className="flex items-start gap-2">
          <div className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-4 text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">{text}</div>
          <CopyBtn text={text} />
        </div>
      </Panel>
    </div>
  )
}
