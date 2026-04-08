/**
 * Shared tokens for AI Resume Studio and Resume Generator.
 * Keep aligned with product shell (primary #335ede).
 */
export const RESUME_STUDIO_THEME = {
  primary: 'var(--primary, #335ede)',
  primaryDark: 'var(--primary-dark, #2a4bc4)',
  primarySoft: 'var(--light-blue-bg, rgba(51, 94, 222, 0.08))',
  border: 'var(--divider, rgba(0,0,0,0.08))',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  pageBg: '#fafbfc',
  surface: '#ffffff',
  mutedBorder: 'rgba(15, 23, 42, 0.12)',
  previewCanvas: '#f1f5f9',
};

/**
 * MUI TextField `sx` for toolbar-style filters (matches AiResumeStudio search / selects).
 */
export const STUDIO_FILTER_TEXTFIELD_SX = {
  '& .MuiOutlinedInput-root': {
    height: 36,
    borderRadius: 1,
    bgcolor: '#fff',
    fontSize: '0.8125rem',
    pl: 0.5,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(15, 23, 42, 0.12)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(51, 94, 222, 0.35)',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: 1,
    borderColor: 'var(--primary, #335ede)',
  },
};

/** Slightly taller for type="date" inputs (browser chrome). */
export const STUDIO_DATE_FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    height: 40,
    borderRadius: 1,
    bgcolor: '#fff',
    fontSize: '0.8125rem',
    pl: 0.5,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(15, 23, 42, 0.12)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(51, 94, 222, 0.35)',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: 1,
    borderColor: 'var(--primary, #335ede)',
  },
};
