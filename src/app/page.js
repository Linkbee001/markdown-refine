'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Import Config & Default Content
import { defaultHtml, DEFAULT_STYLE_CONFIG, pageContent as defaultPageContent, componentTypes } from '../config/editorConfig';

// Import Custom Hooks
import { usePreviewUpdater } from '../hooks/usePreviewUpdater';
import { useStyleEditor } from '../hooks/useStyleEditor';
import { useStyleConfigManager } from '../hooks/useStyleConfigManager';

// Import Components
import HeaderControls from '../components/HeaderControls';
import MarkdownEditorPanel from '../components/MarkdownEditorPanel';
import PreviewPanel from '../components/PreviewPanel';
import ComponentOutlineSidebar from '../components/ComponentOutlineSidebar';
import StyleEditorModal from '../components/StyleEditorModal';
import StyleManagerModal from '../components/StyleManagerModal';

// Dynamically import the MDEditor (Only needed if MarkdownEditorPanel doesn't handle it internally)
// const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Helper function (can be moved to utils if needed)
const camelToKebab = (str) => {
  return str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
};

export default function Home() {
  const router = useRouter();
  // --- Core State ---
  const [markdown, setMarkdown] = useState(`# 今日汇率报告\n\n2024.11.6/星期二\n\n...`); // Initial Markdown
  const [prompt, setPrompt] = useState('使用简洁专业的技术博客风格...'); // Initial Prompt
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('复制 HTML');
  const [isOutlineVisible, setIsOutlineVisible] = useState(false);

  // --- Custom Hooks Initialization ---
  const [isEditorOpenStateForHook, setIsEditorOpenStateForHook] = useState(false);

  const {
    htmlResult,
    setHtmlResult,
    tempHtmlResult,
    setTempHtmlResult,
    previewIframeRef,
    updatePreviewWithStyles,
  } = usePreviewUpdater('', '', isEditorOpenStateForHook);

  const {
    customStyles,
    setCustomStyles,
    selectedComponent,
    isEditorOpen,
    handleComponentSelect,
    handleStyleChange,
    applyStyleTemplate,
    saveStyleChanges,
    cancelStyleChanges: cancelEditorChanges,
    setIsEditorOpen
  } = useStyleEditor({}, updatePreviewWithStyles);

  useEffect(() => {
    setIsEditorOpenStateForHook(isEditorOpen);
  }, [isEditorOpen]);

  const {
    savedStyleConfigs,
    currentConfigName,
    setCurrentConfigName,
    isStyleManagerOpen,
    openStyleManager,
    closeStyleManager,
    saveCurrentStyleConfig,
    loadStyleConfig,
    deleteStyleConfig
  } = useStyleConfigManager({}, setCustomStyles, updatePreviewWithStyles);

  // --- Event Handlers ---

  // Handle AI Beautify Request
  const handleBeautify = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setHtmlResult('');
    setTempHtmlResult('');
    setCopyButtonText('复制 HTML');
    setCustomStyles({});

    try {
      const response = await fetch('/api/beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, prompt }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.finalHtml && data.documentOutline) {
        sessionStorage.setItem('beautifierHtml', data.finalHtml);
        sessionStorage.setItem('beautifierOutline', JSON.stringify(data.documentOutline));
        router.push('/beautifier');
      } else if (data.finalHtml) {
        console.warn("API returned HTML but no document outline. Displaying preview here.");
        setHtmlResult(data.finalHtml);
        setTempHtmlResult(data.finalHtml);
        updatePreviewWithStyles(data.finalHtml ? data.finalHtml : {});
        setError('处理完成，但缺少文档结构信息，无法进入编辑模式。');
      } else {
        setError(data.error || 'API 响应缺少必要的数据 (finalHtml 或 documentOutline)。');
      }
    } catch (e) {
      console.error("Frontend Error calling /api/beautify:", e);
      setError(`处理失败: ${e.message}`);
      setHtmlResult('');
      setTempHtmlResult('');
    } finally {
      setIsLoading(false);
    }
  }, [markdown, prompt, router, updatePreviewWithStyles, setIsLoading, setError, setCopyButtonText, setCustomStyles, setHtmlResult, setTempHtmlResult]);

  // Handle Loading Test HTML
  const handleLoadTestHTML = useCallback(() => {
    setIsLoading(true);
    setError('');
    setCopyButtonText('复制 HTML');
    setCustomStyles({});
    setHtmlResult(defaultHtml);
    setTempHtmlResult(defaultHtml);
    updatePreviewWithStyles(defaultHtml ? defaultHtml : {});
    setIsLoading(false);
  }, [setHtmlResult, setTempHtmlResult, setCustomStyles, updatePreviewWithStyles, setIsLoading, setError, setCopyButtonText]);

  // Handle Copying HTML
  const handleCopyHtml = useCallback(async () => {
    const contentToCopy = isEditorOpen ? tempHtmlResult : htmlResult;
    if (!contentToCopy || isLoading) return;

    setCopyButtonText('复制中...');
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(contentToCopy, 'text/html');

      Object.entries(customStyles).forEach(([componentId, componentStyles]) => {
        const component = componentTypes.find(c => c.id === componentId);
        if (component?.selector) {
          try {
            const elements = doc.querySelectorAll(component.selector);
            elements.forEach(el => {
              Object.entries(componentStyles).forEach(([prop, value]) => {
                if (value !== null && value !== '') {
                  el.style[camelToKebab(prop)] = value;
                }
              });
            });
          } catch (e) {
            console.warn(`CSS selector error for ${componentId}: ${component.selector}`, e)
          }
        }
      });

      const finalHtmlToCopy = `<div style="font-family: sans-serif; line-height: 1.6;">${doc.body.innerHTML}</div>`;
      const blob = new Blob([finalHtmlToCopy], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([clipboardItem]);
      setCopyButtonText('已复制!');
    } catch (err) {
      console.error('Failed to copy HTML using ClipboardItem: ', err);
      try {
        const plainText = new DOMParser().parseFromString(contentToCopy, 'text/html').body.innerText;
        await navigator.clipboard.writeText(plainText);
        setCopyButtonText('已复制 (纯文本)!');
      } catch (fallbackErr) {
        console.error('Failed to copy as text fallback: ', fallbackErr);
        setError('复制 HTML 失败。');
        setCopyButtonText('复制失败');
      }
    } finally {
      setTimeout(() => setCopyButtonText('复制 HTML'), 2500);
    }
  }, [htmlResult, tempHtmlResult, isLoading, customStyles, isEditorOpen, setCopyButtonText, setError]);

  // Handle Export
  const handleExport = useCallback((format) => {
    const contentToExport = isEditorOpen ? tempHtmlResult : htmlResult;
    if (!contentToExport) return;

    const downloadFile = (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    switch (format) {
      case 'html':
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentToExport, 'text/html');
        Object.entries(customStyles).forEach(([componentId, componentStyles]) => {
          const component = componentTypes.find(c => c.id === componentId);
          if (component?.selector) {
            try {
              const elements = doc.querySelectorAll(component.selector);
              elements.forEach(el => {
                Object.entries(componentStyles).forEach(([prop, value]) => {
                  if (value !== null && value !== '') {
                    el.style[camelToKebab(prop)] = value;
                  }
                });
              });
            } catch (e) {
              console.warn(`CSS selector error for export ${componentId}: ${component.selector}`, e)
            }
          }
        });
        const styledHtml = doc.documentElement.outerHTML;
        const htmlBlob = new Blob([styledHtml], { type: 'text/html' });
        downloadFile(htmlBlob, 'buity_export.html');
        break;
      case 'image':
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`<html><head><title>保存为图片</title></head><body><h3>右键点击下方内容区域 -> 图片另存为</h3><div>${contentToExport}</div></body></html>`);
          printWindow.document.close();
        } else {
          setError('弹出窗口被阻止。');
        }
        break;
      case 'markdown':
        setError('Markdown导出功能正在开发中。');
        break;
      default: break;
    }
  }, [htmlResult, tempHtmlResult, isEditorOpen, customStyles, setError]);

  // Wrapper for saving style config
  const handleSaveConfig = useCallback((name) => {
    saveCurrentStyleConfig(name, customStyles);
  }, [saveCurrentStyleConfig, customStyles]);

  // Cancel style changes - revert preview and close editor
  const handleCancelEditor = useCallback(() => {
    setTempHtmlResult(htmlResult);
    updatePreviewWithStyles(customStyles);
    cancelEditorChanges();
  }, [htmlResult, setTempHtmlResult, updatePreviewWithStyles, cancelEditorChanges, customStyles]);

  // --- Render ---
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <HeaderControls
        prompt={prompt}
        setPrompt={setPrompt}
        isLoading={isLoading}
        onBeautify={handleBeautify}
        onLoadTestHTML={handleLoadTestHTML}
        onCopyHtml={handleCopyHtml}
        copyButtonText={copyButtonText}
        htmlResult={htmlResult}
        onExport={handleExport}
      />

      {error && (
        <div className="p-2 bg-red-100 border-b border-red-300 text-red-800 text-sm">
          <strong>错误:</strong> {error}
        </div>
      )}

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <MarkdownEditorPanel markdown={markdown} setMarkdown={setMarkdown} />

        <PreviewPanel
          htmlResult={htmlResult}
          tempHtmlResult={tempHtmlResult}
          isEditorOpen={isEditorOpen}
          isLoading={isLoading}
          previewIframeRef={previewIframeRef}
          isOutlineVisible={isOutlineVisible}
          onToggleOutline={() => setIsOutlineVisible(!isOutlineVisible)}
        />
      </div>

      <ComponentOutlineSidebar
        isVisible={isOutlineVisible}
        selectedComponent={selectedComponent}
        onSelectComponent={handleComponentSelect}
        onOpenStyleManager={openStyleManager}
        onClose={() => setIsOutlineVisible(false)}
      />

      <StyleEditorModal
        isOpen={isEditorOpen}
        selectedComponent={selectedComponent}
        customStyles={customStyles}
        onStyleChange={handleStyleChange}
        onApplyTemplate={applyStyleTemplate}
        onSave={saveStyleChanges}
        onCancel={handleCancelEditor}
      />

      <StyleManagerModal
        isOpen={isStyleManagerOpen}
        savedConfigs={savedStyleConfigs}
        currentConfigName={currentConfigName}
        currentStyles={customStyles}
        onSaveConfig={handleSaveConfig}
        onLoadConfig={loadStyleConfig}
        onDeleteConfig={deleteStyleConfig}
        onClose={closeStyleManager}
        setCurrentConfigNameState={setCurrentConfigName}
      />
    </div>
  );
}
