# 🧰 前端工具箱 Frontend Toolbox

> 纯前端 · 本地运行 · 零上传 · 隐私安全 —— 一站式 Web 开发小工具集

一个完全在浏览器本地运行的开发工具集合。所有数据在你的浏览器中处理，**不上传任何服务器**，隐私绝对安全。部署到 GitHub Pages 即可免费使用。

**🔗 在线使用：[frontend-toolbox.lucky845.top](https://frontend-toolbox.lucky845.top)**

![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white) ![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-4.3-38BDF8?logo=tailwindcss&logoColor=white) ![License](https://img.shields.io/badge/License-Apache--2.0-blue) ![Tools](https://img.shields.io/badge/Tools-23-4EC2C6)

---

## ✨ 特性

- **纯本地运行** —— 无后端、无上传，数据不出浏览器
- **离线可用** —— 部署后静态托管，无需任何服务器
- **隐私安全** —— 图片、文本、密钥全程本地处理
- **深色护眼主题** —— 底 #0C1216 / 强调 #4EC2C6
- **按板块分类** —— 6 大板块，23 个工具，一目了然

---

## 🗂️ 功能一览

### 📝 文本处理
| 工具 | 说明 |
| --- | --- |
| 大小写转换 | 小写/大写/标题/驼峰/帕斯卡/下划线/短横线/反转 |
| 字数统计 | 字符/单词/行/汉字/标点/字节实时统计 |
| 假文生成 | Lorem Ipsum 占位文本，可调段落数 |
| Markdown 预览 | 轻量原生解析 + 实时渲染 |

### 🔤 编码转换
| 工具 | 说明 |
| --- | --- |
| Base64 编解码 | 支持中文 (UTF-8) |
| URL 编解码 | encodeURIComponent / decodeURIComponent |
| UUID 生成 | v4 随机 / v7 时间戳，批量 + 大小写 |
| 进制转换 | 2-36 任意进制，BigInt 无精度丢失 |

### 📦 数据格式化
| 工具 | 说明 |
| --- | --- |
| JSON 格式化 | 校验 + 格式化/压缩 |
| XML 格式化 | 格式化/压缩 |
| YAML 转换 | JSON ↔ YAML 互转 |
| CSV 转换 | CSV ↔ JSON 互转 |
| 哈希计算 | MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512 |

### 🛠️ 开发辅助
| 工具 | 说明 |
| --- | --- |
| 正则测试 | 实时匹配 + 高亮结果 |
| CSS 单位转换 | px/rem/em/pt/vw/vh/vmin/vmax/% 互转 |
| 时间戳转换 | 秒/毫秒与日期互转 |
| Cron 表达式 | 解析并描述执行周期 |

### 🖼️ 图像处理
| 工具 | 说明 |
| --- | --- |
| 二维码生成 | 纯 Canvas 生成 + Logo 上传 + PNG 下载 |
| 图片压缩 | Canvas 重采样，质量可调，JPEG 导出 |
| 图片水印 | 居中半透明斜向水印，PNG 导出 |

### ⚖️ 数据对比
| 工具 | 说明 |
| --- | --- |
| 文本差异 | 行级 LCS diff，绿增红删 + 统计 |
| 颜色转换 | HEX / RGB / HSL 互转 |
| 密码生成 | 长度/字符类型/强度可调，安全密码 |

---

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖（若默认 npm cache 报 EPERM，加 --cache /tmp/npmcache）
npm install --cache /tmp/npmcache

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 本地预览构建产物
npm run preview
```

### 部署到 GitHub Pages

1. 把代码推送到 GitHub 仓库（main 分支）
2. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**
3. 推送后 `.github/workflows/deploy.yml` 自动构建并部署
4. 默认地址：`https://<用户名>.github.io/<仓库名>/`

> 已配置 `base: './'` 相对路径，部署到子路径或独立域名都能正常工作。

### 绑定自定义域名（Cloudflare + GitHub Pages）

本项目已内置 `public/CNAME`，内容为：

```
frontend-toolbox.lucky845.top
```

构建时 Vite 会把它复制到 `dist/CNAME`，GitHub Pages 据此识别自定义域名。完整步骤：

**① 仓库侧**：Settings → Pages → Custom domain 填入 `frontend-toolbox.lucky845.top`，保存后勾选 **Enforce HTTPS**（首次签发证书需等几分钟）。

**② Cloudflare DNS**（域名托管在 CF 时）：

| 类型 | 名称 | 内容 | 代理状态 |
| --- | --- | --- | --- |
| CNAME | `frontend-toolbox` | `lucky845.github.io` | **仅 DNS**（灰色云朵，必须先关代理） |

> ⚠️ 关键点：CNAME 目标必须填 GitHub 的用户主页域名（`<用户名>.github.io`），不能填仓库地址；开启橙色云朵（代理）时 GitHub 无法签发证书，等 GitHub 侧 HTTPS 生效后再按需开启代理，SSL 模式选 **Full** 或 **Full (strict)**。

**③ 验证**：`dig frontend-toolbox.lucky845.top CNAME +short` 应返回 `lucky845.github.io.`，随后访问 `https://frontend-toolbox.lucky845.top` 即可。

---

## 🧱 技术栈

| 技术 | 用途 |
| --- | --- |
| Vite 7 | 构建工具 |
| React 19 | UI 框架 |
| Tailwind CSS 4 | 样式 |
| qrcode | 二维码生成 |

---

## 📁 项目结构

```
lucky845-frontend-toolbox/
├── src/
│   ├── tools/          # 所有工具组件
│   │   ├── registry.jsx  # 工具注册表（板块分类）
│   │   ├── Icons.jsx     # 统一 SVG 图标系统
│   │   └── Panel.jsx     # 公用组件
│   ├── App.jsx         # 主布局（左侧分类导航）
│   └── main.jsx
├── public/
│   ├── CNAME         # 自定义域名（GitHub Pages）
│   └── favicon.svg   # 站点图标
├── .github/workflows/ # GitHub Actions 部署
└── index.html
```

---

## 📄 License

本项目基于 [Apache License 2.0](./LICENSE) 开源。

---

## 🤝 贡献

欢迎提交 Issue 和 PR。如果你有想新增的工具或改进建议，欢迎参与。

> **Privacy-first**：请确保新增工具也遵守「纯前端、零上传」的核心理念。
