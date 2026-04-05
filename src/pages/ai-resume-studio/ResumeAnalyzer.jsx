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
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import SpellcheckRoundedIcon from '@mui/icons-material/SpellcheckRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import DataUsageRoundedIcon from '@mui/icons-material/DataUsageRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FileUploadCustom from '../../components/uploadFiles';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { analyzeResumeAPI } from '../../services';

/** Matches `AiResumeStudio` tool cards and documents panel */
const THEME = {
  primary: 'var(--primary, #335ede)',
  primarySoft: 'var(--light-blue-bg, rgba(51, 94, 222, 0.08))',
  border: 'var(--divider, rgba(0,0,0,0.08))',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
};

const ANALYSIS_CHECKS = [
  { icon: SpellcheckRoundedIcon, label: 'Writing Quality' },
  { icon: FormatListBulletedRoundedIcon, label: 'Section Completeness' },
  { icon: TrackChangesRoundedIcon, label: 'Keyword Density' },
  { icon: TrendingUpRoundedIcon, label: 'Impact & Clarity' },
  { icon: DataUsageRoundedIcon, label: 'ATS Compatibility' },
  { icon: EmojiEventsRoundedIcon, label: 'Strengths & Gaps' },
];

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzeError, setAnalyzeError] = useState('');
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (!analyzing) {
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
  }, [analyzing]);

  const handleAnalyze = async () => {
    if (!resumeFile) return;
    setAnalyzeError('');
    setAnalyzing(true);
    try {
      const { data } = await analyzeResumeAPI(resumeFile);
      setProgress(100);
      const resumeUrl = URL.createObjectURL(resumeFile);
      setTimeout(() => {
        navigate('/resume-analyze-score', {
          state: {
            resumeUrl,
            fileName: resumeFile.name || data?.file_name,
            analysis: data,
          },
        });
      }, 300);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Analysis failed. Please try again.';
      setAnalyzeError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        width: '100%',
        bgcolor: '#fafbfc',
        fontFamily: 'var(--font-family)',
        pb: 5,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          mx: 0,
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          pt: { xs: 3, sm: 4 },
        }}
      >
        <PageBreadcrumb
          items={[
            { label: 'AI Resume Studio', to: '/ai-resume-studio', showBackIcon: true },
            { label: 'Resume Scan' },
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
          Deep Analysis
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
          Deep resume insights
        </Typography>
        <Typography sx={{ color: THEME.textSecondary, fontSize: '0.95rem', mb: 2, maxWidth: 720 }}>
          Get AI feedback on writing quality, keywords, ATS fit, and gaps — then act on clear next steps.
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
            { icon: InsightsRoundedIcon, label: 'Deep analysis' },
            { icon: TrackChangesRoundedIcon, label: 'Keyword match' },
            { icon: TrendingUpRoundedIcon, label: 'Improvement tips' },
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
            bgcolor: '#fff',
            borderRadius: 2,
            border: `1px solid ${THEME.border}`,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
          }}
        >
          {analyzing ? (
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
                <InsightsRoundedIcon sx={{ color: THEME.primary, fontSize: 40 }} />
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.375rem',
                  color: THEME.textPrimary,
                  mb: 1,
                  letterSpacing: '-0.01em',
                }}
              >
                Analyzing your resume
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  color: THEME.textSecondary,
                  mb: 4,
                  textAlign: 'center',
                  maxWidth: 400,
                }}
              >
                Running AI checks for insights and improvement tips
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
                      bgcolor: THEME.primarySoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <InsightsRoundedIcon sx={{ color: THEME.primary, fontSize: 24 }} />
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
                      Upload & analyze
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        color: THEME.textSecondary,
                        lineHeight: 1.45,
                        mt: 0.35,
                      }}
                    >
                      PDF up to 10MB — we'll return a full quality report.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
                <Box
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${THEME.border}`,
                    bgcolor: '#f8fafc',
                    overflow: 'hidden',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderBottom: `1px solid ${THEME.border}`,
                      bgcolor: '#f1f5f9',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: THEME.textSecondary,
                      }}
                    >
                      What we'll evaluate
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {ANALYSIS_CHECKS.map((check) => {
                      const Icon = check.icon;
                      return (
                        <Chip
                          key={check.label}
                          icon={<Icon sx={{ fontSize: '15px !important', color: `${THEME.primary} !important` }} />}
                          label={check.label}
                          size="small"
                          sx={{
                            bgcolor: '#fff',
                            color: THEME.textPrimary,
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            border: `1px solid ${THEME.border}`,
                            height: 28,
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: THEME.textPrimary,
                    mb: 0.75,
                    textAlign: 'center',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Upload your resume
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.9375rem',
                    color: THEME.textSecondary,
                    lineHeight: 1.5,
                    textAlign: 'center',
                    mb: 3,
                  }}
                >
                  We'll score quality, keywords, and structure in one pass
                </Typography>

                <Box sx={{ maxWidth: 580, mx: 'auto' }}>
                  <FileUploadCustom
                    id="resume-analyzer-upload"
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
                        <Typography sx={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                      <CheckCircleRoundedIcon sx={{ fontSize: 28, color: '#10b981' }} />
                    </Box>
                  )}
                </Box>

                {analyzeError && (
                  <Alert severity="error" onClose={() => setAnalyzeError('')} sx={{ mt: 3, maxWidth: 580, mx: 'auto' }}>
                    {analyzeError}
                  </Alert>
                )}

                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: `1px solid ${THEME.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'stretch', sm: 'flex-end' },
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    disableElevation
                    startIcon={<InsightsRoundedIcon sx={{ fontSize: 18 }} />}
                    onClick={handleAnalyze}
                    disabled={!resumeFile}
                    sx={{
                      height: 36,
                      minHeight: 36,
                      px: 2.5,
                      bgcolor: resumeFile ? THEME.primary : 'rgba(15, 23, 42, 0.12)',
                      fontWeight: 600,
                      borderRadius: 1,
                      fontSize: '0.8125rem',
                      textTransform: 'none',
                      minWidth: { xs: '100%', sm: 220 },
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: resumeFile ? 'var(--primary-dark, #2a4bc4)' : undefined,
                        boxShadow: 'none',
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(15, 23, 42, 0.12)',
                        color: 'rgba(15, 23, 42, 0.26)',
                      },
                    }}
                  >
                    Analyze my resume
                  </Button>
                  {!resumeFile && (
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        color: THEME.textSecondary,
                        textAlign: { xs: 'center', sm: 'right' },
                        width: '100%',
                      }}
                    >
                      Upload a PDF to run the analysis
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
