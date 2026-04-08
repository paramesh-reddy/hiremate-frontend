/**
 * CustomizationPanel — Design tab (SaaS-level redesign).
 * All functionality is identical to the previous version.
 * Structure: Template grid → 5 collapsible sections (Appearance, Layout, Spacing, Content, Sections)
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  Switch,
  Slider,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import SectionReorder from './SectionReorder';
import { RESUME_STUDIO_THEME as T } from '../../../utilities/resumeStudioTheme';

function atsScoreColor(score) {
  if (score >= 90) return '#059669';
  if (score >= 80) return '#0d9488';
  if (score >= 70) return '#d97706';
  return '#64748b';
}

/** Normalize template / user hex for `<input type="color">` (requires #rrggbb). */
function normalizeHexForColorInput(hex) {
  if (hex == null || typeof hex !== 'string') return '#000000';
  const v = hex.trim();
  if (/^#[0-9A-Fa-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/i.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return '#000000';
}

function ColorPickerRow({ id, label, value, fallbackHex, onChange, onClear }) {
  const hasValue = Boolean(value);
  const display = normalizeHexForColorInput(value || fallbackHex);
  return (
    <Box sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
      <Typography
        sx={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: T.textPrimary,
          fontFamily: 'var(--font-family)',
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}>
        <Box
          component="label"
          htmlFor={id}
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: 1,
            overflow: 'hidden',
            cursor: 'pointer',
            flexShrink: 0,
            border: `2px solid ${hasValue ? T.primary : T.mutedBorder}`,
            boxShadow: hasValue ? `0 0 0 2px ${T.primarySoft}` : 'none',
            '&:focus-within': { outline: `2px solid ${T.primary}`, outlineOffset: 2 },
          }}
        >
          <input
            id={id}
            type="color"
            value={display}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            aria-label={label}
            style={{
              width: '120%',
              height: '120%',
              margin: '-10%',
              padding: 0,
              border: 'none',
              cursor: 'pointer',
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: T.textSecondary, fontFamily: 'var(--font-family)' }}>
          {hasValue ? normalizeHexForColorInput(value) : `${display} · preset`}
        </Typography>
        {hasValue && (
          <Button
            size="small"
            variant="text"
            onClick={onClear}
            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: T.primary, minWidth: 0 }}
          >
            Reset
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template Tile
// ─────────────────────────────────────────────────────────────────────────────

function TemplateTile({ template, selected, onSelect }) {
  const [imgErr, setImgErr] = useState(false);
  const img = `/resume-templates/${template.id}.svg`;
  const paletteColor = template.color_schemes?.[0]?.primary ?? '#374151';
  const ats = typeof template.ats_score === 'number' ? template.ats_score : 0;

  return (
    <Card
      onClick={onSelect}
      elevation={0}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      sx={{
        overflow: 'hidden',
        cursor: 'pointer',
        border: '2px solid',
        borderColor: selected ? T.primary : T.mutedBorder,
        borderRadius: 2,
        bgcolor: T.surface,
        boxShadow: selected ? '0 0 0 3px rgba(51, 94, 222, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.18s ease',
        '&:hover': {
          borderColor: selected ? T.primary : 'rgba(51, 94, 222, 0.35)',
          transform: 'translateY(-2px)',
          boxShadow: selected
            ? '0 0 0 3px rgba(51, 94, 222, 0.18)'
            : '0 4px 14px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '120 / 160',
            bgcolor: '#f1f5f9',
            flexShrink: 0,
          }}
        >
          {!imgErr ? (
            <Box
              component="img"
              src={img}
              alt={template.name}
              loading="lazy"
              onError={() => setImgErr(true)}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'top center',
                display: 'block',
              }}
            />
          ) : (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                p: 1,
              }}
            >
              <Box sx={{ width: '80%', height: 6, bgcolor: paletteColor, borderRadius: 1, mb: 0.5 }} />
              {[1, 0.7, 0.7, 0.5, 0.5, 0.5].map((w, i) => (
                <Box
                  key={i}
                  sx={{
                    width: `${w * 80}%`,
                    height: 3,
                    bgcolor: '#cbd5e1',
                    borderRadius: 0.5,
                    mt: i === 2 ? 0.75 : 0,
                  }}
                />
              ))}
            </Box>
          )}
          {selected && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                width: 26,
                height: 26,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.96)',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <CheckCircleRoundedIcon sx={{ color: T.primary, fontSize: 20 }} />
            </Box>
          )}
        </Box>

        <Box
          sx={{
            px: 1.25,
            py: 0.85,
            bgcolor: selected ? T.primarySoft : T.surface,
            borderTop: `1px solid ${T.border}`,
            minHeight: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0 }}>
            <Typography
              component="span"
              title={template.name}
              sx={{
                fontSize: '0.6875rem',
                fontWeight: selected ? 700 : 600,
                color: selected ? T.primary : T.textPrimary,
                fontFamily: 'var(--font-family)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
                flex: 1,
                minWidth: 0,
              }}
            >
              {template.name}
            </Typography>
            {template.premium && (
              <DiamondRoundedIcon
                sx={{ fontSize: 12, color: '#b45309', flexShrink: 0, opacity: 0.9 }}
                aria-label="Premium template"
              />
            )}
          </Box>
          <Typography
            sx={{
              fontSize: '0.625rem',
              color: atsScoreColor(ats),
              fontWeight: 700,
              fontFamily: 'var(--font-family)',
              letterSpacing: '0.04em',
              mt: 0.25,
            }}
          >
            ATS {ats}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Collapsible panel section (accordion)
// ─────────────────────────────────────────────────────────────────────────────

function PanelSection({ label, accentColor = T.primary, defaultExpanded = false, children }) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        '&:before': { display: 'none' },
        borderBottom: `1px solid ${T.border}`,
        '&.Mui-expanded': { margin: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: T.textSecondary }} />}
        sx={{
          px: 2,
          minHeight: 48,
          '& .MuiAccordionSummary-content': { my: 0, alignItems: 'center', gap: 1 },
          '&:hover': { bgcolor: T.pageBg },
          '&.Mui-expanded': { bgcolor: T.pageBg },
        }}
      >
        <Box
          sx={{
            width: 3,
            height: 14,
            bgcolor: accentColor,
            borderRadius: '2px',
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: T.textPrimary,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-family)',
          }}
        >
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 1, pb: 2.5, bgcolor: T.surface }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Control label — left: name, right: current value
// ─────────────────────────────────────────────────────────────────────────────

function CtrlLabel({ children, value, sx: sxProp }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        mb: 0.75,
        ...sxProp,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: T.textPrimary,
          fontFamily: 'var(--font-family)',
          fontWeight: 600,
        }}
      >
        {children}
      </Typography>
      {value !== undefined && (
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: T.primary,
            fontFamily: 'var(--font-family)',
            fontWeight: 600,
          }}
        >
          {value}
        </Typography>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle row — label + switch in a card row
// ─────────────────────────────────────────────────────────────────────────────

function ToggleRow({ label, checked, onChange }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.25,
        py: 0.875,
        bgcolor: T.pageBg,
        borderRadius: 1,
        border: `1px solid ${T.border}`,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: T.textPrimary,
          fontFamily: 'var(--font-family)',
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <Switch checked={checked} onChange={onChange} color="primary" size="small" />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ALL_SECTIONS = ['summary', 'experience', 'skills', 'education', 'projects', 'certifications'];

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function CustomizationPanel({
  designConfig,
  onDesignChange,
  templates = [],
  onSectionsOrderChange,
}) {
  const currentTemplate = templates.find((t) => t.id === designConfig.template_id) ?? null;
  const colorSchemes = currentTemplate?.color_schemes ?? [];
  const fontOptions = currentTemplate?.fonts ?? [
    'Times New Roman', 'Arial', 'Georgia', 'Calibri',
    'Helvetica', 'Verdana', 'Lato', 'Segoe UI', 'Garamond',
  ];

  const sectionsVisible = designConfig.sections_visible ?? [];
  const isSectionVisible = (s) => sectionsVisible.length === 0 || sectionsVisible.includes(s);
  const toggleSection = (section) => {
    const visible = sectionsVisible.length === 0 ? [...ALL_SECTIONS] : [...sectionsVisible];
    const updated = visible.includes(section)
      ? visible.filter((s) => s !== section)
      : [...visible, section];
    onDesignChange({ sections_visible: updated });
  };

  const activeColorScheme =
    colorSchemes.find((s) => s.id === designConfig.color_scheme_id) || colorSchemes[0] || null;
  const hasCustomPrimary = Boolean(designConfig.custom_primary_color);
  const colorPickerValue = normalizeHexForColorInput(
    designConfig.custom_primary_color || activeColorScheme?.primary || '#000000'
  );
  const primaryHex = normalizeHexForColorInput(
    activeColorScheme?.primary || currentTemplate?.color_schemes?.[0]?.primary || '#000000'
  );
  const schemeBgHex = normalizeHexForColorInput(
    activeColorScheme?.bg || currentTemplate?.color_schemes?.[0]?.bg || '#ffffff'
  );
  const headerTextFallback = '#ffffff';
  const bodyTextFallback = '#111827';

  return (
    <Box sx={{ bgcolor: T.pageBg, minHeight: '100%' }}>

      {/* ── TEMPLATE ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          mx: 2,
          mt: 2,
          mb: 2,
          px: 2,
          pt: 2,
          pb: 2,
          bgcolor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 2,
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <TopLabel>Template</TopLabel>
        {templates.length > 0 ? (
          <Grid container spacing={1.5}>
            {templates.map((tmpl) => (
              <Grid item xs={6} sm={4} key={tmpl.id}>
                <TemplateTile
                  template={tmpl}
                  selected={designConfig.template_id === tmpl.id}
                  onSelect={() => onDesignChange({ template_id: tmpl.id })}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="caption" sx={{ color: T.textSecondary, fontFamily: 'var(--font-family)' }}>
            Loading templates…
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          mx: 2,
          mb: 2,
          border: `1px solid ${T.border}`,
          borderRadius: 2,
          bgcolor: T.surface,
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
        }}
      >
      {/* ── APPEARANCE: color scheme + typography ─────────────────────────── */}
      <PanelSection label="Appearance" defaultExpanded>

        {colorSchemes.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <CtrlLabel>Color Scheme</CtrlLabel>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', pt: 0.25 }}>
              {colorSchemes.map((cs) => {
                const isActive = !hasCustomPrimary && (designConfig.color_scheme_id
                  ? designConfig.color_scheme_id === cs.id
                  : cs.id === colorSchemes[0].id);
                return (
                  <Tooltip key={cs.id} title={cs.label} placement="top" arrow>
                    <Box
                      role="button"
                      tabIndex={0}
                      onClick={() => onDesignChange({ color_scheme_id: cs.id, custom_primary_color: null })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onDesignChange({ color_scheme_id: cs.id, custom_primary_color: null });
                        }
                      }}
                      sx={{
                        width: 26,
                        height: 26,
                        bgcolor: cs.primary,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: isActive
                          ? `0 0 0 2px white, 0 0 0 4px ${T.primary}`
                          : '0 1px 3px rgba(15, 23, 42, 0.2)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        '&:hover': {
                          transform: 'scale(1.15)',
                          boxShadow: `0 0 0 2px white, 0 0 0 4px rgba(51, 94, 222, 0.45)`,
                        },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25, mt: 1.5 }}>
              <Typography
                component="label"
                htmlFor="resume-custom-primary-color"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: T.textPrimary,
                  fontFamily: 'var(--font-family)',
                }}
              >
                Accent (section titles)
              </Typography>
              <Box
                component="label"
                htmlFor="resume-custom-primary-color"
                sx={{
                  position: 'relative',
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0,
                  border: `2px solid ${hasCustomPrimary ? T.primary : T.mutedBorder}`,
                  boxShadow: hasCustomPrimary ? `0 0 0 2px ${T.primarySoft}` : 'none',
                  '&:focus-within': {
                    outline: `2px solid ${T.primary}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <input
                  id="resume-custom-primary-color"
                  type="color"
                  value={colorPickerValue}
                  onChange={(e) => onDesignChange({ custom_primary_color: e.target.value.toLowerCase() })}
                  aria-label="Accent color for section titles and rules"
                  style={{
                    width: '120%',
                    height: '120%',
                    margin: '-10%',
                    padding: 0,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: '0.7rem', color: T.textSecondary, fontFamily: 'var(--font-family)', fontWeight: 600 }}>
                {colorPickerValue}
              </Typography>
              {hasCustomPrimary && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => onDesignChange({ custom_primary_color: null })}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: T.primary,
                    minWidth: 0,
                  }}
                >
                  Use preset only
                </Button>
              )}
            </Box>
            <Typography sx={{ fontSize: '0.65rem', color: T.textSecondary, fontFamily: 'var(--font-family)', mt: 0.75, lineHeight: 1.4, mb: 1.5 }}>
              Section titles and underlines use the accent. Header/body colors below override template defaults for preview and PDF.
            </Typography>

            {currentTemplate && (
              <>
                <Accordion
                  defaultExpanded
                  disableGutters
                  elevation={0}
                  sx={{
                    border: `1px solid ${T.border}`,
                    borderRadius: '8px !important',
                    mb: 1.5,
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: T.textSecondary }} />}
                    sx={{ px: 1.5, minHeight: 44, bgcolor: T.pageBg, '& .MuiAccordionSummary-content': { my: 1 } }}
                  >
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: T.textPrimary, fontFamily: 'var(--font-family)' }}>
                      Header
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 2, bgcolor: T.surface }}>
                    <ColorPickerRow
                      id="resume-header-bg"
                      label="Background"
                      value={designConfig.header_background_color}
                      fallbackHex={primaryHex}
                      onChange={(hex) => onDesignChange({ header_background_color: hex })}
                      onClear={() => onDesignChange({ header_background_color: null })}
                    />
                    <ColorPickerRow
                      id="resume-header-text"
                      label="Text"
                      value={designConfig.header_text_color}
                      fallbackHex={headerTextFallback}
                      onChange={(hex) => onDesignChange({ header_text_color: hex })}
                      onClear={() => onDesignChange({ header_text_color: null })}
                    />
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  defaultExpanded
                  disableGutters
                  elevation={0}
                  sx={{
                    border: `1px solid ${T.border}`,
                    borderRadius: '8px !important',
                    mb: 0,
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: T.textSecondary }} />}
                    sx={{ px: 1.5, minHeight: 44, bgcolor: T.pageBg, '& .MuiAccordionSummary-content': { my: 1 } }}
                  >
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: T.textPrimary, fontFamily: 'var(--font-family)' }}>
                      Body
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 2, bgcolor: T.surface }}>
                    <ColorPickerRow
                      id="resume-body-bg"
                      label="Background"
                      value={designConfig.body_background_color}
                      fallbackHex={schemeBgHex}
                      onChange={(hex) => onDesignChange({ body_background_color: hex })}
                      onClear={() => onDesignChange({ body_background_color: null })}
                    />
                    <ColorPickerRow
                      id="resume-body-text"
                      label="Text"
                      value={designConfig.body_text_color}
                      fallbackHex={bodyTextFallback}
                      onChange={(hex) => onDesignChange({ body_text_color: hex })}
                      onClear={() => onDesignChange({ body_text_color: null })}
                    />
                  </AccordionDetails>
                </Accordion>
              </>
            )}
          </Box>
        )}

        <Box sx={{ mb: 1.75 }}>
          <CtrlLabel>Font Family</CtrlLabel>
          <Select
            fullWidth
            size="small"
            value={fontOptions.includes(designConfig.font_family) ? designConfig.font_family : fontOptions[0]}
            onChange={(e) => onDesignChange({ font_family: e.target.value })}
            sx={selectSx}
          >
            {fontOptions.map((f) => (
              <MenuItem key={f} value={f} sx={{ fontFamily: f, fontSize: '0.875rem' }}>
                {f}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <CtrlLabel>Font Size</CtrlLabel>
          <ToggleButtonGroup
            value={designConfig.font_size}
            exclusive
            fullWidth
            size="small"
            onChange={(_, v) => v && onDesignChange({ font_size: v })}
            sx={tgSx}
          >
            {['9pt', '10pt', '10.5pt', '11pt', '12pt'].map((s) => (
              <ToggleButton key={s} value={s} sx={tgBtnSx}>{s}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box>
          <CtrlLabel value={designConfig.line_height}>Line Height</CtrlLabel>
          <ToggleButtonGroup
            value={designConfig.line_height}
            exclusive
            fullWidth
            size="small"
            onChange={(_, v) => v && onDesignChange({ line_height: v })}
            sx={tgSx}
          >
            {['1.0', '1.1', '1.2', '1.3', '1.5'].map((v) => (
              <ToggleButton key={v} value={v} sx={tgBtnSx}>{v}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

      </PanelSection>

      {/* ── LAYOUT: alignment + page + margins ────────────────────────────── */}
      <PanelSection label="Layout" defaultExpanded>

        <Box sx={{ mb: 1.75 }}>
          <CtrlLabel>Header Alignment</CtrlLabel>
          <ToggleButtonGroup
            value={designConfig.header_align}
            exclusive
            fullWidth
            size="small"
            onChange={(_, v) => v && onDesignChange({ header_align: v })}
            sx={tgSx}
          >
            <ToggleButton value="Center" sx={tgBtnSx}>Center</ToggleButton>
            <ToggleButton value="Left" sx={tgBtnSx}>Left</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <CtrlLabel>Page Size</CtrlLabel>
          <ToggleButtonGroup
            value={designConfig.page_size}
            exclusive
            fullWidth
            size="small"
            onChange={(_, v) => v && onDesignChange({ page_size: v })}
            sx={tgSx}
          >
            <ToggleButton value="Letter" sx={tgBtnSx}>US Letter</ToggleButton>
            <ToggleButton value="A4" sx={tgBtnSx}>A4</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: designConfig.template_id === 'minimalist' ? 1.75 : 0 }}>
          <CtrlLabel>Page Margins</CtrlLabel>
          <Grid container spacing={1.5}>
            {[
              ['Top',    'margin_top_in'],
              ['Bottom', 'margin_bottom_in'],
              ['Left',   'margin_left_in'],
              ['Right',  'margin_right_in'],
            ].map(([lbl, key]) => {
              const val = designConfig[key] ?? 5;
              return (
                <Grid item xs={6} key={key}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography sx={{ fontSize: '0.68rem', color: T.textSecondary, fontFamily: 'var(--font-family)' }}>
                      {lbl}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: T.primary, fontFamily: 'var(--font-family)', fontWeight: 600 }}>
                      {(val / 10).toFixed(1)}in
                    </Typography>
                  </Box>
                  <Slider
                    value={val}
                    min={1}
                    max={15}
                    step={1}
                    onChange={(_, v) => onDesignChange({ [key]: v })}
                    size="small"
                    sx={sliderSx}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {designConfig.template_id === 'minimalist' && (
          <Box>
            <CtrlLabel value={`${designConfig.title_width ?? 20}%`}>Title Column Width</CtrlLabel>
            <Slider
              value={designConfig.title_width ?? 20}
              min={15}
              max={40}
              step={1}
              onChange={(_, v) => onDesignChange({ title_width: v })}
              size="small"
              sx={sliderSx}
            />
          </Box>
        )}

      </PanelSection>

      {/* ── SPACING: section gap + bullet indent + item padding ───────────── */}
      <PanelSection label="Spacing">

        <Box sx={{ mb: 1.75 }}>
          <CtrlLabel>Section Spacing</CtrlLabel>
          <ToggleButtonGroup
            value={designConfig.section_spacing}
            exclusive
            fullWidth
            size="small"
            onChange={(_, v) => v && onDesignChange({ section_spacing: v })}
            sx={tgSx}
          >
            <ToggleButton value="compact" sx={tgBtnSx}>Compact</ToggleButton>
            <ToggleButton value="normal" sx={tgBtnSx}>Normal</ToggleButton>
            <ToggleButton value="spacious" sx={tgBtnSx}>Spacious</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <CtrlLabel value={`${designConfig.bullet_indent ?? 18}px`}>Bullet Indent</CtrlLabel>
          <Slider
            value={designConfig.bullet_indent ?? 18}
            min={0}
            max={48}
            step={2}
            onChange={(_, v) => onDesignChange({ bullet_indent: v })}
            size="small"
            sx={sliderSx}
          />
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <CtrlLabel>Item Padding</CtrlLabel>
          <ToggleButtonGroup
            value={designConfig.item_padding ?? 'none'}
            exclusive
            fullWidth
            size="small"
            onChange={(_, v) => v != null && onDesignChange({ item_padding: v })}
            sx={tgSx}
          >
            <ToggleButton value="none" sx={tgBtnSx}>None</ToggleButton>
            <ToggleButton value="small" sx={tgBtnSx}>Small</ToggleButton>
            <ToggleButton value="medium" sx={tgBtnSx}>Medium</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <ToggleRow
          label="Section separator lines"
          checked={!!designConfig.section_separator}
          onChange={(e) => onDesignChange({ section_separator: e.target.checked })}
        />

      </PanelSection>

      {/* ── CONTENT: bullet style + dates + name caps ─────────────────────── */}
      <PanelSection label="Content">

        <Box sx={{ mb: 1.75 }}>
          <CtrlLabel>Bullet Style</CtrlLabel>
          <Select
            fullWidth
            size="small"
            value={designConfig.bullet_icon}
            onChange={(e) => onDesignChange({ bullet_icon: e.target.value })}
            sx={selectSx}
          >
            <MenuItem value="• Bullet">• Bullet</MenuItem>
            <MenuItem value="– Dash">– Dash</MenuItem>
            <MenuItem value="▸ Arrow">▸ Arrow</MenuItem>
          </Select>
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <CtrlLabel>Date Format</CtrlLabel>
          <Select
            fullWidth
            size="small"
            value={designConfig.format_dates}
            onChange={(e) => onDesignChange({ format_dates: e.target.value })}
            sx={selectSx}
          >
            <MenuItem value="Long Name (January YYYY)">Long (January YYYY)</MenuItem>
            <MenuItem value="Short (Jan YYYY)">Short (Jan YYYY)</MenuItem>
            <MenuItem value="Numeric (01/YYYY)">Numeric (01/YYYY)</MenuItem>
          </Select>
        </Box>

        <ToggleRow
          label="Full Name Uppercase"
          checked={!!designConfig.name_capitalize}
          onChange={(e) => onDesignChange({ name_capitalize: e.target.checked })}
        />

      </PanelSection>

      {/* ── SECTIONS: visibility chips + drag reorder ─────────────────────── */}
      <PanelSection label="Sections" defaultExpanded>

        <CtrlLabel sx={{ mb: 1 }}>Toggle visibility</CtrlLabel>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.25 }}>
          {ALL_SECTIONS.map((section) => {
            const on = isSectionVisible(section);
            return (
              <Chip
                key={section}
                label={section.charAt(0).toUpperCase() + section.slice(1)}
                onClick={() => toggleSection(section)}
                size="small"
                sx={{
                  height: 26,
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-family)',
                  fontWeight: on ? 600 : 400,
                  cursor: 'pointer',
                  bgcolor: on ? T.primarySoft : T.pageBg,
                  color: on ? T.primary : T.textSecondary,
                  border: '1px solid',
                  borderColor: on ? 'rgba(51, 94, 222, 0.35)' : T.mutedBorder,
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: on ? 'rgba(51, 94, 222, 0.16)' : 'rgba(148, 163, 184, 0.2)',
                  },
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            );
          })}
        </Box>

        <Divider sx={{ mb: 1.5, borderColor: T.border }} />

        <Typography
          sx={{
            fontSize: '0.68rem',
            color: T.textSecondary,
            fontFamily: 'var(--font-family)',
            mb: 0.75,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Drag to reorder
        </Typography>
        <SectionReorder
          sectionsOrder={designConfig.sections_order ?? []}
          onReorder={onSectionsOrderChange}
        />

      </PanelSection>
      </Box>

    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Style helpers
// ─────────────────────────────────────────────────────────────────────────────

function TopLabel({ children }) {
  return (
    <Typography
      sx={{
        fontSize: '0.7rem',
        fontWeight: 700,
        color: T.textPrimary,
        fontFamily: 'var(--font-family)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        mb: 1.25,
      }}
    >
      {children}
    </Typography>
  );
}

const selectSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 1, minHeight: 36, bgcolor: T.surface },
  '& fieldset': { borderColor: T.mutedBorder },
  '& .MuiOutlinedInput-root:hover fieldset': { borderColor: 'rgba(51, 94, 222, 0.35)' },
  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: T.primary, borderWidth: 1 },
  '& .MuiSelect-select': { py: '7px', fontSize: '0.8125rem', fontFamily: 'var(--font-family)' },
};

/** Segmented controls — same visual model for 2-option and 5-option rows (matches AI Resume Studio). */
const tgSx = {
  bgcolor: T.previewCanvas,
  borderRadius: 1,
  p: '4px',
  gap: '3px',
  border: 'none',
  width: '100%',
  '& .MuiToggleButtonGroup-grouped': {
    border: 'none !important',
    borderRadius: '6px !important',
    mx: 0,
    minHeight: 32,
    '&.Mui-selected': {
      bgcolor: `${T.surface} !important`,
      color: `${T.primary} !important`,
      fontWeight: 700,
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.1)',
    },
    '&:not(.Mui-selected)': {
      color: T.textSecondary,
      bgcolor: 'transparent',
    },
    '&:hover:not(.Mui-selected)': {
      bgcolor: 'rgba(255, 255, 255, 0.7) !important',
    },
  },
};

const tgBtnSx = {
  fontFamily: 'var(--font-family)',
  fontSize: '0.75rem',
  textTransform: 'none',
  py: '6px',
  flex: 1,
  minWidth: 0,
  lineHeight: 1.2,
};

const sliderSx = {
  color: T.primary,
  height: 4,
  mt: 0.5,
  '& .MuiSlider-thumb': {
    width: 14,
    height: 14,
    bgcolor: T.surface,
    border: `2px solid ${T.primary}`,
    boxShadow: '0 1px 4px rgba(51, 94, 222, 0.25)',
    '&:hover': { boxShadow: '0 0 0 7px rgba(51, 94, 222, 0.1)' },
    '&.Mui-focusVisible': { boxShadow: '0 0 0 7px rgba(51, 94, 222, 0.15)' },
  },
  '& .MuiSlider-track': { border: 'none', height: 4 },
  '& .MuiSlider-rail': { bgcolor: T.mutedBorder, opacity: 1, height: 4 },
};
