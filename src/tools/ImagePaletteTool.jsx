import { useMemo, useRef, useState } from 'react'
import { Panel, Stat } from './Panel'

// 纯 Canvas 取色：上传的图片只在内存中解码，不会离开浏览器
const MAX_PREVIEW = 900

export default function ImagePaletteTool() {
  const [img, setImg] = useState(null)     // { url, w, h, name, size }
  const [error, setError] = useState('')
  const [colors, setColors] = useState([]) // [{ hex, rgb, ratio }]
  const [busy, setBusy] = useState(false)
  const [count, setCount] = useState(8)
  const [dragging, setDragging] = useState(false)
  const canvasRef = useRef(null)
  const inputRef = useRef(null)

  const pickImage = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('请选择图片文件'); return }
    setError('')
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      setImg({ url, w: image.naturalWidth, h: image.naturalHeight, name: file.name, size: file.size })
      extract(image)
    }
    image.onerror = () => { setError('图片解码失败'); URL.revokeObjectURL(url) }
    image.src = url
  }

  // 中位切分量化：把像素按 RGB 反复切分，得到有代表性的主色
  const extract = (image) => {
    setBusy(true)
    setTimeout(() => {
      try {
        const scale = Math.min(1, MAX_PREVIEW / Math.max(image.naturalWidth, image.naturalHeight))
        const w = Math.max(1, Math.round(image.naturalWidth * scale))
        const h = Math.max(1, Math.round(image.naturalHeight * scale))
        const canvas = canvasRef.current
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(image, 0, 0, w, h)
        const data = ctx.getImageData(0, 0, w, h).data

        const pixels = []
        let total = 0
        // 采样步进，避免大图卡顿
        const stepPx = Math.max(1, Math.floor((w * h) / 40000))
        for (let i = 0; i < data.length; i += 4 * stepPx) {
          const a = data[i + 3]
          if (a < 125) continue
          pixels.push([data[i], data[i + 1], data[i + 2]])
          total++
        }
        if (!pixels.length) { setError('图片没有可见像素'); setBusy(false); return }

        // 中位切分
        let buckets = [pixels]
        while (buckets.length < count) {
          // 找到像素数最多且范围最大的桶来切
          let target = -1
          let bestScore = 0
          buckets.forEach((bucket, i) => {
            if (bucket.length < 2) return
            const ranges = [0, 1, 2].map(ch => {
              let min = 255, max = 0
              for (const p of bucket) { if (p[ch] < min) min = p[ch]; if (p[ch] > max) max = p[ch] }
              return max - min
            })
            const score = Math.max(...ranges) * Math.log2(bucket.length + 1)
            if (score > bestScore) { bestScore = score; target = i }
          })
          if (target < 0) break
          const bucket = buckets[target]
          const ranges = [0, 1, 2].map(ch => {
            let min = 255, max = 0
            for (const p of bucket) { if (p[ch] < min) min = p[ch]; if (p[ch] > max) max = p[ch] }
            return { ch, range: max - min }
          })
          ranges.sort((a, b) => b.range - a.range)
          const ch = ranges[0].ch
          const sorted = [...bucket].sort((a, b) => a[ch] - b[ch])
          const mid = Math.floor(sorted.length / 2)
          buckets.splice(target, 1, sorted.slice(0, mid), sorted.slice(mid))
          buckets = buckets.filter(b => b.length > 0)
        }

        const result = buckets
          .map(bucket => {
            let r = 0, g = 0, b = 0
            for (const p of bucket) { r += p[0]; g += p[1]; b += p[2] }
            const n = bucket.length
            return { rgb: [Math.round(r / n), Math.round(g / n), Math.round(b / n)], n }
          })
          .sort((a, b) => b.n - a.n)
          .map(({ rgb, n }) => ({
            rgb,
            hex: '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase(),
            ratio: n / total
          }))

        setColors(result)
      } catch (e) {
        setError('提取失败：' + e.message)
      } finally {
        setBusy(false)
      }
    }, 0)
  }

  const totalRatio = useMemo(() => colors.reduce((s, c) => s + c.ratio, 0), [colors])
  const cssVars = useMemo(
    () => colors.map((c, i) => `  --palette-${i + 1}: ${c.hex};`).join('\n'),
    [colors]
  )

  const onDrop = e => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    pickImage(file)
  }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      <Panel title="选择图片">
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ' +
            (dragging ? 'border-teal bg-teal/5' : 'border-gray-700 hover:border-teal/50 hover:bg-gray-900/40')
          }
        >
          <div className="text-sm text-gray-300">拖拽图片到这里，或点击选择</div>
          <div className="text-xs text-gray-500 mt-1">支持 PNG / JPG / WebP / GIF，图片仅在本地处理</div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={e => pickImage(e.target.files?.[0])}
          className="hidden"
        />
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <span>主色数量</span>
            <input
              type="range"
              min={3}
              max={16}
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              onMouseUp={() => img && extractByUrl()}
              onTouchEnd={() => img && extractByUrl()}
              className="accent-teal w-32"
            />
            <span className="font-mono text-teal w-6">{count}</span>
          </label>
          {img && (
            <button
              onClick={extractByUrl}
              className="text-sm px-3 py-1.5 rounded-lg bg-teal/20 text-teal hover:bg-teal/30"
            >
              重新提取
            </button>
          )}
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </Panel>

      {img && (
        <Panel title="原图">
          <div className="flex flex-wrap items-start gap-4">
            <img src={img.url} alt={img.name} className="max-h-64 rounded-lg border border-gray-800" />
            <div className="text-xs text-gray-500 space-y-1">
              <div className="text-gray-300 text-sm break-all">{img.name}</div>
              <div>{img.w} × {img.h}</div>
              <div>{(img.size / 1024).toFixed(1)} KB</div>
              <div>{((img.w * img.h) / 1e6).toFixed(2)} 百万像素</div>
            </div>
          </div>
        </Panel>
      )}

      {busy && <div className="text-sm text-teal">正在分析颜色…</div>}

      {colors.length > 0 && (
        <>
          <Panel title="主色板">
            <div className="flex rounded-xl overflow-hidden border border-gray-800 h-16">
              {colors.map((c, i) => (
                <div
                  key={i}
                  style={{ background: c.hex, width: `${(c.ratio / totalRatio) * 100}%` }}
                  title={`${c.hex} · ${(c.ratio * 100).toFixed(1)}%`}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {colors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => navigator.clipboard?.writeText(c.hex).catch(() => {})}
                  className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg p-2 hover:border-teal/60 transition text-left"
                  title="点击复制"
                >
                  <span className="w-9 h-9 rounded-md flex-none border border-gray-800" style={{ background: c.hex }} />
                  <span className="min-w-0">
                    <span className="block font-mono text-xs text-teal">{c.hex}</span>
                    <span className="block text-[10px] text-gray-500 font-mono">
                      rgb({c.rgb.join(', ')})
                    </span>
                    <span className="block text-[10px] text-gray-600">{(c.ratio * 100).toFixed(1)}%</span>
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="CSS 变量">
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs font-mono text-teal whitespace-pre-wrap break-all">
{':root {\n' + cssVars + '\n}'}
            </pre>
            <div className="mt-2">
              <button
                onClick={() => navigator.clipboard?.writeText(':root {\n' + cssVars + '\n}')}
                className="text-xs px-3 py-1.5 rounded-lg bg-teal/20 text-teal hover:bg-teal/30"
              >
                复制全部变量
              </button>
            </div>
          </Panel>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Stat label="采样主色" value={colors.length} />
            <Stat label="图片尺寸" value={`${img.w}×${img.h}`} />
            <Stat label="文件大小" value={`${(img.size / 1024).toFixed(1)} KB`} />
          </div>
        </>
      )}
    </div>
  )

  // 重新用同地址图片提取（改数量时触发）
  function extractByUrl() {
    if (!img) return
    const image = new Image()
    image.onload = () => extract(image)
    image.src = img.url
  }
}
