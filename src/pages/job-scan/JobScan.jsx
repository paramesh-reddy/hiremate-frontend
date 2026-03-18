import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
} from '@mui/material';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import FileUploadCustom from '../../components/uploadFiles';
import JobDescriptionField from '../../components/inputs/JobDescriptionField';
import { atsScanResumeAPI } from '../../services';

const HERO_GRADIENT =
  'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #2d2b8a 70%, #3b5ae4 100%)';

export default function JobScan() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanError, setScanError] = useState('');
  const progressIntervalRef = useRef(null);

  const canScan = resumeFile && jobDescription.trim().length >= 50;

  useEffect(() => {
    if (!scanning) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgress(0);
      return;
    }
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.random() * 6 + 3));
    }, 400);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [scanning]);

  const handleScan = async () => {
    if (!canScan) return;
    setScanError('');
    setScanning(true);
    try {
      const { data } = await atsScanResumeAPI(resumeFile, jobDescription.trim());
      setProgress(100);
      const resumeUrl = resumeFile ? URL.createObjectURL(resumeFile) : null;
      setTimeout(() => {
        navigate('/scan-report', {
          state: {
            report: data,
            resumeUrl,
            fileName: resumeFile?.name || data?.file_name || 'resume.pdf',
          },
        });
      }, 300);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Scan failed. Please try again.';
      setScanError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setScanning(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        bgcolor: '#f1f5f9',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Box sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
        <Box
          sx={{
            background: HERO_GRADIENT,
            borderRadius: 3,
            color: 'white',
            py: { xs: 4, sm: 5 },
            px: { xs: 3, sm: 5 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle radial glow */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 60% 70% at 50% 120%, rgba(99,102,241,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Back button */}
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              position: 'absolute',
              left: { xs: 16, sm: 24 },
              top: { xs: 16, sm: 24 },
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              width: 36,
              height: 36,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Content */}
          <Box sx={{ position: 'relative', textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-family)',
                fontWeight: 800,
                fontSize: { xs: '1.625rem', sm: '2rem' },
                lineHeight: 1.2,
                mb: 1.25,
                letterSpacing: '-0.01em',
              }}
            >
              No More ATS Resume Rejections
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-family)',
                fontSize: { xs: '0.9rem', sm: '0.9375rem' },
                opacity: 0.85,
                mb: 0.75,
              }}
            >
              Ensure an ATS Score of more than 80% and get more interview calls
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-family)',
                fontSize: '0.875rem',
                opacity: 0.7,
                mb: 3,
                maxWidth: 480,
                mx: 'auto',
              }}
            >
              Upload your resume and paste the job description to instantly see how well
              you match — and how to improve.
            </Typography>

            {/* Feature chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
              {[
                { icon: TrackChangesRoundedIcon, label: 'ATS Score Analysis' },
                { icon: BoltRoundedIcon, label: 'Instant Results' },
                { icon: AutoAwesomeRoundedIcon, label: 'Keyword Match' },
              ].map(({ icon: Icon, label }) => (
                <Chip
                  key={label}
                  icon={<Icon sx={{ fontSize: '15px !important', color: 'rgba(255,255,255,0.8) !important' }} />}
                  label={label}
                  size="small"
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    px: 0.5,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Form card ────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 4 }}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.06)',
            overflow: 'visible',
          }}
        >
          {scanning ? (
            /* ── Scanning state ── */
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 10,
                px: 4,
                minHeight: 360,
              }}
            >
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  bgcolor: '#eff6ff',
                  border: '2px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5,
                }}
              >
                <TrackChangesRoundedIcon sx={{ color: '#2563eb', fontSize: 34 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: 'var(--text-primary)',
                  mb: 0.5,
                }}
              >
                Scanning Your Resume
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  mb: 3,
                }}
              >
                Analyzing ATS match and keyword coverage…
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(progress, 100)}
                sx={{
                  width: '100%',
                  maxWidth: 340,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#e0e7ff',
                  '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#2563eb' },
                }}
              />
              <Typography
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  mt: 1,
                }}
              >
                {Math.round(Math.min(progress, 100))}% complete
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Card header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <TrackChangesRoundedIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontWeight: 700,
                      fontSize: '1.0625rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    ATS Scanner
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Upload your resume and paste the job description to check your ATS match score
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Two-column layout */}
              <Grid container spacing={3}>
                {/* Left: Upload */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: 'white',
                          lineHeight: 1,
                        }}
                      >
                        1
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-family)',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Upload Your Resume
                    </Typography>
                    <UploadFileRoundedIcon sx={{ fontSize: 17, color: 'var(--text-muted)' }} />
                  </Box>

                  <FileUploadCustom
                    id="job-scan-resume-upload"
                    label=""
                    title="Choose your resume or drag & drop it here"
                    subtitle="PDF only · Max 10MB"
                    accept=".pdf"
                    allowedExtensions={['.pdf']}
                    maxSizeMB={10}
                    onFileUpload={(file) => setResumeFile(file)}
                    sx={{ width: '100%' }}
                  />

                  {resumeFile && (
                    <Box
                      sx={{
                        mt: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.875,
                        bgcolor: '#eff6ff',
                        borderRadius: 1.5,
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      <DescriptionRoundedIcon sx={{ fontSize: 15, color: '#2563eb', flexShrink: 0 }} />
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.8rem',
                          color: '#2563eb',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {resumeFile.name}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                {/* Divider */}
                <Grid item xs={12} md="auto" sx={{ display: { xs: 'block', md: 'flex' }, alignItems: 'stretch' }}>
                  <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 0.5 }} />
                  <Divider sx={{ display: { xs: 'block', md: 'none' } }} />
                </Grid>

                {/* Right: Job Description */}
                <Grid item xs={12} md>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: 'white',
                          lineHeight: 1,
                        }}
                      >
                        2
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-family)',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Paste Job Description
                    </Typography>
                  </Box>

                  <JobDescriptionField
                    value={jobDescription}
                    onChange={setJobDescription}
                    minRows={9}
                    maxRows={18}
                  />

                  {jobDescription.trim().length > 0 && jobDescription.trim().length < 50 && (
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-family)',
                        fontSize: '0.8rem',
                        color: '#d97706',
                        display: 'block',
                        mt: 0.75,
                      }}
                    >
                      {50 - jobDescription.trim().length} more characters needed for accurate analysis
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {/* CTA */}
              <Box sx={{ mt: 3.5, borderTop: '1px solid var(--divider)', pt: 3 }}>
                {scanError && (
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontSize: '0.875rem',
                      color: '#dc2626',
                      mb: 1.5,
                    }}
                  >
                    {scanError}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<TrackChangesRoundedIcon />}
                  onClick={handleScan}
                  disabled={!canScan}
                  sx={{
                    py: 1.625,
                    background: canScan
                      ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                      : undefined,
                    bgcolor: canScan ? undefined : 'rgba(0,0,0,0.08)',
                    color: canScan ? 'white' : 'rgba(0,0,0,0.3)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 600,
                    borderRadius: 2,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: canScan ? '0 4px 14px rgba(79,70,229,0.35)' : 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)',
                      boxShadow: '0 4px 18px rgba(79,70,229,0.45)',
                    },
                    '&:disabled': {
                      background: 'rgba(0,0,0,0.08)',
                      color: 'rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  Scan My Resume
                </Button>

                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'block',
                    textAlign: 'center',
                    mt: 1,
                  }}
                >
                  PDF required · Paste at least 50 characters of the job description to scan
                </Typography>
              </Box>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
