import { useState } from 'react'
import { Panel } from './Panel'

export default function ImageWatermarkTool() {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('watermark')
  const [name, setName] = useState('')

  const onFile = e => {
    const f = e.target.files[0]
    if (!f) return
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
      // 半透明斜向水印
      ctx.font = `bold ${Math.max(16, img.width/20)}px sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.translate(img.width/2, img.height/2)
      ctx.rotate(-Math.PI/6)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 0, 0)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = (name ? name.replace(/\.[^.]+$/, '') : 'image') + '-watermark.png'
      a.click()
    }
    img.src = url
  }

  return (
    <div className="space-y-4">
      <Panel title="选择图片">
        <input type="file" accept="image/*" onChange={onFile}
          className="text-sm text-gray-400 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-teal file:text-gray-950 file:text-sm file:font-medium hover:file:bg-teal/90 cursor-pointer" />
      </Panel>
      <Panel title="水印文字">
        <input value={text} onChange={e => setText(e.target.value)}
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-teal/60" />
      </Panel>
      {url && (
        <div className="space-y-3">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-center">
            <img src={url} alt="预览" className="max-h-64 max-w-full object-contain rounded" />
          </div>
          <button onClick={download} className="px-4 py-2 rounded-lg text-sm font-medium bg-teal text-gray-950 hover:bg-teal/90 transition">下载带水印图片</button>
          <p className="text-xs text-gray-600">水印居中、半透明白色、-30° 斜向，尺寸随图片自适应。</p>
        </div>
      )}
    </div>
  )
}
