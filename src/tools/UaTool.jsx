import { useMemo, useState } from 'react'
import { Panel, CopyBtn, ErrorBar } from './Panel'

// 常见 UA 模拟，用于查看不同设备下的 header 行为（纯本地展示）
const PRESETS = [
  { id: 'chrome-win', label: 'Chrome / Windows 11', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', platform: 'Win32', vendor: 'Google Inc.', mobile: false },
  { id: 'safari-mac', label: 'Safari / macOS', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15', platform: 'MacIntel', vendor: 'Apple Computer, Inc.', mobile: false },
  { id: 'chrome-android', label: 'Chrome / Android', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', platform: 'Linux armv81', vendor: 'Google Inc.', mobile: true },
  { id: 'safari-ios', label: 'Safari / iPhone', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1', platform: 'iPhone', vendor: 'Apple Computer, Inc.', mobile: true },
  { id: 'wechat', label: '微信内置浏览器', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x18003128) NetType/WIFI Language/zh_CN', platform: 'iPhone', vendor: 'Apple Computer, Inc.', mobile: true },
  { id: 'edge-win', label: 'Edge / Windows 11', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0', platform: 'Win32', vendor: 'Google Inc.', mobile: false }
]

const parseUA = ua => {
  const info = { browser: '', browserVersion: '', engine: '', os: '', osVersion: '', device: '', arch: '' }
  const grab = re => { const m = ua.match(re); return m ? m[1] : '' }

  if (/MicroMessenger/i.test(ua)) { info.browser = '微信浏览器'; info.browserVersion = grab(/MicroMessenger\/([\d.]+)/i) }
  else if (/Edg\//i.test(ua)) { info.browser = 'Edge'; info.browserVersion = grab(/Edg\/([\d.]+)/i) }
  else if (/OPR\//i.test(ua)) { info.browser = 'Opera'; info.browserVersion = grab(/OPR\/([\d.]+)/i) }
  else if (/Firefox\//i.test(ua)) { info.browser = 'Firefox'; info.browserVersion = grab(/Firefox\/([\d.]+)/i) }
  else if (/Chrome\//i.test(ua)) { info.browser = 'Chrome'; info.browserVersion = grab(/Chrome\/([\d.]+)/i) }
  else if (/Version\/[\d.]+.*Safari/i.test(ua)) { info.browser = 'Safari'; info.browserVersion = grab(/Version\/([\d.]+)/i) }
  else { info.browser = '未知' }

  if (/AppleWebKit/i.test(ua)) info.engine = 'WebKit / Blink'
  if (/Gecko\/20100101/i.test(ua)) info.engine = 'Gecko'
  if (/Trident/i.test(ua)) info.engine = 'Trident'

  if (/iPhone|iPad|iPod/i.test(ua)) {
    info.os = 'iOS / iPadOS'
    info.osVersion = grab(/OS ([\d_]+)/).replace(/_/g, '.')
    info.device = /iPad/i.test(ua) ? 'iPad' : /iPod/i.test(ua) ? 'iPod' : 'iPhone'
  } else if (/Android/i.test(ua)) {
    info.os = 'Android'
    info.osVersion = grab(/Android ([\d.]+)/i)
    info.device = grab(/Android [\d.]+; ([^;)]+)/i) || 'Android'
  } else if (/Windows NT/i.test(ua)) {
    info.os = 'Windows'
    const nt = grab(/Windows NT ([\d.]+)/i)
    info.osVersion = { '10.0': '10 / 11', 6.3: '8.1', 6.2: '8', 6.1: '7' }[nt] || nt
    info.device = 'PC'
  } else if (/Mac OS X/i.test(ua)) {
    info.os = 'macOS'
    info.osVersion = grab(/Mac OS X ([\d_]+)/).replace(/_/g, '.')
    info.device = 'Mac'
  } else if (/Linux/i.test(ua)) {
    info.os = 'Linux'
    info.device = 'PC'
  }

  if (/arm64|aarch64/i.test(ua)) info.arch = 'ARM64'
  else if (/x86_64|Win64|x64/i.test(ua)) info.arch = 'x86_64'
  else if (/x86/i.test(ua)) info.arch = 'x86'
  return info
}

export default function UaTool() {
  const [preset, setPreset] = useState('chrome-win')
  const [custom, setCustom] = useState('')
  const current = custom.trim() || PRESETS.find(p => p.id === preset)?.ua || ''
  const parsed = useMemo(() => (current ? parseUA(current) : null), [current])

  return (
    <div className="space-y-4">
      <Panel title="选择预设">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => { setPreset(p.id); setCustom('') }}
              className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                preset === p.id && !custom.trim()
                  ? 'bg-teal/15 text-teal border-teal/30'
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="User-Agent 字符串">
        <div className="relative">
          <textarea
            value={custom || current}
            onChange={e => setCustom(e.target.value)}
            rows={4}
            spellCheck={false}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-xs text-gray-100 focus:outline-none focus:border-teal/60 resize-y"
          />
          <div className="absolute top-2 right-2"><CopyBtn text={custom || current} /></div>
        </div>
        <p className="mt-2 text-xs text-gray-500">直接在上面编辑即可解析任意 UA（覆盖当前预设）。</p>
      </Panel>

      {parsed && (
        <Panel title="解析结果">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['浏览器', parsed.browser + (parsed.browserVersion ? ' ' + parsed.browserVersion.split('.')[0] : '')],
              ['操作系统', parsed.os],
              ['系统版本', parsed.osVersion || '—'],
              ['设备', parsed.device || '—'],
              ['渲染引擎', parsed.engine || '—'],
              ['架构', parsed.arch || '—']
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2">
                <div className="text-[11px] text-gray-500">{label}</div>
                <div className="text-sm text-teal font-medium truncate" title={String(value)}>{value}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {!parsed && <ErrorBar>请输入或选择一段 User-Agent。</ErrorBar>}
    </div>
  )
}
