# Markdown 美化器 (Markdown Beautifier)

<p align="center">
  <img src="public/logo.png" alt="Markdown Beautifier Logo" width="200" height="200" />
</p>

<p align="center">
  <a href="README.md">中文</a> | <a href="README.en.md">English</a>
</p>

一个强大的 Markdown 美化工具，使用 AI 技术帮助你优化 Markdown 文档的格式与样式，使其更加专业和美观。

## ✨ 功能特性

- 🤖 **AI 驱动美化**：使用人工智能优化 Markdown 格式与表现
- 🎨 **样式编辑器**：可视化编辑 HTML 元素样式，调整排版、颜色和布局
- 📱 **响应式设计**：完美适配桌面和移动设备
- 🌐 **国际化支持**：支持中文和英文界面
- 📤 **多格式导出**：导出为 HTML、Markdown 和图片格式
- 🔄 **实时预览**：即时查看美化效果
- 🧩 **组件化布局**：灵活调整文档结构
- 📊 **内容大纲**：自动生成文档结构大纲

## 🛠️ 技术栈

- [Next.js](https://nextjs.org/) - React 框架
- [React](https://reactjs.org/) - 用户界面库
- [Material UI](https://mui.com/) - UI 组件库
- [OpenRouter](https://openrouter.ai/) / [OpenAI](https://openai.com/) / [Anthropic](https://www.anthropic.com/) - 提供AI模型支持

## 📦 安装

1. 克隆仓库

```bash
git clone https://github.com/username/markdown-beautifier.git
cd markdown-beautifier
```

2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. 创建环境变量文件

复制示例环境变量文件并根据需要修改：

```bash
cp .env.example .env.local
```

请确保至少配置了必要的 API 密钥:
- 对于前端：`NEXT_PUBLIC_AI_API_KEY`
- 对于后端：`AI_API_KEY`

如果环境中没有示例文件，可以手动创建 `.env.local`，包含以下内容：

```
# 后端LLM相关配置
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://openrouter.ai/api/v1
AI_DEFAULT_MODEL=anthropic/claude-3.7-sonnet
AI_FALLBACK_MODEL=anthropic/claude-3-haiku
AI_OUTLINE_MODEL=anthropic/claude-3.7-sonnet
AI_DEFAULT_TEMPERATURE=0.1
AI_OUTLINE_TEMPERATURE=0.0

# 前端AI API配置
NEXT_PUBLIC_AI_API_URL=https://api.openrouter.ai/api/v1/chat/completions
NEXT_PUBLIC_AI_API_KEY=your_api_key_here
NEXT_PUBLIC_AI_MODEL_NAME=anthropic/claude-3-haiku-20240307
NEXT_PUBLIC_AI_MAX_TOKENS=4000
NEXT_PUBLIC_AI_TEMPERATURE=0.7

# 应用信息
NEXT_PUBLIC_APP_NAME=Markdown Beautifier
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

5. 访问 [http://localhost:3000](http://localhost:3000) 查看应用

## 🚀 使用方法

1. 在主编辑器中输入或粘贴 Markdown 内容
2. 输入样式提示（例如："使用简洁专业的技术博客风格..."）
3. 点击 "AI 美化" 按钮
4. 查看美化后的结果并根据需要调整样式
5. 导出为所需格式（HTML、图片或 Markdown）

## ⚙️ 配置

### AI API 配置

本项目使用外部 AI API 服务实现 Markdown 美化功能。您需要在 `.env.local` 文件中配置以下 AI 相关的环境变量：

```
# AI API 配置
NEXT_PUBLIC_AI_API_URL=https://api.openrouter.ai/api/v1/chat/completions  # AI API 端点
NEXT_PUBLIC_AI_API_KEY=your_api_key_here  # API 密钥
NEXT_PUBLIC_AI_MODEL_NAME=anthropic/claude-3-haiku-20240307  # 默认模型名称
NEXT_PUBLIC_AI_MAX_TOKENS=4000  # 最大输出令牌数
NEXT_PUBLIC_AI_TEMPERATURE=0.7  # 温度参数，控制输出随机性
NEXT_PUBLIC_AI_SUPPORTED_MODELS=anthropic/claude-3-haiku-20240307,openai/gpt-3.5-turbo  # 支持的模型列表（逗号分隔）
```

### LLM 服务配置（后端）

后端 API 使用 LangChain 和 LangGraph 处理 Markdown 文件并生成美化后的 HTML。您可以在 `.env.local` 中配置以下环境变量来自定义 LLM 服务行为：

```
# LLM 服务配置（后端API使用）
AI_API_KEY=your_api_key_here  # 后端 API 密钥（必需）
AI_BASE_URL=https://openrouter.ai/api/v1  # API 基础 URL

# 模型配置
AI_DEFAULT_MODEL=anthropic/claude-3.7-sonnet  # 默认模型
AI_FALLBACK_MODEL=anthropic/claude-3-haiku  # 后备模型（当默认模型不可用时）
AI_OUTLINE_MODEL=anthropic/claude-3.7-sonnet  # 用于生成文档大纲的模型

# 生成参数
AI_DEFAULT_TEMPERATURE=0.1  # 默认温度参数
AI_OUTLINE_TEMPERATURE=0.0  # 大纲生成温度参数（较低以获得确定性结果）

# 应用信息（用于API请求标头）
NEXT_PUBLIC_APP_NAME=Markdown Beautifier  # 应用名称
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 应用 URL
```

如果您未设置上述某些变量，系统将使用默认值。但 `AI_API_KEY` 是必需的，没有它，美化功能将无法工作。

#### 支持的 AI 服务提供商

项目默认支持以下 AI 服务提供商（通过 OpenRouter 或直接 API）：

1. **OpenRouter**（推荐）
   - 支持多种模型，包括 Anthropic Claude 和 OpenAI GPT 系列
   - 获取 API 密钥：[OpenRouter](https://openrouter.ai/)

2. **OpenAI**
   - 支持 GPT-3.5-Turbo 和 GPT-4 系列模型
   - 获取 API 密钥：[OpenAI Platform](https://platform.openai.com/)
   - 设置 `NEXT_PUBLIC_AI_API_URL=https://api.openai.com/v1/chat/completions`

3. **Anthropic**
   - 支持 Claude 系列模型
   - 获取 API 密钥：[Anthropic Console](https://console.anthropic.com/)
   - 设置 `NEXT_PUBLIC_AI_API_URL=https://api.anthropic.com/v1/messages`

#### 配置自定义 AI 模型

若要使用不同的 AI 模型，请修改 `NEXT_PUBLIC_AI_MODEL_NAME` 环境变量。默认值为 `anthropic/claude-3-haiku-20240307`。

可用模型取决于您选择的 AI 服务提供商。如果使用 OpenRouter，可以在 [OpenRouter Models](https://openrouter.ai/models) 查看支持的模型列表。

### 国际化配置

本项目支持中文和英文两种语言。语言配置文件位于 `src/i18n/locales/` 目录下。

如需添加新语言：

1. 在 `src/i18n/locales/` 目录下创建新的语言文件，例如 `ja-JP.js`
2. 在 `src/i18n/config.js` 中更新 `locales` 数组和 `getLanguageName` 函数
3. 在 `src/i18n/index.js` 中导入新的语言文件并更新 `translations` 对象

```javascript
// 导入新语言文件
import jaJP from './locales/ja-JP';

// 更新语言映射
const translations = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
};
```

### 应用程序配置

除了 AI 相关的环境变量外，您还可以设置以下环境变量来配置应用程序：

```
# 应用程序设置
NEXT_PUBLIC_APP_NAME=Markdown Beautifier  # 应用名称
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 应用 URL
NEXT_PUBLIC_ENABLE_ANALYTICS=false  # 是否启用分析功能
NEXT_PUBLIC_MAX_CONTENT_LENGTH=50000  # 最大内容长度限制（字符数）
```

## 🧑‍💻 开发

### 目录结构

```
markdown-beautifier/
├── public/            # 静态资源
├── src/               # 源代码
│   ├── app/           # Next.js App Router
│   ├── components/    # React 组件
│   ├── i18n/          # 国际化配置
│   │   └── locales/   # 语言文件
│   ├── utils/         # 工具函数
│   │   └── aiService.js  # AI 服务模块
│   └── styles/        # 样式文件
├── .env.example       # 环境变量示例
├── next.config.mjs    # Next.js 配置
└── package.json       # 项目依赖
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 启动生产服务器

```bash
npm start
# 或
yarn start
# 或
pnpm start
```

## 📝 贡献指南

欢迎贡献代码、提交 issue 或提供改进建议！

1. Fork 仓库
2. 创建新分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 鸣谢

- [Next.js 团队](https://nextjs.org/)
- [Material UI 团队](https://mui.com/)
- [OpenRouter](https://openrouter.ai/)
- 所有贡献者

---

<p align="center">使用 ❤️ 制作</p>
