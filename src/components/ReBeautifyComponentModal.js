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
	Typography
} from '@mui/material';
import { useTranslations } from 'next-intl';

const ReBeautifyComponentModal = ({
	open,
	onClose,
	onSubmit, // Expects a function to be called with { componentPrompt }
	isLoading = false,
	error = '',
	initialPrompt = '',
	elementId = null,
	elementType = ''
}) => {
	const t = useTranslations('reBeautifyComponentModal');
	const [componentPrompt, setComponentPrompt] = useState(initialPrompt);

	useEffect(() => {
		if (open) {
			setComponentPrompt(initialPrompt);
		}
	}, [open, initialPrompt]);

	const handleSubmit = () => {
		if (onSubmit && !isLoading) {
			onSubmit({ componentPrompt });
		}
	};

	const handleDialogClose = (event, reason) => {
		if (isLoading && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
			return;
		}
		if (onClose) {
			onClose();
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleDialogClose}
			fullWidth
			maxWidth="sm"
			disableEscapeKeyDown={isLoading}
		>
			<DialogTitle>
				{t('title')}
				{elementType && elementId && ` (${elementType}#${elementId})`}
			</DialogTitle>
			<DialogContent dividers>
				{error && (
					<Typography color="error" variant="body2" sx={{ mb: 2 }}>
						{/* Assuming a generic error translation or you can add a specific one */}
						{t('errorPrefix', { message: error }) || `Error: ${error}`}
					</Typography>
				)}
				<TextField
					label={t('promptLabel')}
					variant="outlined"
					fullWidth
					value={componentPrompt}
					onChange={(e) => setComponentPrompt(e.target.value)}
					sx={{ mt: 1, mb: 2 }}
					disabled={isLoading}
					minRows={3}
					multiline
					placeholder={t('promptPlaceholder')}
				/>
				<Typography variant="caption" color="text.secondary">
					{t('promptTip')}
				</Typography>
			</DialogContent>
			<DialogActions sx={{ p: '16px 24px' }}>
				<Button onClick={onClose} disabled={isLoading} color="secondary">
					{t('cancel')}
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					disabled={isLoading || !componentPrompt.trim()} // Disable if prompt is empty
					startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
				>
					{isLoading ? t('processing') : t('submit')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ReBeautifyComponentModal; 