# 自定义 Hooks

本文档描述了 `/src/hooks` 目录中的自定义 React Hooks。

## `usePreviewUpdater.js`

- **职责**: 管理与 HTML 预览区域相关的状态和逻辑。
- **管理的状态**:
  - `htmlResult`: AI 生成或从测试用例加载的稳定 HTML。
  - `tempHtmlResult`: 用于反映实时样式更改的 HTML 临时版本，在显式保存前不更改 `htmlResult`（尽管目前更改是实时的）。
  - `previewIframeRef`: 附加到预览 `<iframe>` 元素的 React ref。
- **提供的函数/逻辑**:
  - `updatePreviewWithStyles(stylesToUse, pageContent)`: 根据提供的 `pageContent` 结构（默认为测试数据）生成完整的 HTML 文档字符串，并通过在 `<style>` 标签中嵌入生成的 CSS 字符串来应用给定的 `stylesToUse`。更新 `tempHtmlResult` 状态。
  - `generateCustomCSSFromStyles(styles)`: （内部或暴露）辅助函数，用于将 `customStyles` 对象转换为 CSS 字符串，包括属性名的 `camelToKebab` 转换和添加 `!important`。
  - `camelToKebab(str)`: （内部或暴露）辅助函数，用于将驼峰式 JS 属性名转换为短横线分隔的 CSS 属性名。
- **副作用**:
  - 包含一个 `useEffect` 钩子，监听 `tempHtmlResult` 和 `isEditorActive` 的变化。当满足这两个条件时，它会将 `tempHtmlResult` 的内容直接写入 `previewIframeRef.current` 文档。
- **依赖**: 从父组件接收 `isEditorActive` 标志，以确定 `useEffect` 何时应更新 iframe。

## `useStyleEditor.js`

- **职责**: 管理交互式样式编辑功能的状态和逻辑。
- **管理的状态**:
  - `customStyles`: 一个对象，存储用户定义的样式修改，按组件 ID 键控（例如 `{ title: { color: 'red' }, paragraph: { ... } }`）。
  - `selectedComponent`: 当前在侧边栏/模态框中选择用于编辑的组件的 ID 字符串。
  - `isEditorOpen`: 控制 `StyleEditorModal` 可见性的布尔标志。
- **提供的函数**:
  - `handleComponentSelect(componentId)`: 设置 `selectedComponent` 并打开编辑器模态框。
  - `handleStyleChange(prop, value)`: 使用新属性和值更新 `selectedComponent` 的 `customStyles` 状态。调用 `updatePreviewCallback`。
  - `applyStyleTemplate(templateId)`: 查找相应的样式模板并将其样式合并到 `selectedComponent` 的 `customStyles` 状态中。调用 `updatePreviewCallback`。
  - `saveStyleChanges()`: 目前仅关闭编辑器模态框 (`setIsEditorOpen(false)`)。
  - `cancelStyleChanges()`: 关闭编辑器模态框。如果需要，可能需要增强以恢复样式。
  - `setCustomStyles`: 暴露的状态设置函数，允许外部钩子/组件（如 `useStyleConfigManager`）直接设置整个样式状态（例如，在加载配置时）。
  - `setIsEditorOpen`: 暴露的状态设置函数，用于从外部关闭模态框。
- **依赖**: 需要传入一个 `updatePreviewCallback` 函数（通常是来自 `usePreviewUpdater` 的 `updatePreviewWithStyles`），每当样式更改时调用该函数以触发预览更新。

## `useStyleConfigManager.js`

- **职责**: 使用浏览器的 `localStorage` 处理用户定义的样式配置的加载、保存和删除。
- **管理的状态**:
  - `savedStyleConfigs`: 包含所有已保存样式配置对象的数组（每个对象都有 `configName` 和 `styles`）。从 `localStorage` 或使用 `DEFAULT_STYLE_CONFIG` 初始化。
  - `currentConfigName`: 当前活动配置的 `configName` 字符串。
  - `isStyleManagerOpen`: 控制 `StyleManagerModal` 可见性的布尔标志。
- **提供的函数**:
  - `saveCurrentStyleConfig(configName, currentStyles)`: 在给定的 `configName` 下保存提供的 `currentStyles` 对象。更新 `localStorage` 和 `savedStyleConfigs` 状态。将保存的配置设置为 `currentConfigName`。
  - `loadStyleConfig(configName)`: 从指定的 `configName` 加载样式。调用 `setCustomStylesCallback` 更新应用程序的主要样式状态，并调用 `updatePreviewCallback` 刷新预览。将加载的配置设置为 `currentConfigName`。
  - `deleteStyleConfig(configName)`: 从 `localStorage` 和 `savedStyleConfigs` 状态中删除具有给定 `configName` 的配置。如果删除的是当前配置，则加载默认配置。
  - `openStyleManager()`: 将 `isStyleManagerOpen` 设置为 `true`。
  - `closeStyleManager()`: 将 `isStyleManagerOpen` 设置为 `false`。
  - `setCurrentConfigName`: 暴露的状态设置函数，主要用于允许模态框中的输入字段在保存前更新名称。
- **副作用**:
  - 读取和写入 `localStorage`（键：`buity_saved_styles`）。
  - 包含一个 `useEffect` 钩子，确保当组件挂载或 `currentConfigName`/`savedStyleConfigs` 更改时，`customStyles` 状态（通过回调在外部管理）与 `currentConfigName` 同步。
- **依赖**: 需要 `setCustomStylesCallback`（通常是来自 `useStyleEditor` 的 `setCustomStyles`）和 `updatePreviewCallback`（通常是来自 `usePreviewUpdater` 的 `updatePreviewWithStyles`）与主要样式状态和预览进行交互。 