import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Segmented, ErrorBar } from './Panel'

// URL 参数解析与构建
export default function QueryTool() {
  const [mode, setMode] = useState('parse')
  const [input, setInput] = useState('')

  const parsed = useMemo(() => {
    if (mode !== 'parse') return null
    const raw = input.trim()
    if (!raw) return { empty: true }
    try {
      let query = raw
      let base = ''
      const qIndex = raw.indexOf('?')
      if (qIndex >= 0) {
        base = raw.slice(0, qIndex)
        query = raw.slice(qIndex + 1)
      } else if (raw.includes('://') || raw.startsWith('/')) {
        // 完整的 URL 但没有查询串
        return { base: raw, params: [], hash: '' }
      }
      // 去掉 hash
      let hash = ''
      const hIndex = query.indexOf('#')
      if (hIndex >= 0) { hash = query.slice(hIndex + 1); query = query.slice(0, hIndex) }
      if (!query && !base) return { empty: true }
      const sp = new URLSearchParams(query)
      const params = []
      for (const [k, v] of sp.entries()) params.push({ key: k, value: v })
      return { base, params, hash }
    } catch (e) {
      return { error: '解析失败：' + e.message }
    }
  }, [input, mode])

  const built = useMemo(() => {
    if (mode !== 'build') return ''
    const lines = input.split(/\r?\n/).filter(l => l.trim())
    const sp = new URLSearchParams()
    for (const line of lines) {
      const i = line.indexOf('=')
      if (i < 0) sp.append(line.trim(), '')
      else {
        const k = line.slice(0, i).trim()
        let v = line.slice(i + 1).trim()
        // 支持 value 里已经编码过的情况
        if (/%[0-9A-Fa-f]{2}/.test(v)) { try { v = decodeURIComponent(v) } catch {} }
        sp.append(k, v)
      }
    }
    return sp.toString()
  }, [input, mode])

  const buildFullUrl = useMemo(() => {
    if (mode !== 'build' || !built) return ''
    try {
      const u = new URL(window.location.href)
      return `${u.origin}${u.pathname}?${built}`
    } catch {
      return '?' + built
    }
  }, [built, mode])

  return (
    <div className="space-y-4">
      <Segmented value={mode} onChange={setMode} options={[['parse', '解析 URL'], ['build', '构建查询串']]} />

      <Panel title={mode === 'parse' ? '粘贴 URL 或查询串' : '每行一个 key=value'}>
        <TextArea
          value={input}
          onChange={setInput}
          rows={7}
          placeholder={mode === 'parse'
            ? 'https://example.com/search?q=%E5%89%8D%E7%AB%AF&page=2#top'
            : 'q=前端工具箱\npage=2\ntags=a,b'}
        />
      </Panel>

      {parsed?.error && <ErrorBar>{parsed.error}</ErrorBar>}

      {parsed?.base !== undefined && !parsed?.error && (
        <Panel title="路径部分">
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-sm text-gray-200 break-all">
              {parsed.base || '（无）'}
            </code>
            {parsed.base && <CopyBtn text={parsed.base} />}
          </div>
        </Panel>
      )}

      {parsed?.params?.length > 0 && (
        <Panel title={`参数（${parsed.params.length}）`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="text-left font-medium pb-2 pr-4 w-1/3">参数名</th>
                  <th className="text-left font-medium pb-2">值（已解码）</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {parsed.params.map((p, i) => (
                  <tr key={p.key + i}>
                    <td className="py-1.5 pr-4 font-mono text-teal/90 align-top break-all">{p.key}</td>
                    <td className="py-1.5 font-mono text-gray-200 break-all">{p.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end">
            <CopyBtn text={JSON.stringify(Object.fromEntries(parsed.params.map(p => [p.key, p.value])), null, 2)} />
          </div>
        </Panel>
      )}

      {parsed?.params?.length === 0 && parsed?.base !== undefined && !parsed?.error && (
        <div className="text-sm text-gray-500 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          这个 URL 没有查询参数。
        </div>
      )}

      {mode === 'build' && (
        <>
          <Panel title="查询串">
            <div className="relative">
              <TextArea value={built} onChange={() => {}} rows={3} />
              {built && <div className="absolute top-2 right-2"><CopyBtn text={built} /></div>}
            </div>
          </Panel>
          {buildFullUrl && (
            <Panel title="完整 URL">
              <div className="relative">
                <TextArea value={buildFullUrl} onChange={() => {}} rows={3} />
                <div className="absolute top-2 right-2"><CopyBtn text={buildFullUrl} /></div>
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  )
}
