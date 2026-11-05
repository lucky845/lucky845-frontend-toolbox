import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import { Panel } from './Panel'

const SIZE = 480

export default function QrTool() {
  const [text, setText] = useState('https://lucky845.top')
  const [size, setSize] = useState(12)
  const [dark, setDark] = useState('#000000')
  const [logo, setLogo] = useState(null)   // { dataUrl, name }
  const canvasRef = useRef(null)
  const fileRef = useRef(null)

  const draw = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const opts = { errorCorrectionLevel: logo ? 'H' : 'M', margin: 2, width: SIZE, color: { dark: dark, light: '#ffffff' } }
    await QRCode.toCanvas(canvas, text || ' ', opts)
    if (!logo) return
    // 叠 logo (await 加载完成再画, 避免 onload 时序)
    const img = new Image()
    img.src = logo.dataUrl
    await new Promise(r => { img.onload = r; img.onerror = r })
    const ctx = canvas.getContext('2d')
    const bs = SIZE * 0.2, pad = bs * 0.12
    const x = (SIZE - bs) / 2, y = (SIZE - bs) / 2
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(x - pad, y - pad, bs + pad * 2, bs + pad * 2, pad)
    ctx.fill()
    ctx.drawImage(img, x, y, bs, bs)
  }

  useEffect(() => { draw() }, [text, size, dark, logo])

  const onFile = e => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => setLogo({ dataUrl: r.result, name: f.name })
    r.readAsDataURL(f)
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = canvasRef.current.toDataURL('image/png')
    a.download = 'qrcode.png'
    a.click()
  }

  const inputCls = 'bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-teal/60'

  return (
    <div className="space-y-4">
      <Panel title="内容">
        <input value={text} onChange={e => setText(e.target.value)} spellCheck={false}
          placeholder="输入文本或 URL" className={'w-full ' + inputCls} />
      </Panel>
      <div className="grid grid-cols-2 gap-4">
        <Panel title="样式">
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="text-gray-400 text-xs block mb-1">前景色</span>
              <input type="color" value={dark} onChange={e => setDark(e.target.value)} className="w-full h-10 bg-gray-950 border border-gray-800 rounded-lg cursor-pointer" />
            </label>
            <label className="block text-sm">
              <span className="text-gray-400 text-xs block mb-1">Logo</span>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile}
                className="block w-full text-xs text-gray-400 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:bg-teal/20 file:text-teal file:border-0 file:text-sm file:cursor-pointer hover:file:bg-teal/30" />
              {logo && <span className="block mt-1 text-xs text-gray-500">{logo.name} <button className="text-red-400 underline ml-2" onClick={() => { setLogo(null); fileRef.current.value = '' }}>移除</button></span>}
            </label>
          </div>
        </Panel>
        <Panel title="预览">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white rounded-xl p-3 flex justify-center"><canvas ref={canvasRef} className="max-w-full h-auto" /></div>
            <button onClick={download} className="px-4 py-2 rounded-lg text-sm bg-teal/20 text-teal hover:bg-teal/30">下载 PNG</button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
