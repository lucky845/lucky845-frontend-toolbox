import { useState, useEffect } from 'react'
import { Panel, CopyBtn } from './Panel'

const LOW = 'abcdefghijklmnopqrstuvwxyz'
const UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIG = '0123456789'
const SYM = '!@#$%^&*()_+-=[]{};:,.<>?'
const AMB = 'il1Lo0O'

export default function PasswordTool() {
  const [len, setLen] = useState(16)
  const [sets, setSets] = useState({ low: true, up: true, dig: true, sym: true })
  const [excludeAmbig, setExcludeAmbig] = useState(false)
  const [count, setCount] = useState(1)
  const [passwords, setPasswords] = useState([])
  const [error, setError] = useState('')

  const pick = (chars) => chars[Math.floor(Math.random() * chars.length)]

  const generate = () => {
    const selected = []
    if (sets.low) selected.push(LOW)
    if (sets.up) selected.push(UP)
    if (sets.dig) selected.push(DIG)
    if (sets.sym) selected.push(SYM)
    if (selected.length === 0) { setError('至少勾选一种字符类型'); return }
    setError('')
    const pool = selected.join('')
    // 排除易混淆字符后的安全池
    const safePool = excludeAmbig ? [...pool].filter(c => !AMB.includes(c)).join('') : pool
    if (!safePool) { setError('排除易混淆字符后没有可用字符'); return }
    const list = []
    for (let n = 0; n < count; n++) {
      const chars = []
      // 每种勾选的字符至少一个
      for (const s of selected) {
        const usable = excludeAmbig ? [...s].filter(c => !AMB.includes(c)).join('') : s
        chars.push(pick(usable || s))
      }
      while (chars.length < len) chars.push(pick(safePool))
      const out = chars.slice(0, len).sort(() => Math.random() - 0.5).join('')
      list.push(out)
    }
    setPasswords(list)
  }

  useEffect(() => { generate() }, [])

  const strength = len >= 16 ? '强' : len >= 10 ? '中' : '弱'
  const strengthColor = len >= 16 ? 'text-green-400' : len >= 10 ? 'text-amber-400' : 'text-red-400'

  const sel = (k, label) => (
    <label key={k} className="flex items-center gap-1.5 text-sm text-gray-300">
      <input type="checkbox" checked={sets[k]} onChange={e => setSets({ ...sets, [k]: e.target.checked })} className="accent-teal" />
      {label}
    </label>
  )

  return (
    <div className="space-y-4">
      <Panel title="密码生成器">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">长度：{len}</label>
            <input type="range" min={4} max={128} value={len} onChange={e => setLen(+e.target.value)} className="w-full accent-teal" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">生成数量</label>
            <input type="number" min={1} max={20} value={count}
              onChange={e => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">字符类型</label>
            <div className="flex flex-wrap gap-3">
              {sel('low','a-z')}{sel('up','A-Z')}{sel('dig','0-9')}{sel('sym','符号')}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">选项</label>
            <label className="flex items-center gap-1.5 text-sm text-gray-300">
              <input type="checkbox" checked={excludeAmbig} onChange={e => setExcludeAmbig(e.target.checked)} className="accent-teal" />
              排除易混淆字符
            </label>
            <div className={'text-sm mt-2 font-medium ' + strengthColor}>强度：{strength}</div>
          </div>
        </div>
        <button onClick={generate}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-teal text-base hover:bg-teal/80">
          重新生成
        </button>
      </Panel>
      {error && <div className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg p-3">{error}</div>}
      <Panel title="生成结果">
        <div className="space-y-2">
          {passwords.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <code className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-sm text-gray-100 break-all">{p}</code>
              <CopyBtn text={p} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
