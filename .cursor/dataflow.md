# 关键数据流

本文档概述了重构后应用程序中的一些重要数据流。

## 1. 初始加载 / 加载默认配置

1.  **`Home` 组件挂载。**
2.  `useStyleConfigManager` 钩子初始化：
    - 读取 `localStorage` 中的 `savedStyleConfigs`。
    - 将 `currentConfigName` 设置为默认值。
    - 其 `useEffect` 运行，找到默认配置。
    - 调用 `setCustomStylesCallback`（即来自 `useStyleEditor` 的 `setCustomStyles`），传入默认样式（初始为空 `{}`）。
3.  `useStyleEditor` 钩子初始化：
    - `customStyles` 状态通过 `useStyleConfigManager` 的回调设置为 `{}`。
4.  `usePreviewUpdater` 钩子初始化：
    - `htmlResult` 和 `tempHtmlResult` 初始为空。

## 2. 生成 HTML (AI 美化或快速测试)

1.  **用户在 `HeaderControls` 中点击"AI 美化"或"快速测试"。**
2.  `Home` 中的回调函数（`handleBeautify` 或 `handleLoadTestHTML`）被触发。
3.  `Home` 组件：
    - 将 `isLoading` 设置为 true。
    - 调用 `setHtmlResult` 和 `setTempHtmlResult`（来自 `usePreviewUpdater`）设置基础/临时 HTML（来自 API 或 `defaultHtml`）。
    - 调用 `setCustomStyles`（来自 `useStyleEditor`）将样式重置为 `{}`。
    - **关键**: 设置 HTML 后，调用 `finalUpdatePreview`（即来自 `usePreviewUpdater` 的 `updatePreviewWithStyles`），传递*当前加载的配置*的样式（从 `useStyleConfigManager` 获取）。
4.  `usePreviewUpdater`（`updatePreviewWithStyles` 被调用）：
    - 生成包含基础结构和所提供样式的新 HTML 内容 (`updatedHtml`)。
    - 使用 `updatedHtml` 调用 `setTempHtmlResult`。
5.  `usePreviewUpdater`（`tempHtmlResult` 更改触发 `useEffect`）：
    - 如果 `isEditorOpen` 为 true（生成后可能不会立即为 true，但如果用户编辑则会），则将 `tempHtmlResult` 写入 iframe。
    - *注意：如果生成后 `isEditorOpen` 不为 true，可能会有轻微的初始不同步，但 `PreviewPanel` 中的 iframe `srcDoc` 最初仍应显示正确的 `htmlResult`。*

## 3. 编辑样式属性

1.  **用户打开 `ComponentOutlineSidebar`，点击一个组件（例如，"标题"）。**
2.  `Home` 中的 `onSelectComponent` 回调调用 `useStyleEditor` 的 `handleComponentSelect`。
3.  `useStyleEditor`（`handleComponentSelect`）：
    - 将 `selectedComponent` 状态设置为 'title'。
    - 将 `isEditorOpen` 状态设置为 `true`。
4.  **`StyleEditorModal` 变得可见。**
5.  **用户在 `StyleEditorModal` 中更改样式（例如，颜色）。**
6.  `StyleEditorModal` 中的 `onStyleChange` 回调调用 `useStyleEditor` 的 `handleStyleChange`。
7.  `useStyleEditor`（`handleStyleChange`）：
    - 更新 `customStyles` 状态（例如 `{ title: { color: '#ff0000' } }`）。
    - 调用 `updatePreviewCallback`（即来自 `usePreviewUpdater` 的 `updatePreviewWithStyles`），传递*新的* `customStyles` 对象。
8.  `usePreviewUpdater`（`updatePreviewWithStyles` 被调用）：
    - 使用*新的*样式生成新的 HTML 内容 (`updatedHtml`)。
    - 使用 `updatedHtml` 调用 `setTempHtmlResult`。
9.  `usePreviewUpdater`（`tempHtmlResult` 更改触发 `useEffect`）：
    - 因为 `isEditorOpen` 为 `true`，它将新的 `tempHtmlResult`（带有更新的样式）写入 iframe。

## 4. 应用样式模板

1.  **用户为某个组件打开了 `StyleEditorModal`。**
2.  **用户在 `StyleEditorModal` 中点击预设模板按钮。**
3.  `onApplyTemplate` 回调调用 `useStyleEditor` 的 `applyStyleTemplate`。
4.  `useStyleEditor`（`applyStyleTemplate`）：
    - 找到模板样式。
    - 将模板样式合并到所选组件的 `customStyles` 状态中。
    - 调用 `updatePreviewCallback` (`updatePreviewWithStyles`) 并传入更新后的 `customStyles`。
5.  *（"编辑样式属性"中的步骤 8 和 9 跟随执行，更新预览）*。

## 5. 加载样式配置

1.  **用户打开 `ComponentOutlineSidebar`，点击"样式配置管理"。**
2.  `onOpenStyleManager` 回调调用 `useStyleConfigManager` 的 `openStyleManager`。
3.  `useStyleConfigManager` 将 `isStyleManagerOpen` 设置为 `true`。
4.  **`StyleManagerModal` 变得可见。**
5.  **用户在 `StyleManagerModal` 中点击已保存配置的"加载"按钮。**
6.  `onLoadConfig` 回调调用 `useStyleConfigManager` 的 `loadStyleConfig`。
7.  `useStyleConfigManager`（`loadStyleConfig`）：
    - 找到配置对象。
    - 调用 `setCustomStylesCallback`（来自 `useStyleEditor` 的 `setCustomStyles`）并传入加载的样式。
    - 设置自己的 `currentConfigName` 状态。
    - 调用 `updatePreviewCallback`（`updatePreviewWithStyles`）并传入加载的样式。
8.  *（"编辑样式属性"中的步骤 8 和 9 跟随执行，使用加载的样式更新预览）*。
9.  `StyleManagerModal` 关闭。 