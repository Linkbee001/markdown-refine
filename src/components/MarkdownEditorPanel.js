'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the MDEditor with SSR disabled
const MDEditor = dynamic(
	() => import("@uiw/react-md-editor"),
	{ ssr: false }
);

export default function MarkdownEditorPanel({ markdown, setMarkdown }) {
	return (
		<div className="flex-1 p-4 flex flex-col overflow-hidden" data-color-mode="light">
			<h2 className="text-lg font-semibold mb-2 text-gray-700 sr-only">Markdown 输入</h2>
			<div className="flex-grow border border-gray-300 rounded-md overflow-hidden">
				<MDEditor
					value={markdown}
					onChange={(val) => setMarkdown(val || '')}
					height="100%"
					preview="edit"
					className="h-full"
				// 可选：添加更多编辑器配置
				// visibleDragbar={false}
				// previewOptions={{
				//   linkTarget: '_blank'
				// }}
				/>
			</div>
		</div>
	);
} 