import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Typography,
} from '@mui/material';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PageContainer from '../../components/common/PageContainer';
import SectionCard from '../profile/components/SectionCard';
import CustomInput from '../../components/inputs/CustomInput';
import CustomSelect from '../../components/inputs/CustomSelect';
import { SECTION_TITLE_SX, FORM_GRID_SX } from '../profile/constants';
import { createIssueAPI, uploadIssueScreenshotAPI } from '../../services';

const CATEGORIES = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'ui_issue', label: 'UI Issue' },
  { value: 'performance', label: 'Performance' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const EMPTY_FORM = { title: '', description: '', category: 'bug', priority: 'medium' };

function buildMetadata() {
  const ua = navigator.userAgent;
  return {
    url: window.location.href,
    user_agent: ua,
    browser: (() => {
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari')) return 'Safari';
      if (ua.includes('Edge')) return 'Edge';
      return 'Unknown';
    })(),
    os: (() => {
      if (ua.includes('Win')) return 'Windows';
      if (ua.includes('Mac')) return 'macOS';
      if (ua.includes('Linux')) return 'Linux';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
      return 'Unknown';
    })(),
  };
}

export default function ReportIssuePage() {
  const user = useSelector((s) => s.auth?.user);

  const [form, setForm] = useState(EMPTY_FORM);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotError, setScreenshotError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);
  const meta = buildMetadata();

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setScreenshotError('Only image files are allowed');
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setScreenshotError('Screenshot must be under 5 MB');
      return;
    }
    setScreenshotError('');
    setScreenshot(file);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        source: 'web',
        metadata: { ...meta, priority: form.priority },
      };
      const { data: issue } = await createIssueAPI(payload);
      if (screenshot) {
        try {
          await uploadIssueScreenshotAPI(issue.id, screenshot);
        } catch {
          // non-fatal
        }
      }
      setSubmitted(true);
    } catch {
      setSubmitError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setScreenshot(null);
    setScreenshotError('');
    setErrors({});
    setSubmitError('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <PageContainer
        sx={{
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
          bgcolor: 'rgba(0,0,0,0.02)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            maxWidth: 520,
            width: '100%',
            textAlign: 'center',
            py: 8,
            px: 4,
            bgcolor: 'var(--bg-paper)',
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(16,185,129,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 40, color: '#10b981' }} />
          </Box>
          <Typography
            component="h2"
            sx={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', mb: 1.5 }}
          >
            Report Submitted!
          </Typography>
          <Typography
            sx={{ fontSize: 14, color: 'var(--text-secondary)', mb: 4, lineHeight: 1.7, px: 2 }}
          >
            Thank you for the feedback. Our team will review your report and get back to you if needed.
          </Typography>
          <Button
            variant="contained"
            onClick={handleReset}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 4,
              py: 1.25,
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              },
            }}
          >
            Submit Another Report
          </Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      sx={{
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'rgba(0,0,0,0.02)',
        minHeight: '100vh',
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <BugReportRoundedIcon sx={{ fontSize: 24, color: 'var(--primary)' }} />
            <Typography
              component="h1"
              sx={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}
            >
              Report an Issue
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            Found a bug or have a suggestion? Let us know and we'll take a look.
          </Typography>
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* Issue Details */}
        <SectionCard>
          <Typography component="h3" sx={SECTION_TITLE_SX}>
            Issue Details
          </Typography>

          <CustomInput
            label="Title"
            placeholder="A short, descriptive summary of the issue"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            error={!!errors.title}
            helperText={errors.title}
            inputProps={{ maxLength: 255 }}
          />

          <Box sx={FORM_GRID_SX}>
            <CustomSelect
              label="Category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </CustomSelect>

            <CustomSelect
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              renderValue={(val) => {
                const p = PRIORITIES.find((x) => x.value === val);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p?.color, flexShrink: 0 }}
                    />
                    {p?.label}
                  </Box>
                );
              }}
            >
              {PRIORITIES.map(({ value, label, color }) => (
                <MenuItem key={value} value={value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }}
                    />
                    {label}
                  </Box>
                </MenuItem>
              ))}
            </CustomSelect>
          </Box>

          <CustomInput
            label="Description"
            placeholder="Steps to reproduce, expected behavior, and what you observed"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            error={!!errors.description}
            helperText={errors.description}
            multiline
            minRows={5}
          />
        </SectionCard>

        {/* Screenshot */}
        <SectionCard>
          <Typography component="h3" sx={SECTION_TITLE_SX}>
            Screenshot{' '}
            <Typography component="span" sx={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>
              (optional)
            </Typography>
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleScreenshotChange}
          />

          {screenshot ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 2,
                border: '1px solid rgba(16,185,129,0.3)',
                bgcolor: 'rgba(16,185,129,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#10b981' }} />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {screenshot.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {(screenshot.size / 1024).toFixed(0)} KB
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => { setScreenshot(null); setScreenshotError(''); }}
                sx={{ fontSize: 12, borderRadius: 1.5, textTransform: 'none', borderColor: 'var(--border-color)' }}
              >
                Remove
              </Button>
            </Box>
          ) : (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed',
                borderColor: 'rgba(0,0,0,0.12)',
                borderRadius: 2,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  bgcolor: 'rgba(37,99,235,0.02)',
                },
              }}
            >
              <AttachFileRoundedIcon sx={{ fontSize: 24, color: 'var(--text-muted)' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                Click to attach a screenshot
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>
                PNG, JPG, GIF up to 5 MB
              </Typography>
            </Box>
          )}

          {screenshotError && (
            <Typography color="error" sx={{ fontSize: 12, mt: 1 }}>
              {screenshotError}
            </Typography>
          )}
        </SectionCard>

        {/* Auto-captured context */}
        <SectionCard>
          <Typography component="h3" sx={SECTION_TITLE_SX}>
            Auto-captured Context
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 2, lineHeight: 1.6 }}>
            This information is automatically included with your report to help us diagnose the issue faster.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            {[
              { icon: LanguageRoundedIcon, label: 'Page URL', value: window.location.pathname },
              { icon: PersonRoundedIcon, label: 'Account', value: user?.email || 'Not signed in' },
              { icon: ComputerRoundedIcon, label: 'Browser', value: meta.browser },
              { icon: ComputerRoundedIcon, label: 'Operating System', value: meta.os },
            ].map(({ icon: Icon, label, value }) => (
              <Box
                key={label}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.25,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <Icon sx={{ fontSize: 16, color: 'var(--text-muted)', mt: 0.25, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.25 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                    {value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </SectionCard>

        {/* Submit Actions */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 2,
            mt: 3,
            pb: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={submitting}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
              px: 3,
              py: 1,
              fontSize: 14,
              fontWeight: 500,
              '&:hover': {
                borderColor: 'var(--text-secondary)',
                bgcolor: 'rgba(0,0,0,0.02)',
              },
            }}
          >
            Clear Form
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <BugReportRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 4,
              py: 1,
              fontSize: 14,
              fontWeight: 600,
              minWidth: 160,
              boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              },
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Report'}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
