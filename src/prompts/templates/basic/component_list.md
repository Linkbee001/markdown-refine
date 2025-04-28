### 列表 (`ul`, `ol`) 样式要求

对无序列表 (`ul`) 和有序列表 (`ol`) 进行样式化，使其清晰、易读且与整体风格协调。

*   **基础样式:**
    *   **内边距 (padding-left):** 设置合适的左内边距，以容纳列表标记。
    *   **外边距 (margin):** 设置列表整体的上下外边距，以及列表项 (`li`) 之间的垂直间距 (`margin-bottom`)。
    *   **列表标记 (list-style-type):** 选择适合风格的标记类型（如 `disc`, `circle`, `square` 用于 `ul`；`decimal`, `lower-alpha`, `lower-roman` 用于 `ol`）。可以设置为 `none` 并通过伪元素 `::before` 自定义标记。

*   **自定义列表标记 (高级):**
    *   将 `list-style-type` 设置为 `none`。
    *   为 `li` 元素的 `::before` 伪元素设置 `content` 属性（例如使用特殊字符如 `•`, `‣`, `–`，或 SVG 背景图作为标记），并通过 `display: inline-block`, `width`, `text-align`, `margin-right` 等属性精确定位。

*   **定制化列表样式:**
    *   可以为整个列表 (`ul`/`ol`) 或列表项 (`li`) 添加背景色、边框等，创建卡片式或特殊区域列表。
    *   考虑为有序列表的数字标记应用不同的颜色或字重。 