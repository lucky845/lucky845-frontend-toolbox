import { useState } from 'react'
import { Panel, TextArea } from './Panel'

// LCS 最长公共子序列求 diff，按行比较
function lineDiff(aText, bText) {
  const a = aText.split('\n')
  const b = bText.split('\n')
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const ops = []
  let i = 0, j = 0
  while (i < m && j < n) {
    if (a[i] === b[j]) { ops.push({ t: 'same', line: a[i] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ t: 'del', line: a[i] }); i++ }
    else { ops.push({ t: 'add', line: b[j] }); j++ }
  }
  while (i < m) { ops.push({ t: 'del', line: a[i] }); i++ }
  while (j < n) { ops.push({ t: 'add', line: b[j] }); j++ }
  return ops
}

const Badge = ({ t }) => {
  const map = { same: 'text-gray-500', del: 'bg-red-500 text-white', add: 'bg-green-500 text-white' }
  const label = { same: ' ', del: '-', add: '+' }
  return <span className={'inline-block w-5 text-center text-xs mr-1 select-none ' + (t === 'same' ? 'text-gray-600' : 'font-bold')}>{label[t]}</span>
}

export default function DiffTool() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const ops = lineDiff(a, b)
  const adds = ops.filter(o => o.t === 'add').length
  const dels = ops.filter(o => o.t === 'del').length

  const lineClass = {
    same: 'bg-transparent text-gray-300',
    del: 'bg-red-950/60 text-red-300',
    add: 'bg-green-950/60 text-green-300'
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title={'原始文本（' + a.split('\n').length + ' 行）'}>
          <TextArea value={a} onChange={setA} rows={10} />
        </Panel>
        <Panel title={'对比文本（' + b.split('\n').length + ' 行）'}>
          <TextArea value={b} onChange={setB} rows={10} />
        </Panel>
      </div>
      <div className={'text-sm font-medium ' + ((adds || dels) ? 'text-amber-400' : 'text-gray-500')}>
        差异：+{adds} 行新增 / -{dels} 行删除
      </div>
      <Panel title="差异对比（绿色=新增，红色=删除）">
        <div className="font-mono text-xs leading-5 overflow-x-auto">
          {ops.map((o, idx) => (
            <div key={idx} className={'flex whitespace-pre ' + lineClass[o.t]}>
              <span className="w-8 flex-none text-right pr-2 text-gray-600 select-none">{idx + 1}</span>
              <Badge t={o.t} />
              <span className="flex-1 break-words">{o.line || ' '}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
