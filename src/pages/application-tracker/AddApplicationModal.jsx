import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, Box, Typography,
  Select, MenuItem, Button, IconButton, Alert, InputBase,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { createApplicationAPI, updateApplicationAPI } from '../../services/applicationsService';

const initialForm = {
  company: '',
  role: '',
  location: '',
  job_url: '',
  current_status: 'applied',
};

const STATUS_OPTIONS = [
  { id: 'applied',             label: 'Applied',             color: '#3B82F6' },
  { id: 'acknowledged',        label: 'Acknowledged',        color: '#3B82F6' },
  { id: 'in_review',           label: 'In Review',           color: '#F59E0B' },
  { id: 'interview_scheduled', label: 'Interview Scheduled', color: '#8B5CF6' },
  { id: 'offer_received',      label: 'Offer Received',      color: '#10B981' },
  { id: 'rejected',            label: 'Rejected',            color: '#EF4444' },
];

function FieldLabel({ children }) {
  return (
    <Typography
      variant="caption"
      fontWeight={700}
      color="var(--text-secondary)"
      sx={{ fontSize: 12, mb: 0.75, display: 'block', letterSpacing: '0.02em' }}
    >
      {children}
    </Typography>
  );
}

function InputField({ icon: Icon, placeholder, value, onChange, mono }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.75,
        py: 1.25,
        borderRadius: 2,
        border: '1.5px solid var(--border-color)',
        bgcolor: 'var(--grey-5)',
        transition: 'border-color 0.18s',
        '&:focus-within': {
          borderColor: 'var(--primary)',
          boxShadow: '0 0 0 3px rgba(59,130,246,0.1)',
        },
        '&:hover': { borderColor: 'var(--text-muted)' },
      }}
    >
      {Icon && <Icon sx={{ fontSize: 16, color: 'var(--text-muted)', flexShrink: 0 }} />}
      <InputBase
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        fullWidth
        sx={{
          fontSize: mono ? 12 : 14,
          fontWeight: 500,
          fontFamily: mono ? 'monospace' : 'inherit',
          color: 'var(--text-primary)',
          '& input::placeholder': { color: 'var(--text-muted)', opacity: 1 },
        }}
      />
    </Box>
  );
}

export default function AddApplicationModal({ open, onClose, onSuccess, editJob }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(editJob);

  useEffect(() => {
    if (open) {
      setError('');
      setForm(editJob ? {
        company: editJob.company || '',
        role: editJob.role || '',
        location: editJob.location || '',
        job_url: editJob.job_url || '',
        current_status: editJob.current_status || 'applied',
      } : initialForm);
    }
  }, [open, editJob]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.company?.trim() || !form.role?.trim()) {
      setError('Company and Role are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateApplicationAPI(editJob.id, form);
      } else {
        await createApplicationAPI(form);
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStatus = STATUS_OPTIONS.find((s) => s.id === form.current_status);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            bgcolor: 'var(--bg-paper)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography fontWeight={800} color="var(--text-primary)" sx={{ fontSize: 20, letterSpacing: '-0.3px' }}>
              {isEdit ? 'Edit Application' : 'Add Application'}
            </Typography>
            <Typography variant="body2" color="var(--text-muted)" fontWeight={500} sx={{ mt: 0.25, fontSize: 13 }}>
              {isEdit ? 'Update the application details below' : 'Manually track a job you applied to'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'var(--text-muted)',
              bgcolor: 'var(--grey-5)',
              border: '1px solid var(--border-color)',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444', borderColor: '#EF4444' },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Form fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* Company */}
          <Box>
            <FieldLabel>Company Name</FieldLabel>
            <InputField
              icon={BusinessRoundedIcon}
              placeholder="e.g. OpenAI"
              value={form.company}
              onChange={set('company')}
            />
          </Box>

          {/* Role */}
          <Box>
            <FieldLabel>Position Title</FieldLabel>
            <InputField
              icon={WorkRoundedIcon}
              placeholder="e.g. Senior Software Engineer"
              value={form.role}
              onChange={set('role')}
            />
          </Box>

          {/* Status + Location */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <FieldLabel>Status</FieldLabel>
              <Select
                value={form.current_status}
                onChange={set('current_status')}
                size="small"
                fullWidth
                renderValue={() => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: selectedStatus?.color, flexShrink: 0 }} />
                    <Typography fontSize={14} fontWeight={600} color="var(--text-primary)">
                      {selectedStatus?.label}
                    </Typography>
                  </Box>
                )}
                sx={{
                  borderRadius: 2,
                  bgcolor: 'var(--grey-5)',
                  '& fieldset': { borderColor: 'var(--border-color)', borderWidth: '1.5px' },
                  '&:hover fieldset': { borderColor: 'var(--text-muted)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '2px', boxShadow: '0 0 0 3px rgba(59,130,246,0.1)' },
                  '& .MuiSvgIcon-root': { color: 'var(--text-muted)' },
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: opt.color, flexShrink: 0 }} />
                      <Typography fontSize={13} fontWeight={600}>{opt.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box>
              <FieldLabel>Location</FieldLabel>
              <InputField
                icon={LocationOnOutlinedIcon}
                placeholder="e.g. Remote"
                value={form.location}
                onChange={set('location')}
              />
            </Box>
          </Box>

          {/* Job URL */}
          <Box>
            <FieldLabel>Job URL</FieldLabel>
            <InputField
              icon={LinkRoundedIcon}
              placeholder="https://company.com/jobs/123"
              value={form.job_url}
              onChange={set('job_url')}
              mono
            />
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2, fontSize: 13,
                bgcolor: 'rgba(239,68,68,0.08)',
                color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.2)',
                '& .MuiAlert-icon': { color: '#EF4444' },
              }}
            >
              {error}
            </Alert>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            fullWidth
            sx={{
              height: 42, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 14,
              borderColor: 'var(--border-color)', color: 'var(--text-secondary)',
              '&:hover': { borderColor: 'var(--primary)', color: 'var(--primary)', bgcolor: 'rgba(59,130,246,0.06)' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            variant="contained"
            fullWidth
            startIcon={submitting
              ? <Box sx={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <SendRoundedIcon sx={{ fontSize: 16 }} />
            }
            sx={{
              height: 42, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 14,
              background: 'linear-gradient(135deg, var(--primary), #8B5CF6)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              '&:disabled': { opacity: 0.6 },
            }}
          >
            {isEdit ? 'Save Changes' : 'Add Application'}
          </Button>
        </Box>
      </DialogContent>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Dialog>
  );
}
