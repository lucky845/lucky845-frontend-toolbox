import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Check, Stat, ErrorBar } from './Panel'

// 人民币金额转中文大写
const DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const UNITS = ['', '拾', '佰', '仟']
const SECTIONS = ['', '万', '亿', '万亿']

// 把最多 4 位的整数段转成中文
const sectionToChinese = sec => {
  let out = ''
  let zero = false
  for (let i = 3; i >= 0; i--) {
    const d = Math.floor(sec / 10 ** i) % 10
    if (d === 0) {
      if (out) zero = true
    } else {
      if (zero) { out += '零'; zero = false }
      out += DIGITS[d] + UNITS[i]
    }
  }
  return out
}

const integerToChinese = n => {
  if (n === '0') return '零'
  const str = n.replace(/^0+/, '')
  if (!str) return '零'
  // 每 4 位一段，从低位往高位处理
  const sections = []
  for (let end = str.length; end > 0; end -= 4) {
    sections.push(str.slice(Math.max(0, end - 4), end))
  }
  let out = ''
  let needZero = false
  for (let i = sections.length - 1; i >= 0; i--) {
    const secNum = parseInt(sections[i], 10)
    const secText = sectionToChinese(secNum)
    if (secNum === 0) {
      if (out) needZero = true
      continue
    }
    if (out) {
      // 前一段末尾有 0，或当前段不足 4 位（如 0012），需要补零
      if (needZero || sections[i].padStart(4, '0')[0] === '0') out += '零'
    }
    out += secText + SECTIONS[i]
    needZero = false
  }
  return out
}

const toRMB = raw => {
  const s = String(raw).replace(/[,，\s￥¥]/g, '').trim()
  if (!s) return ''
  if (!/^-?\d*(\.\d*)?$/.test(s)) throw new Error('只能包含数字与小数点')
  const negative = s.startsWith('-')
  const body = negative ? s.slice(1) : s
  const [intPart, decRaw] = body.split('.')
  const dec = (decRaw || '').slice(0, 2).padEnd(2, '0')

  const intChinese = integerToChinese(intPart || '0')
  const jiao = Number(dec[0])
  const fen = Number(dec[1])

  let out = intChinese + '元'
  if (jiao === 0 && fen === 0) {
    out += '整'
  } else {
    if (jiao > 0) out += DIGITS[jiao] + '角'
    else if (intChinese !== '零') out += '零'
    if (fen > 0) out += DIGITS[fen] + '分'
  }
  if (negative && (intPart.replace(/^0+/, '') || jiao || fen)) out = '负' + out
  return out
}

export default function MoneyTool() {
  const [input, setInput] = useState('1234.56')
  const [full, setFull] = useState(true)

  const { result, error, parts } = useMemo(() => {
    try {
      let text = toRMB(input)
      if (!full) text = text.replace(/整$/, '')
      const s = String(input).replace(/[,，\s￥¥]/g, '')
      const [i, d] = s.split('.')
      return {
        result: text,
        error: '',
        parts: {
          int: (i || '0').replace(/^0+(?=\d)/, ''),
          dec: (d || '').slice(0, 2).padEnd(2, '0'),
          ky: i ? Number(i).toLocaleString('en-US') : '0'
        }
      }
    } catch (e) {
      return { result: '', error: e.message, parts: null }
    }
  }, [input, full])

  const samples = ['0', '1', '10', '100.5', '1000', '10000', '100000000.99', '1234567890.12']

  return (
    <div className="space-y-4">
      <Panel title="金额输入">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          spellCheck={false}
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 font-mono text-lg text-gray-100 focus:outline-none focus:border-teal/60"
          placeholder="1234.56"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {samples.map(s => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="px-2.5 py-1 rounded-md text-xs bg-gray-800/70 text-gray-300 hover:bg-teal/20 hover:text-teal transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Check checked={full} onChange={setFull} label="零角零分补「整」" hint="关闭后不输出结尾的「整」字" />
        </div>
      </Panel>

      {error && <ErrorBar>{error}</ErrorBar>}

      {parts && (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="整数部分" value={parts.ky} />
          <Stat label="小数部分" value={parts.dec} />
          <Stat label="字数" value={result.length} />
        </div>
      )}

      <Panel title="人民币大写">
        <div className="relative">
          <TextArea value={result} onChange={() => {}} readOnly rows={3} />
          {result && <div className="absolute top-2 right-2"><CopyBtn text={result} /></div>}
        </div>
        {result && (
          <div className="mt-3 text-sm text-gray-300 break-all leading-relaxed">
            {result}
          </div>
        )}
      </Panel>
    </div>
  )
}
