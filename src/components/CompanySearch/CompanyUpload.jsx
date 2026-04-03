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

export default function CompanyUpload({ onCompaniesReady }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState([]);

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
      setCompanies(data.companies);
      onCompaniesReady(data.companies);
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
    const updated = companies.filter((_, i) => i !== idx);
    setCompanies(updated);
    onCompaniesReady(updated);
  };

  return (
    <Box>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${dragging ? '#4f46e5' : 'var(--border-color)'}`,
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background 0.2s',
          bgcolor: dragging ? 'rgba(79,70,229,0.04)' : 'transparent',
          '&:hover': {
            borderColor: '#4f46e5',
            bgcolor: 'rgba(79,70,229,0.03)',
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
        <UploadFileRoundedIcon sx={{ fontSize: 40, color: '#4f46e5', mb: 1 }} />
        <Typography
          sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, color: 'var(--text-primary)', mb: 0.5 }}
        >
          Drop your company list here
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>
          PDF or DOCX — we'll extract all company names automatically
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2, fontFamily: 'var(--font-family)' }}>
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
          <Typography
            sx={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-family)', mb: 1 }}
          >
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
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.8125rem',
                  bgcolor: 'rgba(79,70,229,0.08)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(79,70,229,0.2)',
                  '& .MuiChip-deleteIcon': { color: '#94a3b8', '&:hover': { color: '#64748b' } },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
