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
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SketchPicker } from "react-color";
import { useTranslations } from "next-intl";

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
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  gap: string;
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
  const t = useTranslations("styleEditor");
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
        <Typography variant="body1">{t("selectComponentPrompt")}</Typography>
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
      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {t("selectedComponent", { type: elementType })}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={`ID: ${elementId}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${t("tag")}: ${elementTagName}`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>
        <Divider sx={{ my: 1 }} />
      </Box>

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{ mb: 2, flexShrink: 0 }}
      >
        <Tab label={t("tabs.appearance")} />
        <Tab label={t("tabs.typography")} />
        <Tab label={t("tabs.spacing")} />
      </Tabs>

      <Box sx={{ flexGrow: 1, flexShrink: 1, overflowY: "auto" }}>
        {currentTab === 0 && (
          <Box sx={{ p: 1 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("sections.colors.title")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        {t("sections.colors.backgroundLabel")}
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
                      <Box sx={{ position: "relative", zIndex: 2 }}>
                        <Box
                          sx={{ position: "absolute", top: "100%", mt: 0.5 }}
                        >
                          <SketchPicker
                            color={styles.backgroundColor || "#ffffff"}
                            onChange={(color) =>
                              handleColorChange("backgroundColor", color)
                            }
                          />
                        </Box>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        {t("sections.colors.textLabel")}
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
                      <Box sx={{ position: "relative", zIndex: 2 }}>
                        <Box
                          sx={{ position: "absolute", top: "100%", mt: 0.5 }}
                        >
                          <SketchPicker
                            color={styles.color || "#000000"}
                            onChange={(color) =>
                              handleColorChange("color", color)
                            }
                          />
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("sections.border.title")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        {t("sections.border.colorLabel")}
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
                      <Box sx={{ position: "relative", zIndex: 2 }}>
                        <Box
                          sx={{ position: "absolute", top: "100%", mt: 0.5 }}
                        >
                          <SketchPicker
                            color={styles.borderColor || "#cccccc"}
                            onChange={(color) =>
                              handleColorChange("borderColor", color)
                            }
                          />
                        </Box>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {t("sections.border.widthLabel")}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={styles.borderWidth || ""}
                      onChange={(e) =>
                        handleStyleChange("borderWidth", e.target.value)
                      }
                      placeholder={t("sections.border.widthPlaceholder")}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {t("sections.border.radiusLabel")}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={styles.borderRadius || ""}
                      onChange={(e) =>
                        handleStyleChange("borderRadius", e.target.value)
                      }
                      placeholder={t("sections.border.radiusPlaceholder")}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
        {currentTab === 1 && (
          <Box sx={{ p: 1 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("sections.font.title")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {t("sections.font.sizeLabel")}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={styles.fontSize || ""}
                      onChange={(e) =>
                        handleStyleChange("fontSize", e.target.value)
                      }
                      placeholder={t("sections.font.sizePlaceholder")}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {t("sections.font.weightLabel")}
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("sections.font.selectWeight")}</InputLabel>
                      <Select
                        value={styles.fontWeight || ""}
                        label={t("sections.font.selectWeight")}
                        onChange={(e) =>
                          handleStyleChange("fontWeight", e.target.value)
                        }
                      >
                        <MenuItem value="">
                          {t("sections.font.weightDefault")}
                        </MenuItem>
                        <MenuItem value="normal">
                          {t("sections.font.weightNormal")}
                        </MenuItem>
                        <MenuItem value="bold">
                          {t("sections.font.weightBold")}
                        </MenuItem>
                        <MenuItem value="lighter">
                          {t("sections.font.weightLighter")}
                        </MenuItem>
                        <MenuItem value="bolder">
                          {t("sections.font.weightBolder")}
                        </MenuItem>
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
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("sections.flexbox.title")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t("sections.flexbox.directionLabel")}
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={styles.flexDirection || ""}
                      onChange={(e) =>
                        handleStyleChange("flexDirection", e.target.value)
                      }
                    >
                      <MenuItem value="">
                        {t("sections.flexbox.defaultOption")}
                      </MenuItem>
                      <MenuItem value="row">
                        {t("sections.flexbox.directionRow")}
                      </MenuItem>
                      <MenuItem value="row-reverse">
                        {t("sections.flexbox.directionRowReverse")}
                      </MenuItem>
                      <MenuItem value="column">
                        {t("sections.flexbox.directionColumn")}
                      </MenuItem>
                      <MenuItem value="column-reverse">
                        {t("sections.flexbox.directionColumnReverse")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t("sections.flexbox.justifyContentLabel")}
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={styles.justifyContent || ""}
                      onChange={(e) =>
                        handleStyleChange("justifyContent", e.target.value)
                      }
                    >
                      <MenuItem value="">
                        {t("sections.flexbox.defaultOption")}
                      </MenuItem>
                      <MenuItem value="flex-start">
                        {t("sections.flexbox.justifyStart")}
                      </MenuItem>
                      <MenuItem value="flex-end">
                        {t("sections.flexbox.justifyEnd")}
                      </MenuItem>
                      <MenuItem value="center">
                        {t("sections.flexbox.justifyCenter")}
                      </MenuItem>
                      <MenuItem value="space-between">
                        {t("sections.flexbox.justifyBetween")}
                      </MenuItem>
                      <MenuItem value="space-around">
                        {t("sections.flexbox.justifyAround")}
                      </MenuItem>
                      <MenuItem value="space-evenly">
                        {t("sections.flexbox.justifyEvenly")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t("sections.flexbox.alignItemsLabel")}
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={styles.alignItems || ""}
                      onChange={(e) =>
                        handleStyleChange("alignItems", e.target.value)
                      }
                    >
                      <MenuItem value="">
                        {t("sections.flexbox.defaultOption")}
                      </MenuItem>
                      <MenuItem value="stretch">
                        {t("sections.flexbox.alignStretch")}
                      </MenuItem>
                      <MenuItem value="flex-start">
                        {t("sections.flexbox.alignStart")}
                      </MenuItem>
                      <MenuItem value="flex-end">
                        {t("sections.flexbox.alignEnd")}
                      </MenuItem>
                      <MenuItem value="center">
                        {t("sections.flexbox.alignCenter")}
                      </MenuItem>
                      <MenuItem value="baseline">
                        {t("sections.flexbox.alignBaseline")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t("sections.flexbox.gapLabel")}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={styles.gap || ""}
                    onChange={(e) => handleStyleChange("gap", e.target.value)}
                    placeholder={t("sections.flexbox.gapPlaceholder")}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("sections.padding.title")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t("sections.padding.allLabel")}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={styles.padding || ""}
                    onChange={(e) =>
                      handleStyleChange("padding", e.target.value)
                    }
                    placeholder={t("sections.padding.placeholder")}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("sections.margin.title")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t("sections.margin.allLabel")}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={styles.margin || ""}
                    onChange={(e) =>
                      handleStyleChange("margin", e.target.value)
                    }
                    placeholder={t("sections.margin.placeholder")}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>

      {colorPickerOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 1,
          }}
          onClick={() => toggleColorPicker(null)}
        />
      )}

      <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplyStyles}
          disabled={!elementId}
          fullWidth
        >
          {t("applyButton")}
        </Button>
      </Box>
    </Box>
  );
};

export default StyleEditor;
