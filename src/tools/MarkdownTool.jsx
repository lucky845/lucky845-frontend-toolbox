import { useState } from 'react'
import { Panel } from './Panel'
import { renderMarkdown } from './markdown'

const DEFAULT = '# 标题\n\n**加粗** 和 *斜体* 和 `行内代码`\n\n- 列表项 1\n- 列表项 2\n\n> 引用块\n\n[链接文字](https://example.com)\n\n```js\nconst a = 1\n```\n'

export default function MarkdownTool() {
  const [text, setText] = useState(DEFAULT)

  return (
    <div className="grid grid-cols-2 gap-4">
      <Panel title="Markdown 源码">
        <textarea value={text} onChange={e => setText(e.target.value)} rows={24} spellCheck={false}
          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-sm text-gray-100 focus:outline-none focus:border-teal/60 resize-y" />
      </Panel>
      <Panel title="预览">
        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
      </Panel>
    </div>
  )
}
