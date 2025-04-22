'use client';

import React from 'react';
import { componentTypes, styleProperties } from '../config/editorConfig';

export default function StyleEditorModal({
	isOpen,
	selectedComponent,
	customStyles,
	onStyleChange,
	onApplyTemplate,
	onSave, // Renamed from saveStyleChanges for clarity
	onCancel, // Renamed from cancelStyleChanges for clarity
}) {
	if (!isOpen || !selectedComponent) return null;

	const componentConfig = componentTypes.find(c => c.id === selectedComponent);
	const properties = styleProperties[selectedComponent] || [];
	const templates = componentConfig?.styleTemplates || [];
	const currentComponentStyles = customStyles[selectedComponent] || {};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
				{/* Modal Header */}
				<div className="flex justify-between items-center p-4 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-800">{componentConfig?.name || '组件'} 样式设置</h3>
					<button onClick={onCancel} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100" aria-label="关闭样式编辑器">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Modal Body (Scrollable) */}
				<div className="p-4 overflow-y-auto flex-grow">
					{/* Preset Templates */}
					{templates.length > 0 && (
						<div className="mb-6">
							<h4 className="text-sm font-medium text-gray-600 mb-2">预设样式</h4>
							<div className="flex flex-wrap gap-2">
								{templates.map((template) => (
									<button
										key={template.id}
										className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
										onClick={() => onApplyTemplate(template.id)}
									>
										{template.name}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Style Properties */}
					<div className="space-y-4">
						{properties.map((prop) => (
							<div key={prop.id} className="flex flex-col">
								<label htmlFor={`${selectedComponent}-${prop.id}`} className="text-sm font-medium text-gray-700 mb-1">{prop.name}</label>

								{prop.type === 'range' && (
									<div className="flex items-center space-x-3">
										<input
											type="range"
											id={`${selectedComponent}-${prop.id}`}
											min={prop.min}
											max={prop.max}
											step={prop.step || '1'}
											value={(currentComponentStyles[prop.id] || '').replace(prop.unit || '', '')}
											onChange={(e) => onStyleChange(prop.id, `${e.target.value}${prop.unit || ''}`)}
											className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
										/>
										<span className="text-sm text-gray-600 min-w-[50px] text-right">
											{currentComponentStyles[prop.id] || `${prop.min}${prop.unit || ''}`}
										</span>
									</div>
								)}

								{prop.type === 'color' && (
									<input
										type="color"
										id={`${selectedComponent}-${prop.id}`}
										value={currentComponentStyles[prop.id] || '#000000'}
										onChange={(e) => onStyleChange(prop.id, e.target.value)}
										className="h-10 w-full p-1 border border-gray-300 rounded-md cursor-pointer"
									/>
								)}

								{prop.type === 'select' && (
									<select
										id={`${selectedComponent}-${prop.id}`}
										value={currentComponentStyles[prop.id] || ''}
										onChange={(e) => onStyleChange(prop.id, e.target.value)}
										className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
									>
										<option value="">-- 选择 --</option>
										{prop.options.map(option => (
											<option key={option} value={option}>{option}</option>
										))}
									</select>
								)}

								{prop.type === 'text' && (
									<input
										type="text"
										id={`${selectedComponent}-${prop.id}`}
										placeholder={prop.placeholder || ''}
										value={currentComponentStyles[prop.id] || ''}
										onChange={(e) => onStyleChange(prop.id, e.target.value)}
										className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
									/>
								)}
							</div>
						))}
						{properties.length === 0 && (
							<p className="text-sm text-gray-500 italic">此组件类型没有可用的样式选项。</p>
						)}
					</div>
				</div>

				{/* Modal Footer */}
				<div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 mr-3"
					>
						关闭
					</button>
					{/* Removed the explicit "Apply" button as changes are applied instantly 
          <button
            onClick={onSave}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
          >
            应用样式
          </button> 
          */}
				</div>
			</div>
		</div>
	);
} 