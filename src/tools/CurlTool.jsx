import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Segmented, ErrorBar } from './Panel'

// cURL → fetch / axios / XHR：纯本地解析，不会发起任何请求
const parseCurl = (raw) => {
  // 1. 合并反斜杠换行，切分成参数
  const text = raw.replace(/\\\r?\n/g, ' ').trim()
  const args = []
  let cur = ''
  let quote = null
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === quote) quote = null
      else if (ch === '\\' && quote === '"' && i + 1 < text.length) { cur += text[++i]; continue }
      else cur += ch
      continue
    }
    if (ch === '"' || ch === "'") { quote = ch; continue }
    if (/\s/.test(ch)) { if (cur) { args.push(cur); cur = '' } continue }
    cur += ch
  }
  if (cur) args.push(cur)

  if (args[0] !== 'curl') throw new Error('请输入以 curl 开头的命令')
  const opts = args.slice(1)

  let url = ''
  let method = ''
  const headers = {}
  let body = ''
  let auth = ''
  let compressed = false
  let insecure = false
  let followRedirect = false
  const cookies = []

  const need = (i, flag) => {
    if (i + 1 >= opts.length) throw new Error(`参数 ${flag} 缺少值`)
    return opts[i + 1]
  }

  for (let i = 0; i < opts.length; i++) {
    const a = opts[i]
    let flag = a
    let inlineValue = null
    // 支持 --header=xxx 形式
    if (a.startsWith('--') && a.includes('=')) {
      const idx = a.indexOf('=')
      flag = a.slice(0, idx)
      inlineValue = a.slice(idx + 1)
    } else if (!a.startsWith('-') && /^-[A-Za-z](.)/.test(a) && a.length > 2) {
      flag = a.slice(0, 2)
      inlineValue = a.slice(2)
    }
    const val = () => (inlineValue !== null ? inlineValue : need(i, flag))
    const consume = () => { if (inlineValue === null) i++ }

    switch (flag) {
      case '-X': case '--request': method = val().toUpperCase(); consume(); break
      case '-H': case '--header': {
        const h = val(); consume()
        const idx = h.indexOf(':')
        if (idx > 0) headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim()
        break
      }
      case '-d': case '--data': case '--data-raw': case '--data-binary': case '--data-ascii':
        body = (body ? body + '&' : '') + val(); consume(); break
      case '-F': case '--form':
        headers['Content-Type'] = 'multipart/form-data'
        body = (body ? body + '&' : '') + val(); consume(); break
      case '-u': case '--user': {
        const u = val(); consume()
        auth = 'Basic ' + btoa(u)
        break
      }
      case '-b': case '--cookie':
        cookies.push(val()); consume(); break
      case '-A': case '--user-agent': headers['User-Agent'] = val(); consume(); break
      case '-e': case '--referer': headers['Referer'] = val(); consume(); break
      case '--compressed': compressed = true; break
      case '-k': case '--insecure': insecure = true; break
      case '-L': case '--location': followRedirect = true; break
      case '-s': case '--silent': case '-S': case '--show-error': case '-v': case '--verbose': case '-i': case '--include': break
      case '-o': case '--output': consume(); break
      default:
        if (a.startsWith('-')) break // 未知参数忽略
        if (!url) url = a
    }
  }

  if (!url) throw new Error('未解析到请求 URL')
  if (cookies.length) headers['Cookie'] = cookies.join('; ')
  if (auth) headers['Authorization'] = headers['Authorization'] || auth
  if (body && !method) method = 'POST'
  if (!method) method = 'GET'

  let parsedUrl
  try { parsedUrl = new URL(url) } catch { throw new Error('URL 格式无效：' + url) }

  const query = {}
  for (const [k, v] of parsedUrl.searchParams.entries()) {
    if (k in query) query[k] = [].concat(query[k], v)
    else query[k] = v
  }

  return { url, method, headers, body, parsedUrl: parsedUrl.toString(), query, host: parsedUrl.host, path: parsedUrl.pathname + parsedUrl.search, insecure, followRedirect, compressed }
}

const jsStr = s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'"
const jsVal = v => (Array.isArray(v) ? '[\n' + v.map(x => '    ' + jsStr(x)).join(',\n') + '\n  ]' : jsStr(v))

const buildFetch = r => {
  const lines = [`const res = await fetch(${jsStr(r.url)}, {`]
  lines.push(`  method: ${jsStr(r.method)},`)
  const hk = Object.keys(r.headers)
  if (hk.length) {
    lines.push('  headers: {')
    for (const k of hk) lines.push(`    ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : jsStr(k)}: ${jsStr(r.headers[k])},`)
    lines.push('  },')
  }
  if (r.body) lines.push(`  body: ${jsStr(r.body)},`)
  lines.push('})')
  lines.push('')
  lines.push('if (!res.ok) throw new Error(`HTTP ${res.status}`)')
  lines.push('const data = await res.json()')
  return lines.join('\n')
}

const buildAxios = r => {
  const lines = ['const { data } = await axios({']
  lines.push(`  url: ${jsStr(r.url)},`)
  lines.push(`  method: ${jsStr(r.method.toLowerCase())},`)
  const hk = Object.keys(r.headers)
  if (hk.length) {
    lines.push('  headers: {')
    for (const k of hk) lines.push(`    ${jsStr(k)}: ${jsStr(r.headers[k])},`)
    lines.push('  },')
  }
  if (r.body) {
    // 尝试解析成 JSON，失败则按字符串传
    try {
      JSON.parse(r.body)
      lines.push(`  data: ${r.body},`)
    } catch {
      lines.push(`  data: ${jsStr(r.body)},`)
    }
  }
  lines.push('})')
  return lines.join('\n')
}

const buildNode = r => {
  const lines = [`const res = await fetch(${jsStr(r.url)}, {`]
  lines.push(`  method: ${jsStr(r.method)},`)
  const hk = Object.keys(r.headers)
  if (hk.length) {
    lines.push('  headers: {')
    for (const k of hk) lines.push(`    ${jsStr(k)}: ${jsStr(r.headers[k])},`)
    lines.push('  },')
  }
  if (r.body) lines.push(`  body: ${jsStr(r.body)},`)
  lines.push('})')
  lines.push('const data = await res.json()')
  return lines.join('\n')
}

const buildPython = r => {
  const lines = ['import requests', '', 'res = requests.request(']
  lines.push(`    ${jsStr(r.method)},`)
  lines.push(`    ${jsStr(r.url)},`)
  const hk = Object.keys(r.headers)
  if (hk.length) {
    lines.push('    headers={')
    for (const k of hk) lines.push(`        ${jsStr(k)}: ${jsStr(r.headers[k])},`)
    lines.push('    },')
  }
  if (r.body) lines.push(`    data=${jsStr(r.body)},`)
  lines.push(')')
  lines.push('res.raise_for_status()')
  lines.push('data = res.json()')
  return lines.join('\n')
}

const BUILDERS = {
  fetch: ['fetch（浏览器）', buildFetch],
  axios: ['axios', buildAxios],
  node: ['Node.js 18+', buildNode],
  python: ['Python requests', buildPython]
}

export default function CurlTool() {
  const [input, setInput] = useState('')
  const [target, setTarget] = useState('fetch')

  const { result, error } = useMemo(() => {
    if (!input.trim()) return { result: null, error: '' }
    try {
      return { result: parseCurl(input), error: '' }
    } catch (e) {
      return { result: null, error: e.message }
    }
  }, [input])

  const code = useMemo(() => (result ? BUILDERS[target][1](result) : ''), [result, target])

  return (
    <div className="space-y-4">
      <Panel title="cURL 命令">
        <TextArea
          value={input}
          onChange={setInput}
          rows={7}
          placeholder={"curl 'https://api.example.com/v1/users' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer xxx' \\\n  --data-raw '{\"name\":\"lucky\"}'"}
        />
      </Panel>

      {error && <ErrorBar>{error}</ErrorBar>}

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              ['方法', result.method],
              ['Host', result.host],
              ['请求头', Object.keys(result.headers).length + ' 个'],
              ['请求体', result.body ? result.body.length + ' 字符' : '无']
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2">
                <div className="text-[11px] text-gray-500">{label}</div>
                <div className="text-sm text-teal font-medium truncate" title={String(value)}>{value}</div>
              </div>
            ))}
          </div>

          {Object.keys(result.headers).length > 0 && (
            <Panel title="请求头">
              <div className="space-y-1">
                {Object.entries(result.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-3 text-sm font-mono">
                    <span className="text-teal/90 flex-none">{k}:</span>
                    <span className="text-gray-300 break-all">{v}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {result.body && (
            <Panel title="请求体">
              <div className="relative">
                <TextArea value={result.body} onChange={() => {}} readOnly rows={5} />
                <div className="absolute top-2 right-2"><CopyBtn text={result.body} /></div>
              </div>
            </Panel>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Segmented value={target} onChange={setTarget} options={Object.entries(BUILDERS).map(([k, [label]]) => [k, label])} />
          </div>

          <Panel title="代码">
            <div className="relative">
              <TextArea value={code} onChange={() => {}} readOnly rows={16} />
              <div className="absolute top-2 right-2"><CopyBtn text={code} /></div>
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}
