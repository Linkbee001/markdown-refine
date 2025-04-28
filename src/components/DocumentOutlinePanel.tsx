import React from "react";
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
  selectedId: string | null;
  onSelectItem: (id: string) => void;
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
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  level: number;
}

const OutlineListItem: React.FC<OutlineListItemProps> = ({
  item,
  selectedId,
  onSelectItem,
  level,
}) => {
  const [open, setOpen] = React.useState(true);
  const t = useTranslations("documentOutlinePanel.types");

  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    onSelectItem(item.id);
    if (hasChildren) {
      setOpen(!open);
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
        sx={{
          borderLeft:
            selectedId === item.id
              ? `4px solid ${level > 0 ? "#ff9800" : "#0066cc"}`
              : "4px solid transparent",
          pl: level * 2,
        }}
      >
        <ListItemButton
          selected={selectedId === item.id}
          onClick={handleClick}
          sx={{
            "&.Mui-selected": { bgcolor: level > 0 ? "#fff3e0" : "#e3f2fd" },
          }}
        >
          <ListItemIcon>{getIconForType(item.type)}</ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  {t(typeTranslationKey(item.type))}
                </Typography>
                {item.specialComponents.length > 0 && (
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
              fontWeight: selectedId === item.id ? "bold" : "normal",
            }}
            secondaryTypographyProps={{
              noWrap: true,
              sx: { maxWidth: `${180 - level * 16}px` },
            }}
          />
          {hasChildren ? open ? <ExpandLess /> : <ExpandMore /> : null}
        </ListItemButton>
      </ListItem>
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child) => (
              <OutlineListItem
                key={child.id}
                item={child}
                selectedId={selectedId}
                onSelectItem={onSelectItem}
                level={level + 1}
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
  selectedId,
  onSelectItem,
}) => {
  const t = useTranslations("documentOutlinePanel");

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
      <Typography
        variant="h6"
        sx={{
          p: 2,
          bgcolor: "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
          flexShrink: 0,
        }}
      >
        {t("title")}
      </Typography>
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: "auto", width: "100%" }}>
        <List component="nav" sx={{ width: "100%" }}>
          {outline.map((item) => (
            <OutlineListItem
              key={item.id}
              item={item}
              selectedId={selectedId}
              onSelectItem={onSelectItem}
              level={0}
            />
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default DocumentOutlinePanel;
