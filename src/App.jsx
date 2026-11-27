import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { categories, tools } from './tools/registry'
import { Icons } from './tools/Icons'

export default function App() {
  const { t: translate, i18n } = useTranslation()
  const [active, setActive] = useState('json')
  const activeTool = tools.find(tool => tool.id === active)
  const total = tools.length
  const mainRef = useRef(null)

  // 切换工具时主工作区回到顶部，避免停留在一屏内容中段
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [active])

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('i18n-lng', lng)
  }

  return (
    // 整页锁定视口高度：header/footer 固定，中间左右两栏各自独立滚动
    <div className="h-screen supports-[height:100dvh]:h-dvh flex flex-col bg-base overflow-hidden">
      <header className="flex-none border-b border-gray-800 px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <h1 className="text-lg md:text-xl font-bold truncate">
          <span className="text-teal">{translate('app.title')}</span>
          <span className="text-gray-500 text-sm ml-3 font-normal hidden sm:inline">{translate('app.subtitle')}</span>
        </h1>
        <div className="flex-none flex items-center gap-2 md:gap-3">
          <span className="hidden sm:inline text-xs text-gray-500">{translate('app.toolCount', { toolCount: tools.length, categoryCount: categories.length })}</span>
          
          {/* 语言切换器 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => changeLanguage('zh')}
              className={`px-2 py-1 rounded text-xs transition ${
                i18n.language === 'zh'
                  ? 'bg-teal/20 text-teal border border-teal/30'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
              }`}
              aria-label="中文"
            >
              中文
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 rounded text-xs transition ${
                i18n.language === 'en'
                  ? 'bg-teal/20 text-teal border border-teal/30'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
              }`}
              aria-label="English"
            >
              EN
            </button>
          </div>

          <a
            href="https://github.com/lucky845/lucky845-frontend-toolbox"
            target="_blank"
            rel="noopener noreferrer"
            title={translate('app.githubTooltip')}
            aria-label={translate('app.githubTooltip')}
            className="w-8 h-8 rounded-lg bg-gray-800/60 text-gray-400 flex items-center justify-center border border-gray-700/60 hover:bg-gray-700/60 hover:text-teal hover:border-teal/40 transition"
          >
            {Icons.github}
          </a>
          <a
            href="https://lucky845.top"
            target="_blank"
            rel="noopener noreferrer"
            title={translate('app.siteTooltip')}
            aria-label={translate('app.siteTooltip')}
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
                <span className="hidden md:inline truncate">{translate(`categories.${cat.id}`)}</span>
              </div>
              <div className="space-y-0.5">
                {cat.tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setActive(tool.id)}
                    title={translate(`tools.${tool.id}.name`)}
                    className={`w-full text-left px-1.5 md:px-2.5 py-2 rounded-lg text-sm flex items-center justify-center md:justify-start gap-2.5 group transition
                      ${active === tool.id
                        ? 'bg-teal/10 text-teal border border-teal/25'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'}`}
                  >
                    <span className={`w-7 h-7 flex-none rounded-lg flex items-center justify-center transition
                      ${active === tool.id ? 'bg-teal/20 text-teal' : 'bg-gray-800/60 text-gray-400 group-hover:bg-gray-700/60'}`}>
                      {tool.icon}
                    </span>
                    <span className="truncate hidden md:inline">{translate(`tools.${tool.id}.name`)}</span>
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
        {translate('app.footer')}
      </footer>
    </div>
  )
}
