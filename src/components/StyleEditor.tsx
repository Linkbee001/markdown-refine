import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Grid,
  Button,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SketchPicker } from "react-color";

// 定义样式属性接口
interface StyleProperties {
  backgroundColor: string;
  color: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  padding: string;
  margin: string;
  fontSize: string;
  fontWeight: string;
  // 添加更多样式属性...
}

// 组件属性接口
interface StyleEditorProps {
  elementId: string | null;
  elementType: string;
  elementTagName: string;
  initialStyles: Partial<StyleProperties>;
  onApplyStyles: (styles: Partial<StyleProperties>) => void;
}

const StyleEditor: React.FC<StyleEditorProps> = ({
  elementId,
  elementType,
  elementTagName,
  initialStyles,
  onApplyStyles,
}) => {
  const [styles, setStyles] = useState<Partial<StyleProperties>>(initialStyles);
  const [currentTab, setCurrentTab] = useState(0);
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);

  useEffect(() => {
    setStyles(initialStyles);
  }, [initialStyles, elementId]);

  // 如果没有选择元素，显示提示信息
  if (!elementId) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1">
          请从大纲中选择一个组件来编辑样式
        </Typography>
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleStyleChange = (
    property: keyof StyleProperties,
    value: string
  ) => {
    setStyles((prev) => ({ ...prev, [property]: value }));
  };

  const handleColorChange = (property: keyof StyleProperties, color: any) => {
    setStyles((prev) => ({ ...prev, [property]: color.hex }));
  };

  const handleApplyStyles = () => {
    onApplyStyles(styles);
  };

  const toggleColorPicker = (property: string | null) => {
    setColorPickerOpen(colorPickerOpen === property ? null : property);
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: 2,
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>
        样式编辑器 - {elementType}
        {elementTagName && (
          <Typography
            component="span"
            variant="body2"
            sx={{ ml: 1, color: "gray" }}
          >
            (标签: {elementTagName.toUpperCase()})
          </Typography>
        )}
      </Typography>
      <Typography
        variant="caption"
        sx={{ mb: 2, color: "text.secondary", flexShrink: 0 }}
      >
        ID: {elementId}
      </Typography>

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{ mb: 2, flexShrink: 0 }}
      >
        <Tab label="外观" />
        <Tab label="排版" />
        <Tab label="间距" />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {currentTab === 0 && (
          <Box sx={{ p: 1 }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>颜色</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        背景颜色:
                      </Typography>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: styles.backgroundColor || "#ffffff",
                          border: "1px solid #cccccc",
                          cursor: "pointer",
                          mr: 1,
                        }}
                        onClick={() => toggleColorPicker("backgroundColor")}
                      />
                      <TextField
                        size="small"
                        value={styles.backgroundColor || ""}
                        onChange={(e) =>
                          handleStyleChange("backgroundColor", e.target.value)
                        }
                      />
                    </Box>
                    {colorPickerOpen === "backgroundColor" && (
                      <Box sx={{ mt: 1, mb: 2 }}>
                        <SketchPicker
                          color={styles.backgroundColor || "#ffffff"}
                          onChange={(color) =>
                            handleColorChange("backgroundColor", color)
                          }
                        />
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        文字颜色:
                      </Typography>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: styles.color || "#000000",
                          border: "1px solid #cccccc",
                          cursor: "pointer",
                          mr: 1,
                        }}
                        onClick={() => toggleColorPicker("color")}
                      />
                      <TextField
                        size="small"
                        value={styles.color || ""}
                        onChange={(e) =>
                          handleStyleChange("color", e.target.value)
                        }
                      />
                    </Box>
                    {colorPickerOpen === "color" && (
                      <Box sx={{ mt: 1, mb: 2 }}>
                        <SketchPicker
                          color={styles.color || "#000000"}
                          onChange={(color) =>
                            handleColorChange("color", color)
                          }
                        />
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>边框</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        边框颜色:
                      </Typography>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: styles.borderColor || "#cccccc",
                          border: "1px solid #cccccc",
                          cursor: "pointer",
                          mr: 1,
                        }}
                        onClick={() => toggleColorPicker("borderColor")}
                      />
                      <TextField
                        size="small"
                        value={styles.borderColor || ""}
                        onChange={(e) =>
                          handleStyleChange("borderColor", e.target.value)
                        }
                      />
                    </Box>
                    {colorPickerOpen === "borderColor" && (
                      <Box sx={{ mt: 1, mb: 2 }}>
                        <SketchPicker
                          color={styles.borderColor || "#cccccc"}
                          onChange={(color) =>
                            handleColorChange("borderColor", color)
                          }
                        />
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      边框宽度:
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={styles.borderWidth || ""}
                      onChange={(e) =>
                        handleStyleChange("borderWidth", e.target.value)
                      }
                      placeholder="例如: 1px"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      边框圆角:
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={styles.borderRadius || ""}
                      onChange={(e) =>
                        handleStyleChange("borderRadius", e.target.value)
                      }
                      placeholder="例如: 4px 或 50%"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
        {currentTab === 1 && (
          <Box sx={{ p: 1 }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>字体</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      字号:
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={styles.fontSize || ""}
                      onChange={(e) =>
                        handleStyleChange("fontSize", e.target.value)
                      }
                      placeholder="例如: 16px 或 1rem"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      字重:
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel>选择字重</InputLabel>
                      <Select
                        value={styles.fontWeight || ""}
                        label="选择字重"
                        onChange={(e) =>
                          handleStyleChange("fontWeight", e.target.value)
                        }
                      >
                        <MenuItem value="">默认</MenuItem>
                        <MenuItem value="normal">Normal (400)</MenuItem>
                        <MenuItem value="bold">Bold (700)</MenuItem>
                        <MenuItem value="lighter">Lighter (300)</MenuItem>
                        <MenuItem value="bolder">Bolder (900)</MenuItem>
                        <MenuItem value="100">100</MenuItem>
                        <MenuItem value="200">200</MenuItem>
                        <MenuItem value="300">300</MenuItem>
                        <MenuItem value="400">400</MenuItem>
                        <MenuItem value="500">500</MenuItem>
                        <MenuItem value="600">600</MenuItem>
                        <MenuItem value="700">700</MenuItem>
                        <MenuItem value="800">800</MenuItem>
                        <MenuItem value="900">900</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
        {currentTab === 2 && (
          <Box sx={{ p: 1 }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>内边距 (Padding)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  内边距:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={styles.padding || ""}
                  onChange={(e) => handleStyleChange("padding", e.target.value)}
                  placeholder="例如: 10px 或 5px 10px"
                />
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>外边距 (Margin)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  外边距:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={styles.margin || ""}
                  onChange={(e) => handleStyleChange("margin", e.target.value)}
                  placeholder="例如: 10px 或 0 auto"
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleApplyStyles}
        sx={{ mt: 2, width: "100%", flexShrink: 0 }}
      >
        应用样式
      </Button>
    </Box>
  );
};

export default StyleEditor;
