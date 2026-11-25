import { useMemo, useState } from 'react'
import { Panel, CopyBtn, Select, ErrorBar } from './Panel'

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

// 大整数用 BigInt 精确转换（支持任意进制 2-36）
function convert(src, srcBase, dstBase) {
  if (!src.trim()) return ''
  const str = src.trim().replace(/^0[xX]/, '')
  let big = 0n
  for (const ch of str.toLowerCase()) {
    const d = DIGITS.indexOf(ch)
    if (d < 0 || d >= srcBase) throw new Error('无效字符 ' + ch + ' 用于 ' + srcBase + ' 进制')
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
  { v: 16, name: '十六进制' }, { v: 32, name: '32 进制' }, { v: 36, name: '三十六进制' }
]

const EXAMPLES = [
  [10, '255'], [16, 'ff'], [2, '11111111'], [16, 'deadbeef'], [10, '9007199254740993']
]

export default function BinaryTool() {
  const [srcBase, setSrcBase] = useState('10')
  const [src, setSrc] = useState('255')

  const srcB = BASES.find(b => b.v === Number(srcBase))

  const { results, error, big } = useMemo(() => {
    if (!src.trim()) return { results: [], error: '', big: null }
    try {
      const big = convert(src, Number(srcBase), 10)
      return {
        big,
        error: '',
        results: BASES.filter(b => b.v !== Number(srcBase)).map(b => [b, convert(src, Number(srcBase), b.v)])
      }
    } catch (e) {
      return { results: [], error: e.message, big: null }
    }
  }, [src, srcBase])

  // 位视图：只对不超过 64 位的数展示，避免大数撑爆界面
  const bits = useMemo(() => {
    if (!src.trim() || error) return []
    try {
      const bin = convert(src, Number(srcBase), 2)
      if (bin.length > 64) return []
      const len = Math.max(8, Math.ceil(bin.length / 8) * 8)
      return bin.padStart(len, '0').split('')
    } catch {
      return []
    }
  }, [src, srcBase, error])

  const bitOps = useMemo(() => {
    if (!bits.length || bits.length > 32) return []
    const v = parseInt(bits.join(''), 2) >>> 0
    return [
      ['原值', v],
      ['<< 1', (v << 1) >>> 0],
      ['>> 1（有符号）', v >> 1],
      ['>>> 1（无符号）', v >>> 1],
      ['~ 按位取反', ~v >>> 0],
      ['& 0xFF', v & 0xff],
      ['| 0x0F', v | 0x0f],
      ['^ 0xFF', v ^ 0xff]
    ]
  }, [bits])

  return (
    <div className="space-y-4">
      <Panel title="输入数值">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={srcBase} onChange={setSrcBase} options={BASES.map(b => [String(b.v), b.name])} />
          <input
            value={src}
            onChange={e => setSrc(e.target.value)}
            spellCheck={false}
            placeholder={'输入 ' + (srcB ? srcB.name : '') + ' 数值'}
            className="flex-1 min-w-52 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 font-mono text-sm text-gray-100 focus:outline-none focus:border-teal/60"
          />
          {src && <CopyBtn text={src} />}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {EXAMPLES.map(([b, v]) => (
            <button
              key={v}
              onClick={() => { setSrcBase(String(b)); setSrc(v) }}
              className="text-xs px-2 py-1 rounded-md bg-gray-900 border border-gray-800 text-gray-400 hover:text-teal hover:border-teal/40 font-mono"
            >
              {v} · {BASES.find(x => x.v === b).name}
            </button>
          ))}
        </div>
      </Panel>

      {error && <ErrorBar>{error}</ErrorBar>}

      {results.length > 0 && (
        <Panel title="转换结果">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map(([{ v, name }, out]) => (
              <div key={v} className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{name}（{v} 进制）</span>
                  <CopyBtn text={out} />
                </div>
                <div className="font-mono text-sm text-teal break-all">{out}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {bits.length > 0 && (
        <Panel title={'位视图（' + bits.length + ' 位）'}>
          <div className="flex flex-wrap gap-1 font-mono">
            {bits.map((b, i) => (
              <span
                key={i}
                className={
                  'w-7 h-8 flex items-center justify-center text-sm rounded ' +
                  (b === '1' ? 'bg-teal/20 text-teal border border-teal/30' : 'bg-gray-950 text-gray-600 border border-gray-800')
                }
                title={'bit ' + (bits.length - 1 - i)}
              >
                {b}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">左高位、右低位，每 8 位为一个字节</div>
        </Panel>
      )}

      {bitOps.length > 0 && (
        <Panel title="位运算（32 位无符号）">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bitOps.map(([label, v]) => (
              <div key={label} className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500 flex-1">{label}</span>
                <code className="text-sm font-mono text-teal">{v}</code>
                <code className="text-xs font-mono text-gray-500">0x{v.toString(16).toUpperCase()}</code>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <p className="text-xs text-gray-600">
        支持 2-36 任意进制转换，用 BigInt 精确计算，不受 JavaScript 数值精度限制。
        {big !== null && big.length > 15 && ' 当前数值已超过 2^53，尾数不会丢失。'}
      </p>
    </div>
  )
}
