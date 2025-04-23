'use client';

import React, { useState, useEffect, useRef } from "react";
import {
	Box,
	Paper,
	Typography,
	Button,
	Drawer,
	IconButton,
	useTheme,
	useMediaQuery,
	Switch,
	FormControlLabel,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PaletteIcon from "@mui/icons-material/Palette";
import CloseIcon from "@mui/icons-material/Close";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
// Adjust import paths based on the new location src/app/beautifier/
import DocumentOutlinePanel from "../../components/DocumentOutlinePanel";
import StyleEditor from "../../components/StyleEditor";
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router


// Component logic directly in the page file
export default function BeautifierEditorPage() { // Renamed function to match export
	const previewRef = useRef(null);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const router = useRouter();

	// State management (removed type annotations)
	const [htmlContent, setHtmlContent] = useState("");
	const [outline, setOutline] = useState([]);
	const [selectedItemId, setSelectedItemId] = useState(null);
	const [selectedItemStyles, setSelectedItemStyles] = useState({});
	const [selectedItemType, setSelectedItemType] = useState("");
	const [selectedItemTagName, setSelectedItemTagName] = useState("");
	const [mobilePreviewMode, setMobilePreviewMode] = useState(true);

	// Drawer states
	const [outlineDrawerOpen, setOutlineDrawerOpen] = useState(false);
	const [styleDrawerOpen, setStyleDrawerOpen] = useState(false);

	// --- Effects ---

	// Load data from Session Storage on mount
	useEffect(() => {
		const storedHtml = sessionStorage.getItem("beautifierHtml");
		const storedOutline = sessionStorage.getItem("beautifierOutline");

		if (storedHtml && storedOutline) {
			try {
				const parsedOutline = JSON.parse(storedOutline);
				setHtmlContent(storedHtml);
				setOutline(parsedOutline);
				sessionStorage.removeItem("beautifierHtml");
				sessionStorage.removeItem("beautifierOutline");
			} catch (error) {
				console.error("Failed to parse outline data from session storage:", error);
				alert("加载编辑数据失败，将返回主页。");
				router.push("/");
			}
		} else {
			console.warn("No data found in session storage. Redirecting to home.");
			alert("没有找到编辑数据，请先从主页生成内容。将返回主页。");
			router.push("/");
		}
	}, [router]);

	// Get element styles on selection change
	useEffect(() => {
		if (selectedItemId && previewRef.current) {
			const element = previewRef.current.querySelector(`#${selectedItemId}`);
			if (element) {
				const styleString = element.getAttribute("style") || "";
				const computedStyles = window.getComputedStyle(element);
				const styleObj = {};
				styleString.split(";").forEach((style) => {
					if (style.trim()) {
						const [property, value] = style.split(":");
						if (property && value) {
							styleObj[property.trim()] = value.trim();
						}
					}
				});

				const outlineItem = outline.find((item) => findItemById(item, selectedItemId));
				setSelectedItemType(outlineItem ? outlineItem.type : "未知类型");
				setSelectedItemTagName(outlineItem ? outlineItem.tagName : "");

				setSelectedItemStyles({
					backgroundColor: styleObj["background-color"] || computedStyles.backgroundColor,
					color: styleObj["color"] || computedStyles.color,
					borderColor: styleObj["border-color"] || computedStyles.borderColor,
					borderWidth: styleObj["border-width"] || computedStyles.borderWidth,
					borderRadius: styleObj["border-radius"] || computedStyles.borderRadius,
					padding: styleObj["padding"] || computedStyles.padding,
					margin: styleObj["margin"] || computedStyles.margin,
					fontSize: styleObj["font-size"] || computedStyles.fontSize,
					fontWeight: styleObj["font-weight"] || computedStyles.fontWeight,
				});

				if (isMobile && !styleDrawerOpen) {
					setStyleDrawerOpen(true);
					setOutlineDrawerOpen(false);
				}
			}
		} else {
			setSelectedItemStyles({});
			setSelectedItemType("");
			setSelectedItemTagName("");
		}
	}, [selectedItemId, outline, isMobile, styleDrawerOpen]);

	// Helper function to find item by ID recursively
	const findItemById = (item, id) => {
		if (!id) return null;
		if (item.id === id) return item;
		if (item.children) {
			for (const child of item.children) {
				const found = findItemById(child, id);
				if (found) return found;
			}
		}
		return null;
	};

	// --- Handlers ---

	const handleOutlineItemSelect = (id) => {
		setSelectedItemId(id);
		if (previewRef.current) {
			const element = previewRef.current.querySelector(`#${id}`);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
				element.classList.add("temp-highlight");
				setTimeout(() => {
					element.classList.remove("temp-highlight");
				}, 2000);
			}
		}
		if (isMobile) {
			setOutlineDrawerOpen(false);
		}
	};

	const handleApplyStyles = (styles) => {
		if (selectedItemId && previewRef.current) {
			const element = previewRef.current.querySelector(`#${selectedItemId}`);
			if (element) {
				let styleString = "";
				for (const [key, value] of Object.entries(styles)) {
					if (value) {
						const cssProperty = key.replace(/([A-Z])/g, "-$1").toLowerCase();
						styleString += `${cssProperty}: ${value}; `;
					}
				}
				element.setAttribute("style", styleString);
			}
		}
	};

	const handleExportHtml = () => {
		if (previewRef.current) {
			const contentClone = previewRef.current.cloneNode(true);
			const elementsToClean = contentClone.querySelectorAll(".temp-highlight");
			elementsToClean.forEach((el) => el.classList.remove("temp-highlight"));

			const finalHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>导出的文档</title>
  <style>
    body { font-family: sans-serif; line-height: 1.6; margin: 20px; color: #333; }
    * { box-sizing: border-box; }
    img { max-width: 100%; height: auto; }
    pre { overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; background-color: #f8f9fa; padding: 10px; border: 1px solid #eee; border-radius: 4px; font-family: monospace; }
    blockquote { margin: 1em 0; padding-left: 1em; border-left: 4px solid #eee; color: #555; }
    .temp-highlight { box-shadow: 0 0 0 2px #2196f3 !important; transition: box-shadow 0.3s; position: relative; z-index: 1; }
    #preview-container { word-wrap: break-word; }
    #preview-container * { box-sizing: border-box; max-width: 100%; }
    #preview-container img { height: auto; }
  </style>
</head>
<body>
  ${contentClone.innerHTML}
</body>
</html>`;

			const blob = new Blob([finalHtml], { type: "text/html" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "beautified-document.html";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};


	const toggleOutlineDrawer = (open) => (event) => {
		if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) return;
		setOutlineDrawerOpen(open);
		if (open) setStyleDrawerOpen(false);
	};

	const toggleStyleDrawer = (open) => (event) => {
		if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) return;
		setStyleDrawerOpen(open);
		if (open) setOutlineDrawerOpen(false);
	};

	const toggleMobilePreviewMode = () => {
		setMobilePreviewMode(!mobilePreviewMode);
	};

	// --- Components ---

	const outlinePanel = (
		<Box sx={{ width: isMobile ? 280 : "100%", height: "100%", display: "flex", flexDirection: "column" }}>
			<DocumentOutlinePanel
				outline={outline}
				selectedId={selectedItemId}
				onSelectItem={handleOutlineItemSelect}
			/>
			<Button variant="contained" color="primary" onClick={handleExportHtml} sx={{ mt: 2, width: "100%" }} disabled={!previewRef.current}>
				导出HTML
			</Button>
		</Box>
	);

	const styleEditorPanel = (
		<Box sx={{ width: isMobile ? 320 : "100%", height: "100%", display: "flex", flexDirection: "column" }}>
			<StyleEditor
				elementId={selectedItemId}
				elementType={selectedItemType}
				elementTagName={selectedItemTagName}
				initialStyles={selectedItemStyles}
				onApplyStyles={handleApplyStyles}
			/>
		</Box>
	);

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

	function StandardPreviewPanelComponent() {
		return (
			<Paper elevation={2} sx={{ height: "100%", width: "100%", overflow: "auto", position: "relative", p: 2, "& .temp-highlight": { boxShadow: "0 0 0 2px #2196f3 !important", transition: "box-shadow 0.3s", position: "relative", zIndex: 1 } }}>
				<style>{`.temp-highlight { box-shadow: 0 0 0 2px #2196f3 !important; position: relative; zIndex: 1; } #preview-container { word-wrap: break-word; } #preview-container * { box-sizing: border-box; max-width: 100%; } #preview-container img { height: auto; }`}</style>
				<div id="preview-container" ref={previewRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
			</Paper>
		);
	}

	function MobilePreviewPanelComponent() {
		return (
			<MobileDeviceFrame>
				<Box sx={{ overflow: "auto", width: "100%", height: "100%", backgroundColor: "white" }}>
					<style>{`.temp-highlight { box-shadow: 0 0 0 2px #2196f3 !important; position: relative; zIndex: 1; } #preview-container { word-wrap: break-word; padding: 12px; max-width: 100%; } #preview-container * { box-sizing: border-box; max-width: 100%; } #preview-container img { height: auto; }`}</style>
					<div id="preview-container" ref={previewRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
				</Box>
			</MobileDeviceFrame>
		);
	}

	const PreviewComponent = mobilePreviewMode ? MobilePreviewPanelComponent : StandardPreviewPanelComponent;

	// --- Render ---
	return (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", overflow: "hidden" }}>
			{/* Header Bar */}
			<Box sx={{ p: isMobile ? 1 : 2, borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<Typography variant={isMobile ? "h6" : "h4"}>文档美化编辑器</Typography>
				{!isMobile && (
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<DesktopWindowsIcon color={!mobilePreviewMode ? "primary" : "disabled"} sx={{ mr: 1 }} />
						<Switch checked={mobilePreviewMode} onChange={toggleMobilePreviewMode} color="primary" />
						<SmartphoneIcon color={mobilePreviewMode ? "primary" : "disabled"} sx={{ ml: 1 }} />
					</Box>
				)}
				{isMobile && (
					<Box>
						<IconButton onClick={toggleOutlineDrawer(true)} color="primary" aria-label="打开大纲"><ListAltIcon /></IconButton>
						<IconButton onClick={toggleStyleDrawer(true)} color="primary" disabled={!selectedItemId} aria-label="打开样式编辑器"><PaletteIcon /></IconButton>
					</Box>
				)}
			</Box>

			{/* Main Content Area */}
			<Box sx={{ display: "flex", flexGrow: 1, p: isMobile ? 1 : 2, overflow: "hidden" }}>
				{isMobile ? (
					// Mobile Layout
					<>
						<StandardPreviewPanelComponent />
						{/* Mobile Drawers */}
						<Drawer anchor="left" open={outlineDrawerOpen} onClose={toggleOutlineDrawer(false)}>
							<Box sx={{ width: 280, p: 2, height: "100%" }}>
								<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}><IconButton onClick={toggleOutlineDrawer(false)}><CloseIcon /></IconButton></Box>
								{outlinePanel}
							</Box>
						</Drawer>
						<Drawer anchor="right" open={styleDrawerOpen} onClose={toggleStyleDrawer(false)}>
							<Box sx={{ width: 320, p: 2, height: "100%" }}>
								<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}><IconButton onClick={toggleStyleDrawer(false)}><CloseIcon /></IconButton></Box>
								{styleEditorPanel}
							</Box>
						</Drawer>
					</>
				) : (
					// Desktop Layout
					<Box sx={{ display: "flex", width: "100%", height: "100%", gap: 2 }}>
						{/* Left Outline Panel */}
						<Box sx={{ width: "25%", minWidth: 220, maxWidth: 350, height: "100%", overflow: "auto" }}>{outlinePanel}</Box>
						{/* Center Preview Panel */}
						<Box sx={{ flexGrow: 1, height: "100%", overflow: "hidden" }}><PreviewComponent /></Box>
						{/* Right Style Editor Panel */}
						<Box sx={{ width: "25%", minWidth: 220, maxWidth: 350, height: "100%", overflow: "auto" }}>{styleEditorPanel}</Box>
					</Box>
				)}
			</Box>
		</Box>
	);
}