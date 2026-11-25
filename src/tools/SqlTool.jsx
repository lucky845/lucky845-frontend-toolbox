import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Segmented } from './Panel'

// SQL 格式化：轻量美化，支持压缩与关键字大/小写
const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT INTO',
  'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
  'CROSS JOIN', 'JOIN', 'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS NULL',
  'IS NOT NULL', 'DISTINCT', 'UNION ALL', 'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'WITH'
]

const CLAUSE = /^(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|VALUES|SET|UNION ALL|UNION|INSERT INTO|UPDATE|DELETE FROM|WITH|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|JOIN)\b/i

// 按括号和引号拆分，保证字符串里的内容不被改写；gap 记录该 token 前是否有空白
const tokenize = sql => {
  const tokens = []
  let cur = ''
  let quote = null
  let gap = false
  const flush = () => { if (cur.trim()) { tokens.push({ type: 'word', v: cur.trim(), gap }); gap = false }; cur = '' }
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]
    if (quote) {
      cur += ch
      if (ch === quote && sql[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; cur += ch; continue }
    if (/[(),;]/.test(ch)) {
      flush()
      tokens.push({ type: 'punct', v: ch, gap })
      gap = false
      continue
    }
    if (/\s/.test(ch)) {
      flush()
      gap = true
      continue
    }
    cur += ch
  }
  flush()
  return tokens
}

const applyCase = (word, mode) => {
  if (mode === 'original') return word
  const upper = word.toUpperCase()
  if (KEYWORDS.includes(upper)) return mode === 'upper' ? upper : upper.toLowerCase()
  return word
}

const formatSql = (sql, mode) => {
  const tokens = tokenize(sql)
  let indent = 0
  let out = ''
  let needSpace = false
  const newline = (level = indent) => { out = out.replace(/[ ]+$/, '') + '\n' + '  '.repeat(Math.max(0, level)) }

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type === 'punct') {
      if (t.v === '(') {
        // 函数调用不加空格（count(），其余情况：原文有空白、或跟在逗号后，加一个空格
        const spaced = t.gap || out.endsWith(',')
        out += (spaced ? ' ' : '') + '('
        indent++
        needSpace = false
      } else if (t.v === ')') {
        indent = Math.max(0, indent - 1)
        out = out.replace(/[ \n]+$/, '') + ')'
        needSpace = true
      } else if (t.v === ',') {
        out = out.replace(/[ ]+$/, '') + ','
        needSpace = true
      } else if (t.v === ';') {
        out = out.replace(/[ ]+$/, '') + ';'
        newline(0)
        needSpace = false
      }
      continue
    }
    const upper = t.v.toUpperCase()
    // 多词关键字整体识别
    const twoWord = upper === 'GROUP' || upper === 'ORDER' || upper === 'UNION' || upper === 'INSERT' || upper === 'DELETE' || upper === 'CREATE' || upper === 'ALTER' || upper === 'DROP' || upper === 'LEFT' || upper === 'RIGHT' || upper === 'FULL' || upper === 'INNER' || upper === 'CROSS' || upper === 'IS' || upper === 'NOT' || upper === 'DELETE'
    let word = t.v
    if (twoWord && tokens[i + 1]?.type === 'word') {
      const combo = (upper + ' ' + tokens[i + 1].v.toUpperCase())
      if (KEYWORDS.includes(combo)) {
        word = applyCase(combo, mode)
        i++
      } else word = applyCase(t.v, mode)
    } else {
      word = applyCase(t.v, mode)
    }

    // 子句判定要在多词合并之后进行，否则 ORDER / GROUP 单独不成子句
    if (CLAUSE.test(word)) {
      if (out.trim()) newline(indent)
      out += word
    } else {
      if (needSpace && !out.endsWith('\n')) out += ' '
      out += word
    }
    needSpace = true
  }
  return out.split('\n').map(l => l.replace(/\s+$/, '')).filter((l, i, arr) => l !== '' || arr[i - 1] !== '').join('\n').trim()
}

// 压缩：基于 token 重建，避免破坏引号内的原始空白
const minify = sql => {
  let out = ''
  for (const t of tokenize(sql)) {
    if (t.type === 'punct') {
      if (t.v === '(') out += (t.gap && out && !out.endsWith(' ') ? ' ' : '') + '('
      else if (t.v === ')') out = out.replace(/ $/, '') + ')'
      else if (t.v === ',') out = out.replace(/ $/, '') + ', '
      else if (t.v === ';') out = out.replace(/ $/, '') + '; '
    } else {
      if (out && !out.endsWith(' ') && !out.endsWith('(')) out += ' '
      out += t.v
    }
  }
  return out.trim()
}

export default function SqlTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('format')
  const [keywordCase, setKeywordCase] = useState('upper')

  const output = useMemo(() => {
    if (!input.trim()) return ''
    try {
      return mode === 'minify' ? minify(input) : formatSql(input, keywordCase)
    } catch (e) {
      return '-- 处理失败：' + e.message
    }
  }, [input, mode, keywordCase])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={mode} onChange={setMode} options={[['format', '美化'], ['minify', '压缩']]} />
        {mode === 'format' && (
          <Segmented
            value={keywordCase}
            onChange={setKeywordCase}
            options={[['upper', '关键字大写'], ['lower', '关键字小写'], ['original', '保持原样']]}
          />
        )}
      </div>

      <Panel title="SQL 输入">
        <TextArea value={input} onChange={setInput} rows={10} placeholder="select id,name from users where age>18 and city in ('北京','上海') order by id desc limit 10;" />
      </Panel>

      <Panel title="结果">
        <div className="relative">
          <TextArea value={output} onChange={() => {}} rows={14} />
          {output && <div className="absolute top-2 right-2"><CopyBtn text={output} /></div>}
        </div>
      </Panel>
    </div>
  )
}
