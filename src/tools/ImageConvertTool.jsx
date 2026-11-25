import { useRef, useState } from 'react'
import { Panel, CopyBtn, Field, NumInput, Select, Check, Segmented, Stat, ErrorBar } from './Panel'

// 图片格式转换 + 尺寸调整
const FORMATS = [
  ['png', 'PNG（无损，支持透明）'],
  ['jpeg', 'JPEG（有损，体积小）'],
  ['webp', 'WebP（现代格式，体积最小）']
]

const toBytes = n => {
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1024 / 1024).toFixed(2) + ' MB'
}

export default function ImageConvertTool() {
  const [src, setSrc] = useState(null)          // dataURL
  const [info, setInfo] = useState(null)        // { name, type, size, w, h }
  const [format, setFormat] = useState('webp')
  const [quality, setQuality] = useState(0.9)
  const [scaleMode, setScaleMode] = useState('none')  // none / percent / max
  const [percent, setPercent] = useState(100)
  const [maxSide, setMaxSide] = useState(1280)
  const [keepRatio, setKeepRatio] = useState(true)
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [out, setOut] = useState(null)          // { url, size, w, h }
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  const pick = file => {
    if (!file) return
    setError('')
    setOut(null)
    if (!file.type.startsWith('image/')) { setError('请选择图片文件'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result
      const img = new Image()
      img.onload = () => {
        setSrc(url)
        setInfo({ name: file.name, type: file.type, size: file.size, w: img.width, h: img.height })
        setWidth(img.width)
        setHeight(img.height)
      }
      img.onerror = () => setError('图片解析失败')
      img.src = url
    }
    reader.readAsDataURL(file)
  }

  const convert = () => {
    if (!src || !info) return
    setBusy(true)
    setError('')
    const img = new Image()
    img.onload = () => {
      let w = info.w
      let h = info.h
      if (scaleMode === 'percent') {
        const r = Math.max(1, percent) / 100
        w = Math.round(info.w * r)
        h = Math.round(info.h * r)
      } else if (scaleMode === 'max') {
        const longest = Math.max(info.w, info.h)
        if (longest > maxSide) {
          const r = maxSide / longest
          w = Math.round(info.w * r)
          h = Math.round(info.h * r)
        }
      } else if (scaleMode === 'exact') {
        if (keepRatio) {
          const r = Math.min(width / info.w, height / info.h)
          w = Math.round(info.w * r)
          h = Math.round(info.h * r)
        } else {
          w = Math.max(1, width)
          h = Math.max(1, height)
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      // JPEG 不支持透明，先铺白底
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
      }
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, w, h)
      const mime = 'image/' + (format === 'jpeg' ? 'jpeg' : format)
      const url = canvas.toDataURL(mime, format === 'png' ? undefined : quality)
      const approxSize = Math.round((url.split(',')[1] || '').length * 0.75)
      setOut({ url, size: approxSize, w, h, mime })
      setBusy(false)
    }
    img.onerror = () => { setError('转换失败'); setBusy(false) }
    img.src = src
  }

  const reset = () => {
    setSrc(null); setInfo(null); setOut(null); setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <Panel title="选择图片">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={e => pick(e.target.files?.[0])}
          className="block w-full text-sm text-gray-400 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-teal file:text-gray-950 file:font-medium file:cursor-pointer hover:file:bg-teal/90"
        />
        <div className="mt-2 text-xs text-gray-500">支持 PNG / JPEG / WebP / GIF / SVG，图片仅在本地处理，不会上传。</div>
      </Panel>

      {error && <ErrorBar>{error}</ErrorBar>}

      {info && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="原始尺寸" value={`${info.w} × ${info.h}`} />
          <Stat label="原始体积" value={toBytes(info.size)} />
          <Stat label="格式" value={(info.type.split('/')[1] || '?').toUpperCase()} />
          <Stat label="文件名" value={info.name.length > 16 ? info.name.slice(0, 14) + '…' : info.name} />
        </div>
      )}

      {src && (
        <>
          <Panel title="转换参数">
            <div className="flex flex-wrap items-center gap-4">
              <Field label="输出格式">
                <Select value={format} onChange={setFormat} options={FORMATS.map(([v, l]) => [v, l])} />
              </Field>
              {format !== 'png' && (
                <Field label={`质量 ${Math.round(quality * 100)}%`}>
                  <input
                    type="range" min="0.1" max="1" step="0.05" value={quality}
                    onChange={e => setQuality(parseFloat(e.target.value))}
                    className="w-32 accent-teal"
                  />
                </Field>
              )}
            </div>

            <div className="mt-4">
              <Field label="尺寸调整">
                <Segmented
                  value={scaleMode}
                  onChange={setScaleMode}
                  options={[['none', '保持原尺寸'], ['percent', '按百分比'], ['max', '限制最长边'], ['exact', '指定宽高']]}
                />
              </Field>
            </div>

            {scaleMode === 'percent' && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                <span>缩放</span>
                <NumInput value={percent} onChange={v => setPercent(Number(v) || 100)} min={1} max={400} />
                <span>%</span>
                <span className="text-xs text-gray-600">
                  → {Math.round(info.w * percent / 100)} × {Math.round(info.h * percent / 100)}
                </span>
              </div>
            )}

            {scaleMode === 'max' && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                <span>最长边</span>
                <NumInput value={maxSide} onChange={v => setMaxSide(Number(v) || 1280)} min={16} max={10000} />
                <span>px</span>
              </div>
            )}

            {scaleMode === 'exact' && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                <span>宽</span>
                <NumInput value={width} onChange={v => setWidth(Number(v) || 1)} min={1} max={10000} />
                <span>高</span>
                <NumInput value={height} onChange={v => setHeight(Number(v) || 1)} min={1} max={10000} />
                <Check checked={keepRatio} onChange={setKeepRatio} label="保持宽高比" />
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={convert}
                disabled={busy}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-teal text-gray-950 hover:bg-teal/90 disabled:opacity-50 transition-colors"
              >
                {busy ? '处理中…' : '开始转换'}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                清空
              </button>
            </div>
          </Panel>

          <Panel title="预览">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-2">原始</div>
                <div className="rounded-lg overflow-hidden border border-gray-800 bg-[repeating-conic-gradient(#1f2937_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] flex items-center justify-center p-3">
                  <img src={src} alt="原始" className="max-h-56 max-w-full object-contain" />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2">转换结果</div>
                <div className="rounded-lg overflow-hidden border border-gray-800 bg-[repeating-conic-gradient(#1f2937_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] flex items-center justify-center p-3 min-h-56">
                  {out
                    ? <img src={out.url} alt="结果" className="max-h-56 max-w-full object-contain" />
                    : <span className="text-sm text-gray-600">点击「开始转换」</span>}
                </div>
              </div>
            </div>

            {out && (
              <>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="输出尺寸" value={`${out.w} × ${out.h}`} />
                  <Stat label="输出体积" value={toBytes(out.size)} />
                  <Stat label="体积变化" value={
                    out.size < info.size
                      ? `-${Math.round((1 - out.size / info.size) * 100)}%`
                      : `+${Math.round((out.size / info.size - 1) * 100)}%`
                  } />
                  <Stat label="输出格式" value={format.toUpperCase()} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href={out.url}
                    download={`${info.name.replace(/\.[^.]+$/, '')}-converted.${format === 'jpeg' ? 'jpg' : format}`}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-teal text-gray-950 hover:bg-teal/90 transition-colors"
                  >
                    下载图片
                  </a>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CopyBtn text={out.url} />
                    <span>复制 Data URL</span>
                  </div>
                </div>
              </>
            )}
          </Panel>
        </>
      )}
    </div>
  )
}
