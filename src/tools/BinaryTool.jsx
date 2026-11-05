import { useState } from 'react'
import { Panel } from './Panel'

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

// 大整数用 BigInt 精确转换（支持任意进制 2-36）
function convert(src, srcBase, dstBase) {
  if (!src.trim()) return ''
  const str = src.trim()
  let big = 0n
  for (const ch of str.toLowerCase()) {
    const d = DIGITS.indexOf(ch)
    if (d < 0 || d >= srcBase) throw new Error("无效字符 " + ch + " 用于 " + srcBase + " 进制")
    big = big * BigInt(srcBase) + BigInt(d)
  }
  if (big === 0n) return '0'
  let out = ''
  const db = BigInt(dstBase)
  while (big > 0n) {
    out = DIGITS[Number(big % db)] + out
    big = big / db
  }
  return out
}

const BASES = [
  { v: 2, name: '二进制' }, { v: 8, name: '八进制' }, { v: 10, name: '十进制' },
  { v: 16, name: '十六进制' }, { v: 36, name: '三十六进制' }
]

export default function BinaryTool() {
  const [srcBase, setSrcBase] = useState(10)
  const [src, setSrc] = useState('255')
  const [err, setErr] = useState('')

  const srcB = BASES.find(b => b.v === srcBase)

  return (
    <div className="space-y-4">
      <Panel title="输入数值">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select value={srcBase} onChange={e => setSrcBase(+e.target.value)} className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-teal/60">
              {BASES.map(b => <option key={b.v} value={b.v}>{b.name}</option>)}
            </select>
            <input
              value={src}
              onChange={e => { setSrc(e.target.value); setErr('') }}
              spellCheck={false}
              placeholder={"输入 " + srcB.name + " 数值"}
              className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 font-mono text-sm text-gray-100 focus:outline-none focus:border-teal/60"
            />
          </div>
          {err && <p className="text-amber text-xs">{err}</p>}
        </div>
      </Panel>

      <Panel title="转换结果">
        <div className="grid grid-cols-2 gap-3">
          {BASES.filter(b => b.v !== srcBase).map(b => {
            let out = '', ok = true
            try { out = convert(src, srcBase, b.v) } catch (e) { ok = false; setErr(e.message) }
            return (
              <div key={b.v} className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{b.name}（{b.v}进制）</div>
                <div className="font-mono text-sm text-gray-100 break-all">{ok ? out : '—'}</div>
              </div>
            )
          })}
        </div>
      </Panel>
      <p className="text-xs text-gray-600">支持 2-36 任意进制转换，用 BigInt 精确计算，无精度丢失。</p>
    </div>
  )
}
