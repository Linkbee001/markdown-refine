'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { componentTypes, pageContent as defaultPageContent } from '../config/editorConfig'; // 导入组件类型和默认内容

// 驼峰式转短横线分隔 (kebab-case)
const camelToKebab = (str) => {
	return str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
};

// 生成CSS函数
const generateCustomCSSFromStyles = (styles) => {
	if (!styles) return '';
	let cssString = '';
	Object.entries(styles).forEach(([componentId, componentStyles]) => {
		const component = componentTypes.find(c => c.id === componentId);
		if (component && component.selector) {
			cssString += `body ${component.selector} {\n`;
			Object.entries(componentStyles).forEach(([prop, value]) => {
				if (value !== null && value !== '') {
					const kebabProp = camelToKebab(prop);
					cssString += `  ${kebabProp}: ${value} !important;\n`;
				}
			});
			cssString += '}\n';
		}
	});
	return cssString;
};

export function usePreviewUpdater(initialHtml = '', initialTempHtml = '', isEditorActive = false) {
	const [htmlResult, setHtmlResult] = useState(initialHtml);
	const [tempHtmlResult, setTempHtmlResult] = useState(initialTempHtml || initialHtml);
	const previewIframeRef = useRef(null);

	// 使用useEffect监听tempHtmlResult变化并更新iframe
	useEffect(() => {
		const updateIframeContent = () => {
			// 只有当编辑器打开（或预览需要更新时）、iframe存在且有内容时才更新
			// isEditorActive 应该由外部传入，决定是否处于编辑预览状态
			if (isEditorActive && previewIframeRef.current && tempHtmlResult) {
				const iframe = previewIframeRef.current;
				const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

				if (iframeDoc) {
					try {
						iframeDoc.open();
						iframeDoc.write(tempHtmlResult);
						iframeDoc.close();
					} catch (error) {
						console.error('Error updating iframe content via useEffect:', error);
					}
				}
			}
		};
		updateIframeContent();
	}, [tempHtmlResult, isEditorActive]); // 依赖项包含tempHtmlResult和isEditorActive

	// 更新预览HTML的核心逻辑
	const updatePreviewWithStyles = useCallback((stylesToUse, pageContent = defaultPageContent) => {
		// 创建一个包含所有组件HTML的临时字符串
		let updatedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            padding: 20px; 
            color: #333; 
            max-width: 100%;
            overflow-x: hidden;
            margin: 0;
          }
          /* 基础样式 */
          h1 { font-size: 28px; color: #111; margin-top: 0; font-weight: 700; }
          h2 { font-size: 22px; color: #0066cc; margin-top: 25px; font-weight: 600; }
          p { margin: 15px 0; font-size: 16px; }
          .date-component { font-size: 14px; color: #666; font-style: italic; margin: 5px 0 20px 0; }
          ul, ol { padding-left: 25px; }
          li { margin: 5px 0; }
          strong { color: #111; }
          .ending-component { margin-top: 30px; text-align: center; font-weight: bold; color: #0066cc; }
          .paragraph-component { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #0066cc; }
          /* 自定义样式 */
          ${generateCustomCSSFromStyles(stylesToUse)}
        </style>
      </head>
      <body>
    `;

		let titleCount = 0;
		pageContent.forEach((item, index) => {
			const component = componentTypes.find(c => c.id === item.type);
			if (component && component.template) {
				let componentHtml = component.template;
				if (item.type === 'title') {
					titleCount++;
					const level = titleCount === 1 ? 1 : 2;
					componentHtml = componentHtml.replace(/{{level}}/g, level);
				}
				Object.entries(item.props || {}).forEach(([key, value]) => {
					const regex = new RegExp(`{{${key}(\\s*\\|\\|\\s*[^}]+)?}}`, 'g');
					componentHtml = componentHtml.replace(regex, value);
				});
				componentHtml = componentHtml.replace(/{{[^}]+}}/g, '');
				updatedHtml += componentHtml;
			}
		});

		updatedHtml += `
      </body>
      </html>
    `;

		// 更新临时HTML结果状态，这将触发上面的useEffect
		setTempHtmlResult(updatedHtml);

	}, []); // 依赖项为空，因为它总是使用传入的参数或默认值

	return {
		htmlResult,
		setHtmlResult,
		tempHtmlResult,
		setTempHtmlResult,
		previewIframeRef,
		updatePreviewWithStyles,
		generateCustomCSSFromStyles, // 可能外部也需要用到
		camelToKebab // 可能外部也需要用到
	};
} 