import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SearchFilters from './SearchFilters';
import { RESUME_STUDIO_THEME as THEME, STUDIO_FILTER_TEXTFIELD_SX, STUDIO_DATE_FIELD_SX } from '../../utilities/resumeStudioTheme';

function filtersActive(f) {
  return Boolean(
    f.q?.trim()
    || f.company?.trim()
    || f.role?.trim()
    || f.location?.trim()
    || (f.skills?.length ?? 0) > 0
    || f.posted_from
    || f.posted_to
  );
}

export default function CorpusSearchFilters({ filters, onChange, onClear }) {
  const {
    q = '',
    company = '',
    role = '',
    location = '',
    skills = [],
    posted_from = '',
    posted_to = '',
  } = filters;

  const patch = (partial) => onChange({ ...filters, ...partial });
  const active = filtersActive(filters);

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${THEME.border}`,
        background: `linear-gradient(165deg, rgba(51, 94, 222, 0.06) 0%, ${THEME.previewCanvas} 42%, ${THEME.surface} 100%)`,
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: THEME.surface,
              border: `1px solid ${THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <FilterListRoundedIcon sx={{ fontSize: 20, color: THEME.primary }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: THEME.textPrimary, lineHeight: 1.25 }}>
              Filters
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: THEME.textSecondary, lineHeight: 1.35, maxWidth: 520 }}>
              Refine by keywords, company, role, location, skills, and posted dates
            </Typography>
          </Box>
        </Box>
        {onClear && (
          <Button
            size="small"
            onClick={onClear}
            disabled={!active}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              height: 32,
              color: active ? THEME.primary : THEME.textSecondary,
              '&:hover': { bgcolor: THEME.primarySoft },
            }}
          >
            Clear all
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.25,
          mb: 1.25,
        }}
      >
        <TextField
          id="jr-corpus-search"
          size="small"
          hiddenLabel
          placeholder="Search title, company, or description…"
          value={q}
          onChange={(e) => patch({ q: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: THEME.textSecondary }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 0, ...STUDIO_FILTER_TEXTFIELD_SX }}
        />
        <TextField
          id="jr-corpus-company"
          size="small"
          hiddenLabel
          placeholder="Company"
          value={company}
          onChange={(e) => patch({ company: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessCenterRoundedIcon sx={{ fontSize: 18, color: THEME.textSecondary }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 0, ...STUDIO_FILTER_TEXTFIELD_SX }}
        />
      </Box>

      <Box sx={{ mb: 1.25 }}>
        <SearchFilters filters={{ role, location, skills }} onChange={(sub) => patch(sub)} />
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ alignItems: { sm: 'flex-end' } }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}>
          <Typography
            component="label"
            htmlFor="jr-posted-from"
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: THEME.textSecondary,
              display: 'block',
              mb: 0.5,
              lineHeight: 1.2,
            }}
          >
            Posted from
          </Typography>
          <TextField
            id="jr-posted-from"
            type="date"
            value={posted_from}
            onChange={(e) => patch({ posted_from: e.target.value })}
            size="small"
            fullWidth
            hiddenLabel
            sx={STUDIO_DATE_FIELD_SX}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}>
          <Typography
            component="label"
            htmlFor="jr-posted-to"
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: THEME.textSecondary,
              display: 'block',
              mb: 0.5,
              lineHeight: 1.2,
            }}
          >
            Posted until
          </Typography>
          <TextField
            id="jr-posted-to"
            type="date"
            value={posted_to}
            onChange={(e) => patch({ posted_to: e.target.value })}
            size="small"
            fullWidth
            hiddenLabel
            sx={STUDIO_DATE_FIELD_SX}
          />
        </Box>
      </Stack>
    </Box>
  );
}

export { filtersActive };
