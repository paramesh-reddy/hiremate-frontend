import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  LinearProgress,
  Alert,
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
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { atsScanResumeAPI } from '../../services';

/** Matches `AiResumeStudio` tool cards and documents panel */
const THEME = {
  primary: 'var(--primary, #335ede)',
  primarySoft: 'var(--light-blue-bg, rgba(51, 94, 222, 0.08))',
  border: 'var(--divider, rgba(0,0,0,0.08))',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
};

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
    <Box
      sx={{
        minHeight: '100%',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        bgcolor: '#fafbfc',
        fontFamily: 'var(--font-family)',
        display: 'flex',
        flexDirection: 'column',
        pb: 5,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          mx: 0,
          boxSizing: 'border-box',
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          pt: { xs: 3, sm: 4 },
        }}
      >
        <PageBreadcrumb
          items={[
            { label: 'AI Resume Studio', to: '/ai-resume-studio', showBackIcon: true },
            { label: 'ATS Scanner' },
          ]}
        />

        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: 0.8,
            color: THEME.primary,
            textTransform: 'uppercase',
            mb: 0.75,
          }}
        >
          ATS Analysis
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            color: THEME.textPrimary,
            mb: 0.5,
          }}
        >
          Run an ATS scan
        </Typography>
        <Typography sx={{ color: THEME.textSecondary, fontSize: '0.95rem', mb: 2, maxWidth: 720 }}>
          Know your ATS score before you apply — match score, keywords, and fixes in one pass.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 3,
          }}
        >
          {[
            { icon: TrackChangesRoundedIcon, label: 'ATS score analysis' },
            { icon: BoltRoundedIcon, label: 'Instant results' },
            { icon: AutoAwesomeRoundedIcon, label: 'AI-powered' },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <Chip
                key={item.label}
                icon={
                  <IconComponent sx={{ fontSize: '15px !important', color: `${THEME.primary} !important` }} />
                }
                label={item.label}
                size="small"
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  bgcolor: THEME.primarySoft,
                  border: `1px solid ${THEME.border}`,
                  color: THEME.textPrimary,
                  height: 28,
                  '& .MuiChip-label': { px: 1 },
                  '& .MuiChip-icon': { ml: 0.75 },
                }}
              />
            );
          })}
        </Box>

        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            border: `1px solid ${THEME.border}`,
            overflow: 'hidden',
            bgcolor: '#fff',
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
                  bgcolor: THEME.primarySoft,
                  border: '3px solid rgba(51, 94, 222, 0.22)',
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
                <TrackChangesRoundedIcon sx={{ color: THEME.primary, fontSize: 40 }} />
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
                    bgcolor: THEME.primarySoft,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: THEME.primary,
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.875rem',
                    color: THEME.primary,
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
            <Box>
              <Box
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: 2,
                  borderBottom: `1px solid ${THEME.border}`,
                  bgcolor: '#fff',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: THEME.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 14px rgba(51, 94, 222, 0.2)',
                    }}
                  >
                    <TrackChangesRoundedIcon sx={{ color: '#fff', fontSize: 24 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: THEME.textPrimary,
                        lineHeight: 1.25,
                      }}
                    >
                      Scan setup
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        color: THEME.textSecondary,
                        lineHeight: 1.45,
                        mt: 0.35,
                      }}
                    >
                      Upload your resume, then paste the job description.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
                <Box sx={{ mb: 3 }}>
                  <CustomStepper
                    steps={STEPS}
                    activeStep={isStep0Complete && isStep1Complete ? 2 : activeStep}
                  />
                </Box>

                {scanError && (
                  <Alert severity="error" onClose={() => setScanError('')} sx={{ mb: 3 }}>
                    {scanError}
                  </Alert>
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
                  pt: 3,
                  borderTop: `1px solid ${THEME.border}`,
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
                        borderColor: THEME.border,
                        color: THEME.textSecondary,
                        fontFamily: 'var(--font-family)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        textTransform: 'none',
                        height: 36,
                        minHeight: 36,
                        px: 2,
                        borderRadius: 1,
                        '&:hover': {
                          borderColor: 'rgba(51, 94, 222, 0.35)',
                          bgcolor: THEME.primarySoft,
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
                      disableElevation
                      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '18px !important' }} />}
                      onClick={handleNext}
                      disabled={!isStep0Complete}
                      sx={{
                        py: 1,
                        px: 2.5,
                        bgcolor: isStep0Complete ? THEME.primary : 'rgba(15, 23, 42, 0.12)',
                        fontFamily: 'var(--font-family)',
                        fontWeight: 600,
                        borderRadius: 1,
                        fontSize: '0.8125rem',
                        textTransform: 'none',
                        minHeight: 36,
                        boxShadow: 'none',
                        minWidth: { xs: 'auto', sm: 220 },
                        '&:hover': {
                          bgcolor: isStep0Complete ? 'var(--primary-dark, #2a4bc4)' : undefined,
                          boxShadow: 'none',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(15, 23, 42, 0.12)',
                          color: 'rgba(15, 23, 42, 0.26)',
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
                        disableElevation
                        startIcon={<TrackChangesRoundedIcon sx={{ fontSize: 18 }} />}
                        onClick={handleScan}
                        disabled={!canScan}
                        aria-label="Scan my resume against the job description"
                        sx={{
                          py: 1,
                          px: 2.5,
                          bgcolor: canScan ? THEME.primary : 'rgba(15, 23, 42, 0.12)',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 600,
                          borderRadius: 1,
                          fontSize: '0.8125rem',
                          textTransform: 'none',
                          minHeight: 36,
                          boxShadow: 'none',
                          minWidth: { xs: 'auto', sm: 220 },
                          '&:hover': {
                            bgcolor: canScan ? 'var(--primary-dark, #2a4bc4)' : undefined,
                            boxShadow: 'none',
                          },
                          '&:disabled': {
                            bgcolor: 'rgba(15, 23, 42, 0.12)',
                            color: 'rgba(15, 23, 42, 0.26)',
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
            </Box>
          )}
        </Card>

        {/* ── Summary Progress Card (when all steps complete) ── */}
        {!scanning && isStep0Complete && isStep1Complete && (
          <Card
            elevation={0}
            sx={{
              mt: 3,
              borderRadius: 2,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              border: '1px solid #86efac',
              overflow: 'hidden',
              bgcolor: '#f0fdf4',
            }}
          >
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'var(--success-bg, #dcfce7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid #86efac',
                }}
              >
                <CheckCircleRoundedIcon sx={{ color: 'var(--success-dark, #16a34a)', fontSize: 28 }} />
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
      </Box>
    </Box>
  );
}
