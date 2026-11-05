// 轻量 Markdown 解析器 (原生实现, 无依赖)
export function renderMarkdown(src) {
  if (!src) return ''
  const lines = src.split('\n')
  let html = ''
  let inCode = false, codeBuf = [], inList = false, inQuote = false

  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const inline = t => {
    let s = esc(t)
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>')
    s = s.replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>')
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-teal underline" target="_blank" rel="noopener">$1</a>')
    return s
  }
  const closeCode = () => { if (inCode) { html += '<pre class="bg-gray-950 border border-gray-800 rounded-lg p-3 overflow-x-auto text-xs"><code>' + esc(codeBuf.join('\n')) + '</code></pre>'; inCode = false; codeBuf = [] } }
  const closeList = () => { if (inList) { html += '</ul>'; inList = false } }
  const closeQuote = () => { if (inQuote) { html += '</blockquote>'; inQuote = false } }

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) closeCode(); else { closeList(); closeQuote(); inCode = true }
      continue
    }
    if (inCode) { codeBuf.push(line); continue }
    const heading = line.match(/^(#{1,6})\s+(.*)/)
    if (heading) {
      closeList(); closeQuote()
      const h = heading[1].length
      html += '<h' + h + ' class="mt-4 mb-2 font-bold text-gray-100">' + inline(heading[2]) + '</h' + h + '>'
      continue
    }
    if (/^---+$/.test(line)) { closeList(); closeQuote(); html += '<hr class="my-4 border-gray-700" />'; continue }
    if (/^>\s?/.test(line)) {
      closeList()
      if (!inQuote) { inQuote = true; html += '<blockquote class="border-l-4 border-teal pl-3 my-2 text-gray-300">' }
      else html += '<br/>'
      html += inline(line.replace(/^>\s?/, ''))
      continue
    }
    const li = line.match(/^[-*+]\s+(.*)/) || line.match(/^\d+\.\s+(.*)/)
    if (li) {
      closeQuote()
      if (!inList) { inList = true; html += '<ul class="list-disc pl-5 my-2 space-y-1">' }
      html += '<li>' + inline(li[1]) + '</li>'
      continue
    }
    if (!line.trim()) { closeList(); closeQuote(); html += '<div class="h-2"></div>'; continue }
    closeList(); closeQuote()
    html += '<p class="my-2 leading-relaxed">' + inline(line) + '</p>'
  }
  closeCode(); closeList(); closeQuote()
  return html
}
