// src/services/htmlService.js
// 提供HTML处理的工具函数，包括组件提取、替换和修复

import { JSDOM } from "jsdom";

/**
 * 添加基本组件类和ID到HTML
 * @param {string} html - 原始HTML
 * @returns {string} 处理后的HTML
 */
export function addComponentClassesToHtml(html) {
	try {
		const dom = new JSDOM(html);
		const document = dom.window.document;

		// 为日期元素添加类名
		const dateElements = document.querySelectorAll("time");
		dateElements.forEach((el, i) => {
			el.classList.add("date-component");
			if (!el.id) el.id = `date-component-${i + 1}`;
		});

		// 为段落添加类名
		const paragraphs = document.querySelectorAll("p");
		paragraphs.forEach((p, i) => {
			if (!p.id) p.id = `paragraph-${i + 1}`;
			if (!p.classList.contains('paragraph-component')) {
				p.classList.add('paragraph-component');
			}

			// 日期格式检测 (如 2024.11.6/星期二)
			if (/\d{4}\.\d{1,2}\.\d{1,2}(\/星期[一二三四五六日])?/.test(p.textContent)) {
				p.classList.add('date-component');
			}
		});

		const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
		headings.forEach((h, i) => {
			const level = h.tagName.substring(1);
			h.classList.add(`heading-component`);
			h.classList.add(`heading-${level}`);
			h.id = `heading-${level}-${i + 1}`;
		});

		// 为结尾标记添加类名
		const endingElements = document.querySelectorAll('p, strong');
		endingElements.forEach(el => {
			if (el.textContent.trim() === 'END' || el.textContent.trim() === 'END.') {
				el.classList.add('ending-component');
			}
		});

		return dom.serialize();
	} catch (error) {
		console.error("添加组件类时出错:", error);
		return html; // 发生错误时返回原始HTML
	}
}

/**
 * 从完整HTML中提取指定组件的HTML
 * @param {string} fullHtml - 完整HTML文档
 * @param {string} componentId - 要提取的组件ID
 * @returns {Object} 提取结果
 */
export function extractComponentHtml(fullHtml, componentId) {
	console.log(`提取组件[${componentId}]的HTML...`);

	if (!fullHtml || !componentId) {
		return {
			success: false,
			error: "缺少HTML内容或组件ID"
		};
	}

	try {
		// 创建DOM以提取组件
		const dom = new JSDOM(fullHtml);
		const document = dom.window.document;

		// 查找指定ID的组件
		const component = document.getElementById(componentId);

		if (!component) {
			console.warn(`未找到ID为[${componentId}]的组件`);
			return {
				success: false,
				error: `未找到ID为[${componentId}]的组件`
			};
		}

		// 提取组件的outerHTML
		const componentHtml = component.outerHTML;
		console.log(`成功提取组件HTML, 长度: ${componentHtml.length}`);

		return {
			success: true,
			componentHtml,
			componentElement: component,
			dom: dom
		};
	} catch (error) {
		console.error(`提取组件HTML出错: ${error.message}`);
		return {
			success: false,
			error: `提取组件失败: ${error.message}`
		};
	}
}

/**
 * 将美化后的组件HTML替换回原始文档中
 * @param {string} fullHtml - 完整HTML文档
 * @param {string} componentId - 组件ID
 * @param {string} beautifiedComponentHtml - 美化后的组件HTML
 * @returns {Object} 替换结果
 */
export function replaceComponentInHtml(fullHtml, componentId, beautifiedComponentHtml) {
	console.log(`替换组件[${componentId}]...`);

	if (!fullHtml || !componentId || !beautifiedComponentHtml) {
		return {
			success: false,
			error: "替换组件失败: 缺少必要参数"
		};
	}

	try {
		// 创建DOM
		const dom = new JSDOM(fullHtml);
		const document = dom.window.document;

		// 查找需要替换的组件
		const originalComponent = document.getElementById(componentId);

		if (!originalComponent) {
			console.warn(`未找到要替换的组件[${componentId}]`);
			return {
				success: false,
				error: `未找到要替换的组件[${componentId}]`
			};
		}

		// 创建临时DOM以解析美化后的组件HTML
		const tempDom = new JSDOM(`<div>${beautifiedComponentHtml}</div>`);
		const beautifiedElement = tempDom.window.document.body.firstChild;

		// 使用importNode确保所有事件、属性等正确复制
		const importedNode = document.importNode(beautifiedElement, true);

		// 替换原组件
		originalComponent.parentNode.replaceChild(importedNode, originalComponent);

		const resultHtml = dom.serialize();
		console.log(`组件替换成功，更新后HTML长度: ${resultHtml.length}`);

		return {
			success: true,
			updatedHtml: resultHtml
		};
	} catch (error) {
		console.error(`替换组件出错: ${error.message}`);
		return {
			success: false,
			error: `替换组件失败: ${error.message}`,
			originalHtml: fullHtml // 返回原始HTML以防出错
		};
	}
}

/**
 * 验证和修复AI生成的组件HTML
 * @param {string} beautifiedHtml - AI生成的美化HTML 
 * @param {string} originalHtml - 原始HTML，用于提取ID和标签
 * @returns {string} 修复后的HTML
 */
export function validateAndFixComponentHtml(beautifiedHtml, originalHtml) {
	if (!beautifiedHtml) {
		return originalHtml;
	}

	// 提取原始组件ID
	const idMatch = originalHtml.match(/id=["']([^"']*)["']/i);
	const originalId = idMatch ? idMatch[1] : null;

	// 如果美化的HTML看起来不完整或没有保留ID
	if (!beautifiedHtml.includes('>') || (originalId && !beautifiedHtml.includes(`id="${originalId}"`) && !beautifiedHtml.includes(`id='${originalId}'`))) {
		console.warn(`AI返回的HTML不完整或ID丢失，进行修复`);

		// 提取原始标签名
		const tagMatch = originalHtml.match(/<([a-z0-9]+)[\s>]/i);
		const tagName = tagMatch ? tagMatch[1] : 'div';

		// 提取原始类名
		const classMatch = originalHtml.match(/class=["']([^"']*)["']/i);
		const originalClass = classMatch ? classMatch[1] : '';

		// 重新构建带有原始ID和类的标签
		let fixedHtml = `<${tagName} id="${originalId}"`;
		if (originalClass) {
			fixedHtml += ` class="${originalClass}"`;
		}
		fixedHtml += ` style="color:blue;">${beautifiedHtml}</${tagName}>`;

		console.log(`修复后的HTML: ${fixedHtml}`);
		return fixedHtml;
	}

	return beautifiedHtml;
}

/**
 * 从HTML内容创建基本大纲
 * @param {string} contentHtml - HTML内容
 * @returns {Object} 包含大纲和可能更新过的HTML
 */
export function createBasicOutlineFromHtml(contentHtml) {
	try {
		// 创建一个基本的大纲，主要包含标题元素
		const dom = new JSDOM(contentHtml);
		const document = dom.window.document;
		const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

		const outline = Array.from(headings).map((heading, index) => {
			const id = heading.id || `auto-outline-${index + 1}`;
			// 如果元素没有ID，添加一个
			if (!heading.id) {
				heading.id = id;
			}
			return {
				id: id,
				type: "heading",
				contentPreview: heading.textContent.substring(0, 50) + (heading.textContent.length > 50 ? '...' : ''),
				tagName: heading.tagName.toLowerCase(),
				specialComponents: []
			};
		});

		// 如果没有大纲项，添加一个根部项
		if (outline.length === 0) {
			outline.push({
				id: "document-root",
				type: "document",
				contentPreview: "完整文档",
				tagName: "body",
				specialComponents: []
			});
		}

		// 返回更新后的HTML和大纲
		return {
			outline: outline,
			updatedHtml: dom.window.document.body.innerHTML
		};
	} catch (error) {
		console.error("创建基本大纲时出错:", error);
		// 返回一个基本项
		return {
			outline: [{
				id: "document-root",
				type: "document",
				contentPreview: "文档内容",
				tagName: "body",
				specialComponents: []
			}],
			updatedHtml: contentHtml
		};
	}
} 