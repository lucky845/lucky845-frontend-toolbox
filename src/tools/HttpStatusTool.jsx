import { useMemo, useState } from 'react'
import { Panel, Segmented } from './Panel'

// HTTP 状态码速查
const STATUS = [
  [100, 'Continue', '继续。客户端应继续发送请求剩余部分。'],
  [101, 'Switching Protocols', '切换协议。服务端同意升级协议（如 WebSocket）。'],
  [200, 'OK', '请求成功，响应体中包含结果。'],
  [201, 'Created', '已创建。请求成功并在服务端创建了新资源。'],
  [202, 'Accepted', '已接受。请求已接收但尚未处理完成。'],
  [204, 'No Content', '无内容。请求成功但没有响应体。'],
  [206, 'Partial Content', '部分内容。用于断点续传与 Range 请求。'],
  [301, 'Moved Permanently', '永久重定向，搜索引擎会更新索引。'],
  [302, 'Found', '临时重定向，后续请求仍用原地址。'],
  [304, 'Not Modified', '资源未修改，可直接使用本地缓存。'],
  [307, 'Temporary Redirect', '临时重定向，方法保持不变。'],
  [308, 'Permanent Redirect', '永久重定向，方法保持不变。'],
  [400, 'Bad Request', '请求语法错误或参数不合法。'],
  [401, 'Unauthorized', '未认证。需要提供有效的身份凭证。'],
  [403, 'Forbidden', '已认证但无权访问该资源。'],
  [404, 'Not Found', '请求的资源不存在。'],
  [405, 'Method Not Allowed', 'HTTP 方法不被该资源支持。'],
  [408, 'Request Timeout', '请求超时，客户端未在服务端等待时间内完成。'],
  [409, 'Conflict', '请求与资源当前状态冲突（如并发写入）。'],
  [410, 'Gone', '资源已被永久删除且不再可用。'],
  [413, 'Payload Too Large', '请求体过大，超过服务端限制。'],
  [415, 'Unsupported Media Type', '请求的 Content-Type 不受支持。'],
  [422, 'Unprocessable Content', '语义错误，语法正确但无法处理。'],
  [429, 'Too Many Requests', '请求过于频繁，触发限流。'],
  [500, 'Internal Server Error', '服务端内部错误，通用错误兜底。'],
  [501, 'Not Implemented', '服务端不支持该请求所需的功能。'],
  [502, 'Bad Gateway', '网关从上游收到无效响应。'],
  [503, 'Service Unavailable', '服务暂时不可用，通常因过载或维护。'],
  [504, 'Gateway Timeout', '网关等待上游响应超时。'],
  [505, 'HTTP Version Not Supported', '服务端不支持请求使用的 HTTP 版本。']
]

const groupOf = code => (code < 200 ? 'info' : code < 300 ? 'success' : code < 400 ? 'redirect' : code < 500 ? 'client' : 'server')

const TONE = {
  info: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
  success: 'bg-teal/10 border-teal/30 text-teal',
  redirect: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  client: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
  server: 'bg-red-500/10 border-red-500/30 text-red-300'
}

const GROUP_LABEL = { info: '信息响应 1xx', success: '成功 2xx', redirect: '重定向 3xx', client: '客户端错误 4xx', server: '服务端错误 5xx' }

export default function HttpStatusTool() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STATUS.filter(([code, name, desc]) => {
      if (filter !== 'all' && groupOf(code) !== filter) return false
      if (!q) return true
      return String(code).includes(q) || name.toLowerCase().includes(q) || desc.includes(query.trim())
    })
  }, [query, filter])

  return (
    <div className="space-y-4">
      <Panel title="HTTP 状态码速查">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索状态码、名称或描述，如 404 / timeout / 重定向"
            className="flex-1 min-w-52 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-teal/60"
          />
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[['all', '全部'], ['info', '1xx'], ['success', '2xx'], ['redirect', '3xx'], ['client', '4xx'], ['server', '5xx']]}
          />
        </div>
      </Panel>

      <div className="space-y-2">
        {rows.map(([code, name, desc]) => (
          <div key={code} className={`border rounded-xl p-4 ${TONE[groupOf(code)]}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold font-mono flex-none w-14">{code}</span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{name}</div>
                <div className="text-sm opacity-80 mt-1">{desc}</div>
              </div>
              <span className="text-[11px] opacity-60 flex-none hidden sm:block">{GROUP_LABEL[groupOf(code)]}</span>
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="text-sm text-gray-500 bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          没有匹配的状态码。
        </div>
      )}
    </div>
  )
}
