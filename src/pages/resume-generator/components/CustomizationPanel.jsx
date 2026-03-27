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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SectionReorder from './SectionReorder';

// ─────────────────────────────────────────────────────────────────────────────
// Template Tile
// ─────────────────────────────────────────────────────────────────────────────

function TemplateTile({ template, selected, onSelect }) {
  const [imgErr, setImgErr] = useState(false);
  const img = `/resume-templates/${template.id}.svg`;
  const paletteColor = template.color_schemes?.[0]?.primary ?? '#374151';

  return (
    <Card
      onClick={onSelect}
      elevation={0}
      sx={{
        overflow: 'hidden',
        cursor: 'pointer',
        border: '2px solid',
        borderColor: selected ? '#335EDE' : '#E5E7EB',
        borderRadius: '10px',
        bgcolor: 'white',
        boxShadow: selected ? '0 0 0 3px rgba(51,94,222,0.14)' : 'none',
        transition: 'all 0.18s ease',
        '&:hover': {
          borderColor: selected ? '#335EDE' : '#C7D2FE',
          transform: 'translateY(-2px)',
          boxShadow: selected
            ? '0 0 0 3px rgba(51,94,222,0.2)'
            : '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Box sx={{ aspectRatio: '120/160', display: 'flex', flexDirection: 'column' }}>
        {!imgErr ? (
          <Box
            component="img"
            src={img}
            alt={template.name}
            loading="eager"
            onError={() => setImgErr(true)}
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              flex: 1,
              bgcolor: '#F9FAFB',
              display: 'block',
            }}
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F9FAFB',
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
                  bgcolor: '#D1D5DB',
                  borderRadius: 0.5,
                  mt: i === 2 ? 0.75 : 0,
                }}
              />
            ))}
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.25,
            py: 0.75,
            bgcolor: selected ? 'rgba(51,94,222,0.06)' : 'white',
            borderTop: '1px solid #F3F4F6',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: selected ? 700 : 500,
                color: selected ? '#335EDE' : '#374151',
                fontFamily: 'var(--font-family)',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}
            >
              {template.name}{template.premium ? ' ✦' : ''}
            </Typography>
            {template.ats_score >= 90 && (
              <Typography
                sx={{
                  fontSize: '0.58rem',
                  color: '#059669',
                  fontWeight: 700,
                  fontFamily: 'var(--font-family)',
                  letterSpacing: '0.02em',
                }}
              >
                ATS {template.ats_score}
              </Typography>
            )}
          </Box>
          {selected && (
            <CheckCircleRoundedIcon sx={{ color: '#335EDE', fontSize: 14, flexShrink: 0 }} />
          )}
        </Box>
      </Box>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Collapsible panel section (accordion)
// ─────────────────────────────────────────────────────────────────────────────

function PanelSection({ label, accentColor = '#335EDE', defaultExpanded = false, children }) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        '&:before': { display: 'none' },
        borderBottom: '1px solid #F0F0F0',
        '&.Mui-expanded': { margin: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />}
        sx={{
          px: 2,
          minHeight: 42,
          '& .MuiAccordionSummary-content': { my: 0, alignItems: 'center', gap: 1 },
          '&:hover': { bgcolor: '#F9FAFB' },
          '&.Mui-expanded': { bgcolor: '#F9FAFB' },
        }}
      >
        <Box
          sx={{
            width: 3,
            height: 13,
            bgcolor: accentColor,
            borderRadius: '2px',
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#1F2937',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-family)',
          }}
        >
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 1, pb: 2.5, bgcolor: 'white' }}>
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
          fontSize: '0.72rem',
          color: '#374151',
          fontFamily: 'var(--font-family)',
          fontWeight: 500,
        }}
      >
        {children}
      </Typography>
      {value !== undefined && (
        <Typography
          sx={{
            fontSize: '0.68rem',
            color: '#335EDE',
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
        bgcolor: '#F9FAFB',
        borderRadius: '8px',
        border: '1px solid #F0F0F0',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: '#374151',
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

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100%' }}>

      {/* ── TEMPLATE ──────────────────────────────────────────────────────── */}
      <Box sx={{ px: 2, pt: 2, pb: 2, bgcolor: 'white', borderBottom: '1px solid #F0F0F0' }}>
        <TopLabel>Template</TopLabel>
        {templates.length > 0 ? (
          <Grid container spacing={1.25}>
            {templates.map((t) => (
              <Grid item xs={4} key={t.id}>
                <TemplateTile
                  template={t}
                  selected={designConfig.template_id === t.id}
                  onSelect={() => onDesignChange({ template_id: t.id })}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'var(--font-family)' }}>
            Loading templates…
          </Typography>
        )}
      </Box>

      {/* ── APPEARANCE: color scheme + typography ─────────────────────────── */}
      <PanelSection label="Appearance" accentColor="#8B5CF6" defaultExpanded>

        {colorSchemes.length > 1 && (
          <Box sx={{ mb: 2 }}>
            <CtrlLabel>Color Scheme</CtrlLabel>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 0.25 }}>
              {colorSchemes.map((cs) => {
                const isActive = designConfig.color_scheme_id
                  ? designConfig.color_scheme_id === cs.id
                  : cs.id === colorSchemes[0].id;
                return (
                  <Tooltip key={cs.id} title={cs.label} placement="top" arrow>
                    <Box
                      onClick={() => onDesignChange({ color_scheme_id: cs.id })}
                      sx={{
                        width: 26,
                        height: 26,
                        bgcolor: cs.primary,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: isActive
                          ? `0 0 0 2px white, 0 0 0 4px #335EDE`
                          : '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(51,94,222,0.5)',
                        },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
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
      <PanelSection label="Layout" accentColor="#0EA5E9" defaultExpanded>

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
                    <Typography sx={{ fontSize: '0.68rem', color: '#6B7280', fontFamily: 'var(--font-family)' }}>
                      {lbl}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: '#335EDE', fontFamily: 'var(--font-family)', fontWeight: 600 }}>
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
      <PanelSection label="Spacing" accentColor="#10B981">

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
      <PanelSection label="Content" accentColor="#F59E0B">

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
      <PanelSection label="Sections" accentColor="#EF4444" defaultExpanded>

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
                  bgcolor: on ? 'rgba(51,94,222,0.1)' : '#F3F4F6',
                  color: on ? '#335EDE' : '#9CA3AF',
                  border: '1px solid',
                  borderColor: on ? 'rgba(51,94,222,0.35)' : '#E5E7EB',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: on ? 'rgba(51,94,222,0.18)' : '#E9EAEC',
                  },
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            );
          })}
        </Box>

        <Divider sx={{ mb: 1.5, borderColor: '#F0F0F0' }} />

        <Typography
          sx={{
            fontSize: '0.68rem',
            color: '#9CA3AF',
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
        color: '#1F2937',
        fontFamily: 'var(--font-family)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        mb: 1.25,
      }}
    >
      {children}
    </Typography>
  );
}

const selectSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '8px', minHeight: 34, bgcolor: 'white' },
  '& fieldset': { borderColor: '#E5E7EB' },
  '& .MuiOutlinedInput-root:hover fieldset': { borderColor: '#C7D2FE' },
  '& .MuiSelect-select': { py: '6px', fontSize: '0.8125rem', fontFamily: 'var(--font-family)' },
};

// Segmented-control style: pill container, white active card
const tgSx = {
  bgcolor: '#F3F4F6',
  borderRadius: '8px',
  p: '3px',
  gap: '2px',
  border: 'none',
  width: '100%',
  '& .MuiToggleButtonGroup-grouped': {
    border: 'none !important',
    borderRadius: '6px !important',
    mx: 0,
    '&.Mui-selected': {
      bgcolor: 'white !important',
      color: '#335EDE',
      fontWeight: 700,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    '&:not(.Mui-selected)': {
      color: '#6B7280',
      bgcolor: 'transparent',
    },
    '&:hover:not(.Mui-selected)': {
      bgcolor: 'rgba(255,255,255,0.55) !important',
    },
  },
};

const tgBtnSx = {
  fontFamily: 'var(--font-family)',
  fontSize: '0.72rem',
  textTransform: 'none',
  py: '4px',
  flex: 1,
  minWidth: 0,
};

const sliderSx = {
  color: '#335EDE',
  height: 4,
  mt: 0.5,
  '& .MuiSlider-thumb': {
    width: 14,
    height: 14,
    bgcolor: 'white',
    border: '2px solid #335EDE',
    boxShadow: '0 1px 4px rgba(51,94,222,0.3)',
    '&:hover': { boxShadow: '0 0 0 7px rgba(51,94,222,0.1)' },
    '&.Mui-focusVisible': { boxShadow: '0 0 0 7px rgba(51,94,222,0.15)' },
  },
  '& .MuiSlider-track': { border: 'none', height: 4 },
  '& .MuiSlider-rail': { bgcolor: '#E5E7EB', opacity: 1, height: 4 },
};
