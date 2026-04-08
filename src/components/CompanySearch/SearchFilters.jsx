import { Autocomplete, Box, Chip, InputAdornment, TextField } from '@mui/material';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import { RESUME_STUDIO_THEME as THEME, STUDIO_FILTER_TEXTFIELD_SX } from '../../utilities/resumeStudioTheme';

export default function SearchFilters({ filters, onChange }) {
  const { role = '', location = '', skills = [] } = filters;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.25,
        flexWrap: 'wrap',
        alignItems: { xs: 'stretch', sm: 'flex-start' },
      }}
    >
      <TextField
        id="jr-filter-role"
        size="small"
        hiddenLabel
        placeholder="Role / job title"
        value={role}
        onChange={(e) => onChange({ ...filters, role: e.target.value })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <WorkOutlineRoundedIcon sx={{ fontSize: 18, color: THEME.textSecondary }} />
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1, minWidth: { xs: '100%', sm: 160 }, ...STUDIO_FILTER_TEXTFIELD_SX }}
      />
      <TextField
        id="jr-filter-location"
        size="small"
        hiddenLabel
        placeholder="Location"
        value={location}
        onChange={(e) => onChange({ ...filters, location: e.target.value })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PlaceOutlinedIcon sx={{ fontSize: 18, color: THEME.textSecondary }} />
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1, minWidth: { xs: '100%', sm: 160 }, ...STUDIO_FILTER_TEXTFIELD_SX }}
      />
      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={skills}
        onChange={(_, newVal) => onChange({ ...filters, skills: newVal })}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={index}
              label={option}
              size="small"
              {...getTagProps({ index })}
              sx={{
                fontFamily: 'var(--font-family)',
                fontSize: '0.75rem',
                bgcolor: THEME.primarySoft,
                color: THEME.primary,
              }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            id="jr-filter-skills"
            size="small"
            hiddenLabel
            placeholder={skills.length === 0 ? 'Skills — type and press Enter' : ''}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <StyleRoundedIcon sx={{ fontSize: 18, color: THEME.textSecondary, ml: 0.5 }} />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 200 },
              ...STUDIO_FILTER_TEXTFIELD_SX,
              '& .MuiOutlinedInput-root': {
                ...STUDIO_FILTER_TEXTFIELD_SX['& .MuiOutlinedInput-root'],
                minHeight: 36,
                height: 'auto',
                alignItems: 'flex-start',
                py: 0.5,
              },
            }}
          />
        )}
        sx={{ flex: 1, minWidth: { xs: '100%', sm: 220 } }}
      />
    </Box>
  );
}
