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

// Import style examples
import { styleExamples } from '../config/editorConfig'; // Adjust path if needed

// Assuming onSubmit expects an object like { markdown, prompt }
const BeautifyModal = ({
	isOpen,
	onClose,
	initialMarkdown = '',
	initialPrompt = '',
	onSubmit, // Expects a function to be called with { markdown, prompt }
	isLoading = false,
	error = ''
}) => {
	const [markdown, setMarkdown] = useState(initialMarkdown);
	const [prompt, setPrompt] = useState(initialPrompt);

	// Reset local state when initial props change (e.g., modal reopens with new defaults)
	useEffect(() => {
		// Only reset if the modal is actually opening with new initial values
		// This prevents overriding user input if props re-render for other reasons
		if (isOpen) {
			setMarkdown(initialMarkdown);
		}
	}, [isOpen, initialMarkdown]);

	useEffect(() => {
		if (isOpen) {
			setPrompt(initialPrompt);
		}
	}, [isOpen, initialPrompt]);

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
			open={isOpen}
			onClose={handleDialogClose}
			fullWidth
			maxWidth="md" // Adjust size as needed
			disableEscapeKeyDown={isLoading} // Disable Esc key if loading
		>
			<DialogTitle>文本美化</DialogTitle>
			<DialogContent dividers>
				{/* Display Error */}
				{error && (
					<Typography color="error" variant="body2" sx={{ mb: 2 }}>
						错误: {error}
					</Typography>
				)}

				{/* Preset Style Buttons */}
				<Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
					<Typography variant="caption" sx={{ width: '100%', mb: 0.5, color: 'text.secondary' }}>
						选择预设风格:
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
					label="或自定义提示词 (Prompt)"
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
				<TextField
					label="Markdown 原文"
					variant="outlined"
					fullWidth
					multiline
					rows={15} // Adjust rows as needed
					value={markdown}
					onChange={(e) => setMarkdown(e.target.value)}
					disabled={isLoading}
					InputProps={{
						style: { fontFamily: 'monospace' } // Optional: Use monospace font
					}}
				/>
			</DialogContent>
			<DialogActions sx={{ p: '16px 24px' }}>
				<Button onClick={onClose} disabled={isLoading} color="secondary">
					取消
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					disabled={isLoading}
					startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
				>
					{isLoading ? '处理中...' : '开始美化'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default BeautifyModal; 