import { useState } from 'react'
import { Panel, TextArea, CopyBtn } from './Panel'

const toTitle = s => s.replace(/\b\w/g, c => c.toUpperCase())
const toCamel = s => s.replace(/[\s_\-]+(\w)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toLowerCase())
const toSnake = s => s.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase().replace(/[\s\-]+/g, '_')
const toKebab = s => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/[\s_]+/g, '-')
const toPascal = s => toTitle(s.replace(/[\s_\-]+/g, ' ')).replace(/\s/g, '')

const MODES = [
  { k: 'lower', name: '小写', fn: s => s.toLowerCase() },
  { k: 'upper', name: '大写', fn: s => s.toUpperCase() },
  { k: 'title', name: '标题式', fn: toTitle },
  { k: 'sentence', name: '首句大写', fn: s => s.replace(/^\w/, c => c.toUpperCase()) },
  { k: 'camel', name: '驼峰', fn: toCamel },
  { k: 'pascal', name: '帕斯卡', fn: toPascal },
  { k: 'snake', name: '下划线', fn: toSnake },
  { k: 'kebab', name: '短横线', fn: toKebab },
  { k: 'invert', name: '大小写反转', fn: s => s.replace(/./g, c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()) }
]

export default function CaseTool() {
  const [text, setText] = useState('hello world')
  const [mode, setMode] = useState('upper')
  const m = MODES.find(x => x.k === mode)
  return (
    <div className="space-y-4">
      <Panel title="输入文本">
        <TextArea value={text} onChange={setText} rows={5} placeholder="输入要转换的文本" />
      </Panel>
      <Panel title="选择转换方式">
        <div className="flex flex-wrap gap-2">
          {MODES.map(x => (
            <button key={x.k} onClick={() => setMode(x.k)}
              className={mode === x.k ? 'px-3 py-1.5 rounded-lg text-sm transition border bg-teal/20 text-teal border-teal/40' : 'px-3 py-1.5 rounded-lg text-sm transition border bg-gray-800/50 text-gray-400 border-gray-800 hover:text-gray-200'}>
              {x.name}
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="结果">
        <div className="flex items-start gap-2">
          <div className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-sm text-gray-100 whitespace-pre-wrap break-all min-h-24">{m ? m.fn(text) : ''}</div>
          <CopyBtn text={m ? m.fn(text) : ''} />
        </div>
      </Panel>
    </div>
  )
}
