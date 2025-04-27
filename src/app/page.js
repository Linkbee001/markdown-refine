'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
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
import { defaultHtml, DEFAULT_STYLE_CONFIG /*, pageContent as defaultPageContent, componentTypes */ } from '../config/editorConfig'; // Removed unused componentTypes?

// Import Custom Hooks (REMOVED - logic integrated or simplified)
// import { usePreviewUpdater } from '../hooks/usePreviewUpdater';
// import { useStyleEditor } from '../hooks/useStyleEditor';
// import { useStyleConfigManager } from '../hooks/useStyleConfigManager';

// Import Components
import HeaderControls from '../components/HeaderControls';
// REMOVED: import MarkdownEditorPanel from '../components/MarkdownEditorPanel';
// REMOVED: import PreviewPanel from '../components/PreviewPanel';
// REMOVED: import ComponentOutlineSidebar from '../components/ComponentOutlineSidebar';
// REMOVED: import StyleEditorModal from '../components/StyleEditorModal';
// REMOVED: import StyleManagerModal from '../components/StyleManagerModal';
import BeautifyModal from '../components/BeautifyModal';
import DocumentOutlinePanel from "../components/DocumentOutlinePanel";
import StyleEditor from "../components/StyleEditor";

// Import test data for Quick Test button
import testData from '../data/testBeautifierResponse.json';

// Helper function (can be moved to utils if needed)
// const camelToKebab = (str) => { ... }; // Keep if needed for style application?

export default function Home() {
  const router = useRouter();
  const previewRef = useRef(null);

  // === State for Modal ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMarkdown, setModalMarkdown] = useState('# 示例 Markdown\n\n在此输入或粘贴你的 Markdown 内容...');
  const [modalPrompt, setModalPrompt] = useState('使用简洁专业的技术博客风格...');

  // === State for Main Editor/Preview Display ===
  const [mainHtmlContent, setMainHtmlContent] = useState('');
  const [mainOutline, setMainOutline] = useState([]);
  const [customStyles, setCustomStyles] = useState({}); // State to store all custom styles { elementId: stylesObject }

  // === State for UI Control ===
  const [selectedItemId, setSelectedItemId] = useState(null);

  // === State for Style Editor Panel ===
  const [selectedItemType, setSelectedItemType] = useState("");
  const [selectedItemTagName, setSelectedItemTagName] = useState("");
  const [selectedItemStyles, setSelectedItemStyles] = useState({});

  // === Other Core State ===
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('复制富文本');

  // Add hasMounted state to prevent hydration issues potentially caused by other client-side logic
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
        const element = doc.getElementById(id); // Use getElementById for direct lookup
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
      // Return the innerHTML of the body, or outerHTML of the html element depending on need
      // Returning body.innerHTML is usually sufficient for pasting into editors
      return doc.body.innerHTML;
    } catch (error) {
      console.error("[getStyledHtml] Error parsing or styling HTML:", error);
      return baseHtml; // Return original HTML on error
    }
  };

  // --- Event Handlers ---

  // Handle AI Beautify Request (Triggered from Modal)
  const handleBeautify = useCallback(async ({ markdown: modalMd, prompt: modalPmt }) => {
    if (!modalMd) {
      setError('Markdown 内容不能为空。');
      return;
    }
    setIsLoading(true);
    setError('');
    setMainHtmlContent('');
    setMainOutline([]);
    setCustomStyles({}); // Reset custom styles on new generation
    setSelectedItemId(null); // Deselect item on new generation
    setSelectedItemStyles({}); // Clear selected styles

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
        setError(data.error || 'API 响应缺少必要的数据 (finalHtml 或 documentOutline)。');
      }
    } catch (e) {
      console.error("Frontend Error calling /api/beautify:", e);
      setError(`处理失败: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    // Updated dependencies
    setMainHtmlContent,
    setMainOutline,
    setIsModalOpen,
    setIsLoading,
    setError,
    setCustomStyles,
    setSelectedItemId,
    setSelectedItemStyles
  ]);

  // Handle Loading Test HTML
  const handleLoadTestHTML = useCallback(() => {
    console.log("Loading test data...");
    setIsLoading(true);
    setError('');
    setCopyButtonText('复制富文本');
    setCustomStyles({});
    setSelectedItemId(null);
    setSelectedItemStyles({});

    // Load data from the imported JSON file
    if (testData && testData.finalHtml && testData.documentOutline) {
      setMainHtmlContent(testData.finalHtml);
      setMainOutline(testData.documentOutline);
      console.log("Test data loaded successfully.");
    } else {
      console.error("Failed to load test data from JSON.");
      setError("加载测试数据失败。");
      setMainHtmlContent(""); // Clear content on failure
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
    setSelectedItemStyles
  ]);

  // Handle Copying HTML (Now applies custom styles)
  const handleCopyHtml = useCallback(async () => {
    if (!mainHtmlContent || isLoading) return;

    setCopyButtonText('准备中...');
    const styledHtmlToCopy = getStyledHtml(mainHtmlContent, customStyles);
    console.log("Styled HTML for Copy:", styledHtmlToCopy);

    if (!styledHtmlToCopy) {
      setError('生成用于复制的 HTML 失败。');
      setCopyButtonText('复制失败');
      return;
    }

    setCopyButtonText('复制中...');
    try {
      // Try using ClipboardItem API first for rich HTML content
      const blob = new Blob([styledHtmlToCopy], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([clipboardItem]);
      setCopyButtonText('已复制!');
    } catch (err) {
      console.warn('Failed to copy as HTML, falling back to text: ', err);
      try {
        // Fallback: Copy as plain text (might lose formatting)
        // Create a temporary element to get innerText accurately
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = styledHtmlToCopy;
        const plainText = tempDiv.innerText || ""; // Get text content
        await navigator.clipboard.writeText(plainText);
        setCopyButtonText('已复制 (纯文本)!');
      } catch (fallbackErr) {
        console.error('Failed to copy as text fallback: ', fallbackErr);
        setError('复制富文本 失败。');
        setCopyButtonText('复制失败');
      }
    } finally {
      // Reset button text after a delay
      setTimeout(() => setCopyButtonText('复制富文本'), 2500);
    }
  }, [mainHtmlContent, customStyles, isLoading, getStyledHtml, setCopyButtonText, setError]); // Added customStyles, getStyledHtml

  // Handle Export (Simplified)
  const handleExport = useCallback((format) => {
    // TODO: Re-implement applying customStyles if needed
    if (!mainHtmlContent) return;
    alert(`导出功能 (${format}) 待实现 - 导出内容:
${mainHtmlContent.substring(0, 100)}...`);
  }, [mainHtmlContent]); // Removed customStyles dependency for now

  // --- Handlers for new UI elements ---

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

        // --- Get Type and TagName from outline ---
        const outlineItem = findItemById(mainOutline, id);
        setSelectedItemType(outlineItem ? outlineItem.type : "未知类型");
        setSelectedItemTagName(outlineItem ? outlineItem.tagName : "");

        // --- Get Styles: Prioritize customStyles state, fallback to DOM ---
        if (customStyles[id]) {
          console.log(`Loading styles for ${id} from customStyles state.`);
          setSelectedItemStyles({ ...customStyles[id] });
        } else {
          console.log(`Reading initial styles for ${id} from DOM.`);
          const styleString = element.getAttribute("style") || "";
          const computedStyles = window.getComputedStyle(element);
          const styleObj = {};
          // Extract specific styles (as before)
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
          // Set state using combined computed and inline styles
          const resolvedBgColor = computedStyles.backgroundColor;
          const resolvedColor = computedStyles.color;
          const resolvedBorderColor = computedStyles.borderColor;

          // Use inline style only if it's a standard format (e.g., hex, rgb, rgba)
          // This prevents 'var(--...)' from being sent to the StyleEditor
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
            // --- Updated Color Logic ---
            backgroundColor: initialBgColor,
            color: initialColor,
            borderColor: initialBorderColor,
            // --- Other styles remain the same ---
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
    customStyles, // Add customStyles as dependency
    setSelectedItemId,
    setSelectedItemType,
    setSelectedItemTagName,
    setSelectedItemStyles
  ]);

  // --- Style Application Handler ---
  const applyStylesToElement = useCallback((styles) => {
    console.log("--- applyStylesToElement called ---");
    console.log("Selected Item ID:", selectedItemId);
    console.log("Styles to apply:", styles);

    if (selectedItemId) {
      // Update the central customStyles state
      setCustomStyles(prevStyles => ({
        ...prevStyles,
        [selectedItemId]: { ...styles } // Store a copy of the applied styles
      }));
      // Update the local state for the editor immediately
      setSelectedItemStyles({ ...styles });
      console.log("Custom styles state updated.");

      // REMOVED direct DOM manipulation from here:
      // const element = previewRef.current?.querySelector(`#${selectedItemId}`);
      // if (element) { ... element.setAttribute ... }

    } else {
      console.warn("applyStylesToElement skipped: No selectedItemId.");
    }
  }, [selectedItemId, setSelectedItemStyles, setCustomStyles]); // Removed previewRef from deps

  // --- Effect to synchronize customStyles to the preview DOM ---
  useEffect(() => {
    if (!previewRef.current || !mainHtmlContent) {
      // Don't try to apply styles if preview isn't rendered or content is empty
      return;
    }
    console.log("--- Syncing customStyles to DOM ---", customStyles);

    // Keep track of applied IDs to potentially clear styles for elements
    // that are no longer in customStyles (optional, adds complexity)
    // const appliedIds = new Set();

    for (const [id, styles] of Object.entries(customStyles)) {
      const element = previewRef.current.querySelector(`#${id}`);
      if (element) {
        // appliedIds.add(id);
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

    // Optional: Clear styles from elements no longer in customStyles
    // This requires iterating through potentially all elements with IDs in the preview
    // For now, we'll skip this complexity.

  }, [customStyles, mainHtmlContent, previewRef]); // Depend on styles and content

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

  // Component to render preview inside a mobile frame for the desktop layout
  function DesktopMobilePreviewPanel() {
    return (
      <MobileDeviceFrame>
        <Box sx={{ overflow: "auto", width: "100%", height: "100%", backgroundColor: "white" }}>
          {/* Styles needed for highlighting and mobile-like rendering */}
          <style>{`
            .temp-highlight { box-shadow: 0 0 0 2px #2196f3 !important; position: relative; zIndex: 1; }
            #preview-container { word-wrap: break-word; padding: 12px; max-width: 100%; } /* Mobile padding */
            #preview-container * { box-sizing: border-box; max-width: 100%; }
            #preview-container img { height: auto; }
          `}</style>
          {/* Render main content using the ref */}
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
            样式编辑器 - {selectedItemType}
            {selectedItemTagName && (
              <Typography
                component="span"
                variant="body2"
                sx={{ ml: 1, color: "gray" }}
              >
                (标签: {selectedItemTagName.toUpperCase()})
              </Typography>
            )}
          </Typography>
          <Typography
            variant="caption"
            sx={{ mb: 0, color: "text.secondary", flexShrink: 0 }}
          >
            ID: {selectedItemId}
          </Typography>
        </>
      ) : (
        <Typography variant="h6" sx={{ mb: 1 }}>样式编辑器</Typography>
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
    return null; // Or a loading spinner using MUI CircularProgress?
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
          错误: {error}
        </Typography>
      )}

      <Box sx={{ display: "flex", flexGrow: 1, p: 2, gap: 2, overflow: "hidden" }}>
        <Box sx={{ width: "25%", minWidth: 220, maxWidth: 350, height: "100%", overflow: "auto", bgcolor: 'background.paper', borderRadius: 1, p: 2 }}>
          {mainOutline.length > 0 ? outlinePanel : <Typography sx={{ p: 0 }}>没有可用大纲</Typography>}
        </Box>

        <Box sx={{ flexGrow: 1, height: "100%", overflow: "auto" }}>
          {mainHtmlContent ? <DesktopMobilePreviewPanel /> :
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>点击 "AI美化" 开始生成内容。</Typography>
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
