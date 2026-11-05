import { useState } from 'react'
import { Panel, TextArea, CopyBtn } from './Panel'

// JSON → YAML
function jsonToYaml(json) {
  const arr = typeof json === 'string' ? JSON.parse(json) : json
  const lines = []
  const walk = (obj, indent) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined) lines.push(indent + k + ': null')
      else if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length) {
        lines.push(indent + k + ':')
        walk(v, indent + '  ')
      } else if (Array.isArray(v)) {
        if (v.length === 0) { lines.push(indent + k + ': []'); continue }
        v.forEach(item => {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            lines.push(indent + k + ':')
            walk(item, indent + '  ')
          } else {
            lines.push(indent + '- ' + JSON.stringify(item))
          }
        })
      } else {
        lines.push(indent + k + ': ' + JSON.stringify(v))
      }
    }
  }
  walk(arr, '')
  return lines.join('\n')
}

// YAML → JSON（简化：仅标量/对象/数组）
function yamlToJson(yaml) {
  const lines = yaml.split(/\r?\n/).filter(l => l.trim() !== '' && !l.trim().startsWith('#'))
  const root = {}
  const stack = [{ indent: -1, obj: root, isArr: false }]
  const indentOf = l => l.match(/^ */)[0].length
  lines.forEach(line => {
    const indent = indentOf(line)
    const content = line.trim()
    while (stack.length > 1 && stack[stack.length-1].indent >= indent) stack.pop()
    const parent = stack[stack.length-1]
    if (content.startsWith('- ')) {
      const val = parseScalar(content.slice(2))
      if (parent.isArr) parent.obj.push(val)
    } else {
      const idx = content.indexOf(':')
      const key = content.slice(0, idx).trim()
      const rest = content.slice(idx+1).trim()
      let container
      if (parent.isArr) { container = {}; parent.obj.push(container) }
      else container = parent.obj
      if (rest === '') {
        const child = {}
        container[key] = child
        stack.push({ indent, obj: child, isArr: false })
      } else {
        container[key] = parseScalar(rest)
      }
    }
  })
  return root
}
function parseScalar(s) {
  if (s === 'null') return null
  if (s === 'true') return true
  if (s === 'false') return false
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1,-1)
  const n = Number(s)
  if (!isNaN(n) && s !== '') return n
  return s
}

export default function YamlTool() {
  const [mode, setMode] = useState('json2yaml')
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')

  const run = () => {
    try {
      if (!input.trim()) { setOut(''); setErr(''); return }
      if (mode === 'json2yaml') setOut(jsonToYaml(input))
      else setOut(JSON.stringify(yamlToJson(input), null, 2))
      setErr('')
    } catch (e) { setOut(''); setErr(e.message) }
  }

  return (
    <div className="space-y-4">
      <Panel title={mode === 'json2yaml' ? '输入 JSON' : '输入 YAML'}>
        <TextArea value={input} onChange={setInput} rows={10}
          placeholder={mode === 'json2yaml' ? '{"name":"张三","age":25,"tags":["a","b"]}' : 'name: 张三\nage: 25\ntags:\n  - a\n  - b'} />
      </Panel>
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-800 overflow-hidden">
          <button onClick={() => setMode('json2yaml')} className={mode === 'json2yaml' ? 'px-4 py-1.5 text-sm bg-teal/20 text-teal' : 'px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200'}>JSON → YAML</button>
          <button onClick={() => setMode('yaml2json')} className={mode === 'yaml2json' ? 'px-4 py-1.5 text-sm bg-teal/20 text-teal' : 'px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200'}>YAML → JSON</button>
        </div>
        <button onClick={run} className="px-4 py-1.5 rounded-lg text-sm font-medium bg-teal text-gray-950 hover:bg-teal/90 transition">转换</button>
      </div>
      {err && <p className="text-amber text-xs">{err}</p>}
      <Panel title="结果">
        <div className="flex items-start gap-2">
          <TextArea value={out} onChange={setOut} rows={14} className="flex-1" />
          <CopyBtn text={out} />
        </div>
      </Panel>
      <p className="text-xs text-gray-600">简化版 YAML 转换，支持标量 / 嵌套对象 / 数组（含对象数组）。</p>
    </div>
  )
}
