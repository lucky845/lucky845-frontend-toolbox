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
// 第二批新增工具
import DedupTool from './DedupTool'
import ReplaceTool from './ReplaceTool'
import EscapeTool from './EscapeTool'
import QueryTool from './QueryTool'
import JwtTool from './JwtTool'
import JsonTypeTool from './JsonTypeTool'
import SqlTool from './SqlTool'
import CurlTool from './CurlTool'
import UaTool from './UaTool'
import HttpStatusTool from './HttpStatusTool'
import DateCalcTool from './DateCalcTool'
import GradientTool from './GradientTool'
import ImagePaletteTool from './ImagePaletteTool'
import MockDataTool from './MockDataTool'
// 第三批新增工具
import MoneyTool from './MoneyTool'
import MaskTool from './MaskTool'
import ShadowTool from './ShadowTool'
import ImageConvertTool from './ImageConvertTool'
import { Icons } from './Icons'

// 板块定义：每类一个标题 + 工具列表
export const categories = [
  {
    id: 'text',
    name: '文本处理',
    icon: Icons.text,
    tools: [
      { id: 'case', name: '大小写转换', icon: Icons.text, component: CaseTool },
      { id: 'count', name: '文本统计', icon: Icons.count, component: CountTool },
      { id: 'lorem', name: '假文生成', icon: Icons.lorem, component: LoremTool },
      { id: 'markdown', name: 'Markdown 预览', icon: Icons.markdown, component: MarkdownTool },
      { id: 'dedup', name: '行去重排序', icon: Icons.dedup, component: DedupTool },
      { id: 'replace', name: '批量替换', icon: Icons.replace, component: ReplaceTool },
      { id: 'escape', name: '转义处理', icon: Icons.escape, component: EscapeTool },
      { id: 'mask', name: '文本脱敏', icon: Icons.mask, component: MaskTool },
      { id: 'money', name: '金额大写', icon: Icons.money, component: MoneyTool }
    ]
  },
  {
    id: 'encode',
    name: '编码转换',
    icon: Icons.base64,
    tools: [
      { id: 'base64', name: 'Base64 编解码', icon: Icons.base64, component: Base64Tool },
      { id: 'url', name: 'URL 编解码', icon: Icons.url, component: UrlTool },
      { id: 'query', name: 'URL 参数解析', icon: Icons.network, component: QueryTool },
      { id: 'uuid', name: 'UUID 生成', icon: Icons.uuid, component: UuidTool },
      { id: 'binary', name: '进制转换', icon: Icons.binary, component: BinaryTool },
      { id: 'jwt', name: 'JWT 解析', icon: Icons.key, component: JwtTool }
    ]
  },
  {
    id: 'format',
    name: '数据格式化',
    icon: Icons.json,
    tools: [
      { id: 'json', name: 'JSON 格式化', icon: Icons.json, component: JsonTool },
      { id: 'json-type', name: 'JSON 转类型', icon: Icons.layers, component: JsonTypeTool },
      { id: 'xml', name: 'XML 格式化', icon: Icons.xml, component: XmlTool },
      { id: 'yaml', name: 'YAML 转换', icon: Icons.text, component: YamlTool },
      { id: 'csv', name: 'CSV 转换', icon: Icons.table, component: CsvTool },
      { id: 'sql', name: 'SQL 格式化', icon: Icons.database, component: SqlTool },
      { id: 'hash', name: '哈希计算', icon: Icons.hash, component: HashTool }
    ]
  },
  {
    id: 'dev',
    name: '开发辅助',
    icon: Icons.regex,
    tools: [
      { id: 'regex', name: '正则测试', icon: Icons.regex, component: RegexTool },
      { id: 'curl', name: 'cURL 转代码', icon: Icons.terminal, component: CurlTool },
      { id: 'http-status', name: 'HTTP 状态码', icon: Icons.http, component: HttpStatusTool },
      { id: 'ua', name: 'UA 解析', icon: Icons.globe, component: UaTool },
      { id: 'css-unit', name: 'CSS 单位转换', icon: Icons.cssunit, component: CssUnitTool },
      { id: 'timestamp', name: '时间戳转换', icon: Icons.timestamp, component: TimestampTool },
      { id: 'date-calc', name: '日期计算', icon: Icons.timestamp, component: DateCalcTool },
      { id: 'cron', name: 'Cron 表达式', icon: Icons.cron, component: CronTool },
      { id: 'mock-data', name: '假数据生成', icon: Icons.file, component: MockDataTool }
    ]
  },
  {
    id: 'image',
    name: '图像处理',
    icon: Icons.compress,
    tools: [
      { id: 'qr', name: '二维码生成', icon: Icons.qr, component: QrTool },
      { id: 'image-compress', name: '图片压缩', icon: Icons.compress, component: ImageCompressTool },
      { id: 'image-watermark', name: '图片水印', icon: Icons.watermark, component: ImageWatermarkTool },
      { id: 'image-palette', name: '图片取色', icon: Icons.image, component: ImagePaletteTool },
      { id: 'gradient', name: '渐变生成', icon: Icons.gradient, component: GradientTool },
      { id: 'shadow', name: '阴影生成', icon: Icons.shadow, component: ShadowTool },
      { id: 'image-convert', name: '图片格式转换', icon: Icons.convert, component: ImageConvertTool }
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
