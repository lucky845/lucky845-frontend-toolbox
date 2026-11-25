import { useMemo, useState } from 'react'
import { Panel, TextArea, CopyBtn, Check, ErrorBar, Segmented } from './Panel'

// ---------- 1. 把 JSON 值归纳成 schema 树 ----------
// schema: { kind: 'string'|'number'|'boolean'|'null'|'unknown'|'array'|'object'|'union', ... }
const schemaOf = (value) => {
  if (value === null) return { kind: 'null' }
  if (Array.isArray(value)) {
    return { kind: 'array', item: mergeAll(value.map(schemaOf)) }
  }
  if (typeof value === 'object') {
    const props = {}
    for (const [k, v] of Object.entries(value)) props[k] = schemaOf(v)
    return { kind: 'object', props, counts: Object.fromEntries(Object.keys(props).map(k => [k, 1])), total: 1 }
  }
  return { kind: typeof value }
}

// 合并多个 schema（数组元素可能类型不一致）
const mergeAll = (list) => {
  if (list.length === 0) return { kind: 'unknown' }
  if (list.length === 1) return list[0]
  const kinds = new Set(list.map(s => s.kind))
  kinds.delete('null')
  if (kinds.size === 0) return { kind: 'null' }
  if (kinds.size === 1) {
    const k = [...kinds][0]
    if (k === 'object') {
      const props = {}
      const counts = {}
      for (const s of list) {
        for (const [key, sub] of Object.entries(s.props)) {
          props[key] = props[key] ? mergeAll([props[key], sub]) : sub
          counts[key] = (counts[key] || 0) + 1
        }
      }
      return { kind: 'object', props, counts, total: list.length }
    }
    if (k === 'array') return { kind: 'array', item: mergeAll(list.map(s => s.item)) }
    return { kind: k }
  }
  // 混合类型：基础类型之间做联合，涉及对象则退化为 unknown
  if (kinds.has('object') || kinds.has('array')) return { kind: 'unknown' }
  return { kind: 'union', parts: [...kinds] }
}

const primitive = { string: 'string', number: 'number', boolean: 'boolean', null: 'null', unknown: 'unknown' }

// ---------- 2. TypeScript ----------
const tsRender = (s, indent, opts, key, isOpt, asInterface) => {
  const pad = '  '.repeat(indent)
  const ro = opts.readonly ? 'readonly ' : ''
  const opt = isOpt ? '?' : ''

  if (s.kind === 'object' && !asInterface && key !== undefined) {
    const body = Object.entries(s.props)
      .map(([k, sub]) => tsField(k, sub, indent + 1, opts, s))
      .join('\n')
    return `${pad}${ro}${safeKey(key)}${opt}: {\n${body}\n${pad}}`
  }
  return `${pad}${ro}${safeKey(key)}${opt}: ${tsType(s, indent, opts)}`
}

const tsField = (k, s, indent, opts, parent) => {
  const isOpt = opts.optional && parent && parent.total > 1 && parent.counts[k] < parent.total
  return tsRender(s, indent, opts, k, isOpt, false)
}

const tsType = (s, indent, opts) => {
  switch (s.kind) {
    case 'object': {
      const body = Object.entries(s.props).map(([k, sub]) => tsField(k, sub, indent + 1, opts, s)).join('\n')
      return `{\n${body}\n${'  '.repeat(indent)}}`
    }
    case 'array':
      return tsType(s.item, indent, opts) + '[]'
    case 'union':
      return s.parts.map(p => primitive[p] || 'unknown').join(' | ')
    default:
      return primitive[s.kind] || 'unknown'
  }
}

const safeKey = k => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k))

const buildTs = (root, name, opts) => {
  const exportKw = 'export '
  if (root.kind === 'object') {
    const body = Object.entries(root.props).map(([k, sub]) => tsField(k, sub, 1, opts, root)).join('\n')
    return `${exportKw}interface ${name} {\n${body}\n}`
  }
  return `${exportKw}type ${name} = ${tsType(root, 0, opts)}`
}

// ---------- 3. Go ----------
const goIdent = s => {
  const cleaned = String(s).replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
  const name = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  return /^[A-Za-z]/.test(name) ? name : 'F' + name
}

// 收集结构体定义，返回该 schema 对应的 Go 类型表达式
const goType = (s, hint, structs) => {
  switch (s.kind) {
    case 'string': return 'string'
    case 'number': return 'float64'
    case 'boolean': return 'bool'
    case 'null': return 'interface{}'
    case 'unknown': return 'interface{}'
    case 'union': return 'interface{}'
    case 'array': {
      const inner = goType(s.item, hint + 'Item', structs)
      return '[]' + inner
    }
    case 'object': {
      const name = hint
      const fields = Object.entries(s.props).map(([k, sub]) => {
        const goField = goIdent(k)
        const type = goType(sub, name + goField, structs)
        return `\t${goField} ${type} \`json:"${k}"\``
      })
      if (fields.length === 0) return 'map[string]interface{}'
      structs.unshift(`type ${name} struct {\n${fields.join('\n')}\n}`)
      return name
    }
    default:
      return 'interface{}'
  }
}

const buildGo = (root, name) => {
  const structs = []
  const rootType = goType(root, goIdent(name), structs)
  if (root.kind === 'object') return structs.join('\n\n')
  return structs.join('\n\n') + `\n\ntype ${goIdent(name)} ${rootType}`
}

// ---------- 4. Java ----------
const javaType = (s, hint, classes) => {
  switch (s.kind) {
    case 'string': return 'String'
    case 'number': return 'Double'
    case 'boolean': return 'Boolean'
    case 'array': return 'List<' + javaType(s.item, hint + 'Item', classes) + '>'
    case 'object': {
      const name = hint
      const fields = Object.entries(s.props).map(([k, sub]) => {
        const cls = javaType(sub, name + goIdent(k), classes)
        return `        private ${cls} ${k.replace(/[^A-Za-z0-9_]/g, '_')};`
      })
      classes.unshift(`    public static class ${name} {\n${fields.join('\n')}\n    }`)
      return name
    }
    default: return 'Object'
  }
}

const buildJava = (root, name) => {
  const className = goIdent(name)
  if (root.kind !== 'object') return `public class ${className} {\n    private ${javaType(root, className + 'Value', [])} value;\n}`
  const classes = []
  const body = Object.entries(root.props).map(([k, sub]) => {
    const cls = javaType(sub, className + goIdent(k), classes)
    return `    private ${cls} ${k.replace(/[^A-Za-z0-9_]/g, '_')};`
  }).join('\n')
  const inner = classes.length ? `\n\n${classes.join('\n\n')}` : ''
  return `public class ${className} {\n${body}${inner}\n}`
}

export default function JsonTypeTool() {
  const [input, setInput] = useState('')
  const [target, setTarget] = useState('ts')
  const [rootName, setRootName] = useState('Root')
  const [optional, setOptional] = useState(true)
  const [readonly, setReadonly] = useState(false)

  const parsed = useMemo(() => {
    if (!input.trim()) return { empty: true }
    try {
      return { value: JSON.parse(input) }
    } catch (e) {
      return { error: e.message }
    }
  }, [input])

  const output = useMemo(() => {
    if (parsed.error || parsed.empty) return ''
    const name = (rootName.trim() || 'Root').replace(/[^A-Za-z0-9_$]/g, '') || 'Root'
    const schema = schemaOf(parsed.value)
    try {
      if (target === 'ts') return buildTs(schema, name, { optional, readonly })
      if (target === 'go') return buildGo(schema, name)
      return buildJava(schema, name)
    } catch (e) {
      return '// 生成失败：' + e.message
    }
  }, [parsed, target, rootName, optional, readonly])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={target} onChange={setTarget} options={[['ts', 'TypeScript'], ['go', 'Go'], ['java', 'Java']]} />
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <span>根类型名</span>
          <input
            value={rootName}
            onChange={e => setRootName(e.target.value)}
            className="w-32 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-teal/60"
          />
        </label>
        {target === 'ts' && (
          <>
            <Check checked={optional} onChange={setOptional} label="非共有字段标记 ?" />
            <Check checked={readonly} onChange={setReadonly} label="readonly" />
          </>
        )}
      </div>

      <Panel title="JSON 输入">
        <TextArea
          value={input}
          onChange={setInput}
          rows={9}
          placeholder={'{\n  "id": 1,\n  "name": "lucky",\n  "tags": ["a", "b"],\n  "items": [{"sku": "A1", "price": 12.5}],\n  "profile": { "age": 30 }\n}'}
        />
      </Panel>

      {parsed.error && <ErrorBar>{'JSON 解析失败：' + parsed.error}</ErrorBar>}

      <Panel title="生成结果">
        <div className="relative">
          <TextArea value={output} onChange={() => {}} readOnly rows={16} />
          {output && <div className="absolute top-2 right-2"><CopyBtn text={output} /></div>}
        </div>
        {output && (
          <p className="mt-2 text-xs text-gray-500">
            {target === 'ts'
              ? 'Object 数组会取所有键的并集，未在每个元素中出现的键会自动加 ?。'
              : target === 'go'
                ? '嵌套对象拆成独立 struct，嵌套字段名按父名+子名拼接避免重名。'
                : '嵌套对象生成 public static class，数组映射为 List<>。'}
          </p>
        )}
      </Panel>
    </div>
  )
}
