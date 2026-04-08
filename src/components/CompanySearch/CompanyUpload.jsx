import { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { parseFile } from '../../services/companySearchService';
import { RESUME_STUDIO_THEME as THEME } from '../../utilities/resumeStudioTheme';

export default function CompanyUpload({ companies = [], onCompaniesChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      setError('Only PDF and DOCX files are supported.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await parseFile(file);
      onCompaniesChange(data.companies);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to parse file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const removeCompany = (idx) => {
    onCompaniesChange(companies.filter((_, i) => i !== idx));
  };

  return (
    <Box>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${dragging ? THEME.primary : THEME.border}`,
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background 0.2s',
          bgcolor: dragging ? THEME.primarySoft : 'transparent',
          '&:hover': {
            borderColor: THEME.primary,
            bgcolor: THEME.primarySoft,
          },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <UploadFileRoundedIcon sx={{ fontSize: 40, color: THEME.primary, mb: 1 }} />
        <Typography sx={{ fontWeight: 600, color: THEME.textPrimary, mb: 0.5 }}>
          Drop your company list here
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary }}>
          PDF or DOCX — we'll extract all company names automatically
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width={100} height={32} />
          ))}
        </Box>
      )}

      {!loading && companies.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary, mb: 1 }}>
            {companies.length} companies found — click × to remove any
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {companies.map((c, idx) => (
              <Chip
                key={idx}
                label={c.name}
                size="small"
                onDelete={() => removeCompany(idx)}
                deleteIcon={<CloseRoundedIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  fontSize: '0.8125rem',
                  bgcolor: THEME.primarySoft,
                  color: THEME.primary,
                  border: `1px solid rgba(51, 94, 222, 0.22)`,
                  fontWeight: 600,
                  '& .MuiChip-deleteIcon': { color: THEME.textSecondary, '&:hover': { color: THEME.textPrimary } },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
