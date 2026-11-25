import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Segmented, NumInput, Field, Check } from './Panel'

// 假数据生成器：全部在浏览器内随机生成，不请求任何接口
const SURNAMES = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章'.split('')
const GIVEN = '伟芳娜秀英敏静丽强磊军洋勇艳杰娟涛明超秀霞平刚桂英华建国志强文博子涵浩然雨萱梓豪'.split('')
const EN_FIRST = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Emily', 'Daniel', 'Olivia', 'Sophia', 'Liam', 'Noah']
const EN_LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor']
const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆', '苏州', '天津', '长沙', '青岛', '厦门', '宁波']
const PROVINCES = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '陕西省', '重庆市', '山东省', '福建省']
const STREETS = ['中山路', '人民大道', '建设路', '解放路', '长江路', '黄河街', '科技园路', '文化路', '和平街', '振兴大道']
const DEPTS = ['研发部', '产品部', '设计部', '市场部', '运营部', '人事部', '财务部', '客服部']
const TITLES = ['工程师', '高级工程师', '技术专家', '产品经理', '设计师', '运营专员', '市场主管', '财务分析师']
const DOMAINS = ['example.com', 'test.cn', 'demo.io', 'mail.com', 'corp.net']
const TAGS = ['前端', '后端', '设计', '运维', '数据', '算法', '测试', '产品']
const WORDS = '项目团队数据设计系统接口服务性能优化体验方案版本迭代需求文档测试部署监控日志缓存队列并发安全权限配置流程规范质量效率'.split('')

const rnd = n => Math.floor(Math.random() * n)
const pick = arr => arr[rnd(arr.length)]
const cjk = () => pick(SURNAMES) + pick(GIVEN) + (Math.random() > 0.6 ? pick(GIVEN) : '')
const enName = () => pick(EN_FIRST) + ' ' + pick(EN_LAST)
const pad = n => String(n).padStart(2, '0')

const randomDate = (startYear = 2020) => {
  const y = startYear + rnd(new Date().getFullYear() - startYear + 1)
  const m = 1 + rnd(12)
  const d = 1 + rnd(28)
  return `${y}-${pad(m)}-${pad(d)}`
}
const randomDateTime = () => `${randomDate()} ${pad(rnd(24))}:${pad(rnd(60))}:${pad(rnd(60))}`

const FIELDS = {
  name: { label: '姓名', gen: () => cjk() },
  enName: { label: '英文名', gen: () => enName() },
  email: { label: '邮箱', gen: () => {
    const local = ['user', 'contact', 'hello', 'info', 'admin', 'dev'][rnd(6)]
    return `${local}${100 + rnd(900)}@${pick(DOMAINS)}`
  } },
  phone: { label: '手机号', gen: () => '1' + [3, 5, 7, 8, 9][rnd(5)] + Array.from({ length: 9 }, () => rnd(10)).join('') },
  id: { label: 'ID', gen: () => rnd(10000) },
  uuid: { label: 'UUID', gen: () => (crypto.randomUUID?.() || (Date.now() + '-' + rnd(1e9))) },
  age: { label: '年龄', gen: () => 18 + rnd(45) },
  city: { label: '城市', gen: () => pick(CITIES) },
  address: { label: '地址', gen: () => `${pick(PROVINCES)}${pick(CITIES)}${pick(STREETS)}${1 + rnd(999)}号` },
  company: { label: '公司', gen: () => pick(CITIES) + pick(['科技', '网络', '信息', '数据', '智能']) + '有限公司' },
  dept: { label: '部门', gen: () => pick(DEPTS) },
  title: { label: '职位', gen: () => pick(TITLES) },
  date: { label: '日期', gen: () => randomDate() },
  datetime: { label: '日期时间', gen: () => randomDateTime() },
  timestamp: { label: '时间戳(秒)', gen: () => Math.floor(new Date(randomDate() + 'T00:00:00').getTime() / 1000 + rnd(86400)) },
  bool: { label: '布尔值', gen: () => Math.random() > 0.5 },
  score: { label: '分数', gen: () => Number((Math.random() * 100).toFixed(1)) },
  price: { label: '价格', gen: () => Number((Math.random() * 2000).toFixed(2)) },
  tags: { label: '标签数组', gen: () => TAGS.filter(() => Math.random() > 0.7).slice(0, 3).concat(pick(TAGS)).slice(0, 3) },
  url: { label: 'URL', gen: () => `https://${pick(DOMAINS)}/${['post', 'user', 'item', 'p'][rnd(4)]}/${1 + rnd(999)}` },
  ip: { label: 'IPv4', gen: () => [1 + rnd(223), rnd(256), rnd(256), 1 + rnd(254)].join('.') },
  sentence: { label: '句子', gen: () => {
    const n = 8 + rnd(12)
    return Array.from({ length: n }, () => pick(WORDS)).join('') + '。'
  } },
  paragraph: { label: '段落', gen: () => Array.from({ length: 3 }, () => {
    const n = 10 + rnd(15)
    return Array.from({ length: n }, () => pick(WORDS)).join('') + '。'
  }).join('') }
}

const DEFAULT_KEYS = ['id', 'name', 'email', 'phone', 'city', 'age']

const toCSV = (rows) => {
  if (!rows.length) return ''
  const keys = Object.keys(rows[0])
  const esc = v => {
    if (v === null || v === undefined) return ''
    if (typeof v === 'object') v = JSON.stringify(v)
    const s = String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  return [keys.join(','), ...rows.map(r => keys.map(k => esc(r[k])).join(','))].join('\n')
}

const toSQL = (rows, table) => {
  if (!rows.length) return ''
  const keys = Object.keys(rows[0])
  const val = v => {
    if (v === null || v === undefined) return 'NULL'
    if (typeof v === 'number') return String(v)
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
    if (typeof v === 'object') return "'" + JSON.stringify(v).replace(/'/g, "''") + "'"
    return "'" + String(v).replace(/'/g, "''") + "'"
  }
  return rows
    .map(r => `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(k => val(r[k])).join(', ')});`)
    .join('\n')
}

export default function MockDataTool() {
  const [keys, setKeys] = useState(DEFAULT_KEYS)
  const [count, setCount] = useState('10')
  const [format, setFormat] = useState('json')
  const [table, setTable] = useState('users')
  const [seed, setSeed] = useState(0)

  const rows = useMemo(() => {
    const n = Math.max(1, Math.min(200, Number(count) || 1))
    return Array.from({ length: n }, () => {
      const row = {}
      for (const k of keys) row[k] = FIELDS[k].gen()
      return row
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, count, seed])

  const output = useMemo(() => {
    if (!rows.length) return ''
    if (format === 'json') return JSON.stringify(rows, null, 2)
    if (format === 'csv') return toCSV(rows)
    return toSQL(rows, table || 'users')
  }, [rows, format, table])

  const toggle = k => setKeys(keys.includes(k) ? keys.filter(x => x !== k) : [...keys, k])

  return (
    <div className="space-y-4">
      <Panel title="字段">
        <div className="flex flex-wrap gap-2">
          {Object.entries(FIELDS).map(([k, f]) => (
            <button
              key={k}
              onClick={() => toggle(k)}
              className={
                'text-xs px-2.5 py-1.5 rounded-lg border transition ' +
                (keys.includes(k)
                  ? 'bg-teal/20 text-teal border-teal/40'
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <Field label="条数"><NumInput value={count} onChange={setCount} min={1} max={200} /></Field>
          <Field label="输出">
            <Segmented value={format} onChange={setFormat} options={[['json', 'JSON'], ['csv', 'CSV'], ['sql', 'SQL']]} />
          </Field>
          {format === 'sql' && (
            <Field label="表名">
              <input
                value={table}
                onChange={e => setTable(e.target.value)}
                spellCheck={false}
                className="w-32 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 text-sm text-gray-100 focus:outline-none focus:border-teal/60 font-mono"
              />
            </Field>
          )}
          <button
            onClick={() => setSeed(s => s + 1)}
            className="text-sm px-3 py-1.5 rounded-lg bg-teal text-gray-950 font-medium hover:bg-teal/90"
          >
            重新生成
          </button>
          <button
            onClick={() => setKeys(Object.keys(FIELDS))}
            className="text-xs px-2 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-teal"
          >
            全选字段
          </button>
        </div>
        {keys.length === 0 && <p className="text-amber text-xs mt-3">至少选择一个字段。</p>}
      </Panel>

      {keys.length > 0 && (
        <Panel title={`预览（${rows.length} 条，${keys.length} 个字段）`}>
          <div className="overflow-auto max-h-96 rounded-lg border border-gray-800">
            <table className="w-full text-xs">
              <thead className="bg-gray-900 sticky top-0">
                <tr>
                  {keys.map(k => (
                    <th key={k} className="text-left px-3 py-2 font-medium text-gray-400 whitespace-nowrap border-b border-gray-800">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b border-gray-900 hover:bg-gray-900/40">
                    {keys.map(k => (
                      <td key={k} className="px-3 py-1.5 text-gray-300 font-mono whitespace-nowrap max-w-56 truncate">
                        {typeof r[k] === 'object' ? JSON.stringify(r[k]) : String(r[k])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 20 && <p className="text-xs text-gray-600 mt-2">仅预览前 20 行，完整数据请复制下方输出。</p>}
        </Panel>
      )}

      <Panel title="输出">
        <TextArea value={output} onChange={() => {}} readOnly rows={14} />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            {output.length.toLocaleString()} 字符 · 约 {new TextEncoder().encode(output).length.toLocaleString()} 字节
          </span>
          <CopyBtn text={output} />
        </div>
      </Panel>
    </div>
  )
}
