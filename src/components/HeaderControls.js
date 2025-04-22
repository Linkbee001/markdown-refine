'use client';

import React, { useState } from 'react';
import { styleExamples } from '../config/editorConfig';

export default function HeaderControls({
	prompt,
	setPrompt,
	isLoading,
	onBeautify,
	onLoadTestHTML,
	onCopyHtml,
	copyButtonText,
	htmlResult,
	onExport,
}) {
	const [isShowingExamples, setIsShowingExamples] = useState(false);
	const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

	const handleSelectStyle = (selectedPrompt) => {
		setPrompt(selectedPrompt);
		setIsShowingExamples(false);
	};

	return (
		<div className="p-4 bg-white border-b border-gray-200 flex items-center gap-4 flex-wrap shadow-sm">
			<h1 className="text-xl font-bold text-gray-800 mr-auto">Markdown 美化器</h1>
			<div className="flex-grow md:flex-grow-0 md:w-96 relative">
				<label htmlFor="prompt" className="sr-only">
					风格提示
				</label>
				<div className="flex items-center">
					<input
						type="text"
						id="prompt"
						className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="输入风格提示 (例如：暗色主题)..."
						disabled={isLoading}
					/>
					<button
						onClick={() => setIsShowingExamples(!isShowingExamples)}
						className="ml-2 text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
						disabled={isLoading}
					>
						样式示例
					</button>
				</div>

				{isShowingExamples && (
					<div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
						{styleExamples.map((style, index) => (
							<button
								key={index}
								className="block w-full text-left p-2 hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
								onClick={() => handleSelectStyle(style.prompt)}
							>
								<span className="font-medium">{style.name}</span>
								<p className="text-xs text-gray-500 truncate">{style.prompt}</p>
							</button>
						))}
					</div>
				)}
			</div>
			<button
				onClick={onBeautify}
				disabled={isLoading}
				className={`px-4 py-2 text-white font-medium rounded-md transition-colors min-w-[100px] text-center ${isLoading
					? 'bg-gray-400 cursor-not-allowed'
					: 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
					}`}
			>
				{isLoading ? '处理中...' : 'AI 美化'}
			</button>

			<button
				onClick={onLoadTestHTML}
				disabled={isLoading}
				className={`px-4 py-2 text-white font-medium rounded-md transition-colors min-w-[100px] text-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
			>
				快速测试
			</button>

			<button
				onClick={onCopyHtml}
				disabled={!htmlResult || isLoading}
				className={`px-4 py-2 text-white font-medium rounded-md transition-colors min-w-[100px] text-center ${!htmlResult || isLoading
					? 'bg-gray-300 text-gray-500 cursor-not-allowed'
					: copyButtonText.includes('失败')
						? 'bg-red-500 hover:bg-red-600'
						: copyButtonText.includes('已复制')
							? 'bg-green-500 hover:bg-green-600'
							: 'bg-indigo-600 hover:bg-indigo-700'
					} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
			>
				{copyButtonText}
			</button>

			{/* 导出按钮 */}
			<div className="relative">
				<button
					onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
					disabled={!htmlResult || isLoading}
					className={`px-4 py-2 text-white font-medium rounded-md transition-colors min-w-[100px] text-center ${!htmlResult || isLoading
						? 'bg-gray-300 text-gray-500 cursor-not-allowed'
						: 'bg-amber-600 hover:bg-amber-700'
						} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
				>
					导出
				</button>

				{isExportMenuOpen && (
					<div className="absolute z-20 mt-1 right-0 w-40 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
						<button
							className="w-full text-left p-2 hover:bg-gray-100 text-sm border-b border-gray-100"
							onClick={() => { onExport('html'); setIsExportMenuOpen(false); }}
						>
							导出为 HTML
						</button>
						<button
							className="w-full text-left p-2 hover:bg-gray-100 text-sm border-b border-gray-100"
							onClick={() => { onExport('image'); setIsExportMenuOpen(false); }}
						>
							导出为图片
						</button>
						<button
							className="w-full text-left p-2 hover:bg-gray-100 text-sm"
							onClick={() => { onExport('markdown'); setIsExportMenuOpen(false); }}
						>
							导出为 Markdown
						</button>
					</div>
				)}
			</div>
		</div>
	);
} 