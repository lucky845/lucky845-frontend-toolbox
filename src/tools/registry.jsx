// 工具注册表 - 集中管理所有工具，按板块分类
import JsonTool from './JsonTool'
import RegexTool from './RegexTool'
import Base64Tool from './Base64Tool'
import UrlTool from './UrlTool'
import ColorTool from './ColorTool'
import TimestampTool from './TimestampTool'
import QrTool from './QrTool'
import MarkdownTool from './MarkdownTool'
import PasswordTool from './PasswordTool'
import DiffTool from './DiffTool'
import CssUnitTool from './CssUnitTool'
import HashTool from './HashTool'
import UuidTool from './UuidTool'
import BinaryTool from './BinaryTool'
import CaseTool from './CaseTool'
import CountTool from './CountTool'
import LoremTool from './LoremTool'
import XmlTool from './XmlTool'
import CsvTool from './CsvTool'
import YamlTool from './YamlTool'
import CronTool from './CronTool'
import ImageCompressTool from './ImageCompressTool'
import ImageWatermarkTool from './ImageWatermarkTool'
import { Icons } from './Icons'

// 板块定义：每类一个标题 + 工具列表
export const categories = [
  {
    id: 'text',
    name: '文本处理',
    icon: Icons.text,
    tools: [
      { id: 'case', name: '大小写转换', icon: Icons.text, component: CaseTool },
      { id: 'count', name: '字数统计', icon: Icons.count, component: CountTool },
      { id: 'lorem', name: '假文生成', icon: Icons.lorem, component: LoremTool },
      { id: 'markdown', name: 'Markdown 预览', icon: Icons.markdown, component: MarkdownTool }
    ]
  },
  {
    id: 'encode',
    name: '编码转换',
    icon: Icons.base64,
    tools: [
      { id: 'base64', name: 'Base64 编解码', icon: Icons.base64, component: Base64Tool },
      { id: 'url', name: 'URL 编解码', icon: Icons.url, component: UrlTool },
      { id: 'uuid', name: 'UUID 生成', icon: Icons.uuid, component: UuidTool },
      { id: 'binary', name: '进制转换', icon: Icons.binary, component: BinaryTool }
    ]
  },
  {
    id: 'format',
    name: '数据格式化',
    icon: Icons.json,
    tools: [
      { id: 'json', name: 'JSON 格式化', icon: Icons.json, component: JsonTool },
      { id: 'xml', name: 'XML 格式化', icon: Icons.xml, component: XmlTool },
      { id: 'yaml', name: 'YAML 转换', icon: Icons.text, component: YamlTool },
      { id: 'csv', name: 'CSV 转换', icon: Icons.table, component: CsvTool },
      { id: 'hash', name: '哈希计算', icon: Icons.hash, component: HashTool }
    ]
  },
  {
    id: 'dev',
    name: '开发辅助',
    icon: Icons.regex,
    tools: [
      { id: 'regex', name: '正则测试', icon: Icons.regex, component: RegexTool },
      { id: 'css-unit', name: 'CSS 单位转换', icon: Icons.cssunit, component: CssUnitTool },
      { id: 'timestamp', name: '时间戳转换', icon: Icons.timestamp, component: TimestampTool },
      { id: 'cron', name: 'Cron 表达式', icon: Icons.cron, component: CronTool }
    ]
  },
  {
    id: 'image',
    name: '图像处理',
    icon: Icons.compress,
    tools: [
      { id: 'qr', name: '二维码生成', icon: Icons.qr, component: QrTool },
      { id: 'image-compress', name: '图片压缩', icon: Icons.compress, component: ImageCompressTool },
      { id: 'image-watermark', name: '图片水印', icon: Icons.watermark, component: ImageWatermarkTool }
    ]
  },
  {
    id: 'compare',
    name: '数据对比',
    icon: Icons.diff,
    tools: [
      { id: 'diff', name: '文本差异', icon: Icons.diff, component: DiffTool },
      { id: 'color', name: '颜色转换', icon: Icons.color, component: ColorTool },
      { id: 'password', name: '密码生成', icon: Icons.password, component: PasswordTool }
    ]
  }
]

// 拍平所有工具，供内部查找
export const tools = categories.flatMap(c => c.tools)
