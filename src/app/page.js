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
	const tStyleEditor = useTranslations('styleEditor');

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
	const [selectedItemIds, setSelectedItemIds] = useState([]);
	const [isMergeModeEnabled, setIsMergeModeEnabled] = useState(false);

	// === State for Style Editor Panel ===
	const [styleEditorElementId, setStyleEditorElementId] = useState(null);
	const [styleEditorElementType, setStyleEditorElementType] = useState("");
	const [styleEditorElementTagName, setStyleEditorElementTagName] = useState("");
	const [styleEditorInitialStyles, setStyleEditorInitialStyles] = useState({});

	// === Other Core State ===
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [copyButtonText, setCopyButtonText] = useState(t('copyButton.default'));

	// Add hasMounted state to prevent hydration issues
	const [hasMounted, setHasMounted] = useState(false);
	useEffect(() => {
		setHasMounted(true);
	}, []);

	// --- Helper function to flatten the outline - DEFINE INSIDE Home component ---
	const flattenOutline = (items) => {
		let flat = [];
		items.forEach(item => {
			flat.push(item);
			if (item.children && item.children.length > 0) {
				// Recursive call needs to reference the function within this scope
				flat = flat.concat(flattenOutline(item.children));
			}
		});
		return flat;
	};

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
		setSelectedItemIds([]);
		setStyleEditorElementId(null);
		setStyleEditorElementType("");
		setStyleEditorElementTagName("");
		setStyleEditorInitialStyles({});
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
		setSelectedItemIds,
		setStyleEditorElementId,
		setStyleEditorElementType,
		setStyleEditorElementTagName,
		setStyleEditorInitialStyles,
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
		setSelectedItemIds([]);
		setStyleEditorElementId(null);
		setStyleEditorElementType("");
		setStyleEditorElementTagName("");
		setStyleEditorInitialStyles({});
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
		setSelectedItemIds,
		setStyleEditorElementId,
		setStyleEditorElementType,
		setStyleEditorElementTagName,
		setStyleEditorInitialStyles,
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

	// Handle SINGLE item selection in NORMAL mode
	const handleItemClickNormalMode = useCallback((id) => {
		// Should only be called when isMergeModeEnabled is false
		if (isMergeModeEnabled) return;

		setSelectedItemIds([id]); // Set selection to only this ID

		// Update Style Editor state
		const outlineItem = findItemById(mainOutline, id);
		if (outlineItem) {
			setStyleEditorElementId(id);
			setStyleEditorElementType(outlineItem.type);
			setStyleEditorElementTagName(outlineItem.tagName);
			setStyleEditorInitialStyles(customStyles[id] || {});
		} else {
			setStyleEditorElementId(null);
			setStyleEditorElementType("");
			setStyleEditorElementTagName("");
			setStyleEditorInitialStyles({});
		}
	}, [
		isMergeModeEnabled, // Make sure not in merge mode
		mainOutline,
		customStyles,
		setSelectedItemIds,
		setStyleEditorElementId,
		setStyleEditorElementType,
		setStyleEditorElementTagName,
		setStyleEditorInitialStyles,
	]);

	// Handle Checkbox toggle for item selection in MERGE mode
	const handleToggleMergeSelection = useCallback((id) => {
		// Should only be called when isMergeModeEnabled is true
		if (!isMergeModeEnabled) return;

		setSelectedItemIds(prevIds =>
			prevIds.includes(id)
				? prevIds.filter(prevId => prevId !== id) // Remove ID
				: [...prevIds, id] // Add ID
		);
		// DO NOT update style editor state here
	}, [isMergeModeEnabled, setSelectedItemIds]);

	const handleApplyManualStyles = useCallback((stylesToApply) => {
		// Ensure not in merge mode and an item is selected for styling
		if (isMergeModeEnabled || !styleEditorElementId) return;
		console.log(`Applying manual styles to ${styleEditorElementId}:`, stylesToApply);

		setCustomStyles((prevCustomStyles) => {
			const newCustomStyles = {
				...prevCustomStyles,
				[styleEditorElementId]: {
					...(prevCustomStyles[styleEditorElementId] || {}),
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

		setStyleEditorInitialStyles(prev => ({ ...prev, ...stylesToApply }));
	}, [
		isMergeModeEnabled, // Add dependency
		styleEditorElementId,
		initialStyledHtml,
		getStyledHtml,
		setCustomStyles,
		setStyleEditorInitialStyles,
		setMainHtmlContent,
	]);

	const handleReBeautifyComponent = useCallback(async () => {
		// Ensure not in merge mode and a single item is selected
		if (isMergeModeEnabled || !styleEditorElementId || !initialStyledHtml || !currentUserPrompt || isLoading) {
			console.warn("Cannot re-beautify component. Merge mode active, or missing ID, initial HTML, prompt, or already loading.");
			return;
		}

		console.log(`Requesting re-beautification for ${styleEditorElementId} with prompt: "${currentUserPrompt}"`);
		setIsLoading(true);
		setError('');

		try {
			const response = await fetch('/api/beautify-component', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					html: initialStyledHtml,
					componentId: styleEditorElementId,
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
				setSelectedItemIds([]);
				setStyleEditorElementId(null);
				setStyleEditorElementType("");
				setStyleEditorElementTagName("");
				setStyleEditorInitialStyles({});
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
	}, [
		isMergeModeEnabled, // Add dependency
		styleEditorElementId,
		initialStyledHtml,
		currentUserPrompt,
		isLoading,
		setInitialStyledHtml,
		setMainHtmlContent,
		setCustomStyles,
		setSelectedItemIds,
		setStyleEditorElementId,
		setStyleEditorElementType,
		setStyleEditorElementTagName,
		setStyleEditorInitialStyles,
		setIsLoading,
		setError,
		t
	]);

	// --- Functions for Merge Feature ---

	// Check if the selected items are mergeable
	const isMergeable = useCallback((ids) => {
		console.log("[isMergeable] Checking IDs:", ids); // Log input IDs
		if (ids.length < 2) {
			console.log("[isMergeable] Result: false (less than 2 items selected)");
			return false;
		}

		// Use mainOutline directly as it represents the top-level items
		const topLevelItems = mainOutline;
		console.log("[isMergeable] Top-Level Outline:", topLevelItems);

		const selectedTopLevelParagraphsInfo = []; // Stores { id, originalIndex, type }
		const mergeableTypes = ['paragraph', 'paragraph-wrapper']; // Define mergeable types

		for (let i = 0; i < topLevelItems.length; i++) {
			const item = topLevelItems[i];
			if (ids.includes(item.id)) {
				console.log(`[isMergeable] Found top-level item ${item.id} at index ${i} with type: ${item.type}`);

				// Check if this selected item is a mergeable type
				if (!mergeableTypes.includes(item.type)) {
					console.log(`[isMergeable] Result: false (selected top-level item ${item.id} has non-mergeable type: ${item.type})`);
					return false;
				}
				selectedTopLevelParagraphsInfo.push({ id: item.id, originalIndex: i, type: item.type });
			}
		}

		// Ensure all provided IDs were found among top-level, mergeable-type items
		if (selectedTopLevelParagraphsInfo.length !== ids.length) {
			console.warn("[isMergeable] Could not find all selected IDs among top-level, mergeable paragraph items.");
			console.log("[isMergeable] Result: false (data missing or type mismatch for some IDs at top level)");
			return false;
		}

		// Sort the selected items by their original index in the top-level outline
		selectedTopLevelParagraphsInfo.sort((a, b) => a.originalIndex - b.originalIndex);

		const selectedIndices = selectedTopLevelParagraphsInfo.map(info => info.originalIndex);
		console.log("[isMergeable] Sorted Original Indices of selected top-level paragraphs:", selectedIndices);

		// Check for consecutiveness among these original indices
		for (let i = 1; i < selectedIndices.length; i++) {
			console.log(`[isMergeable] Checking top-level consecutiveness: Index ${selectedIndices[i]} vs ${selectedIndices[i - 1] + 1}`);
			if (selectedIndices[i] !== selectedIndices[i - 1] + 1) {
				console.log("[isMergeable] Result: false (top-level paragraph items are not consecutive)");
				return false; // Not consecutive
			}
		}

		console.log("[isMergeable] Result: true (all checks passed for top-level paragraphs)");
		return true; // All checks passed
	}, [mainOutline]); // Dependency is mainOutline

	// Handle merging the selected items
	const handleMergeSelectedItems = useCallback(async (idsToMerge) => {
		console.log("Requesting merge for items:", idsToMerge);
		// Ensure IDs are sorted by document order before sending to backend
		// This relies on the order they appear in the flattened outline
		const flatOutline = flattenOutline(mainOutline); // You need the flattenOutline helper defined earlier
		const idOrderMap = new Map();
		flatOutline.forEach((item, index) => {
			if (idsToMerge.includes(item.id)) {
				idOrderMap.set(item.id, index);
			}
		});
		const sortedIdsToMerge = idsToMerge.slice().sort((a, b) => (idOrderMap.get(a) ?? Infinity) - (idOrderMap.get(b) ?? Infinity));

		if (sortedIdsToMerge.length !== idsToMerge.length) {
			console.error("Merge handler: Could not determine order for all selected IDs.");
			setError("Failed to determine the order of items to merge.");
			return;
		}

		console.log("Merge handler: Sorted IDs to merge:", sortedIdsToMerge);

		setIsLoading(true);
		setError('');
		try {
			const response = await fetch('/api/merge-components', { // Call the new API endpoint
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				// Send initialStyledHtml (base HTML before custom styles) and the sorted IDs
				body: JSON.stringify({ html: initialStyledHtml, componentIds: sortedIdsToMerge }),
			});
			const data = await response.json();
			if (!response.ok) {
				// Use error message from backend if available
				throw new Error(data.error || `Merge failed with status: ${response.status}`);
			}
			if (data.finalHtml && data.documentOutline) {
				console.log("Merge successful. Updating state.");
				// Update state with the new HTML and outline from the backend
				setInitialStyledHtml(data.finalHtml);
				setMainHtmlContent(data.finalHtml);
				setMainOutline(data.documentOutline);
				setSelectedItemIds([]); // Clear selection
				setCustomStyles({}); // Clear custom styles as base HTML changed
				setError('');
				// Reset style editor state as well
				setStyleEditorElementId(null);
				setStyleEditorElementType("");
				setStyleEditorElementTagName("");
				setStyleEditorInitialStyles({});
				if (data.warning) { // Display warning from backend if any (e.g., outline skip)
					console.warn("Merge API Warning:", data.warning);
					// Optionally show this warning to the user
				}
			} else {
				// This case might happen if backend skips outline generation without error
				setError('Merge API response missing data (HTML or Outline).');
			}
		} catch (e) {
			console.error("Error merging components in frontend:", e);
			setError(`Merge failed: ${e.message}`);
		} finally {
			setIsLoading(false);
		}
	}, [initialStyledHtml, mainOutline, setIsLoading, setError, setInitialStyledHtml, setMainHtmlContent, setMainOutline, setSelectedItemIds, setCustomStyles, setStyleEditorElementId, setStyleEditorElementType, setStyleEditorElementTagName, setStyleEditorInitialStyles]);

	// --- Function to toggle merge mode ---
	const toggleMergeMode = () => {
		setIsMergeModeEnabled(prev => {
			const newMode = !prev;
			if (!newMode) {
				setSelectedItemIds([]);
				setStyleEditorElementId(null);
				setStyleEditorElementType("");
				setStyleEditorElementTagName("");
				setStyleEditorInitialStyles({});
			}
			return newMode;
		});
	};

	// --- Render ---
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
					{console.log(`[page.js] Rendering DocumentOutlinePanel with: isMergeModeEnabled=${isMergeModeEnabled}, selectedItemIds=${JSON.stringify(selectedItemIds)}, isMergeableResult=${isMergeable(selectedItemIds)}`)}
					<DocumentOutlinePanel
						outline={mainOutline}
						selectedIds={selectedItemIds}
						onToggleMergeSelection={handleToggleMergeSelection}
						onItemClickNormalMode={handleItemClickNormalMode}
						isMergeable={isMergeable}
						onMergeItems={handleMergeSelectedItems}
						isMergeModeEnabled={isMergeModeEnabled}
						onToggleMergeMode={toggleMergeMode}
					/>
				</Paper>

				<Box sx={{ flexGrow: 4, display: 'flex', flexDirection: 'column', p: 1, overflow: 'hidden' }}>
					<PreviewPanel
						htmlResult={mainHtmlContent}
						tempHtmlResult={null}
						isLoading={isLoading}
						error={error}
						onClearError={() => setError('')}
						selectedElementIds={selectedItemIds}
						isMergeModeEnabled={isMergeModeEnabled}
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
							disabled={isMergeModeEnabled || selectedItemIds.length !== 1 || isLoading || !initialStyledHtml || !currentUserPrompt}
							sx={{ flexShrink: 0, mt: 1, mx: 1 }}
						>
							{t('reBeautifyButton.label')}
						</Button>

						<Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 1 }}>
							{!isMergeModeEnabled && selectedItemIds.length === 1 ? (
								<StyleEditor
									elementId={styleEditorElementId}
									elementType={styleEditorElementType}
									elementTagName={styleEditorElementTagName}
									initialStyles={styleEditorInitialStyles}
									onApplyStyles={handleApplyManualStyles}
								/>
							) : (
								<Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
									{isMergeModeEnabled
										? tStyleEditor('editingDisabledInMergeMode')
										: (selectedItemIds.length === 0
											? tStyleEditor('selectComponentPrompt')
											: tStyleEditor('multipleSelectedPrompt')
										)
									}
								</Box>
							)}
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