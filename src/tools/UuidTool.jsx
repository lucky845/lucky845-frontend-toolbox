import { useState } from 'react'
import { Panel, CopyBtn } from './Panel'

function genV7() {
  // UUID v7: 48 位毫秒时间戳 + version(7) + variant + 随机
  const ts = BigInt(Date.now()).toString(16).padStart(12, '0')
  const rnd = Array.from(crypto.getRandomValues(new Uint8Array(10)), b => b.toString(16).padStart(2, '0')).join('')
  // 位 12-15 放 version=7, 位 16-17 放 variant=10
  const s = ts + '7' + rnd.slice(0, 3) + '8' + rnd.slice(3, 7) + rnd.slice(7)
  return s.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5')
}

export default function UuidTool() {
  const [count, setCount] = useState(1)
  const [uppercase, setUppercase] = useState(false)
  const [version, setVersion] = useState('v4')
  const [list, setList] = useState(() => [crypto.randomUUID()])

  const gen = () => {
    const arr = []
    for (let i = 0; i < count; i++) arr.push(version === 'v4' ? crypto.randomUUID() : genV7())
    setList(arr.map(u => uppercase ? u.toUpperCase() : u))
  }

  return (
    <div className="space-y-4">
      <Panel title="参数">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2 text-gray-300">
            数量
            <input type="number" min="1" max="100" value={count}
              onChange={e => setCount(Math.max(1, Math.min(100, +e.target.value || 1)))}
              className="w-20 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-100 focus:outline-none focus:border-teal/60" />
          </label>
          <label className="flex items-center gap-2 text-gray-300">
            版本
            <select value={version} onChange={e => setVersion(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-100 focus:outline-none focus:border-teal/60">
              <option value="v4">v4（随机）</option>
              <option value="v7">v7（时间戳）</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} className="accent-teal" />
            大写
          </label>
          <button onClick={gen} className="px-4 py-1.5 rounded-lg text-sm font-medium bg-teal text-gray-950 hover:bg-teal/90 transition">生成</button>
        </div>
      </Panel>
      <Panel title="结果">
        <div className="space-y-1.5">
          {list.map((u, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-sm text-gray-200">
              <span className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 break-all">{u}</span>
              <CopyBtn text={u} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
