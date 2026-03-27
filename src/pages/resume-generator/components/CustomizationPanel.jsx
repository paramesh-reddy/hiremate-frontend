/**
 * CustomizationPanel — Design tab content for the resume editor.
 *
 * Receives:
 *   designConfig   — unified design state object
 *   onDesignChange — (changes: object) => void  (partial update, merged by parent)
 *   templates      — template list from backend GET /resume/templates
 *   resumeId       — current resume ID (for section-order persistence)
 *   onSectionsOrderChange — (newOrder: string[]) => void
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
  FormControlLabel,
  Switch,
  Slider,
  Tooltip,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SectionReorder from './SectionReorder';

// ── Template thumbnail ────────────────────────────────────────────────────────

function TemplateTile({ template, selected, onSelect }) {
  const [imgErr, setImgErr] = useState(false);
  const img = `/resume-templates/${template.id}.svg`;
  const paletteColor = template.color_schemes?.[0]?.primary ?? '#374151';

  return (
    <Card
      onClick={onSelect}
      sx={{
        overflow: 'hidden',
        cursor: 'pointer',
        border: 2,
        borderColor: selected ? 'var(--primary)' : 'var(--border-color)',
        bgcolor: selected ? 'rgba(51,94,222,0.04)' : 'white',
        boxShadow: selected ? '0 2px 12px rgba(51,94,222,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        '&:hover': {
          borderColor: selected ? 'var(--primary)' : 'rgba(51,94,222,0.4)',
          transform: 'translateY(-2px)',
          boxShadow: selected ? '0 2px 12px rgba(51,94,222,0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Box sx={{ aspectRatio: '120/160', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {!imgErr ? (
          <Box
            component="img"
            src={img}
            alt={template.name}
            loading="eager"
            onError={() => setImgErr(true)}
            sx={{ width: '100%', height: 'auto', objectFit: 'contain', flex: 1, p: 0.75, bgcolor: '#fafafa', display: 'block' }}
          />
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa', gap: 0.5, p: 1 }}>
            <Box sx={{ width: '80%', height: 6, bgcolor: paletteColor, borderRadius: 0.5, mb: 0.5 }} />
            {[1, 0.7, 0.7, 0.5, 0.5, 0.5].map((w, i) => (
              <Box key={i} sx={{ width: `${w * 80}%`, height: 3, bgcolor: '#d1d5db', borderRadius: 0.5, mt: i === 2 ? 0.75 : 0 }} />
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
            borderTop: '1px solid var(--border-color)',
            bgcolor: selected ? 'rgba(51,94,222,0.08)' : 'transparent',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontFamily: 'var(--font-family)', fontWeight: selected ? 600 : 500, color: selected ? 'var(--primary)' : 'var(--text-secondary)', display: 'block', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {template.name}{template.premium ? ' ✦' : ''}
            </Typography>
            {template.ats_score >= 90 && (
              <Typography sx={{ fontSize: '0.6rem', color: '#059669', fontWeight: 600, fontFamily: 'var(--font-family)' }}>
                ATS {template.ats_score}
              </Typography>
            )}
          </Box>
          {selected && <CheckCircleRoundedIcon sx={{ color: 'var(--primary)', fontSize: 16, flexShrink: 0 }} />}
        </Box>
      </Box>
    </Card>
  );
}

// ── Color scheme dots ─────────────────────────────────────────────────────────

function ColorDot({ color }) {
  return <Box sx={{ width: 14, height: 14, bgcolor: color, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }} />;
}

// ── Section label helper ──────────────────────────────────────────────────────

const ALL_SECTIONS = ['summary', 'experience', 'skills', 'education', 'projects', 'certifications'];

// ── CustomizationPanel ────────────────────────────────────────────────────────

export default function CustomizationPanel({
  designConfig,
  onDesignChange,
  templates = [],
  onSectionsOrderChange,
}) {
  const currentTemplate = templates.find((t) => t.id === designConfig.template_id) ?? null;
  const colorSchemes = currentTemplate?.color_schemes ?? [];
  const fontOptions = currentTemplate?.fonts ?? ['Times New Roman', 'Arial', 'Georgia', 'Calibri', 'Helvetica', 'Verdana', 'Lato', 'Segoe UI', 'Garamond'];

  // Sections visible — default to all visible when empty list
  const sectionsVisible = designConfig.sections_visible ?? [];
  const isSectionVisible = (s) => sectionsVisible.length === 0 || sectionsVisible.includes(s);
  const toggleSection = (section) => {
    const visible = sectionsVisible.length === 0 ? [...ALL_SECTIONS] : [...sectionsVisible];
    const updated = visible.includes(section)
      ? visible.filter((s) => s !== section)
      : [...visible, section];
    onDesignChange({ sections_visible: updated });
  };

  const handleSectionsReorder = (newOrder) => {
    onSectionsOrderChange(newOrder);
  };

  return (
    <Box sx={{ p: 2, '& .cp-section': { mb: 2.5 } }}>

      {/* ── Templates ──────────────────────────────────────────────────── */}
      <Box className="cp-section">
        <SectionLabel>Template</SectionLabel>
        {templates.length > 0 ? (
          <Grid container spacing={1.5}>
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
          <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>
            Loading templates…
          </Typography>
        )}
      </Box>

      {/* ── Color Scheme ───────────────────────────────────────────────── */}
      {colorSchemes.length > 1 && (
        <Box className="cp-section">
          <SectionLabel>Color Scheme</SectionLabel>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {colorSchemes.map((cs) => {
              const isActive = designConfig.color_scheme_id === cs.id;
              return (
                <Tooltip key={cs.id} title={cs.label} arrow placement="top">
                  <Box
                    onClick={() => onDesignChange({ color_scheme_id: cs.id })}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      border: '1.5px solid',
                      borderColor: isActive ? 'var(--primary)' : '#E5E7EB',
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      bgcolor: isActive ? 'rgba(51,94,222,0.06)' : 'white',
                      '&:hover': { borderColor: 'rgba(51,94,222,0.4)' },
                    }}
                  >
                    <ColorDot color={cs.primary} />
                    {cs.accent !== cs.primary && <ColorDot color={cs.accent} />}
                    <Typography variant="caption" sx={{ fontFamily: 'var(--font-family)', fontSize: '0.7rem', color: isActive ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: isActive ? 600 : 400 }}>
                      {cs.label}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Typography ─────────────────────────────────────────────────── */}
      <Box className="cp-section">
        <SectionLabel>Typography</SectionLabel>
        <Box sx={{ mb: 1.5 }}>
          <FieldLabel>Font Family</FieldLabel>
          <Select
            fullWidth
            size="small"
            value={fontOptions.includes(designConfig.font_family) ? designConfig.font_family : fontOptions[0]}
            onChange={(e) => onDesignChange({ font_family: e.target.value })}
            sx={selectSx}
          >
            {fontOptions.map((f) => (
              <MenuItem key={f} value={f} sx={{ fontFamily: f, fontSize: '0.875rem' }}>{f}</MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <FieldLabel>Font Size</FieldLabel>
          <ToggleButtonGroup
            value={designConfig.font_size}
            exclusive
            onChange={(_, v) => v && onDesignChange({ font_size: v })}
            size="small"
            fullWidth
            sx={tgSx}
          >
            {['9pt', '10pt', '10.5pt', '11pt', '12pt'].map((s) => (
              <ToggleButton key={s} value={s} sx={tgBtnSx}>{s}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box>
          <FieldLabel>Line Height: {designConfig.line_height}</FieldLabel>
          <ToggleButtonGroup
            value={designConfig.line_height}
            exclusive
            onChange={(_, v) => v && onDesignChange({ line_height: v })}
            size="small"
            fullWidth
            sx={tgSx}
          >
            {['1.0', '1.1', '1.2', '1.3', '1.5'].map((v) => (
              <ToggleButton key={v} value={v} sx={tgBtnSx}>{v}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ── Layout & Spacing ───────────────────────────────────────────── */}
      <Box className="cp-section">
        <SectionLabel>Layout & Spacing</SectionLabel>
        <Box sx={{ mb: 1.5 }}>
          <FieldLabel>Header Alignment</FieldLabel>
          <ToggleButtonGroup
            value={designConfig.header_align}
            exclusive
            onChange={(_, v) => v && onDesignChange({ header_align: v })}
            size="small"
            fullWidth
            sx={tgSx}
          >
            <ToggleButton value="Center" sx={tgBtnSx}>Center</ToggleButton>
            <ToggleButton value="Left" sx={tgBtnSx}>Left</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <FieldLabel>Margin Size</FieldLabel>
          <ToggleButtonGroup
            value={designConfig.margin_size}
            exclusive
            onChange={(_, v) => v && onDesignChange({ margin_size: v })}
            size="small"
            fullWidth
            sx={tgSx}
          >
            <ToggleButton value="Small" sx={tgBtnSx}>Small</ToggleButton>
            <ToggleButton value="Medium" sx={tgBtnSx}>Medium</ToggleButton>
            <ToggleButton value="Large" sx={tgBtnSx}>Large</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <FieldLabel>Section Spacing</FieldLabel>
          <ToggleButtonGroup
            value={designConfig.section_spacing}
            exclusive
            onChange={(_, v) => v && onDesignChange({ section_spacing: v })}
            size="small"
            fullWidth
            sx={tgSx}
          >
            <ToggleButton value="compact" sx={tgBtnSx}>Compact</ToggleButton>
            <ToggleButton value="normal" sx={tgBtnSx}>Normal</ToggleButton>
            <ToggleButton value="spacious" sx={tgBtnSx}>Spacious</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <FieldLabel>Page Size</FieldLabel>
          <ToggleButtonGroup
            value={designConfig.page_size}
            exclusive
            onChange={(_, v) => v && onDesignChange({ page_size: v })}
            size="small"
            fullWidth
            sx={tgSx}
          >
            <ToggleButton value="Letter" sx={tgBtnSx}>US Letter</ToggleButton>
            <ToggleButton value="A4" sx={tgBtnSx}>A4</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {designConfig.template_id === 'minimalist' && (
          <Box sx={{ mb: 1.5 }}>
            <FieldLabel>Title Width: {designConfig.title_width ?? 20}%</FieldLabel>
            <Slider
              value={designConfig.title_width ?? 20}
              min={15}
              max={40}
              step={1}
              onChange={(_, v) => onDesignChange({ title_width: v })}
              size="small"
              sx={{ color: 'var(--primary)', mt: 0.5 }}
            />
          </Box>
        )}

        <FormControlLabel
          control={<Switch checked={!!designConfig.section_separator} onChange={(e) => onDesignChange({ section_separator: e.target.checked })} color="primary" size="small" />}
          label={<Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', fontSize: '0.8125rem' }}>Section separator line</Typography>}
          sx={{ display: 'flex', ml: 0, mt: 0.5 }}
        />
      </Box>

      {/* ── Content Format ─────────────────────────────────────────────── */}
      <Box className="cp-section">
        <SectionLabel>Content Format</SectionLabel>
        <Box sx={{ mb: 1.5 }}>
          <FieldLabel>Date Format</FieldLabel>
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

        <Box sx={{ mb: 1.5 }}>
          <FieldLabel>Bullet Style</FieldLabel>
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

        <FormControlLabel
          control={<Switch checked={!!designConfig.name_capitalize} onChange={(e) => onDesignChange({ name_capitalize: e.target.checked })} color="primary" size="small" />}
          label={<Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', fontSize: '0.8125rem' }}>Full Name Uppercase</Typography>}
          sx={{ display: 'flex', ml: 0 }}
        />
      </Box>

      {/* ── Section Visibility & Order ──────────────────────────────────── */}
      <Box className="cp-section">
        <SectionLabel>Sections</SectionLabel>
        <Box sx={{ mb: 1.5 }}>
          {ALL_SECTIONS.map((section) => (
            <FormControlLabel
              key={section}
              control={<Switch checked={isSectionVisible(section)} onChange={() => toggleSection(section)} color="primary" size="small" />}
              label={<Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', fontSize: '0.8125rem', textTransform: 'capitalize' }}>{section}</Typography>}
              sx={{ display: 'flex', ml: 0, mb: 0.25 }}
            />
          ))}
        </Box>

        <FieldLabel sx={{ mb: 0.75 }}>Drag to reorder</FieldLabel>
        <SectionReorder
          sectionsOrder={designConfig.sections_order ?? []}
          onReorder={handleSectionsReorder}
        />
      </Box>

    </Box>
  );
}

// ── Local style helpers ───────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', fontFamily: 'var(--font-family)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
      {children}
    </Typography>
  );
}

function FieldLabel({ children, sx }) {
  return (
    <Typography variant="caption" sx={{ display: 'block', fontFamily: 'var(--font-family)', color: '#6B7280', mb: 0.5, fontSize: '0.75rem', ...sx }}>
      {children}
    </Typography>
  );
}

const selectSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '6px', minHeight: 34 },
  '& fieldset': { borderColor: '#D1D5DB' },
  '& .MuiSelect-select': { py: '6px', fontSize: '0.8125rem', fontFamily: 'var(--font-family)' },
};

const tgSx = {
  '& .MuiToggleButtonGroup-grouped': {
    borderColor: '#D1D5DB',
    '&.Mui-selected': { bgcolor: 'rgba(51,94,222,0.08)', color: 'var(--primary)', fontWeight: 600, borderColor: 'var(--primary)' },
  },
};

const tgBtnSx = {
  fontFamily: 'var(--font-family)',
  fontSize: '0.75rem',
  textTransform: 'none',
  py: '4px',
};
