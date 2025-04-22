'use client';

import React from 'react';
import { componentTypes } from '../config/editorConfig'; // Import component types for mapping

export default function ComponentOutlineSidebar({
	isVisible,
	selectedComponent,
	onSelectComponent,
	onOpenStyleManager,
	onClose, // Function to close the sidebar
}) {
	if (!isVisible) return null;

	return (
		<div className="fixed left-0 top-0 bottom-0 bg-white shadow-lg p-3 flex flex-col space-y-2 z-30 w-64 transition-transform duration-300 ease-in-out transform translate-x-0 overflow-y-auto">
			{/* Header with close button */}
			<div className="flex justify-between items-center border-b pb-2 mb-2">
				<h3 className="text-sm font-semibold text-gray-700">组件导航</h3>
				<button
					onClick={onClose}
					className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
					aria-label="关闭组件导航"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{/* Component List */}
			{componentTypes.map(component => (
				<button
					key={component.id}
					className={`text-sm w-full px-3 py-2 rounded-md text-left ${selectedComponent === component.id
						? 'bg-blue-100 text-blue-700 font-medium'
						: 'text-gray-700 hover:bg-gray-100'
						}`}
					onClick={() => onSelectComponent(component.id)}
				>
					{component.name}
				</button>
			))}

			{/* Style Manager Button */}
			<div className="pt-3 mt-auto border-t border-gray-200">
				<button
					className="w-full text-sm px-3 py-2 bg-green-100 text-green-700 rounded-md text-center hover:bg-green-200 font-medium"
					onClick={onOpenStyleManager}
				>
					样式配置管理
				</button>
			</div>
		</div>
	);
} 