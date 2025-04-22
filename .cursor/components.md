# UI 组件

本文档描述了 `/src/components` 目录中的主要 UI 组件。

## `HeaderControls.js`

- **职责**: 渲染应用程序顶部的页眉/工具栏。
- **Props**:
  - `prompt`: 当前的 AI 风格提示。
  - `setPrompt`: 更新提示状态的函数。
  - `isLoading`: 布尔值，指示操作（AI 美化、测试加载）是否正在进行中。
  - `onBeautify`: 当点击"AI 美化"按钮时触发的回调函数。
  - `onLoadTestHTML`: 当点击"快速测试"按钮时触发的回调函数。
  - `onCopyHtml`: 当点击"复制 HTML"按钮时触发的回调函数。
  - `copyButtonText`: 复制按钮上显示的文本（例如，"复制 HTML"、"已复制！"）。
  - `htmlResult`: 生成的 HTML 结果（用于启用/禁用复制/导出按钮）。
  - `onExport`: 当选择导出选项时触发的回调函数。
- **内部状态**: 管理样式示例下拉菜单和导出菜单的可见性。

## `MarkdownEditorPanel.js`

- **职责**: 渲染包含 Markdown 编辑器（使用 `@uiw/react-md-editor`）的左侧面板。
- **Props**:
  - `markdown`: 当前的 Markdown 内容字符串。
  - `setMarkdown`: 更新 Markdown 内容状态的函数。

## `PreviewPanel.js`

- **职责**: 渲染右侧面板，包括移动设备框架和预览 `<iframe>`。
- **Props**:
  - `htmlResult`: AI 生成或加载的稳定 HTML，作为基础预览。
  - `tempHtmlResult`: 反映实时样式编辑的临时 HTML。
  - `isEditorOpen`: 布尔值，指示样式编辑器是否处于活动状态（决定显示 `tempHtmlResult` 还是 `htmlResult`）。
  - `isLoading`: 布尔值，指示内容是否正在生成（显示加载消息）。
  - `previewIframeRef`: 要附加到 `<iframe>` 元素的 React ref 对象。
  - `isOutlineVisible`: 布尔值，控制 `ComponentOutlineSidebar` 的可见性。
  - `onToggleOutline`: 当点击大纲切换按钮时触发的回调函数。

## `ComponentOutlineSidebar.js`

- **职责**: 渲染从左侧滑出的侧边栏，用于导航可编辑组件和访问样式管理器。
- **Props**:
  - `isVisible`: 布尔值，控制侧边栏当前是否显示。
  - `selectedComponent`: 当前选定组件的 ID（用于高亮显示）。
  - `onSelectComponent`: 当点击组件按钮时触发的回调函数，传递组件 ID。
  - `onOpenStyleManager`: 当点击"样式配置管理"按钮时触发的回调函数。
  - `onClose`: 当点击关闭按钮 (X) 时触发的回调函数。

## `StyleEditorModal.js`

- **职责**: 渲染用于编辑所选组件样式的模态对话框。
- **Props**:
  - `isOpen`: 布尔值，控制模态框是否可见。
  - `selectedComponent`: 正在编辑其样式的组件的 ID。
  - `customStyles`: 包含所有自定义样式的当前状态对象。
  - `onStyleChange`: 当样式属性值更改时触发的回调函数，传递 `(propertyId, value)`。
  - `onApplyTemplate`: 当点击预设样式模板按钮时触发的回调函数，传递 `templateId`。
  - `onSave`: （目前仅关闭模态框）回调函数，最初用于显式应用更改。
  - `onCancel`: 当点击关闭按钮或发生取消操作时触发的回调函数。

## `StyleManagerModal.js`

- **职责**: 渲染用于管理已保存样式配置（加载、保存、删除）的模态对话框。
- **Props**:
  - `isOpen`: 布尔值，控制模态框是否可见。
  - `savedConfigs`: 已保存样式配置对象的数组。
  - `currentConfigName`: 当前活动样式配置的名称。
  - `currentStyles`: 当前的自定义样式对象（保存时需要）。
  - `onSaveConfig`: 当点击保存按钮时触发的回调函数，传递 `(configName, currentStyles)`。
  - `onLoadConfig`: 当点击加载按钮时触发的回调函数，传递 `configName`。
  - `onDeleteConfig`: 当点击删除按钮时触发的回调函数，传递 `configName`。
  - `onClose`: 当点击关闭按钮时触发的回调函数。
  - `setCurrentConfigNameState`: 用于更新控制保存输入字段值的状态的函数。 