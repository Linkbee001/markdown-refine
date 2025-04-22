# 项目结构

本文档概述了 Buity Markdown 美化器项目的主要目录结构。

- **/src**: 包含应用程序的主要源代码。
  - **/app**: Next.js App Router 目录。
    - `page.js`: 应用程序的主要入口点和页面组件。重构后，它主要负责协调 Hooks 和组件。
    - `layout.js`: 应用程序的根布局。
    - `globals.css`: 全局 CSS 样式（可能是 Tailwind CSS 基础/实用程序）。
  - **/components**: 包含可复用的 React UI 组件。
    - `HeaderControls.js`: 渲染顶部控制栏。
    - `MarkdownEditorPanel.js`: 渲染带有 Markdown 编辑器的左侧面板。
    - `PreviewPanel.js`: 渲染带有移动设备框架和预览 iframe 的右侧面板。
    - `ComponentOutlineSidebar.js`: 渲染用于组件导航和样式管理的滑出式侧边栏。
    - `StyleEditorModal.js`: 渲染用于编辑组件样式的模态框。
    - `StyleManagerModal.js`: 渲染用于管理已保存样式配置的模态框。
  - **/hooks**: 包含封装了状态逻辑的自定义 React Hooks。
    - `usePreviewUpdater.js`: 管理预览状态（HTML、临时 HTML、iframe ref）和更新逻辑。
    - `useStyleEditor.js`: 管理样式编辑状态（自定义样式、选定组件、编辑器打开状态）和相关操作。
    - `useStyleConfigManager.js`: 使用 localStorage 管理样式配置的加载、保存和删除。
  - **/config**: 包含应用程序的静态配置数据。
    - `editorConfig.js`: 定义组件类型、样式属性、样式模板、样式示例、默认配置和测试数据。
  - **/api**: (如果后端逻辑存在于 Next.js 应用中) 包含 API 路由处理程序，例如 `/api/beautify` 端点。
- **/.cursor**: 包含 Cursor AI 助手配置和文档文件。
  - `structure.md`: 本文件，描述项目结构。
  - `components.md`: UI 组件文档。
  - `hooks.md`: 自定义 Hooks 文档。
  - `dataflow.md`: 关键数据流文档。
- **/public**: 直接提供的静态资源。
- `next.config.js`: Next.js 配置文件。
- `package.json`: 项目依赖和脚本。
- `tailwind.config.js`: Tailwind CSS 配置。
- `postcss.config.js`: PostCSS 配置。 