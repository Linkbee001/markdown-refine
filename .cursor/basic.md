# Buity-Create 项目文档

## 项目概述

Buity-Create 是一个基于 Next.js 框架开发的 Markdown 美化工具，它能够将用户输入的 Markdown 内容转换为美观、适合移动设备显示的 HTML 内容。项目利用 AI 技术（通过 OpenRouter API 与 Anthropic Claude 模型集成）来智能地将基础 HTML 美化为符合用户指定风格的内容，并保持内容在富文本编辑器中的兼容性。

### 核心功能

1. **Markdown 编辑与预览**：用户可以输入 Markdown 内容并实时预览
2. **风格定制**：用户可以通过文本提示描述期望的风格（如"暗色主题"、"科技蓝"等）
3. **AI 美化**：利用 LLM 模型将基础 HTML 转换为美观、风格化的 HTML
4. **移动端预览**：在界面右侧展示模拟移动设备的预览效果
5. **HTML 复制**：一键复制美化后的 HTML 代码，方便粘贴到其他富文本编辑器

### 目标用户

- 博客作者、内容创作者
- 需要将文本内容分享到各类平台的用户
- 开发人员和设计师，需要快速生成美观 HTML 内容的人群

## 项目结构

```
/
├── .next/                    # Next.js 构建文件
├── node_modules/             # 项目依赖
├── public/                   # 静态资源文件
├── src/                      # 源代码目录
│   ├── app/                  # Next.js App Router 目录
│   │   ├── api/              # API 路由目录
│   │   │   └── beautify/     # 美化 API 端点
│   │   │       └── route.js  # 美化处理逻辑
│   │   ├── page.js           # 主页面组件
│   │   ├── layout.js         # 应用布局组件
│   │   ├── globals.css       # 全局样式
│   │   └── favicon.ico       # 网站图标
│   └── prompts/              # 提示模板目录
│       └── beautifySystemPrompt.js  # 美化系统提示模板
├── package.json              # 项目配置和依赖
├── pnpm-lock.yaml            # 依赖锁定文件
├── pnpm-workspace.yaml       # 工作区配置文件
├── jsconfig.json             # JavaScript 配置
├── postcss.config.mjs        # PostCSS 配置
├── next.config.mjs           # Next.js 配置
├── eslint.config.mjs         # ESLint 配置
└── .env.local                # 环境变量（包含 API 密钥）
```

## 技术栈

- **前端框架**：Next.js 15.3.1（使用 App Router）
- **UI 组件**：
  - React 19.0.0
  - Tailwind CSS 4.0
  - 动态导入的 @uiw/react-md-editor（Markdown 编辑器）
- **后端/API**：
  - Next.js API Routes
  - LangChain.js（@langchain/langgraph、@langchain/core、@langchain/openai）
  - Marked（Markdown 解析器）
- **AI 集成**：
  - OpenRouter API 连接 Anthropic Claude 3.7 Sonnet 模型
- **包管理**：pnpm 10.8.1

## 逻辑流程

### 用户交互流程

1. 用户在左侧编辑器中输入 Markdown 内容
2. 用户输入风格提示（例如"暗色主题"、"科技蓝"）
3. 用户点击"AI 美化"按钮触发处理
4. 系统处理完成后在右侧显示美化后的 HTML 预览
5. 用户可以点击"复制 HTML"按钮获取美化后的代码

### 后端处理流程（LangGraph）

美化 API 使用 LangChain 的 LangGraph 构建工作流：

1. **解析 Markdown**（`parse_markdown` 节点）：
   - 接收用户提交的 Markdown 文本
   - 使用 Marked 库将 Markdown 转换为基础 HTML
   - 清理可能的安全风险（如去除 script 标签）

2. **美化 HTML**（`beautify_html` 节点）：
   - 使用 OpenRouter API 连接 Claude 3.7 Sonnet 模型
   - 传入包含用户风格提示和基础 HTML 的系统提示
   - LLM 模型生成内联样式美化的 HTML

3. **完成文档**（`finalize_html` 节点）：
   - 将美化后的 HTML 片段包装到完整 HTML 文档中
   - 添加基础 CSS 样式，确保移动端兼容性
   - 返回最终的 HTML 文档

### 系统提示设计策略

美化过程中使用的系统提示（`beautifySystemPrompt.js`）遵循以下原则：

1. **移动优先**：设计优先考虑小屏幕设备的阅读体验
2. **内容与结构保真**：禁止修改 HTML 标签结构和文本内容
3. **富文本编辑器兼容性**：确保生成的 HTML 在主流富文本编辑器中正确显示
4. **用户风格遵循**：根据用户描述选择合适的样式属性
5. **特殊元素处理**：对代码块、图片、链接等元素进行特殊处理
6. **装饰限制**：通过边框、背景色和有限的 SVG 图案提供装饰效果

## 部署和环境配置

项目需要以下环境变量：

- `OPENROUTER_API_KEY`：OpenRouter API 密钥
- `NEXT_PUBLIC_APP_URL`：应用 URL（用于 API 请求）
- `NEXT_PUBLIC_APP_NAME`：应用名称（用于 API 请求）

## 未来扩展方向

1. **更多风格模板**：预设常用风格模板
2. **样式保存**：允许用户保存和复用自定义样式
3. **扩展导出格式**：支持导出为PDF或其他格式
4. **多语言支持**：增加多语言界面
5. **批量处理**：支持批量文档处理功能 