'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
	Box,
	Paper,
	Typography,
	Button,
	CircularProgress,
	Stack,
} from '@mui/material';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';


// Import Components
import HeaderControls from '../components/HeaderControls';
import BeautifyModal from '../components/BeautifyModal';
import DocumentOutlinePanel from "../components/DocumentOutlinePanel";
import StyleEditor from "../components/StyleEditor";
import PreviewPanel from '../components/PreviewPanel';

// Import test data for Quick Test button
import testData from '../data/testBeautifierResponse.json';

export default function Home() {
	const router = useRouter();
	const t = useTranslations('page');

	// === State for Modal ===
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMarkdown, setModalMarkdown] = useState(t('beautifyModal.initialMarkdown'));
	const [modalPrompt, setModalPrompt] = useState(t('beautifyModal.initialPrompt'));
	const [currentUserPrompt, setCurrentUserPrompt] = useState('');

	// === State for Main Editor/Preview Display ===
	const [mainHtmlContent, setMainHtmlContent] = useState('');
	const [initialStyledHtml, setInitialStyledHtml] = useState('');
	const [mainOutline, setMainOutline] = useState([]);
	const [customStyles, setCustomStyles] = useState({});

	// === State for UI Control ===
	const [selectedItemId, setSelectedItemId] = useState(null);

	// === State for Style Editor Panel ===
	const [selectedItemType, setSelectedItemType] = useState("");
	const [selectedItemTagName, setSelectedItemTagName] = useState("");
	const [selectedItemStyles, setSelectedItemStyles] = useState({});

	// === Other Core State ===
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [copyButtonText, setCopyButtonText] = useState(t('copyButton.default'));

	// Add hasMounted state to prevent hydration issues
	const [hasMounted, setHasMounted] = useState(false);
	useEffect(() => {
		setHasMounted(true);
	}, []);

	// --- Helper function to apply styles to an HTML string ---
	const getStyledHtml = (baseHtml, stylesById) => {
		if (!baseHtml) return '';
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(baseHtml, 'text/html');

			for (const [id, styles] of Object.entries(stylesById)) {
				const element = doc.getElementById(id);
				if (element) {
					let styleString = "";
					for (const [key, value] of Object.entries(styles)) {
						if (value !== null && value !== undefined && value !== '') {
							const cssProperty = key.replace(/([A-Z])/g, "-$1").toLowerCase();
							styleString += `${cssProperty}: ${value}; `;
						}
					}
					const existingStyle = element.getAttribute('style') || '';
					const newStyle = `${existingStyle ? existingStyle + '; ' : ''}${styleString.trim()}`;
					element.setAttribute("style", newStyle);
				} else {
					console.warn(`[getStyledHtml] Element #${id} not found in base HTML.`);
				}
			}
			return doc.body.innerHTML;
		} catch (error) {
			console.error("[getStyledHtml] Error parsing or styling HTML:", error);
			return baseHtml;
		}
	};

	// --- Event Handlers ---

	// Handle AI Beautify Request (Triggered from Modal)
	const handleBeautify = useCallback(async ({ markdown: modalMd, prompt: modalPmt }) => {
		if (!modalMd) {
			setError(t('error.markdownEmpty'));
			return;
		}
		setIsLoading(true);
		setError('');
		setMainHtmlContent('');
		setInitialStyledHtml('');
		setMainOutline([]);
		setCustomStyles({});
		setSelectedItemId(null);
		setSelectedItemStyles({});
		setCurrentUserPrompt(modalPmt);

		try {
			const response = await fetch('/api/beautify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ markdown: modalMd, prompt: modalPmt }),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
			if (data.finalHtml && data.documentOutline) {
				setInitialStyledHtml(data.finalHtml);
				setMainHtmlContent(data.finalHtml);
				setMainOutline(data.documentOutline);
				setIsModalOpen(false);
				setError('');
			} else {
				setError(t('error.apiMissingData'));
			}
		} catch (e) {
			console.error("Frontend Error calling /api/beautify:", e);
			setError(t('error.processingFailed', { message: e.message }));
			setCurrentUserPrompt('');
			setInitialStyledHtml('');
		} finally {
			setIsLoading(false);
		}
	}, [
		setMainHtmlContent,
		setInitialStyledHtml,
		setMainOutline,
		setIsModalOpen,
		setIsLoading,
		setError,
		setCustomStyles,
		setSelectedItemId,
		setSelectedItemStyles,
		setCurrentUserPrompt,
		t
	]);

	// Handle Loading Test HTML
	const handleLoadTestHTML = useCallback(() => {
		console.log("Loading test data...");
		setIsLoading(true);
		setError('');
		setCopyButtonText(t('copyButton.default'));
		setCustomStyles({});
		setSelectedItemId(null);
		setSelectedItemStyles({});
		setCurrentUserPrompt(t('beautifyModal.initialPrompt'));

		try {
			if (testData && testData.finalHtml && testData.documentOutline) {
				console.log("Test data found. HTML length:", testData.finalHtml.length);
				console.log("Outline items:", testData.documentOutline.length);

				setInitialStyledHtml(testData.finalHtml);
				setMainHtmlContent(testData.finalHtml);
				setMainOutline(testData.documentOutline);

				console.log("Test data loaded successfully");
				setTimeout(() => {
					console.log("Check if content was set - mainHtmlContent length:", mainHtmlContent?.length || 0);
				}, 100);
			} else {
				console.error("Failed to load test data from JSON.");
				console.error("testData object:", testData);
				setError(t('error.loadTestDataFailed'));
				setMainHtmlContent("");
				setInitialStyledHtml("");
				setMainOutline([]);
				setCurrentUserPrompt('');
			}
		} finally {
			setIsLoading(false);
		}
	}, [
		setMainHtmlContent,
		setInitialStyledHtml,
		setMainOutline,
		setCustomStyles,
		setIsLoading,
		setError,
		setCopyButtonText,
		setSelectedItemId,
		setSelectedItemStyles,
		setCurrentUserPrompt,
		t,
		mainHtmlContent
	]);

	// Handle Copying HTML
	const handleCopyHtml = useCallback(async () => {
		if (!mainHtmlContent || isLoading) return;

		setCopyButtonText(t('copyButton.preparing'));
		const styledHtmlToCopy = getStyledHtml(mainHtmlContent, customStyles);
		console.log("Styled HTML for Copy:", styledHtmlToCopy);

		if (!styledHtmlToCopy) {
			setError(t('error.generateCopyHtmlFailed'));
			setCopyButtonText(t('copyButton.copyFailed'));
			return;
		}

		setCopyButtonText(t('copyButton.copying'));
		try {
			const blob = new Blob([styledHtmlToCopy], { type: 'text/html' });
			const clipboardItem = new ClipboardItem({ 'text/html': blob });
			await navigator.clipboard.write([clipboardItem]);
			setCopyButtonText(t('copyButton.copiedSuccessHtml'));
		} catch (err) {
			console.warn('Failed to copy as HTML, falling back to text: ', err);
			try {
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = styledHtmlToCopy;
				const plainText = tempDiv.innerText || "";
				await navigator.clipboard.writeText(plainText);
				setCopyButtonText(t('copyButton.copiedSuccessText'));
			} catch (fallbackErr) {
				console.error('Failed to copy as text fallback: ', fallbackErr);
				setError(t('error.copyFailed'));
				setCopyButtonText(t('copyButton.copyFailed'));
			}
		} finally {
			setTimeout(() => setCopyButtonText(t('copyButton.default')), 2500);
		}
	}, [mainHtmlContent, customStyles, isLoading, getStyledHtml, setCopyButtonText, setError, t]);

	// Handle Export
	const handleExport = useCallback((format) => {
		if (!mainHtmlContent) return;
		const styledHtmlToExport = getStyledHtml(mainHtmlContent, customStyles);
		alert(t('export.notImplemented', {
			format,
			content: styledHtmlToExport.substring(0, 100) + '...'
		}));
	}, [mainHtmlContent, customStyles, getStyledHtml, t]);

	// Helper function to find item by ID recursively in outline
	const findItemById = (items, id) => {
		for (const item of items) {
			if (item.id === id) return item;
			if (item.children) {
				const found = findItemById(item.children, id);
				if (found) return found;
			}
		}
		return null;
	};

	// Handle Selection from Outline or Preview Click
	const handleOutlineItemSelect = useCallback((id) => {
		setSelectedItemId(id);
		const outlineItem = findItemById(mainOutline, id);
		setSelectedItemType(outlineItem ? outlineItem.type : t('styleEditor.unknownType'));
		setSelectedItemTagName(outlineItem ? outlineItem.tagName : "");
		setSelectedItemStyles({});
	}, [mainOutline, t, setSelectedItemId, setSelectedItemType, setSelectedItemTagName, setSelectedItemStyles]);

	const handleApplyManualStyles = useCallback((stylesToApply) => {
		if (!selectedItemId) return;
		console.log(`Applying manual styles to ${selectedItemId}:`, stylesToApply);

		setCustomStyles((prevCustomStyles) => {
			const newCustomStyles = {
				...prevCustomStyles,
				[selectedItemId]: {
					...(prevCustomStyles[selectedItemId] || {}),
					...stylesToApply
				}
			};

			if (initialStyledHtml) {
				const newHtml = getStyledHtml(initialStyledHtml, newCustomStyles);
				setMainHtmlContent(newHtml);
			} else {
				console.warn("[handleApplyManualStyles] initialStyledHtml is empty. Cannot update preview with manual styles.");
			}
			return newCustomStyles;
		});

		setSelectedItemStyles(prev => ({ ...prev, ...stylesToApply }));
	}, [selectedItemId, initialStyledHtml, getStyledHtml, setCustomStyles, setSelectedItemStyles, setMainHtmlContent]);

	const handleReBeautifyComponent = useCallback(async () => {
		if (!selectedItemId || !initialStyledHtml || !currentUserPrompt || isLoading) {
			console.warn("Cannot re-beautify component. Missing ID, initial HTML, prompt, or already loading.");
			return;
		}

		console.log(`Requesting re-beautification for ${selectedItemId} with prompt: "${currentUserPrompt}"`);
		setIsLoading(true);
		setError('');

		try {
			const response = await fetch('/api/beautify-component', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					html: initialStyledHtml,
					componentId: selectedItemId,
					prompt: currentUserPrompt,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || `HTTP error! status: ${response.status}`);
			}

			if (data.html) {
				console.log("Re-beautification successful. Updating HTML.");
				setInitialStyledHtml(data.html);
				setMainHtmlContent(data.html);
				setCustomStyles({});
				setSelectedItemId(null);
				setSelectedItemStyles({});
				setSelectedItemType("");
				setSelectedItemTagName("");
				setError('');
			} else {
				setError(t('error.apiMissingData'));
			}

		} catch (e) {
			console.error("Frontend Error calling /api/beautify-component:", e);
			setError(t('error.reBeautifyFailed', { message: e.message }));
		} finally {
			setIsLoading(false);
		}
	}, [selectedItemId, initialStyledHtml, currentUserPrompt, isLoading, setInitialStyledHtml, setMainHtmlContent, setCustomStyles, setSelectedItemId, setSelectedItemStyles, setSelectedItemType, setSelectedItemTagName, setIsLoading, setError, t]);

	return (
		<Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
			<HeaderControls
				isLoading={isLoading}
				onBeautify={() => setIsModalOpen(true)}
				onLoadTestHTML={handleLoadTestHTML}
				onCopyHtml={handleCopyHtml}
				copyButtonText={copyButtonText}
				htmlResult={mainHtmlContent}
				onExport={handleExport}
			/>

			<Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
				<Paper
					elevation={1}
					sx={{ width: 250, overflowY: 'auto', flexShrink: 0, borderRight: '1px solid #e0e0e0' }}
				>
					<DocumentOutlinePanel
						outline={mainOutline}
						onSelectItem={handleOutlineItemSelect}
						selectedId={selectedItemId}
					/>
				</Paper>

				<Box sx={{ flexGrow: 4, display: 'flex', flexDirection: 'column', p: 1, overflow: 'hidden' }}>
					<PreviewPanel
						htmlResult={mainHtmlContent}
						tempHtmlResult={null}
						isLoading={isLoading}
						error={error}
						onClearError={() => setError('')}
						selectedElementId={selectedItemId}
					/>
				</Box>

				<Paper
					elevation={1}
					sx={{ width: 300, p: 1, overflowY: 'hidden', flexShrink: 0, borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}
				>
					<Stack spacing={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
						<Button
							variant="contained"
							color="secondary"
							startIcon={<AutoFixHighIcon />}
							onClick={handleReBeautifyComponent}
							disabled={!selectedItemId || isLoading || !initialStyledHtml || !currentUserPrompt}
							sx={{ flexShrink: 0, mt: 1, mx: 1 }}
						>
							{t('reBeautifyButton.label')}
						</Button>

						<Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 1 }}>
							<StyleEditor
								elementId={selectedItemId}
								elementType={selectedItemType}
								elementTagName={selectedItemTagName}
								initialStyles={selectedItemStyles}
								onApplyStyles={handleApplyManualStyles}
							/>
						</Box>
					</Stack>
				</Paper>
			</Box>

			{isModalOpen && (
				<BeautifyModal
					open={isModalOpen}
					initialMarkdown={modalMarkdown}
					initialPrompt={modalPrompt}
					isLoading={isLoading}
					error={error}
					onClose={() => { setIsModalOpen(false); setError(''); }}
					onSubmit={handleBeautify}
				/>
			)}
		</Box>
	);
} 