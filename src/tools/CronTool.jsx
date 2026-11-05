import { useState } from 'react'
import { Panel } from './Panel'

// 简易 cron 解析：分 时 日 月 周
function describeField(f, unit) {
  if (f === '*' || f === '?') return '每' + unit
  if (f.startsWith('*/')) return '每 ' + f.slice(2) + ' ' + unit
  if (f.includes('/')) {
    const [from, step] = f.split('/')
    return '每 ' + step + ' ' + unit + (from === '*' ? '' : '（从 ' + from + ' 开始）')
  }
  if (f.includes('-')) return unit + ' ' + f.split('-').join(' 到 ')
  if (f.includes(',')) return unit + ' ' + f.split(',').join('、')
  return unit + ' ' + f
}

function describeCron(expr) {
  const p = expr.trim().split(/\s+/)
  if (p.length !== 5) return '需要 5 个字段：分 时 日 月 周'
  const names = ['分钟', '小时', '日', '月', '星期']
  return p.map((f, i) => describeField(f, names[i])).join('，')
}

export default function CronTool() {
  const [expr, setExpr] = useState('*/5 * * * *')
  const desc = describeCron(expr)

  return (
    <div className="space-y-4">
      <Panel title="Cron 表达式">
        <input value={expr} onChange={e => setExpr(e.target.value)} spellCheck={false}
          placeholder="分 时 日 月 周"
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 font-mono text-sm text-gray-100 focus:outline-none focus:border-teal/60" />
        <div className="mt-2 text-xs text-gray-600">
          字段顺序：分 时 日 月 周（如 <code className="text-teal">*/5 * * * *</code> = 每 5 分钟）
        </div>
      </Panel>
      <Panel title="解析结果">
        <p className="text-sm text-gray-200 leading-relaxed">{desc}</p>
      </Panel>
    </div>
  )
}
