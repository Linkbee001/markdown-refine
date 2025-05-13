import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Badge,
  Collapse,
  Checkbox,
  Button,
  Tooltip,
  IconButton,
  Switch,
} from "@mui/material";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import CodeIcon from "@mui/icons-material/Code";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import EventIcon from "@mui/icons-material/Event";
import FlagIcon from "@mui/icons-material/Flag";
import DescriptionIcon from "@mui/icons-material/Description";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useTranslations } from "next-intl";

// 定义大纲项目的接口
export interface OutlineItem {
  id: string;
  type: string;
  contentPreview: string;
  tagName: string;
  specialComponents: Array<{
    type: string;
    content: string;
  }>;
  children?: OutlineItem[];
}

// 组件属性接口
interface DocumentOutlinePanelProps {
  outline: OutlineItem[];
  selectedIds: string[];
  onToggleMergeSelection: (id: string) => void;
  onItemClickNormalMode: (id: string) => void;
  onMergeItems: (ids: string[]) => void;
  isMergeable: (ids: string[]) => boolean;
  isMergeModeEnabled: boolean;
  onToggleMergeMode: () => void;
}

// 根据类型返回适当的图标
const getIconForType = (type: string) => {
  switch (type) {
    case "heading":
      return <TextFieldsIcon />;
    case "paragraph":
      return <DescriptionIcon />;
    case "list":
      return <FormatListBulletedIcon />;
    case "code":
      return <CodeIcon />;
    case "quote":
      return <FormatQuoteIcon />;
    case "date":
      return <EventIcon />;
    case "ending":
      return <FlagIcon />;
    case "paragraph-wrapper":
    case "image-wrapper":
      return <InboxIcon />;
    default:
      return <DescriptionIcon />;
  }
};

// 递归渲染列表项的组件
interface OutlineListItemProps {
  item: OutlineItem;
  selectedIds: string[];
  onToggleMergeSelection: (id: string) => void;
  onItemClickNormalMode: (id: string) => void;
  level: number;
  isMergeModeEnabled: boolean;
}

const OutlineListItem: React.FC<OutlineListItemProps> = ({
  item,
  selectedIds,
  onToggleMergeSelection,
  onItemClickNormalMode,
  level,
  isMergeModeEnabled,
}) => {
  const tItemTypes = useTranslations("documentOutlinePanel.types");
  const tPanel = useTranslations("documentOutlinePanel");

  const isSelected = selectedIds.includes(item.id);
  const mergeableTypes = ["paragraph", "paragraph-wrapper"]; // Define mergeable types here
  const isMergeableType = mergeableTypes.includes(item.type);

  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isMergeModeEnabled) {
      onToggleMergeSelection(item.id);
    }
  };

  const handleItemClick = () => {
    if (!isMergeModeEnabled) {
      onItemClickNormalMode(item.id);
    }
  };

  const typeTranslationKey = (type: string): string => {
    switch (type) {
      case "paragraph-wrapper":
        return "paragraphWrapper";
      case "image-wrapper":
        return "imageWrapper";
      default:
        return type;
    }
  };

  return (
    <React.Fragment key={item.id}>
      <ListItem
        disablePadding
        secondaryAction={
          isMergeModeEnabled && isMergeableType ? (
            <Tooltip
              title={
                tPanel(
                  "checkboxTooltip.enabled"
                ) /* Simplified tooltip as it only shows when enabled */
              }
            >
              <span>
                <Checkbox
                  edge="end"
                  onChange={handleToggle}
                  checked={isSelected}
                  disabled={!isMergeModeEnabled}
                  inputProps={{
                    "aria-labelledby": `checkbox-list-label-${item.id}`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </span>
            </Tooltip>
          ) : null
        }
        sx={{
          borderLeft: isSelected
            ? `4px solid ${level > 0 ? "#ff9800" : "#0066cc"}`
            : "4px solid transparent",
          pl: level * 2,
          bgcolor: isSelected ? (level > 0 ? "#fff3e0" : "#e3f2fd") : "inherit",
          opacity: isMergeModeEnabled && !isMergeableType ? 0.5 : 1,
          cursor: isMergeModeEnabled ? "default" : "pointer",
          sx: { pr: isMergeModeEnabled && isMergeableType ? 7 : 2 },
        }}
      >
        <ListItemButton
          onClick={handleItemClick}
          disabled={isMergeModeEnabled}
          sx={{ pr: 7 }}
        >
          <ListItemIcon>{getIconForType(item.type)}</ListItemIcon>
          <ListItemText
            id={`checkbox-list-label-${item.id}`}
            primary={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  {tItemTypes(typeTranslationKey(item.type))}
                </Typography>
                {item.specialComponents &&
                  item.specialComponents.length > 0 && (
                    <Badge
                      badgeContent={item.specialComponents.length}
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                  )}
              </Box>
            }
            secondary={item.contentPreview}
            primaryTypographyProps={{
              fontWeight: isSelected ? "bold" : "normal",
            }}
            secondaryTypographyProps={{
              noWrap: true,
              sx: { maxWidth: `${180 - level * 16 - 40}px` },
            }}
          />
        </ListItemButton>
      </ListItem>
      {hasChildren && (
        <Collapse in={true} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child) => (
              <OutlineListItem
                key={child.id}
                item={child}
                selectedIds={selectedIds}
                onToggleMergeSelection={onToggleMergeSelection}
                onItemClickNormalMode={onItemClickNormalMode}
                level={level + 1}
                isMergeModeEnabled={isMergeModeEnabled}
              />
            ))}
          </List>
        </Collapse>
      )}
    </React.Fragment>
  );
};

// 主面板组件
const DocumentOutlinePanel: React.FC<DocumentOutlinePanelProps> = ({
  outline,
  selectedIds,
  onToggleMergeSelection,
  onItemClickNormalMode,
  onMergeItems,
  isMergeable,
  isMergeModeEnabled,
  onToggleMergeMode,
}) => {
  const t = useTranslations("documentOutlinePanel");
  const tGeneric = useTranslations("generic");

  // Log received props
  console.log(
    `[DocumentOutlinePanel] Received props: isMergeModeEnabled=${isMergeModeEnabled}, selectedIds=${JSON.stringify(
      selectedIds
    )}`
  );

  // Call the received isMergeable function to determine 'canMerge'
  const canMerge = isMergeable(selectedIds);
  console.log(`[DocumentOutlinePanel] Calculated canMerge: ${canMerge}`); // Log the result

  const handleMergeClick = () => {
    if (isMergeModeEnabled && canMerge) {
      onMergeItems(selectedIds);
    } else {
      // Log why merge is not happening
      console.log(
        `[DocumentOutlinePanel] Merge click ignored. isMergeModeEnabled=${isMergeModeEnabled}, canMerge=${canMerge}`
      );
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 1.5,
          bgcolor: "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ mr: 1 }}>
          {t("title")}
        </Typography>
        <Tooltip
          title={
            isMergeModeEnabled
              ? t("toggleMergeModeButton.tooltipDisable")
              : t("toggleMergeModeButton.tooltipEnable")
          }
        >
          <span>
            <IconButton
              onClick={() => {
                console.log(
                  "[DocumentOutlinePanel] Toggle Merge Mode button clicked."
                ); // Log toggle click
                onToggleMergeMode();
              }}
              color={isMergeModeEnabled ? "primary" : "default"}
              size="small"
            >
              {isMergeModeEnabled ? <PlaylistAddCheckIcon /> : <EditNoteIcon />}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip
          title={
            !isMergeModeEnabled
              ? t("mergeButton.disabledModeTooltip")
              : canMerge
              ? t("mergeButton.tooltip")
              : t("mergeButton.disabledTooltip")
          }
        >
          <span>
            {/* Log the disabled state directly */}
            {console.log(
              `[DocumentOutlinePanel] Merge Button disabled state: ${
                !isMergeModeEnabled || !canMerge
              }`
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<MergeTypeIcon />}
              onClick={handleMergeClick}
              disabled={!isMergeModeEnabled || !canMerge}
              sx={{ ml: "auto" }}
            >
              {tGeneric("merge")}
            </Button>
          </span>
        </Tooltip>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto", width: "100%" }}>
        <List component="nav" sx={{ width: "100%", pt: 0 }}>
          {outline.map((item) => (
            <OutlineListItem
              key={item.id}
              item={item}
              selectedIds={selectedIds}
              onToggleMergeSelection={onToggleMergeSelection}
              onItemClickNormalMode={onItemClickNormalMode}
              level={0}
              isMergeModeEnabled={isMergeModeEnabled}
            />
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default DocumentOutlinePanel;
