'use client';

import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	CircularProgress,
	Box,
	Typography,
	Chip
} from '@mui/material';
import { useTranslations } from 'next-intl'; // 导入 useTranslations
import dynamic from 'next/dynamic';

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// Import style examples
import { styleExamples } from '../config/editorConfig'; // Adjust path if needed

// Assuming onSubmit expects an object like { markdown, prompt }
const BeautifyModal = ({
	open,
	onClose,
	initialMarkdown = '',
	initialPrompt = '',
	onSubmit, // Expects a function to be called with { markdown, prompt }
	isLoading = false,
	error = ''
}) => {
	const t = useTranslations('beautifyModal'); // 获取 beautifyModal 命名空间的翻译函数
	const [markdown, setMarkdown] = useState(initialMarkdown);
	const [prompt, setPrompt] = useState(initialPrompt);

	// Reset local state when initial props change (e.g., modal reopens with new defaults)
	useEffect(() => {
		// Only reset if the modal is actually opening with new initial values
		// This prevents overriding user input if props re-render for other reasons
		if (open) {
			setMarkdown(initialMarkdown);
		}
	}, [open, initialMarkdown]);

	useEffect(() => {
		if (open) {
			setPrompt(initialPrompt);
		}
	}, [open, initialPrompt]);

	const handleSubmit = () => {
		if (onSubmit && !isLoading) {
			onSubmit({ markdown, prompt }); // Pass local state to the handler
		}
	};

	// Prevent closing dialog by clicking outside or pressing Esc if loading
	const handleDialogClose = (event, reason) => {
		if (isLoading && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
			return; // Do nothing if loading
		}
		if (onClose) {
			onClose();
		}
	};

	const handlePresetClick = (presetPrompt) => {
		setPrompt(presetPrompt);
	};

	return (
		<Dialog
			open={open}
			onClose={handleDialogClose}
			fullWidth
			maxWidth="md" // Adjust size as needed
			disableEscapeKeyDown={isLoading} // Disable Esc key if loading
		>
			<DialogTitle>{t('title')}</DialogTitle>
			<DialogContent dividers>
				{/* Display Error */}
				{error && (
					<Typography color="error" variant="body2" sx={{ mb: 2 }}>
						{t('error', { error })}
					</Typography>
				)}

				{/* Preset Style Buttons */}
				<Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
					<Typography variant="caption" sx={{ width: '100%', mb: 0.5, color: 'text.secondary' }}>
						{t('selectPresetStyle')}
					</Typography>
					{styleExamples.map((style, index) => (
						<Chip
							key={index}
							label={style.name}
							onClick={() => handlePresetClick(style.prompt)}
							disabled={isLoading}
							size="small"
							variant="outlined"
							clickable
						/>
					))}
				</Box>

				{/* Prompt Input */}
				<TextField
					label={t('customPromptLabel')}
					variant="outlined"
					fullWidth
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					sx={{ mb: 2 }}
					disabled={isLoading}
					minRows={2} // Allow slightly more space for prompt
					multiline
				/>

				{/* Markdown Input */}
				<Box sx={{ mb: 2 }} data-color-mode="light"> {/* data-color-mode="light" is often needed for MDEditor themes */}
					<Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary', display: 'block' }}>
						{t('markdownLabel')}
					</Typography>
					<MDEditor
						value={markdown}
						onChange={(value) => setMarkdown(value || '')}
						height={400} // Adjust height as needed
						preview="edit" // Show only editor, or "live" for live preview, "preview" for only preview
					// visibleDragbar={false} // Optionally hide the drag bar
					// extraCommands={[]} // Optionally add extra commands
					// commands={[]} // Optionally customize commands
					/>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: '16px 24px' }}>
				<Button onClick={onClose} disabled={isLoading} color="secondary">
					{t('cancel')}
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					disabled={isLoading}
					startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
				>
					{isLoading ? t('processing') : t('startBeautify')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default BeautifyModal; 