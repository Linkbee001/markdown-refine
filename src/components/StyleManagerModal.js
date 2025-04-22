'use client';

import React from 'react';
import { DEFAULT_STYLE_CONFIG } from '../config/editorConfig';

export default function StyleManagerModal({
	isOpen,
	savedConfigs,
	currentConfigName,
	currentStyles, // Need current styles to save
	onSaveConfig,
	onLoadConfig,
	onDeleteConfig,
	onClose,
	setCurrentConfigNameState, // Allow updating the input field state directly
}) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
				{/* Modal Header */}
				<div className="flex justify-between items-center p-4 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-800">样式配置管理</h3>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100" aria-label="关闭样式管理器">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Modal Body (Scrollable) */}
				<div className="p-4 overflow-y-auto flex-grow">
					{/* Save Current Config Section */}
					<div className="mb-6 pb-4 border-b border-gray-200">
						<h4 className="text-sm font-medium text-gray-600 mb-2">保存当前样式配置</h4>
						<div className="flex items-center gap-2">
							<input
								type="text"
								placeholder="输入配置名称..."
								value={currentConfigName}
								onChange={(e) => setCurrentConfigNameState(e.target.value)} // Update local state for input
								className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
							/>
							<button
								onClick={() => onSaveConfig(currentConfigName, currentStyles)} // Pass current styles from parent
								className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 whitespace-nowrap"
							>
								保存
							</button>
						</div>
						<p className="text-xs text-gray-500 mt-1">如果名称已存在，将覆盖原有配置。</p>
					</div>

					{/* Saved Configs List Section */}
					<div>
						<h4 className="text-sm font-medium text-gray-600 mb-2">已保存的样式配置</h4>
						{savedConfigs.length > 1 ? (
							<div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
								{savedConfigs.map((config) => (
									<div key={config.configName} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
										<span className={`text-sm font-medium ${config.configName === currentConfigName ? 'text-blue-600' : 'text-gray-800'}`}>
											{config.configName}
										</span>
										<div className="flex items-center gap-2 flex-shrink-0">
											<button
												onClick={() => onLoadConfig(config.configName)}
												className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-300"
												disabled={config.configName === currentConfigName}
											>
												加载
											</button>
											{config.configName !== DEFAULT_STYLE_CONFIG.configName && (
												<button
													onClick={() => onDeleteConfig(config.configName)}
													className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-1 focus:ring-red-300"
													aria-label={`删除配置 ${config.configName}`}
												>
													删除
												</button>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-gray-500 italic">还没有保存任何自定义样式配置。</p>
						)}
					</div>
				</div>

				{/* Modal Footer */}
				<div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
					>
						关闭
					</button>
				</div>
			</div>
		</div>
	);
} 