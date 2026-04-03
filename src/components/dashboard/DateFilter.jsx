import { useState } from 'react';
import { Box, Button, ButtonGroup, TextField, Collapse } from '@mui/material';

const PRESETS = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
];

export default function DateFilter({ value, onChange, isInline = false }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const handlePreset = (days) => {
    setShowCustom(false);
    onChange({ preset: days, from: null, to: null });
  };

  const handleCustomApply = () => {
    if (customFrom && customTo && customFrom <= customTo) {
      onChange({ preset: null, from: customFrom, to: customTo });
      setShowCustom(false);
    }
  };

  const isPresetActive = (days) => value?.preset === days && !value?.from;
  const isCustomActive = !!value?.from;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <ButtonGroup
        size="small"
        variant="outlined"
        sx={{
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          bgcolor: 'var(--bg-paper)',
          '& .MuiButton-root': {
            border: 'none',
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 700,
            px: 2,
            height: 36,
            color: 'var(--text-secondary)',
            transition: 'all 0.2s ease',
            '&:not(:last-of-type)': { borderRight: '1px solid var(--border-color)' },
            '&:active': { transform: 'scale(0.98)' },
          },
        }}
      >
        {PRESETS.map((p) => (
          <Button
            key={p.days}
            onClick={() => handlePreset(p.days)}
            sx={{
              color: isPresetActive(p.days) ? '#fff !important' : 'var(--text-secondary)',
              bgcolor: isPresetActive(p.days) ? 'var(--primary)' : 'transparent',
              '&:hover': {
                bgcolor: isPresetActive(p.days) ? 'var(--primary-dark)' : 'var(--light-blue-bg-08)',
                color: isPresetActive(p.days) ? '#fff !important' : 'var(--primary)',
              },
            }}
          >
            {p.label}
          </Button>
        ))}
        <Button
          onClick={() => setShowCustom((v) => !v)}
          sx={{
            color: isCustomActive ? '#fff !important' : showCustom ? 'var(--primary)' : 'var(--text-secondary)',
            bgcolor: isCustomActive ? 'var(--primary)' : 'transparent',
            '&:hover': {
              bgcolor: isCustomActive ? 'var(--primary-dark)' : 'var(--light-blue-bg-08)',
              color: isCustomActive ? '#fff !important' : 'var(--primary)',
            },
          }}
        >
          {isCustomActive ? `${value.from} → ${value.to}` : 'Custom'}
        </Button>
      </ButtonGroup>

      {/* Custom date panel — absolute dropdown, doesn't affect row height */}
      <Collapse in={showCustom} timeout={200}>
        <Box
          sx={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 10,
            display: 'flex',
            flexWrap: isInline ? 'wrap' : 'nowrap',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            borderRadius: '12px',
            bgcolor: 'var(--bg-paper)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            whiteSpace: 'nowrap',
          }}
        >
          <TextField
            type="date"
            size="small"
            label="From"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
          <TextField
            type="date"
            size="small"
            label="To"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={handleCustomApply}
            sx={{
              textTransform: 'none', borderRadius: '8px',
              px: 2, height: 36, fontWeight: 700, boxShadow: 'none',
            }}
          >
            Apply
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}
