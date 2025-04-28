'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
	Box,
	Paper,
	Typography,
	Button,
	IconButton,
	Switch,
	CircularProgress,
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";

// Import Config & Default Content
import { defaultHtml, DEFAULT_STYLE_CONFIG } from '../config/editorConfig'; // 修正路径

// Import Components
import HeaderControls from '../components/HeaderControls'; // 修正路径
import BeautifyModal from '../components/BeautifyModal'; // 修正路径
import DocumentOutlinePanel from "../components/DocumentOutlinePanel"; // 修正路径
import StyleEditor from "../components/StyleEditor"; // 修正路径

// Import test data for Quick Test button
import testData from '../data/testBeautifierResponse.json'; // 修正路径

export default function Home() {
	const router = useRouter();
	const previewRef = useRef(null);
	const t = useTranslations('page');

	// === State for Modal ===
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMarkdown, setModalMarkdown] = useState(t('beautifyModal.initialMarkdown'));
	const [modalPrompt, setModalPrompt] = useState(t('beautifyModal.initialPrompt'));

	// === State for Main Editor/Preview Display ===
	const [mainHtmlContent, setMainHtmlContent] = useState('');
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
					element.setAttribute("style", styleString.trim());
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
		setMainOutline([]);
		setCustomStyles({});
		setSelectedItemId(null);
		setSelectedItemStyles({});

		try {
			const response = await fetch('/api/beautify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ markdown: modalMd, prompt: modalPmt }),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
			if (data.finalHtml && data.documentOutline) {
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
		} finally {
			setIsLoading(false);
		}
	}, [
		setMainHtmlContent,
		setMainOutline,
		setIsModalOpen,
		setIsLoading,
		setError,
		setCustomStyles,
		setSelectedItemId,
		setSelectedItemStyles,
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

		if (testData && testData.finalHtml && testData.documentOutline) {
			setMainHtmlContent(testData.finalHtml);
			setMainOutline(testData.documentOutline);
			console.log("Test data loaded successfully.");
		} else {
			console.error("Failed to load test data from JSON.");
			setError(t('error.loadTestDataFailed'));
			setMainHtmlContent("");
			setMainOutline([]);
		}

		setIsLoading(false);
	}, [
		setMainHtmlContent,
		setMainOutline,
		setCustomStyles,
		setIsLoading,
		setError,
		setCopyButtonText,
		setSelectedItemId,
		setSelectedItemStyles,
		t
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
		alert(t('export.notImplemented', {
			format,
			content: mainHtmlContent.substring(0, 100) + '...'
		}));
	}, [mainHtmlContent, t]);

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

	const handleOutlineItemSelect = useCallback((id) => {
		setSelectedItemId(id);
		if (previewRef.current) {
			const element = previewRef.current.querySelector(`#${id}`);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
				document.querySelectorAll('.temp-highlight').forEach(el => el.classList.remove('temp-highlight'));
				element.classList.add("temp-highlight");

				const outlineItem = findItemById(mainOutline, id);
				setSelectedItemType(outlineItem ? outlineItem.type : t('styleEditor.unknownType'));
				setSelectedItemTagName(outlineItem ? outlineItem.tagName : "");

				if (customStyles[id]) {
					console.log(`Loading styles for ${id} from customStyles state.`);
					setSelectedItemStyles({ ...customStyles[id] });
				} else {
					console.log(`Reading initial styles for ${id} from DOM.`);
					const styleString = element.getAttribute("style") || "";
					const computedStyles = window.getComputedStyle(element);
					const styleObj = {};
					styleString.split(";").forEach((style) => {
						if (style.trim()) {
							const [property, value] = style.split(":");
							if (property && value) {
								let key = property.trim();
								if (key === 'background-color') key = 'backgroundColor';
								if (key === 'border-color') key = 'borderColor';
								if (key === 'border-width') key = 'borderWidth';
								if (key === 'border-radius') key = 'borderRadius';
								if (key === 'font-size') key = 'fontSize';
								if (key === 'font-weight') key = 'fontWeight';
								styleObj[key] = value.trim();
							}
						}
					});

					const resolvedBgColor = computedStyles.backgroundColor;
					const resolvedColor = computedStyles.color;
					const resolvedBorderColor = computedStyles.borderColor;

					const initialBgColor = styleObj.backgroundColor && !styleObj.backgroundColor.startsWith('var(')
						? styleObj.backgroundColor
						: resolvedBgColor;
					const initialColor = styleObj.color && !styleObj.color.startsWith('var(')
						? styleObj.color
						: resolvedColor;
					const initialBorderColor = styleObj.borderColor && !styleObj.borderColor.startsWith('var(')
						? styleObj.borderColor
						: resolvedBorderColor;

					setSelectedItemStyles({
						backgroundColor: initialBgColor,
						color: initialColor,
						borderColor: initialBorderColor,
						borderWidth: styleObj.borderWidth || computedStyles.borderWidth,
						borderRadius: styleObj.borderRadius || computedStyles.borderRadius,
						padding: styleObj.padding || computedStyles.padding,
						margin: styleObj.margin || computedStyles.margin,
						fontSize: styleObj.fontSize || computedStyles.fontSize,
						fontWeight: styleObj.fontWeight || computedStyles.fontWeight,
					});
				}
			}
		}
	}, [
		mainOutline,
		previewRef,
		customStyles,
		setSelectedItemId,
		setSelectedItemType,
		setSelectedItemTagName,
		setSelectedItemStyles,
		t
	]);

	// --- Style Application Handler ---
	const applyStylesToElement = useCallback((styles) => {
		console.log("--- applyStylesToElement called ---");
		console.log("Selected Item ID:", selectedItemId);
		console.log("Styles to apply:", styles);

		if (selectedItemId) {
			setCustomStyles(prevStyles => ({
				...prevStyles,
				[selectedItemId]: { ...styles }
			}));
			setSelectedItemStyles({ ...styles });
			console.log("Custom styles state updated.");
		} else {
			console.warn("applyStylesToElement skipped: No selectedItemId.");
		}
	}, [selectedItemId, setSelectedItemStyles, setCustomStyles]);

	// --- Effect to synchronize customStyles to the preview DOM ---
	useEffect(() => {
		if (!previewRef.current || !mainHtmlContent) {
			return;
		}
		console.log("--- Syncing customStyles to DOM ---", customStyles);

		for (const [id, styles] of Object.entries(customStyles)) {
			const element = previewRef.current.querySelector(`#${id}`);
			if (element) {
				let styleString = "";
				for (const [key, value] of Object.entries(styles)) {
					if (value !== null && value !== undefined && value !== '') {
						const cssProperty = key.replace(/([A-Z])/g, "-$1").toLowerCase();
						styleString += `${cssProperty}: ${value}; `;
					}
				}
				const finalStyleString = styleString.trim();
				console.log(`Applying to #${id}: ${finalStyleString}`);
				element.setAttribute("style", finalStyleString);
			} else {
				console.warn(`Element #${id} not found in preview DOM during style sync.`);
			}
		}
	}, [customStyles, mainHtmlContent, previewRef]);

	// --- Add back MobileDeviceFrame Component Definition ---
	const MobileDeviceFrame = ({ children }) => (
		<Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", p: 2, overflow: "auto" }}>
			<Box sx={{ width: "375px", maxWidth: "90%", height: "100%", maxHeight: "750px", borderRadius: "36px", position: "relative", overflow: "hidden", boxShadow: "0 0 20px rgba(0,0,0,0.2)", border: "14px solid #111", display: "flex", flexDirection: "column" }}>
				<Box sx={{ position: "absolute", top: 0, width: "60%", height: "28px", backgroundColor: "#111", zIndex: 2, borderBottomLeftRadius: "18px", borderBottomRightRadius: "18px", left: "50%", transform: "translateX(-50%)" }} />
				<Box sx={{ mt: "28px", flexGrow: 1, overflow: "auto", width: "100%", backgroundColor: "#fff" }}>
					{children}
				</Box>
				<Box sx={{ height: "4px", backgroundColor: "#111", width: "40%", mx: "auto", mb: 1, borderRadius: "2px" }} />
			</Box>
		</Box>
	);

	// --- Inline Component Definitions ---
	function DesktopMobilePreviewPanel() {
		return (
			<MobileDeviceFrame>
				<Box sx={{ overflow: "auto", width: "100%", height: "100%", backgroundColor: "white" }}>
					<style>{`
            .temp-highlight { box-shadow: 0 0 0 2px #2196f3 !important; position: relative; zIndex: 1; }
            #preview-container { word-wrap: break-word; padding: 12px; max-width: 100%; }
            #preview-container * { box-sizing: border-box; max-width: 100%; }
            #preview-container img { height: auto; }
          `}</style>
					<div id="preview-container" ref={previewRef} dangerouslySetInnerHTML={{ __html: mainHtmlContent }} />
				</Box>
			</MobileDeviceFrame>
		);
	}

	// --- Panel Components for Layout ---
	const outlinePanel = (
		<Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
			<DocumentOutlinePanel
				outline={mainOutline}
				selectedId={selectedItemId}
				onSelectItem={handleOutlineItemSelect}
			/>
		</Box>
	);

	const styleEditorPanel = (
		<Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
			{selectedItemId ? (
				<>
					<Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>
						{t('styleEditor.titleWithType', { type: selectedItemType })}
						{selectedItemTagName && (
							<Typography
								component="span"
								variant="body2"
								sx={{ ml: 1, color: "gray" }}
							>
								{t('styleEditor.tagInfo', { tagName: selectedItemTagName.toUpperCase() })}
							</Typography>
						)}
					</Typography>
					<Typography
						variant="caption"
						sx={{ mb: 0, color: "text.secondary", flexShrink: 0 }}
					>
						{t('styleEditor.idInfo', { id: selectedItemId })}
					</Typography>
				</>
			) : (
				<Typography variant="h6" sx={{ mb: 1 }}>{t('styleEditor.title')}</Typography>
			)}
			<StyleEditor
				elementId={selectedItemId}
				elementType={selectedItemType}
				elementTagName={selectedItemTagName}
				initialStyles={selectedItemStyles}
				onApplyStyles={applyStylesToElement}
			/>
		</Box>
	);

	// --- Render ---
	if (!hasMounted) {
		return null;
	}

	return (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", overflow: "hidden", bgcolor: 'grey.100' }}>
			<HeaderControls
				isLoading={isLoading}
				onBeautify={() => setIsModalOpen(true)}
				onLoadTestHTML={handleLoadTestHTML}
				onCopyHtml={handleCopyHtml}
				copyButtonText={copyButtonText}
				htmlResult={mainHtmlContent}
				onExport={handleExport}
			/>

			{error && !isModalOpen && (
				<Typography color="error" variant="body2" sx={{ p: 1, bgcolor: 'error.light' }}>
					{t('error.generic', { error })}
				</Typography>
			)}

			<Box sx={{ display: "flex", flexGrow: 1, p: 2, gap: 2, overflow: "hidden" }}>
				<Box sx={{ width: "25%", minWidth: 220, maxWidth: 350, height: "100%", overflow: "auto", bgcolor: 'background.paper', borderRadius: 1, p: 2 }}>
					{mainOutline.length > 0 ? outlinePanel : <Typography sx={{ p: 0 }}>{t('noOutline')}</Typography>}
				</Box>

				<Box sx={{ flexGrow: 1, height: "100%", overflow: "auto" }}>
					{mainHtmlContent ? <DesktopMobilePreviewPanel /> :
						<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
							<Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>{t('promptStartBeautify')}</Typography>
						</Box>
					}
				</Box>

				<Box sx={{ width: "25%", minWidth: 220, maxWidth: 350, height: "100%", overflow: "visible", bgcolor: 'background.paper', borderRadius: 1, p: 2 }}>
					{styleEditorPanel}
				</Box>
			</Box>

			<BeautifyModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				initialMarkdown={modalMarkdown}
				initialPrompt={modalPrompt}
				onSubmit={handleBeautify}
				isLoading={isLoading}
				error={error}
			/>
		</Box>
	);
} 