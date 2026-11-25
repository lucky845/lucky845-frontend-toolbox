import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Stat } from './Panel'

// 逐字符统计，正确处理代理对（emoji）与全角标点
const CJK = /[\u4e00-\u9fff\u3400-\u4dbf]/
const WORD = /[A-Za-z0-9_'\u00c0-\u024f]/

export default function CountTool() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const chars = Array.from(text)
    let letters = 0
    let digits = 0
    let spaces = 0
    let cjk = 0
    let punct = 0
    let other = 0
    for (const ch of chars) {
      if (CJK.test(ch)) cjk++
      else if (/[0-9]/.test(ch)) digits++
      else if (/\s/.test(ch)) spaces++
      else if (/[A-Za-z\u00c0-\u024f]/.test(ch)) letters++
      else if (/[\p{P}\p{S}]/u.test(ch)) punct++
      else other++
    }
    const lines = text === '' ? 0 : text.split('\n').length
    const paragraphs = text.split(/\n\s*\n/).filter(s => s.trim()).length
    // 英文单词：连续字母数字序列；中文按字计数
    const words = text.split(/[^A-Za-z0-9\u00c0-\u024f']+/).filter(Boolean)
    const cjkChars = cjk
    const readMinutes = Math.max(0, (words.length / 250) + (cjkChars / 450))

    // 词频
    const freq = new Map()
    let buf = ''
    const flush = () => {
      if (!buf) return
      const key = buf.toLowerCase()
      freq.set(key, (freq.get(key) || 0) + 1)
      buf = ''
    }
    for (const ch of chars) {
      if (WORD.test(ch)) buf += ch
      else flush()
    }
    flush()
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)

    return {
      chars: chars.length,
      bytes: new TextEncoder().encode(text).length,
      letters, digits, spaces, cjk: cjkChars, punct, other,
      lines, paragraphs, words: words.length,
      readMinutes,
      top,
      unique: freq.size
    }
  }, [text])

  const hasText = text.length > 0

  return (
    <div className="space-y-4">
      <Panel title="文本统计">
        <TextArea value={text} onChange={setText} rows={10} placeholder="粘贴任意文本，实时统计字符、词数、行数与词频…" />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">全部在本地计算，不上传任何内容</span>
          <CopyBtn text={text} />
        </div>
      </Panel>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Stat label="字符数" value={stats.chars} />
        <Stat label="字节数 (UTF-8)" value={stats.bytes} />
        <Stat label="词数" value={stats.words} />
        <Stat label="行数" value={stats.lines} />
        <Stat label="段落数" value={stats.paragraphs} />
        <Stat label="汉字数" value={stats.cjk} />
        <Stat label="字母 / 数字" value={`${stats.letters} / ${stats.digits}`} />
        <Stat label="标点 / 空白" value={`${stats.punct} / ${stats.spaces}`} />
      </div>

      <Panel title="构成">
        <div className="space-y-2">
          {[
            ['汉字', stats.cjk, 'bg-teal'],
            ['字母', stats.letters, 'bg-sky-400'],
            ['数字', stats.digits, 'bg-amber-400'],
            ['标点符号', stats.punct, 'bg-purple-400'],
            ['空白', stats.spaces, 'bg-gray-500'],
            ['其他', stats.other, 'bg-gray-700']
          ].map(([label, value, color]) => {
            const pct = stats.chars ? (value / stats.chars) * 100 : 0
            return (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{label}</span>
                  <span className="font-mono">{value} · {pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
                  <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
        {hasText && (
          <div className="mt-3 text-xs text-gray-500">
            预计阅读时间约 <span className="text-teal font-mono">{stats.readMinutes < 1 ? '<1' : stats.readMinutes.toFixed(1)}</span> 分钟（中文 450 字/分，英文 250 词/分）
          </div>
        )}
      </Panel>

      {stats.top.length > 0 && (
        <Panel title={`词频 Top ${stats.top.length}（共 ${stats.unique} 个不同词）`}>
          <div className="flex flex-wrap gap-2">
            {stats.top.map(([w, n]) => {
              const scale = 1 + Math.min(1.2, (n / stats.top[0][1]) * 1.2)
              return (
                <span
                  key={w}
                  className="px-2 py-1 rounded-md bg-teal/10 text-teal border border-teal/20 font-mono"
                  style={{ fontSize: `${0.75 * scale}rem` }}
                  title={`出现 ${n} 次`}
                >
                  {w}
                  <span className="text-teal/50 ml-1 text-[10px]">{n}</span>
                </span>
              )
            })}
          </div>
        </Panel>
      )}
    </div>
  )
}
