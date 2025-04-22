export const beautifyHtmlLlmAdditionalInstructions = `
请注意，输入的HTML已经过结构化处理，包含带有 'paragraph-component' 类和唯一 'id' 的段落块。


请务必在美化时：
1.  **保留所有 'id' 属性**，它们对于后续交互至关重要。
2.  **保留 'paragraph-component' 类**，同时添加你的样式。
3.  为日期文本添加 'date-component' 类名 (例如：<p class="date-component paragraph-component" id="comp-X" style="...">...</p>)
4.  为结尾标记添加 'ending-component' 类名 (例如：<p class="ending-component paragraph-component" id="comp-Y" style="...">END</p>)
5.  **核心要求：使用内联样式 (style="")** 来应用所有视觉样式（颜色、边距、填充、边框、字体等），确保样式在复制到富文本编辑器时能够保留。为每个 'paragraph-component' 元素以及其中的标题、列表等添加完整的内联样式。
6.  可以为段落添加边框、背景色、内边距等，使其更有层次感。

输出应该是完整的 HTML body 内容，带有所有必要的内联样式和类名/ID。不要包含\`\`\`html 标记。
`; 