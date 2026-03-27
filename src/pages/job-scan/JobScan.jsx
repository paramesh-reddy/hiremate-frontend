import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  Container,
} from '@mui/material';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FileUploadCustom from '../../components/uploadFiles';
import JobDescriptionField from '../../components/inputs/JobDescriptionField';
import CustomStepper from '../../components/common/CustomStepper';
import { atsScanResumeAPI } from '../../services';

const HERO_GRADIENT =
  'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #2d2b8a 70%, #3b5ae4 100%)';

const STEPS = [
  {
    label: 'Upload Resume',
    description: 'PDF format, max 10MB',
  },
  {
    label: 'Job Description',
    description: 'Paste the full job posting',
  },
];

export default function JobScan() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanError, setScanError] = useState('');
  const progressIntervalRef = useRef(null);

  const isStep0Complete = resumeFile !== null;
  const isStep1Complete = jobDescription.trim().length >= 50;
  const canScan = isStep0Complete && isStep1Complete;
  const hasJobDescError = jobDescription.trim().length > 0 && jobDescription.trim().length < 50;

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

  const handleNext = () => {
    if (activeStep === 0 && isStep0Complete) {
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', fontFamily: 'var(--font-family)' }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Box sx={{ pt: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            background: HERO_GRADIENT,
            borderRadius: 3,
            color: 'white',
            py: { xs: 5, sm: 6 },
            px: { xs: 3, sm: 4 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative background elements */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 60% 70% at 50% 120%, rgba(99,102,241,0.4) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Back button */}
          <IconButton
            onClick={() => navigate(-1)}
            aria-label="Go back"
            sx={{
              position: 'absolute',
              left: { xs: 16, sm: 24 },
              top: { xs: 16, sm: 24 },
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              width: 38,
              height: 38,
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
              '&:hover': { 
                bgcolor: 'rgba(255,255,255,0.24)',
                transform: 'translateX(-2px)',
              },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Content */}
          <Box sx={{ position: 'relative', textAlign: 'center', maxWidth: 640, mx: 'auto' }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: 'var(--font-family)',
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
                lineHeight: 1.2,
                mb: 1.5,
                letterSpacing: '-0.03em',
              }}
            >
              Beat the ATS & Get Interviews
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-family)',
                fontSize: { xs: '1rem', sm: '1.0625rem' },
                opacity: 0.92,
                mb: 0.75,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              Analyze your resume's ATS compatibility in seconds
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-family)',
                fontSize: '0.9375rem',
                opacity: 0.7,
                mb: 3,
                maxWidth: 520,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Get instant feedback on match score, keyword optimization, and actionable improvements
            </Typography>

            {/* Feature chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.25 }}>
              {[
                { icon: TrackChangesRoundedIcon, label: 'ATS Score Analysis' },
                { icon: BoltRoundedIcon, label: 'Instant Results' },
                { icon: AutoAwesomeRoundedIcon, label: 'AI-Powered' },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <Chip
                    key={item.label}
                    icon={<IconComponent sx={{ fontSize: '15px !important', color: 'rgba(255,255,255,0.85) !important' }} />}
                    label={item.label}
                    size="small"
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                      bgcolor: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.24)',
                      color: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(12px)',
                      px: 0.75,
                      py: 0.25,
                      height: 30,
                      '& .MuiChip-label': { px: 1.25 },
                      '& .MuiChip-icon': { ml: 0.75 },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Form area ─────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ pt: { xs: 3, sm: 4 }, pb: 6, px: { xs: 2, sm: 3 } }}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 10px 36px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
            bgcolor: '#ffffff',
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
                py: { xs: 10, sm: 14 },
                px: 4,
                minHeight: 420,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#eff6ff',
                  border: '3px solid #dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                  },
                }}
              >
                <TrackChangesRoundedIcon sx={{ color: '#3b82f6', fontSize: 40 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 700,
                  fontSize: '1.375rem',
                  color: 'var(--text-primary)',
                  mb: 1,
                  letterSpacing: '-0.01em',
                }}
              >
                Analyzing Your Resume
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.9375rem',
                  color: 'var(--text-secondary)',
                  mb: 4,
                  textAlign: 'center',
                  maxWidth: 400,
                }}
              >
                Running ATS compatibility check and keyword analysis
              </Typography>
              <Box sx={{ width: '100%', maxWidth: 400, px: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progress, 100)}
                  sx={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#e0e7ff',
                    '& .MuiLinearProgress-bar': { 
                      borderRadius: 4, 
                      bgcolor: '#4f46e5',
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.875rem',
                    color: '#4f46e5',
                    mt: 1.5,
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  {Math.round(Math.min(progress, 100))}% complete
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              {/* ── Card header ── */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(79,70,229,0.25)',
                    }}
                  >
                    <TrackChangesRoundedIcon sx={{ color: 'white', fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-family)',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      ATS Scanner
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-family)',
                        fontSize: '0.9375rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                      }}
                    >
                      Analyze your resume's compatibility with any job posting
                    </Typography>
                  </Box>
                </Box>

                {/* Stepper */}
                <CustomStepper 
                  steps={STEPS} 
                  activeStep={isStep0Complete && isStep1Complete ? 2 : activeStep} 
                />
              </Box>

              {/* ── Error Alert ── */}
              {scanError && (
                <Box
                  role="alert"
                  sx={{
                    mb: 4,
                    p: 2.5,
                    bgcolor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>!</Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontSize: '0.875rem',
                      color: '#dc2626',
                      fontWeight: 500,
                      lineHeight: 1.6,
                    }}
                  >
                    {scanError}
                  </Typography>
                </Box>
              )}

              {/* ── Step Content ── */}
              <Box sx={{ minHeight: 400 }}>
                {/* Step 0: Upload Resume */}
                {activeStep === 0 && (
                  <Box>
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontWeight: 700,
                          fontSize: '1.125rem',
                          color: 'var(--text-primary)',
                          mb: 0.75,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Upload Your Resume
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.9375rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                        }}
                      >
                        We'll analyze it against the job requirements
                      </Typography>
                    </Box>

                    <Box sx={{ maxWidth: 580, mx: 'auto' }}>
                      <FileUploadCustom
                        id="job-scan-resume-upload"
                        label=""
                        title="Choose your resume or drag & drop it here"
                        subtitle="PDF only · Max 10MB"
                        accept=".pdf"
                        allowedExtensions={['.pdf']}
                        maxSizeMB={10}
                        onFileUpload={(file) => setResumeFile(file)}
                        sx={{
                          width: '100%',
                          minHeight: 260,
                          transition: 'all 0.2s',
                        }}
                      />

                      {resumeFile && (
                        <Box
                          sx={{
                            mt: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: 3,
                            py: 2,
                            bgcolor: '#f0fdf4',
                            borderRadius: 2.5,
                            border: '1.5px solid #86efac',
                          }}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              bgcolor: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <DescriptionRoundedIcon sx={{ fontSize: 22, color: 'white' }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontFamily: 'var(--font-family)',
                                fontSize: '0.9375rem',
                                color: '#065f46',
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mb: 0.25,
                              }}
                            >
                              {resumeFile.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: 'var(--font-family)',
                                fontSize: '0.8125rem',
                                color: '#059669',
                                fontWeight: 500,
                              }}
                            >
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                          <CheckCircleRoundedIcon sx={{ fontSize: 28, color: '#10b981' }} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Step 1: Job Description */}
                {activeStep === 1 && (
                  <Box>
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontWeight: 700,
                          fontSize: '1.125rem',
                          color: 'var(--text-primary)',
                          mb: 0.75,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Paste the Job Description
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.9375rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                        }}
                      >
                        Include responsibilities, requirements, and qualifications for best results
                      </Typography>
                    </Box>

                    <Box sx={{ maxWidth: 680, mx: 'auto' }}>
                      <JobDescriptionField
                        value={jobDescription}
                        onChange={setJobDescription}
                        minRows={12}
                        maxRows={20}
                      />

                      {hasJobDescError && (
                        <Box
                          sx={{
                            mt: 2,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            px: 2.5,
                            py: 2,
                            bgcolor: '#fffbeb',
                            borderRadius: 2,
                            border: '1px solid #fde68a',
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: 'var(--font-family)',
                              fontSize: '0.875rem',
                              color: '#d97706',
                              fontWeight: 500,
                              lineHeight: 1.6,
                            }}
                          >
                            Need {50 - jobDescription.trim().length} more characters for accurate analysis (minimum 50 characters required)
                          </Typography>
                        </Box>
                      )}

                      {isStep1Complete && (
                        <Box
                          sx={{
                            mt: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 2.5,
                            py: 1.75,
                            bgcolor: '#f0fdf4',
                            borderRadius: 2,
                            border: '1.5px solid #86efac',
                          }}
                        >
                          <CheckCircleRoundedIcon sx={{ fontSize: 24, color: '#10b981' }} />
                          <Typography
                            sx={{
                              fontFamily: 'var(--font-family)',
                              fontSize: '0.875rem',
                              color: '#065f46',
                              fontWeight: 600,
                            }}
                          >
                            Job description ready for analysis ({jobDescription.trim().length} characters)
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* ── Bottom Actions ── */}
              <Box
                sx={{
                  mt: 5,
                  pt: 4,
                  borderTop: '1.5px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                {/* Left: Back button */}
                <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' }, order: { xs: 2, sm: 1 } }}>
                  {activeStep > 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackRoundedIcon />}
                      onClick={handleBack}
                      sx={{
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        fontFamily: 'var(--font-family)',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        textTransform: 'none',
                        py: 1.25,
                        px: 3,
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: '#cbd5e1',
                          bgcolor: '#f8fafc',
                        },
                      }}
                    >
                      Back
                    </Button>
                  )}
                </Box>

                {/* Right: Next/Scan button */}
                <Box 
                  sx={{ 
                    flex: { xs: '1 1 100%', sm: '1 1 auto' }, 
                    order: { xs: 1, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'stretch', sm: 'flex-end' },
                    gap: 1.5,
                  }}
                >
                  {activeStep === 0 && (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardRoundedIcon />}
                      onClick={handleNext}
                      disabled={!isStep0Complete}
                      sx={{
                        py: 1.75,
                        px: 4,
                        background: isStep0Complete
                          ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                          : 'rgba(0,0,0,0.08)',
                        fontFamily: 'var(--font-family)',
                        fontWeight: 700,
                        borderRadius: 2.5,
                        fontSize: '1.0625rem',
                        textTransform: 'none',
                        boxShadow: isStep0Complete ? '0 4px 16px rgba(79,70,229,0.4)' : 'none',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        letterSpacing: '-0.01em',
                        minWidth: { xs: 'auto', sm: 240 },
                        '&:hover': {
                          background: isStep0Complete 
                            ? 'linear-gradient(135deg, #4338ca 0%, #5b21b6 100%)'
                            : 'rgba(0,0,0,0.08)',
                          boxShadow: isStep0Complete ? '0 6px 24px rgba(79,70,229,0.5)' : 'none',
                          transform: isStep0Complete ? 'translateY(-2px)' : 'none',
                        },
                        '&:active': { transform: isStep0Complete ? 'translateY(0)' : 'none' },
                        '&:disabled': {
                          background: 'rgba(0,0,0,0.08)',
                          color: 'rgba(0,0,0,0.35)',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      Continue to Job Description
                    </Button>
                  )}

                  {activeStep === 1 && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<TrackChangesRoundedIcon sx={{ fontSize: 20 }} />}
                        onClick={handleScan}
                        disabled={!canScan}
                        aria-label="Scan my resume against the job description"
                        sx={{
                          py: 1.75,
                          px: 4,
                          background: canScan
                            ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                            : 'rgba(0,0,0,0.08)',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 700,
                          borderRadius: 2.5,
                          fontSize: '1.0625rem',
                          textTransform: 'none',
                          boxShadow: canScan ? '0 4px 16px rgba(79,70,229,0.4)' : 'none',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          letterSpacing: '-0.01em',
                          minWidth: { xs: 'auto', sm: 240 },
                          '&:hover': {
                            background: canScan 
                              ? 'linear-gradient(135deg, #4338ca 0%, #5b21b6 100%)'
                              : 'rgba(0,0,0,0.08)',
                            boxShadow: canScan ? '0 6px 24px rgba(79,70,229,0.5)' : 'none',
                            transform: canScan ? 'translateY(-2px)' : 'none',
                          },
                          '&:active': { transform: canScan ? 'translateY(0)' : 'none' },
                          '&:disabled': {
                            background: 'rgba(0,0,0,0.08)',
                            color: 'rgba(0,0,0,0.35)',
                            boxShadow: 'none',
                          },
                        }}
                      >
                        Scan My Resume
                      </Button>

                      {!canScan && (
                        <Typography
                          sx={{
                            fontFamily: 'var(--font-family)',
                            fontSize: '0.8125rem',
                            color: '#dc2626',
                            textAlign: { xs: 'center', sm: 'right' },
                            fontWeight: 500,
                          }}
                        >
                          Add at least 50 characters to continue
                        </Typography>
                      )}
                    </>
                  )}

                  {activeStep === 0 && !isStep0Complete && (
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-family)',
                        fontSize: '0.8125rem',
                        color: '#94a3b8',
                        textAlign: { xs: 'center', sm: 'right' },
                        fontWeight: 500,
                      }}
                    >
                      Upload your resume to continue
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Card>

        {/* ── Summary Progress Card (when all steps complete) ── */}
        {!scanning && isStep0Complete && isStep1Complete && (
          <Card
            sx={{
              mt: 3,
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
              border: '1.5px solid #86efac',
              overflow: 'hidden',
              bgcolor: '#f0fdf4',
            }}
          >
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                }}
              >
                <CheckCircleRoundedIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontWeight: 700,
                    fontSize: '1.0625rem',
                    color: '#065f46',
                    lineHeight: 1.3,
                    mb: 0.5,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Ready to Scan
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.875rem',
                    color: '#047857',
                    lineHeight: 1.5,
                  }}
                >
                  All requirements met. Click "Scan My Resume" to analyze your ATS compatibility
                </Typography>
              </Box>
            </Box>
          </Card>
        )}
      </Container>
    </Box>
  );
}
