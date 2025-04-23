# Markdown 美化器大纲面板与样式编辑器

这个功能允许用户通过大纲面板查看文档结构，并通过样式编辑器对每个组件进行精细的样式调整。

## 功能概述

1. **文档大纲面板**：
   - 显示文档的层级结构
   - 标识不同类型的组件（段落、标题、列表等）
   - 点击项目可以定位和选择对应的组件

2. **样式编辑器**：
   - 提供直观的界面修改组件样式
   - 包含外观、排版和间距三个选项卡
   - 支持颜色选择器、边框设置、字体调整等

3. **实时预览**：
   - 中间区域显示文档的实时预览
   - 选中的组件会高亮显示
   - 样式修改会立即反映在预览中

## 如何测试

为了方便测试和开发，我们创建了使用固定示例数据的测试页面。这样可以避免每次测试都需要调用 AI 生成内容，从而节省时间和 API 调用费用。

1. **启动开发服务器**：
   ```bash
   npm run dev
   # 或
   yarn dev
   # 或
   pnpm dev
   ```

2. **访问编辑器页面**：
   浏览器打开 http://localhost:3000

3. **使用方式**：
   - 从左侧大纲面板中选择一个组件
   - 在右侧的样式编辑器中调整样式属性
   - 点击"应用样式"按钮查看实时效果
   - 完成后可以点击"导出 HTML"按钮导出编辑后的内容

## 技术实现

该功能使用以下组件实现：

1. `DocumentOutlinePanel`：显示文档结构的组件
2. `StyleEditor`：提供样式编辑功能的组件
3. `BeautifierEditorPage`：整合上述组件的主页面

数据流向：
- API 调用结果（文档大纲和 HTML）→ 大纲面板和预览区域
- 用户选择组件 → 获取当前样式 → 显示在样式编辑器中
- 用户修改样式 → 应用到预览区域 → 用户确认后可导出

## 集成到现有系统

当测试满意后，可以替换掉测试数据源，直接使用实际的 API 调用结果：

```javascript
// 从测试数据
import testData from '../data/testBeautifierResponse.json';
const [htmlContent, setHtmlContent] = useState<string>(testData.finalHtml);
const [outline, setOutline] = useState<OutlineItem[]>(testData.documentOutline);

// 改为 API 调用
const [htmlContent, setHtmlContent] = useState<string>('');
const [outline, setOutline] = useState<OutlineItem[]>([]);

useEffect(() => {
  async function fetchData() {
    const response = await fetch('/api/beautify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        markdown: '# 示例标题\n\n这是内容...',
        prompt: '简洁专业的风格，段落背景用浅灰色，边框细一点' 
      })
    });
    const data = await response.json();
    setHtmlContent(data.finalHtml);
    setOutline(data.documentOutline);
  }
  fetchData();
}, []);
```

## 后续优化方向

1. 支持更多样式属性（文本对齐、行高等）
2. 添加撤销/重做功能
3. 保存自定义样式预设
4. 直接编辑 HTML/CSS 代码的高级模式
5. 组件分组和批量样式应用 