'use client';

import { useState, useCallback } from 'react';
import { componentTypes } from '../config/editorConfig'; // 导入组件类型

// 假设 updatePreviewWithStyles 函数可以从外部传入或在这里定义
// 为简单起见，我们假设它会被作为参数传入

export function useStyleEditor(initialStyles = {}, updatePreviewCallback) {
	const [customStyles, setCustomStyles] = useState(initialStyles);
	const [selectedComponent, setSelectedComponent] = useState(null);
	const [isEditorOpen, setIsEditorOpen] = useState(false);

	// 处理组件选择
	const handleComponentSelect = useCallback((componentId) => {
		setSelectedComponent(componentId);
		setIsEditorOpen(true);
	}, []);

	// 处理样式变更
	const handleStyleChange = useCallback((prop, value) => {
		if (!selectedComponent) return;

		const newStyles = {
			...customStyles,
			[selectedComponent]: {
				...(customStyles[selectedComponent] || {}),
				[prop]: value
			}
		};

		setCustomStyles(newStyles);
		if (updatePreviewCallback) {
			updatePreviewCallback(newStyles);
		}

		// console.log(`应用样式: ${selectedComponent}.${prop} = ${value}`);
		// console.log('更新后的样式对象:', newStyles);
	}, [selectedComponent, customStyles, updatePreviewCallback]);

	// 应用样式模板
	const applyStyleTemplate = useCallback((templateId) => {
		if (!selectedComponent) return;

		const component = componentTypes.find(c => c.id === selectedComponent);
		if (!component) return;

		const templateList = component.styleTemplates || [];
		const template = templateList.find(t => t.id === templateId);

		if (!template) {
			console.error(`未找到样式模板: ${templateId}`);
			return;
		}

		// console.log(`应用样式模板: ${templateId} 到 ${selectedComponent}`);
		// console.log('模板样式:', template.styles);

		const newStyles = {
			...customStyles,
			[selectedComponent]: {
				...(customStyles[selectedComponent] || {}),
				...template.styles
			}
		};

		setCustomStyles(newStyles);
		if (updatePreviewCallback) {
			updatePreviewCallback(newStyles);
		}
	}, [selectedComponent, customStyles, updatePreviewCallback]);

	// 保存样式更改 (这里指关闭编辑器，实际保存发生在更新customStyles时)
	const saveStyleChanges = useCallback(() => {
		// 可以在这里添加将tempHtmlResult更新到htmlResult的逻辑，如果需要的话
		setIsEditorOpen(false);
	}, []);

	// 取消样式更改 (这里指关闭编辑器，可能需要恢复预览)
	const cancelStyleChanges = useCallback((originalHtml) => {
		// 可能需要恢复到应用样式前的状态，但这比较复杂
		// 简单处理：关闭编辑器，并可能需要用原始HTML重置预览
		if (updatePreviewCallback) {
			// 假设回调可以处理空参数来恢复原始预览
			// 或者传入一个标记来指示取消
			// updatePreviewCallback(null, { action: 'cancel' }); 
		}
		setIsEditorOpen(false);
	}, [updatePreviewCallback]);

	return {
		customStyles,
		setCustomStyles, // 暴露以便StyleConfigManager可以设置它
		selectedComponent,
		isEditorOpen,
		handleComponentSelect,
		handleStyleChange,
		applyStyleTemplate,
		saveStyleChanges,
		cancelStyleChanges,
		setIsEditorOpen // 可能需要暴露给外部关闭
	};
} 