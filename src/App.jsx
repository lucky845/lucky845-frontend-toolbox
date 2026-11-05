import { useEffect, useRef, useState } from 'react'
import { categories, tools } from './tools/registry'
import { Icons } from './tools/Icons'

export default function App() {
  const [active, setActive] = useState('json')
  const activeTool = tools.find(t => t.id === active)
  const total = tools.length
  const mainRef = useRef(null)

  // 切换工具时主工作区回到顶部，避免停留在一屏内容中段
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [active])

  return (
    // 整页锁定视口高度：header/footer 固定，中间左右两栏各自独立滚动
    <div className="h-screen supports-[height:100dvh]:h-dvh flex flex-col bg-base overflow-hidden">
      <header className="flex-none border-b border-gray-800 px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <h1 className="text-lg md:text-xl font-bold truncate">
          <span className="text-teal">前端</span>工具箱
          <span className="text-gray-500 text-sm ml-3 font-normal hidden sm:inline">纯本地 · 无上传 · 隐私安全</span>
        </h1>
        <div className="flex-none flex items-center gap-2 md:gap-3">
          <span className="hidden sm:inline text-xs text-gray-500">{total} 个工具 · {categories.length} 个板块</span>
          <a
            href="https://github.com/lucky845/lucky845-frontend-toolbox"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub 源码 · 欢迎 Star"
            aria-label="GitHub 源码"
            className="w-8 h-8 rounded-lg bg-gray-800/60 text-gray-400 flex items-center justify-center border border-gray-700/60 hover:bg-gray-700/60 hover:text-teal hover:border-teal/40 transition"
          >
            {Icons.github}
          </a>
          <a
            href="https://lucky845.top"
            target="_blank"
            rel="noopener noreferrer"
            title="作者主站 lucky845.top"
            aria-label="作者主站"
            className="h-8 px-2.5 rounded-lg bg-gray-800/60 text-gray-400 flex items-center gap-1.5 border border-gray-700/60 hover:bg-gray-700/60 hover:text-teal hover:border-teal/40 transition"
          >
            {Icons.globe}
            <span className="text-xs hidden md:inline">lucky845.top</span>
          </a>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <nav className="w-16 md:w-60 flex-none border-r border-gray-800 py-4 px-2 md:px-3 space-y-5 overflow-y-auto overscroll-contain">
          {categories.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center justify-center md:justify-start gap-2 px-0 md:px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <span className="w-4 h-4 flex-none">{cat.icon}</span>
                <span className="hidden md:inline truncate">{cat.name}</span>
              </div>
              <div className="space-y-0.5">
                {cat.tools.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    title={t.name}
                    className={`w-full text-left px-1.5 md:px-2.5 py-2 rounded-lg text-sm flex items-center justify-center md:justify-start gap-2.5 group transition
                      ${active === t.id
                        ? 'bg-teal/10 text-teal border border-teal/25'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'}`}
                  >
                    <span className={`w-7 h-7 flex-none rounded-lg flex items-center justify-center transition
                      ${active === t.id ? 'bg-teal/20 text-teal' : 'bg-gray-800/60 text-gray-400 group-hover:bg-gray-700/60'}`}>
                      {t.icon}
                    </span>
                    <span className="truncate hidden md:inline">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* 右栏独立滚动容器：左侧导航滚动时右侧完全不动 */}
        <main ref={mainRef} className="flex-1 min-w-0 overflow-y-auto overscroll-contain p-4 md:p-6">
          <div className="max-w-5xl">
            {activeTool && <activeTool.component />}
          </div>
        </main>
      </div>

      <footer className="flex-none border-t border-gray-800 py-3 text-center text-xs text-gray-600">
        所有数据在浏览器本地处理，不会上传到任何服务器 · Apache 2.0 License
      </footer>
    </div>
  )
}
