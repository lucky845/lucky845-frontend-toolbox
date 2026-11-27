import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Check, Segmented, Field, Select, Stat, Tip } from './Panel'

// 文本脱敏：身份证 / 银行卡 / 手机号 / 邮箱 / IP / 姓名
// 顺序很重要：更长的数字规则必须排在手机号之前，否则会被手机号规则先命中
const RULES = [
  ['idcard', '身份证', /(?<!\d)(\d{4})\d{10}(\d{4})(?!\d)/g, (m, a, b) => a + '**********' + b],
  ['bank', '银行卡', /(?<!\d)(\d{4})\d{8,11}(\d{4})(?!\d)/g, (m, a, b) => a + '*'.repeat(m.length - 8) + b],
  ['phone', '手机号', /(?<!\d)(1[3-9]\d)\d{4}(\d{4})(?!\d)/g, (m, a, b) => a + '****' + b],
  ['email', '邮箱', /([\w.+-])([\w.+-]*)(@[\w-]+\.[\w.-]+)/g, (m, a, b, c) => a + '*'.repeat(Math.max(1, b.length)) + c],
  ['ip', 'IP 地址', /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, (m, a, b, c, d) => `${a}.*.*.${d}`],
  // 中文姓名只在「姓名：/联系人：」这类前缀后面匹配，避免误伤普通词语
  ['name', '中文姓名', /(姓名|联系人|客户|收件人)([:：\s]+)([\u4e00-\u9fa5])([\u4e00-\u9fa5]{1,2})/g, (m, p, sep, a, b) => p + sep + a + '*'.repeat(b.length)],
  ['qq', 'QQ / 微信号', /\b(QQ|微信|WeChat|wx)[:：\s]*([A-Za-z0-9_-]{4,})/gi, (m, a, b) => a + '：' + b[0] + '*'.repeat(Math.max(2, b.length - 1)), false]
]

// 每条规则的匹配说明：长规则对用户不直观，用 Tip 气泡讲清楚「什么才算命中」
const TIPS = {
  idcard: '匹配 18 位身份证号，掩掉中间 10 位，保留前 4 位和后 4 位。前后不能紧邻其它数字，避免误伤更长的数字串。',
  bank: '匹配 16–19 位银行卡号，保留前 4 位和后 4 位，中间全部掩盖。',
  phone: '匹配 11 位大陆手机号（1 开头，第二位 3–9），掩掉中间 4 位，保留号段前 3 位和后 4 位。',
  email: '保留邮箱首字符与 @ 后面的域名，只掩盖用户名中间部分。',
  ip: '匹配 IPv4 地址，掩掉中间两段，保留第一段和最后一段用于定位网段。',
  name: (
    <>
      仅当姓名前面出现 <b>姓名</b>、<b>联系人</b>、<b>客户</b>、<b>收件人</b> 这四个前缀之一（
      后面跟冒号、空格或换行）时才命中，掩掉名的部分、保留姓。
      <br />
      例：<code className="text-teal">姓名：张三</code> → <code className="text-teal">姓名：张*</code>
      <br />
      裸写的「张三」不会命中，避免误伤正文里的普通词汇。
    </>
  ),
  qq: '匹配 QQ / 微信 / WeChat / wx 后面跟的账号，保留首字符，其余掩盖。'
}

// 自定义关键词的替换符号
const MASKS = [
  ['star', '****'],
  ['hash', '####'],
  ['keep', '保留首尾']
]

export default function MaskTool() {
  const [input, setInput] = useState('')
  const [enabled, setEnabled] = useState(() => Object.fromEntries(RULES.map(r => [r[0], true])))
  const [maskStyle, setMaskStyle] = useState('star')
  const [custom, setCustom] = useState('')

  const toggle = id => setEnabled(prev => ({ ...prev, [id]: !prev[id] }))

  const { output, counts } = useMemo(() => {
    if (!input) return { output: '', counts: [] }
    let text = input
    const counts = []
    for (const [id, label, re, fn] of RULES) {
      if (!enabled[id]) continue
      let n = 0
      // 每条规则都要用新的 RegExp，避免 g 标志下的 lastIndex 污染
      const rx = new RegExp(re.source, re.flags)
      text = text.replace(rx, (...args) => { n++; return fn(...args) })
      counts.push({ label, n })
    }
    // 自定义关键词（逗号或换行分隔）
    const words = custom.split(/[,，\n]/).map(w => w.trim()).filter(Boolean)
    if (words.length) {
      let n = 0
      const mark = maskStyle === 'hash' ? '####' : '****'
      for (const w of words) {
        const safe = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const re = new RegExp(safe, 'g')
        text = text.replace(re, m => {
          n++
          if (maskStyle === 'keep' && m.length > 2) return m[0] + '*'.repeat(m.length - 2) + m[m.length - 1]
          return mark
        })
      }
      counts.push({ label: '自定义关键词', n })
    }
    return { output: text, counts }
  }, [input, enabled, maskStyle, custom])

  const total = counts.reduce((a, b) => a + b.n, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {RULES.map(([id, label]) => (
          <div key={id} className="flex items-center gap-1 min-w-0">
            <Check checked={!!enabled[id]} onChange={() => toggle(id)} label={label} />
            {TIPS[id] && <Tip>{TIPS[id]}</Tip>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="自定义敏感词（逗号或换行分隔）">
          <input
            value={custom}
            onChange={e => setCustom(e.target.value)}
            spellCheck={false}
            placeholder="例如：公司名, 项目代号"
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-teal/60"
          />
        </Field>
        <Field label="遮盖样式">
          <Segmented value={maskStyle} onChange={setMaskStyle} options={MASKS} />
        </Field>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="原始文本">
          <TextArea
            value={input}
            onChange={setInput}
            rows={12}
            placeholder={'粘贴需要脱敏的日志、名单或文本…\n例如：联系人 13812345678，邮箱 alice@example.com'}
          />
        </Panel>
        <Panel title="脱敏结果">
          <div className="relative">
            <TextArea value={output} onChange={() => {}} readOnly rows={12} />
            {output && <div className="absolute top-2 right-2"><CopyBtn text={output} /></div>}
          </div>
        </Panel>
      </div>

      {input && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="原文长度" value={input.length} />
            <Stat label="结果长度" value={output.length} />
            <Stat label="命中总数" value={total} />
            <Stat label="减少字符" value={input.length - output.length} />
          </div>
          {counts.some(c => c.n > 0) && (
            <Panel title="各类命中次数">
              <div className="flex flex-wrap gap-2">
                {counts.filter(c => c.n > 0).map(c => (
                  <span key={c.label} className="px-3 py-1.5 rounded-lg bg-teal/15 text-teal text-sm">
                    {c.label} <b className="ml-1">{c.n}</b>
                  </span>
                ))}
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  )
}
