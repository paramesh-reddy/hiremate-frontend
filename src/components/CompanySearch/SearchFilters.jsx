import { Autocomplete, Box, Chip, TextField } from '@mui/material';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    fontFamily: 'var(--font-family)',
    fontSize: '0.9rem',
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'var(--font-family)',
    fontSize: '0.9rem',
  },
};

export default function SearchFilters({ filters, onChange }) {
  const { role = '', location = '', skills = [] } = filters;

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
      <TextField
        label="Role / Job Title"
        value={role}
        onChange={(e) => onChange({ ...filters, role: e.target.value })}
        size="small"
        sx={{ flex: 1, ...inputSx }}
        placeholder="e.g. Software Engineer"
      />
      <TextField
        label="Location"
        value={location}
        onChange={(e) => onChange({ ...filters, location: e.target.value })}
        size="small"
        sx={{ flex: 1, ...inputSx }}
        placeholder="e.g. San Francisco, CA"
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
                bgcolor: 'rgba(79,70,229,0.08)',
                color: 'var(--text-primary)',
              }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Skills"
            size="small"
            placeholder={skills.length === 0 ? 'Type a skill and press Enter' : ''}
            sx={{ flex: 1, minWidth: 200, ...inputSx }}
          />
        )}
        sx={{ flex: 1 }}
      />
    </Box>
  );
}
