import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, ErrorBar } from './Panel'

// 纯前端 JWT 解析：Base64URL 解码，不校验签名
const b64urlDecode = str => {
  let s = str.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  const bin = atob(s)
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

const CLAIM_LABELS = {
  iss: '签发者 iss',
  sub: '主题 sub',
  aud: '受众 aud',
  exp: '过期时间 exp',
  nbf: '生效时间 nbf',
  iat: '签发时间 iat',
  jti: '编号 jti'
}

const fmtTime = sec => {
  if (typeof sec !== 'number') return ''
  const d = new Date(sec * 1000)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function JwtTool() {
  const [token, setToken] = useState('')

  const parsed = useMemo(() => {
    const raw = token.trim().replace(/^Bearer\s+/i, '')
    if (!raw) return { empty: true }
    const parts = raw.split('.')
    if (parts.length < 2) return { error: '不是一个合法的 JWT：应包含 2~3 段以「.」分隔的内容' }
    try {
      const header = JSON.parse(b64urlDecode(parts[0]))
      const payload = JSON.parse(b64urlDecode(parts[1]))
      return { header, payload, signature: parts[2] || '', parts: parts.length }
    } catch (e) {
      return { error: '解析失败：' + e.message }
    }
  }, [token])

  const expInfo = useMemo(() => {
    const exp = parsed.payload?.exp
    if (typeof exp !== 'number') return null
    const diff = exp * 1000 - Date.now()
    const abs = Math.abs(diff)
    const days = Math.floor(abs / 86400000)
    const hours = Math.floor((abs % 86400000) / 3600000)
    const mins = Math.floor((abs % 3600000) / 60000)
    const span = days > 0 ? `${days} 天 ${hours} 小时` : hours > 0 ? `${hours} 小时 ${mins} 分` : `${mins} 分钟`
    return { expired: diff < 0, text: diff < 0 ? `已过期 ${span}` : `还有 ${span} 过期`, at: fmtTime(exp) }
  }, [parsed.payload])

  const rows = parsed.payload
    ? Object.entries(parsed.payload).map(([k, v]) => ({
      key: k,
      label: CLAIM_LABELS[k] || k,
      value: (k === 'exp' || k === 'iat' || k === 'nbf') && typeof v === 'number' ? fmtTime(v) : JSON.stringify(v)
    }))
    : []

  return (
    <div className="space-y-4">
      <Panel title="JWT Token">
        <TextArea
          value={token}
          onChange={setToken}
          rows={5}
          placeholder="粘贴 JWT，支持带 Bearer 前缀：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.xxxxx"
        />
        <p className="mt-2 text-xs text-gray-500">
          仅本地解码，不上传、不校验签名。签名是否有效需要服务端私钥，本工具无法验证。
        </p>
      </Panel>

      {parsed.error && <ErrorBar>{parsed.error}</ErrorBar>}

      {expInfo && (
        <div className={`rounded-lg p-3 text-sm border ${expInfo.expired
          ? 'bg-red-950/40 border-red-900 text-red-300'
          : 'bg-teal/10 border-teal/30 text-teal'}`}>
          <span className="font-medium">{expInfo.expired ? '✕ Token 已过期' : '✓ Token 未过期'}</span>
          <span className="ml-2 opacity-80">{expInfo.text} · 过期于 {expInfo.at}</span>
        </div>
      )}

      {parsed.header && (
        <>
          <Panel title="Header">
            <div className="relative">
              <TextArea value={JSON.stringify(parsed.header, null, 2)} onChange={() => {}} readOnly rows={5} />
              <div className="absolute top-2 right-2">
                <CopyBtn text={JSON.stringify(parsed.header, null, 2)} />
              </div>
            </div>
          </Panel>

          <Panel title="Payload">
            <div className="relative">
              <TextArea value={JSON.stringify(parsed.payload, null, 2)} onChange={() => {}} readOnly rows={10} />
              <div className="absolute top-2 right-2">
                <CopyBtn text={JSON.stringify(parsed.payload, null, 2)} />
              </div>
            </div>
          </Panel>

          {rows.length > 0 && (
            <Panel title="字段解读">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs">
                      <th className="text-left font-medium pb-2 pr-4">字段</th>
                      <th className="text-left font-medium pb-2">值</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {rows.map(r => (
                      <tr key={r.key}>
                        <td className="py-1.5 pr-4 font-mono text-teal/90 align-top">{r.label}</td>
                        <td className="py-1.5 font-mono text-gray-200 break-all">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {parsed.signature && (
            <Panel title="签名（未校验）">
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-xs text-gray-400 break-all">
                  {parsed.signature}
                </code>
                <CopyBtn text={parsed.signature} />
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  )
}
