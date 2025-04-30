'use client';

import React, { useState } from 'react';
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Box,
	Menu,
	MenuItem,
	CircularProgress
} from '@mui/material';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function HeaderControls({
	isLoading,
	onBeautify,
	onLoadTestHTML,
	onCopyHtml,
	copyButtonText,
	htmlResult,
	onExport,
}) {
	const t = useTranslations();
	const [exportAnchorEl, setExportAnchorEl] = useState(null);
	const isExportMenuOpen = Boolean(exportAnchorEl);

	const handleExportMenuClick = (event) => {
		setExportAnchorEl(event.currentTarget);
	};

	const handleExportMenuClose = () => {
		setExportAnchorEl(null);
	};

	const handleExportAction = (format) => {
		onExport(format);
		handleExportMenuClose();
	};

	return (
		<AppBar position="static" color="default" elevation={0}>
			<Toolbar sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: { xs: 1, sm: 2 } }}>
				<Typography variant="h6" component="h1" sx={{ flexGrow: 1, mr: 2, whiteSpace: 'nowrap' }}>
					{t('beautifier.title')}
				</Typography>
				<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
					<LanguageSwitcher sx={{ mr: 1 }} />

					<Button
						variant="contained"
						color="primary"
						onClick={onBeautify}
						disabled={isLoading}
						startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
						sx={{ minWidth: '100px' }}
					>
						{t('beautifier.beautify')}
					</Button>

					<Button
						variant="contained"
						color="success"
						onClick={onLoadTestHTML}
						disabled={isLoading}
						sx={{ minWidth: '100px' }}
					>
						{t('beautifier.testData')}
					</Button>

					<Button
						variant="contained"
						onClick={onCopyHtml}
						disabled={!htmlResult || isLoading}
						sx={{
							minWidth: '100px',
							bgcolor: (!htmlResult || isLoading)
								? 'grey.300'
								: copyButtonText.includes('失败') || copyButtonText.includes('Failed')
									? 'error.main'
									: copyButtonText.includes('已复制') || copyButtonText.includes('Copied')
										? 'success.light'
										: 'secondary.main',
							'&:hover': {
								bgcolor: (!htmlResult || isLoading)
									? 'grey.300'
									: copyButtonText.includes('失败') || copyButtonText.includes('Failed')
										? 'error.dark'
										: copyButtonText.includes('已复制') || copyButtonText.includes('Copied')
											? 'success.main'
											: 'secondary.dark',
							}
						}}
					>
						{copyButtonText}
					</Button>

					<Box>
						<Button
							variant="contained"
							onClick={handleExportMenuClick}
							disabled={!htmlResult || isLoading}
							sx={{
								minWidth: '100px',
								bgcolor: (!htmlResult || isLoading) ? 'grey.300' : 'warning.main',
								'&:hover': {
									bgcolor: (!htmlResult || isLoading) ? 'grey.300' : 'warning.dark',
								}
							}}
							aria-controls={isExportMenuOpen ? 'export-menu' : undefined}
							aria-haspopup="true"
							aria-expanded={isExportMenuOpen ? 'true' : undefined}
						>
							{t('beautifier.export')}
						</Button>
						<Menu
							id="export-menu"
							anchorEl={exportAnchorEl}
							open={isExportMenuOpen}
							onClose={handleExportMenuClose}
							MenuListProps={{
								'aria-labelledby': 'export-button',
							}}
						>
							<MenuItem onClick={() => handleExportAction('html')}>
								{t('common.exportAs', { format: 'HTML' })}
							</MenuItem>
							<MenuItem onClick={() => handleExportAction('image')}>
								{t('common.exportAs', { format: t('common.image') })}
							</MenuItem>
							<MenuItem onClick={() => handleExportAction('markdown')}>
								{t('common.exportAs', { format: 'Markdown' })}
							</MenuItem>
						</Menu>
					</Box>
				</Box>
			</Toolbar>
		</AppBar>
	);
} 