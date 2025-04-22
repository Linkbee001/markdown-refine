'use client';

// 预设样式模板
export const styleTemplates = {
	title: [
		{ id: 'simple-title', name: '简约标题', styles: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '20px 0 10px 0', padding: '0 0 5px 0', borderBottom: '1px solid #eee' } },
		{ id: 'highlight-title', name: '醒目标题', styles: { fontSize: '28px', fontWeight: 'bold', color: 'white', backgroundColor: '#3498db', padding: '10px 15px', borderRadius: '5px', textAlign: 'center' } },
		{ id: 'book-title', name: '书籍标题', styles: { fontSize: '28px', fontWeight: '500', color: '#2c3e50', textAlign: 'center', padding: '15px 0', margin: '10px 0 20px 0', borderBottom: '2px solid #3498db', borderTop: '2px solid #3498db' } },
	],
	date: [
		{ id: 'simple-date', name: '简约日期', styles: { fontSize: '14px', color: '#888', fontStyle: 'italic', margin: '5px 0 15px 0' } },
		{ id: 'highlight-date', name: '突出日期', styles: { fontSize: '14px', color: '#3498db', fontWeight: '500', padding: '2px 8px', backgroundColor: '#f0f8ff', borderRadius: '3px', display: 'inline-block' } },
		{ id: 'underline-date', name: '下划线日期', styles: { fontSize: '14px', color: '#666', borderBottom: '1px dashed #ccc', paddingBottom: '3px', display: 'inline-block' } },
	],
	paragraph: [
		{
			id: 'simple-white',
			name: '简约白底',
			styles: {
				padding: '15px',
				margin: '15px 0',
				border: '1px solid #eee',
				borderRadius: '5px',
				backgroundColor: '#ffffff',
				lineHeight: '1.6',
				textAlign: 'left'
			}
		},
		{
			id: 'light-blue',
			name: '浅蓝背景',
			styles: {
				padding: '15px',
				margin: '15px 0',
				backgroundColor: '#f0f8ff',
				borderRadius: '5px',
				boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
				color: '#333',
				lineHeight: '1.6'
			}
		},
		{
			id: 'left-border',
			name: '左侧边框',
			styles: {
				padding: '10px 15px',
				margin: '10px 0',
				borderLeft: '4px solid #3498db',
				backgroundColor: '#f8f9fa',
				lineHeight: '1.6',
				textAlign: 'left'
			}
		},
		{
			id: 'divider-frame',
			name: '分割线框',
			styles: {
				padding: '15px',
				margin: '20px 0',
				position: 'relative',
				borderTop: '1px solid #eee',
				borderBottom: '1px solid #eee',
				lineHeight: '1.6'
			}
		},
		{
			id: 'card-style',
			name: '卡片式',
			styles: {
				padding: '20px',
				margin: '15px 0',
				backgroundColor: '#fff',
				borderRadius: '8px',
				boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
				color: '#333',
				lineHeight: '1.6',
				fontFamily: 'sans-serif'
			}
		},
		{
			id: 'green-tip',
			name: '绿色提示',
			styles: {
				padding: '15px',
				margin: '15px 0',
				backgroundColor: '#f0fff4',
				borderLeft: '4px solid #4caf50',
				borderRadius: '2px',
				color: '#2e7d32',
				lineHeight: '1.6'
			}
		},
		{
			id: 'warning-block',
			name: '警告块',
			styles: {
				padding: '15px',
				margin: '15px 0',
				backgroundColor: '#fff8e1',
				borderLeft: '4px solid #ffc107',
				borderRadius: '2px',
				color: '#b28704',
				lineHeight: '1.6'
			}
		},
	],
	quote: [
		{
			id: 'classic-quote',
			name: '经典引用',
			styles: {
				padding: '15px 20px',
				margin: '15px 0',
				borderLeft: '4px solid #ccc',
				backgroundColor: '#f9f9f9',
				fontStyle: 'italic',
				color: '#555'
			}
		},
		{
			id: 'modern-quote',
			name: '现代引用',
			styles: {
				padding: '20px',
				margin: '20px 0',
				backgroundColor: '#f0f7fb',
				borderLeft: '5px solid #3498db',
				borderRadius: '3px',
				color: '#444',
				fontStyle: 'normal'
			}
		}
	],
	image: [
		{
			id: 'simple-image',
			name: '简约图片',
			styles: {
				maxWidth: '100%',
				margin: '15px 0',
				borderRadius: '3px'
			}
		},
		{
			id: 'framed-image',
			name: '带框图片',
			styles: {
				maxWidth: '100%',
				margin: '15px 0',
				border: '1px solid #ddd',
				padding: '5px',
				backgroundColor: '#fff',
				boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
			}
		}
	],
	ending: [
		{
			id: 'centered-ending',
			name: '居中结尾',
			styles: {
				fontSize: '18px',
				fontWeight: 'bold',
				textAlign: 'center',
				margin: '30px 0 15px',
				padding: '10px',
				color: '#555'
			}
		},
		{
			id: 'decorated-ending',
			name: '装饰结尾',
			styles: {
				fontSize: '20px',
				fontWeight: 'bold',
				textAlign: 'center',
				margin: '30px auto 15px',
				padding: '10px 20px',
				color: '#3498db',
				borderTop: '1px solid #eee',
				borderBottom: '1px solid #eee',
				maxWidth: '80%'
			}
		}
	]
};

// 组件类型定义
export const componentTypes = [
	{
		id: 'title',
		name: '标题',
		selector: 'h1, h2, h3, h4, h5, h6',
		template: '<h{{level}}>{{content}}</h{{level}}>\n',
		styleTemplates: styleTemplates.title || []
	},
	{
		id: 'date',
		name: '日期',
		selector: '.date-component',
		template: '<p class="date-component">{{content}}</p>\n',
		styleTemplates: styleTemplates.date || []
	},
	{
		id: 'content',
		name: '正文内容',
		selector: 'p:not(.date-component):not(.paragraph-component):not(.ending-component)',
		template: '<p>{{content}}</p>\n',
		styleTemplates: []
	},
	{
		id: 'paragraph',
		name: '段落块',
		selector: 'p.paragraph-component',
		template: '<p class="paragraph-component">{{content}}</p>\n',
		styleTemplates: styleTemplates.paragraph || []
	},
	{
		id: 'list',
		name: '列表',
		selector: 'ul, ol',
		template: '<ul>{{content}}</ul>\n', // 假设列表内容已包含<li>标签
		styleTemplates: []
	},
	{
		id: 'code',
		name: '代码块',
		selector: 'pre, code',
		template: '<pre><code>{{content}}</code></pre>\n',
		styleTemplates: []
	},
	{
		id: 'quote',
		name: '引用',
		selector: 'blockquote',
		template: '<blockquote>{{content}}</blockquote>\n',
		styleTemplates: styleTemplates.quote || []
	},
	{
		id: 'image',
		name: '图片',
		selector: 'img',
		template: '<img src="{{src}}" alt="{{alt || \'\'}}" />\n',
		styleTemplates: styleTemplates.image || []
	},
	{
		id: 'ending',
		name: '结尾',
		selector: '.ending-component',
		template: '<p class="ending-component">{{content}}</p>\n',
		styleTemplates: styleTemplates.ending || []
	}
];

// 样式属性定义
export const styleProperties = {
	title: [
		{ id: 'fontSize', name: '字体大小', type: 'range', min: '12', max: '48', unit: 'px' },
		{ id: 'fontWeight', name: '字体粗细', type: 'select', options: ['normal', 'bold', '300', '400', '500', '600', '700'] },
		{ id: 'color', name: '文字颜色', type: 'color' },
		{ id: 'backgroundColor', name: '背景颜色', type: 'color' },
		{ id: 'textAlign', name: '对齐方式', type: 'select', options: ['left', 'center', 'right'] },
		{ id: 'padding', name: '内边距', type: 'text', placeholder: '10px 15px' },
		{ id: 'margin', name: '外边距', type: 'text', placeholder: '10px 0' },
		{ id: 'borderRadius', name: '圆角', type: 'range', min: '0', max: '20', unit: 'px' },
	],
	date: [
		{ id: 'fontSize', name: '字体大小', type: 'range', min: '10', max: '24', unit: 'px' },
		{ id: 'fontWeight', name: '字体粗细', type: 'select', options: ['normal', 'bold', '300', '400', '500', '600', '700'] },
		{ id: 'color', name: '文字颜色', type: 'color' },
		{ id: 'backgroundColor', name: '背景颜色', type: 'color' },
		{ id: 'textAlign', name: '对齐方式', type: 'select', options: ['left', 'center', 'right'] },
		{ id: 'fontStyle', name: '字体样式', type: 'select', options: ['normal', 'italic'] },
	],
	content: [
		{ id: 'fontSize', name: '字体大小', type: 'range', min: '12', max: '24', unit: 'px' },
		{ id: 'lineHeight', name: '行高', type: 'range', min: '1', max: '3', step: '0.1', unit: '' },
		{ id: 'color', name: '文字颜色', type: 'color' },
		{ id: 'backgroundColor', name: '背景颜色', type: 'color' },
		{ id: 'padding', name: '内边距', type: 'text', placeholder: '5px 10px' },
		{ id: 'textIndent', name: '首行缩进', type: 'range', min: '0', max: '40', unit: 'px' },
	],
	paragraph: [
		{ id: 'backgroundColor', name: '背景颜色', type: 'color' },
		{ id: 'padding', name: '内边距', type: 'text', placeholder: '10px 15px' },
		{ id: 'margin', name: '外边距', type: 'text', placeholder: '15px 0' },
		{ id: 'border', name: '边框', type: 'text', placeholder: '1px solid #eee' },
		{ id: 'borderRadius', name: '圆角', type: 'range', min: '0', max: '20', unit: 'px' },
		{ id: 'boxShadow', name: '阴影', type: 'text', placeholder: '0 2px 5px rgba(0,0,0,0.1)' },
		{ id: 'position', name: '位置', type: 'select', options: ['static', 'relative'] },
		{ id: 'borderBefore', name: '上分割线', type: 'text', placeholder: '1px solid #eee' },
		{ id: 'borderAfter', name: '下分割线', type: 'text', placeholder: '1px solid #eee' },
		{ id: 'textAlign', name: '文字对齐', type: 'select', options: ['left', 'center', 'right', 'justify'] },
	],
	list: [
		{ id: 'fontSize', name: '字体大小', type: 'range', min: '12', max: '24', unit: 'px' },
		{ id: 'lineHeight', name: '行高', type: 'range', min: '1', max: '3', step: '0.1', unit: '' },
		{ id: 'color', name: '文字颜色', type: 'color' },
		{ id: 'listStyleType', name: '列表样式', type: 'select', options: ['disc', 'circle', 'square', 'decimal', 'decimal-leading-zero', 'lower-roman', 'upper-roman', 'lower-alpha', 'upper-alpha', 'none'] },
		{ id: 'margin', name: '外边距', type: 'text', placeholder: '10px 0' },
	],
	code: [
		{ id: 'fontSize', name: '字体大小', type: 'range', min: '10', max: '20', unit: 'px' },
		{ id: 'backgroundColor', name: '背景颜色', type: 'color' },
		{ id: 'color', name: '文字颜色', type: 'color' },
		{ id: 'padding', name: '内边距', type: 'text', placeholder: '10px 15px' },
		{ id: 'borderRadius', name: '圆角', type: 'range', min: '0', max: '20', unit: 'px' },
		{ id: 'border', name: '边框', type: 'text', placeholder: '1px solid #ccc' },
	],
	quote: [
		{ id: 'fontSize', name: '字体大小', type: 'range', min: '12', max: '24', unit: 'px' },
		{ id: 'fontStyle', name: '字体样式', type: 'select', options: ['normal', 'italic'] },
		{ id: 'backgroundColor', name: '背景颜色', type: 'color' },
		{ id: 'color', name: '文字颜色', type: 'color' },
		{ id: 'borderLeft', name: '左边框', type: 'text', placeholder: '5px solid #ccc' },
		{ id: 'padding', name: '内边距', type: 'text', placeholder: '10px 15px' },
		{ id: 'margin', name: '外边距', type: 'text', placeholder: '10px 0' },
	],
	image: [
		{ id: 'maxWidth', name: '最大宽度', type: 'range', min: '50', max: '100', unit: '%' },
		{ id: 'borderRadius', name: '圆角', type: 'range', min: '0', max: '20', unit: 'px' },
		{ id: 'border', name: '边框', type: 'text', placeholder: '1px solid #ccc' },
		{ id: 'boxShadow', name: '阴影', type: 'text', placeholder: '0 0 10px rgba(0,0,0,0.1)' },
		{ id: 'margin', name: '外边距', type: 'text', placeholder: '10px 0' },
	],
	ending: [
		{ id: 'fontSize', name: '字体大小', type: 'range', min: '12', max: '36', unit: 'px' },
		{ id: 'fontWeight', name: '字体粗细', type: 'select', options: ['normal', 'bold', '300', '400', '500', '600', '700'] },
		{ id: 'color', name: '文字颜色', type: 'color' },
		{ id: 'backgroundColor', name: '背景颜色', type: 'color' },
		{ id: 'textAlign', name: '对齐方式', type: 'select', options: ['left', 'center', 'right'] },
		{ id: 'padding', name: '内边距', type: 'text', placeholder: '10px 15px' },
		{ id: 'border', name: '边框', type: 'text', placeholder: '1px solid #ccc' },
		{ id: 'borderRadius', name: '圆角', type: 'range', min: '0', max: '20', unit: 'px' },
	],
};

// 样式提示示例
export const styleExamples = [
	{ name: "技术博客", prompt: "使用简洁专业的技术博客风格，突出代码块，使用蓝色作为主色调，适合技术内容阅读" },
	{ name: "杂志布局", prompt: "类似现代杂志的排版风格，注重段落间距，使用优雅的衬线字体，强调引用和关键点" },
	{ name: "卡片式设计", prompt: "将内容分成独立的卡片式区块，每个段落有轻微的阴影和圆角，整体风格简洁现代" },
	{ name: "简约暗色", prompt: "暗色背景与高对比度文本，减少视觉噪音，适合长时间阅读的极简设计" },
	{ name: "手绘风格", prompt: "模拟手写笔记的风格，使用手写体字体，添加下划线和手绘边框，营造有机自然感" },
	{ name: "企业报告", prompt: "正式的企业报告风格，使用专业字体，强调标题层次结构，适合商务文档" },
	{ name: "科技未来", prompt: "未来感科技风格，使用蓝色渐变和几何元素，代码块有发光效果，整体风格前卫" },
	{ name: "文学阅读", prompt: "舒适的文学阅读体验，使用经典的衬线字体，宽松的行距和适当的段落间距，适合长篇文章" },
	{ name: "自然绿色", prompt: "以绿色为基调的自然风格，使用柔和的色彩，有机的形状和足够的留白，给人平静感" },
	{ name: "创意混搭", prompt: "打破常规的创意设计，使用不对称布局，大胆的色彩对比和独特的装饰元素" },
];

// 初始样式配置
export const DEFAULT_STYLE_CONFIG = {
	configName: "默认样式",
	styles: {}
};

// 生成用于模拟页面内容的变量 (用于快速测试)
export const defaultHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Markdown美化示例</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 20px; color: #333; margin: 0; }
        h1 { font-size: 28px; color: #111; margin-top: 0; font-weight: 700; }
        h2 { font-size: 22px; color: #0066cc; margin-top: 25px; font-weight: 600; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        p { margin: 15px 0; font-size: 16px; }
        .date-component { font-size: 14px; color: #666; font-style: italic; margin: 5px 0 20px 0; }
        ul, ol { padding-left: 25px; }
        li { margin-bottom: 5px; }
        strong { color: #111; }
        .ending-component { margin-top: 30px; text-align: center; font-weight: bold; color: #0066cc; }
        .paragraph-component { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #0066cc; }
      </style>
    </head>
    <body>
      <h1>今日汇率报告</h1>
      <p class="date-component">2024.11.6/星期二</p>
      
      <h2>官方汇率概况</h2>
      <p>今日官方汇率：909(央行)<br>今日黑市汇率：1050<br>汇率差距持续扩大，反映了市场与官方价格的偏离程度。</p>
      
      <h2>市场影响因素</h2>
      <p class="paragraph-component">近期国际贸易形势变化，商品出口受到一定影响。<br>国内政策调整预期增强，市场参与者情绪谨慎。<br>短期内预计汇率波动会持续，建议关注后续央行动向。</p>
      
      <h2>未来展望</h2>
      <p>如果情况持续，可能会出现以下变化：</p>
      <ul>
        <li>进口商品价格上涨</li>
        <li>出口竞争力提升</li>
        <li>跨境资金流动受限</li>
      </ul>
      
      <h2>建议措施</h2>
      <p class="paragraph-component">请企业做好外汇风险管理，合理安排外汇收支时间。</p>
      
      <p class="ending-component">END</p>
    </body>
    </html>
  `;

// 模拟的页面组件内容 (用于快速测试)
export const pageContent = [
	{ type: 'title', props: { content: '今日汇率报告' } },
	{ type: 'date', props: { content: '2024.11.6/星期二' } },
	{ type: 'title', props: { content: '官方汇率概况' } },
	{ type: 'content', props: { content: '今日官方汇率：909(央行)<br>今日黑市汇率：1050<br>汇率差距持续扩大，反映了市场与官方价格的偏离程度。' } },
	{ type: 'title', props: { content: '市场影响因素' } },
	{ type: 'paragraph', props: { content: '近期国际贸易形势变化，商品出口受到一定影响。<br>国内政策调整预期增强，市场参与者情绪谨慎。<br>短期内预计汇率波动会持续，建议关注后续央行动向。' } },
	{ type: 'title', props: { content: '未来展望' } },
	{ type: 'content', props: { content: '如果情况持续，可能会出现以下变化：' } },
	{ type: 'list', props: { content: '<li>进口商品价格上涨</li><li>出口竞争力提升</li><li>跨境资金流动受限</li>' } },
	{ type: 'title', props: { content: '建议措施' } },
	{ type: 'paragraph', props: { content: '请企业做好外汇风险管理，合理安排外汇收支时间。' } },
	{ type: 'content', props: { content: 'AAAAAA' } },
	{ type: 'ending', props: { content: 'END' } }
]; 