'use client';

import React, { useEffect, useRef } from 'react';
import {
	Box,
	Paper,
	Typography,
	Button,
	CircularProgress,
} from '@mui/material';
import { useTranslations } from 'next-intl';

// 移动设备框架组件
const MobileDeviceFrame = ({ children, innerRef }) => (
	<Box
		sx={{
			width: 350, // 进一步减小宽度
			height: 650, // 进一步减小高度
			maxHeight: 'calc(100vh - 120px)', // 确保不会超过视口高度
			border: "12px solid #111",
			borderRadius: "32px",
			backgroundColor: "#f8f8f8",
			boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
			overflow: "hidden",
			position: "relative",
			margin: "auto",
			display: "flex",
			flexDirection: "column",
		}}
	>
		{/* 顶部刘海 */}
		<Box sx={{ position: 'absolute', top: 0, width: '55%', height: '20px', backgroundColor: '#111', zIndex: 2, borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', left: '50%', transform: 'translateX(-50%)' }} />
		<Box
			ref={innerRef}
			sx={{
				mt: "20px", // 减小刘海空间
				flexGrow: 1,
				width: "100%",
				height: "calc(100% - 24px)", // 减去刘海和底部指示器的高度
				overflowY: "auto", // 滚动条在这里显示
				backgroundColor: "white",
				p: "10px", // 修改为四周都有内边距
			}}
		>
			{children}
		</Box>
		{/* 底部Home指示器 */}
		<Box sx={{ height: "4px", backgroundColor: "#111", width: "40%", mx: "auto", mb: 1, borderRadius: "2px" }} />
	</Box>
);

export default function PreviewPanel({
	htmlResult,
	tempHtmlResult,
	isLoading,
	error,
	onClearError,
	selectedElementIds, // Use plural name for array
	isMergeModeEnabled // Receive merge mode status
}) {
	const t = useTranslations('page');
	const previewScrollContainerRef = useRef(null);

	// 日志记录，以帮助调试
	useEffect(() => {
		console.log("PreviewPanel MUI rendered:", {
			hasHtmlResult: !!htmlResult,
			htmlResultLength: htmlResult?.length || 0,
			hasTempHtml: !!tempHtmlResult,
			isLoading,
			hasError: !!error,
			selectedElementIds,
			isMergeModeEnabled
		});
	}, [htmlResult, tempHtmlResult, isLoading, error, selectedElementIds, isMergeModeEnabled]);

	// 获取要显示的HTML
	const htmlToRender = tempHtmlResult || htmlResult;

	// 高亮选中的元素 & 滚动到选中的元素 (if applicable)
	useEffect(() => {
		const previewElementContainer = previewScrollContainerRef.current;
		if (!previewElementContainer || !htmlToRender) return;

		// --- 高亮逻辑 (Highlight ALL selected IDs) ---
		// 移除所有现有高亮
		previewElementContainer.querySelectorAll('.selected-component-highlight').forEach(el => {
			el.classList.remove('selected-component-highlight');
		});

		// 如果有选中的元素ID，添加高亮
		if (selectedElementIds && selectedElementIds.length > 0) {
			selectedElementIds.forEach(id => {
				const selectedElement = previewElementContainer.querySelector(`#${id}`);
				if (selectedElement) {
					selectedElement.classList.add('selected-component-highlight');
				} else {
					console.warn(`[PreviewPanel] Element with ID #${id} not found for highlighting.`);
				}
			});
		}

		// --- 滚动逻辑 (Scroll only in Normal mode on single selection) ---
		if (!isMergeModeEnabled && selectedElementIds && selectedElementIds.length === 1) {
			const singleSelectedElement = previewElementContainer.querySelector(`#${selectedElementIds[0]}`);
			if (singleSelectedElement) {
				singleSelectedElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'nearest'
				});
			}
		}

	}, [htmlToRender, selectedElementIds, isMergeModeEnabled]);

	return (
		<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: 'hidden', height: '100%' }}>
			<Paper
				elevation={0}
				sx={{
					p: 1,
					mb: 1,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexShrink: 0,
				}}
			>
				<Typography variant="subtitle1">{t('previewPanel.title') || '预览'}</Typography>
			</Paper>

			<Paper
				elevation={2}
				sx={{
					flexGrow: 1,
					overflow: "auto",
					position: "relative",
					p: 1,
					backgroundColor: '#f0f0f0',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100%',
					'& .temp-highlight': {
						outline: '2px solid blue !important',
						boxShadow: '0 0 5px blue !important',
						transition: 'outline 0.3s ease, box-shadow 0.3s ease',
						cursor: 'pointer',
					},
					'& .paragraph-component[id]': {
						cursor: 'pointer',
						transition: 'background-color 0.2s ease',
					},
					'& .paragraph-component[id]:hover': {
						backgroundColor: 'rgba(0, 0, 255, 0.05)',
					},
					// 修改选中元素的高亮样式
					'& .selected-component-highlight': {
						position: 'relative',
						outline: '3px solid #ff5722 !important',
						outlineOffset: '2px !important', // 添加外轮廓偏移，防止被遮挡
						boxShadow: '0 0 8px rgba(255, 87, 34, 0.4) !important',
						animation: 'pulse 1.5s infinite',
						marginTop: '6px !important', // 为第一个元素添加顶部空间
						paddingTop: '2px !important', // 内部也添加一些空间
					},
					// 修改 ::before 样式，在选中元素上方显示标记
					'& .selected-component-highlight::before': {
						content: '"✓"',
						position: 'absolute',
						top: '-16px', // 调整标记位置
						right: '-2px',
						background: '#ff5722',
						color: 'white',
						width: '20px',
						height: '20px',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						borderRadius: '50%',
						fontSize: '12px',
						fontWeight: 'bold',
						zIndex: 10,
						boxShadow: '0 0 3px rgba(0,0,0,0.3)',
					},
					// 添加动画效果
					'@keyframes pulse': {
						'0%': {
							boxShadow: '0 0 0 0 rgba(255, 87, 34, 0.4)',
						},
						'70%': {
							boxShadow: '0 0 0 5px rgba(255, 87, 34, 0)',
						},
						'100%': {
							boxShadow: '0 0 0 0 rgba(255, 87, 34, 0)',
						},
					},
				}}
			>
				{isLoading && (
					<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
						<CircularProgress />
					</Box>
				)}

				{!isLoading && error && (
					<Box sx={{ p: 2, color: 'error.main', textAlign: 'center', width: '100%' }}>
						<Typography variant="h6">{t('error.title') || '错误'}</Typography>
						<Typography variant="body1">{error}</Typography>
						<Button onClick={onClearError} sx={{ mt: 1 }}>{t('error.dismiss') || '关闭'}</Button>
					</Box>
				)}

				{!isLoading && !error && htmlToRender && (
					<MobileDeviceFrame innerRef={previewScrollContainerRef}>
						<Box
							sx={{
								'& > *:first-of-type': {
									marginTop: '8px !important'
								}
							}}
							dangerouslySetInnerHTML={{ __html: htmlToRender }}
						/>
					</MobileDeviceFrame>
				)}

				{!isLoading && !error && !htmlToRender && (
					<Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', width: '100%' }}>
						<Typography variant="body1">{t('previewPanel.emptyState') || '预览将在此处显示...'}</Typography>
					</Box>
				)}
			</Paper>
		</Box>
	);
} 