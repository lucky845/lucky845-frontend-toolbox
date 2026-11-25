import { useMemo, useState } from 'react'
import { Panel, Field, NumInput, Stat, Segmented, Select } from './Panel'

const pad = n => String(n).padStart(2, '0')
const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const today = () => toISO(new Date())
const DAY = 86400000

const parseDate = s => {
  if (!s) return null
  const d = new Date(s + 'T00:00:00')
  return Number.isNaN(d.getTime()) ? null : d
}

const WEEK_LABEL = ['日', '一', '二', '三', '四', '五', '六']

// 统计两个日期之间的工作日（排除周末，可选排除指定星期）
const countWorkdays = (a, b, weekend) => {
  const start = a <= b ? a : b
  const end = a <= b ? b : a
  let n = 0
  const cur = new Date(start)
  while (cur <= end) {
    if (!weekend.includes(cur.getDay())) n++
    cur.setDate(cur.getDate() + 1)
  }
  return a <= b ? n : -n
}

// 第 n 周 ISO 周数
const isoWeek = d => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t - yearStart) / DAY + 1) / 7)
}

export default function DateCalcTool() {
  const [mode, setMode] = useState('diff')
  const [a, setA] = useState(today())
  const [b, setB] = useState(today())
  const [base, setBase] = useState(today())
  const [amount, setAmount] = useState('30')
  const [unit, setUnit] = useState('day')
  const [dir, setDir] = useState('1')
  const [weekend, setWeekend] = useState([0, 6])

  const da = parseDate(a)
  const db = parseDate(b)
  const dbase = parseDate(base)

  const diff = useMemo(() => {
    if (!da || !db) return null
    const ms = db - da
    const days = Math.round(ms / DAY)
    // 按日历月计算
    let months = (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth())
    if (db.getDate() < da.getDate()) months--
    const years = Math.floor(Math.abs(months) / 12) * Math.sign(months || 1)
    return {
      days,
      weeks: days / 7,
      months,
      years: Number.isNaN(years) ? 0 : years,
      workdays: countWorkdays(da, db, weekend),
      ms: Math.abs(ms),
      hours: Math.abs(ms) / 3600000,
      minutes: Math.abs(ms) / 60000,
      seconds: Math.abs(ms) / 1000
    }
  }, [da, db, weekend])

  const shifted = useMemo(() => {
    if (!dbase) return null
    const n = Number(amount) || 0
    const d = new Date(dbase)
    if (unit === 'day') d.setDate(d.getDate() + n * Number(dir))
    else if (unit === 'week') d.setDate(d.getDate() + n * 7 * Number(dir))
    else if (unit === 'month') d.setMonth(d.getMonth() + n * Number(dir))
    else if (unit === 'year') d.setFullYear(d.getFullYear() + n * Number(dir))
    else if (unit === 'workday') {
      let left = Math.abs(n)
      const step = Number(dir) >= 0 ? 1 : -1
      while (left > 0) {
        d.setDate(d.getDate() + step)
        if (!weekend.includes(d.getDay())) left--
      }
    }
    return d
  }, [dbase, amount, unit, dir, weekend])

  const info = d => d && ({
    iso: toISO(d),
    week: `星期${WEEK_LABEL[d.getDay()]}`,
    weekNum: isoWeek(d),
    dayOfYear: Math.floor((d - new Date(d.getFullYear(), 0, 0)) / DAY),
    quarter: Math.floor(d.getMonth() / 3) + 1,
    unix: Math.floor(d.getTime() / 1000),
    isLeap: (d.getFullYear() % 4 === 0 && d.getFullYear() % 100 !== 0) || d.getFullYear() % 400 === 0
  })

  return (
    <div className="space-y-4">
      <Panel title="日期计算">
        <Segmented value={mode} onChange={setMode} options={[['diff', '日期间隔'], ['add', '日期加减']]} />
      </Panel>

      {mode === 'diff' && (
        <>
          <Panel title="选择两个日期">
            <div className="flex flex-wrap items-end gap-4">
              <Field label="开始">
                <input type="date" value={a} onChange={e => setA(e.target.value)}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-teal/60" />
              </Field>
              <Field label="结束">
                <input type="date" value={b} onChange={e => setB(e.target.value)}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-teal/60" />
              </Field>
              <button onClick={() => { setA(today()); setB(today()) }}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-teal hover:border-teal/40">
                重置为今天
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-400">
              <span>周末定义</span>
              {WEEK_LABEL.map((l, i) => (
                <label key={i} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weekend.includes(i)}
                    onChange={e => setWeekend(e.target.checked ? [...weekend, i].sort() : weekend.filter(x => x !== i))}
                    className="w-3.5 h-3.5 accent-teal"
                  />
                  <span>{l}</span>
                </label>
              ))}
            </div>
          </Panel>

          {diff && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Stat label="相差天数" value={diff.days} />
                <Stat label="工作日" value={diff.workdays} />
                <Stat label="整月数" value={diff.months} />
                <Stat label="整年数" value={diff.years} />
                <Stat label="周" value={diff.weeks.toFixed(2)} />
                <Stat label="小时" value={diff.hours.toFixed(1)} />
                <Stat label="分钟" value={Math.round(diff.minutes)} />
                <Stat label="秒" value={Math.round(diff.seconds)} />
              </div>
              <Panel title="日期详情">
                <div className="grid md:grid-cols-2 gap-3">
                  {[[a, info(da)], [b, info(db)]].map(([label, it]) => it && (
                    <div key={label} className="bg-gray-950 border border-gray-800 rounded-lg p-3 space-y-1 text-sm">
                      <div className="text-teal font-mono">{it.iso}</div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-400">
                        <span>{it.week}</span>
                        <span>第 {it.weekNum} 周</span>
                        <span>第 {it.quarter} 季度</span>
                        <span>第 {it.dayOfYear} 天</span>
                        <span>Unix {it.unix}</span>
                        <span>{it.isLeap ? '闰年' : '平年'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          )}
        </>
      )}

      {mode === 'add' && (
        <>
          <Panel title="基准日期与偏移">
            <div className="flex flex-wrap items-end gap-4">
              <Field label="基准">
                <input type="date" value={base} onChange={e => setBase(e.target.value)}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-teal/60" />
              </Field>
              <Field label="方向">
                <Select value={dir} onChange={setDir} options={[['1', '之后 +'], ['-1', '之前 −']]} />
              </Field>
              <Field label="数量">
                <NumInput value={amount} onChange={setAmount} min={0} />
              </Field>
              <Field label="单位">
                <Select value={unit} onChange={setUnit} options={[['day', '天'], ['workday', '工作日'], ['week', '周'], ['month', '月'], ['year', '年']]} />
              </Field>
            </div>
          </Panel>

          {shifted && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Stat label="结果日期" value={toISO(shifted)} />
                <Stat label="星期" value={'星期' + WEEK_LABEL[shifted.getDay()]} />
                <Stat label="Unix" value={Math.floor(shifted.getTime() / 1000)} />
              </div>
              <Panel title="结果">
                <div className="space-y-1.5 font-mono text-sm">
                  {[
                    ['YYYY-MM-DD', toISO(shifted)],
                    ['YYYY/MM/DD', `${shifted.getFullYear()}/${pad(shifted.getMonth() + 1)}/${pad(shifted.getDate())}`],
                    ['中文', `${shifted.getFullYear()}年${shifted.getMonth() + 1}月${shifted.getDate()}日`],
                    ['ISO 8601', shifted.toISOString()],
                    ['本地时间', shifted.toString()],
                    ['UTC', shifted.toUTCString()]
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3 bg-gray-950 border border-gray-800 rounded px-3 py-1.5">
                      <span className="text-xs text-gray-500 w-24 flex-none pt-0.5">{k}</span>
                      <span className="text-teal break-all">{v}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          )}
        </>
      )}
    </div>
  )
}
