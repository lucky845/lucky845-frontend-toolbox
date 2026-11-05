import { useState } from 'react'
import { Panel } from './Panel'

export default function ImageCompressTool() {
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState(0.7)
  const [name, setName] = useState('')
  const [info, setInfo] = useState('')
  const [err, setErr] = useState('')

  const onFile = e => {
    const f = e.target.files[0]
    if (!f) return
    setErr('')
    setInfo('')
    setName(f.name)
    const reader = new FileReader()
    reader.onload = ev => setUrl(ev.target.result)
    reader.readAsDataURL(f)
  }

  const download = () => {
    if (!url) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const outUrl = canvas.toDataURL('image/jpeg', quality)
      const a = document.createElement('a')
      a.href = outUrl
      a.download = (name ? name.replace(/\.[^.]+$/, '') : 'compressed') + '.jpg'
      a.click()
      const orig = url.length
      const comp = outUrl.length
      setInfo(`原始 ${Math.round(orig*0.75)} KB → 压缩 ${Math.round(comp*0.75)} KB（约 ${Math.round(comp/orig*100)}%），质量 ${Math.round(quality*100)}%`)
    }
    img.src = url
  }

  return (
    <div className="space-y-4">
      <Panel title="选择图片">
        <input type="file" accept="image/*" onChange={onFile}
          className="text-sm text-gray-400 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-teal file:text-gray-950 file:text-sm file:font-medium hover:file:bg-teal/90 cursor-pointer" />
        {err && <p className="text-amber text-xs mt-2">{err}</p>}
      </Panel>
      <Panel title="压缩质量">
        <div className="flex items-center gap-4">
          <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(+e.target.value)} className="flex-1 accent-teal" />
          <span className="text-sm text-gray-300 w-12 text-right">{Math.round(quality*100)}%</span>
        </div>
      </Panel>
      {url && (
        <div className="space-y-3">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-center">
            <img src={url} alt="预览" className="max-h-64 max-w-full object-contain rounded" />
          </div>
          <button onClick={download} className="px-4 py-2 rounded-lg text-sm font-medium bg-teal text-gray-950 hover:bg-teal/90 transition">压缩并下载 JPEG</button>
          {info && <p className="text-xs text-gray-400">{info}</p>}
        </div>
      )}
    </div>
  )
}
