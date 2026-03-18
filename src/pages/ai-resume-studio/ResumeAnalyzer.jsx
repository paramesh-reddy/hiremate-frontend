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
} from '@mui/material';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SpellcheckRoundedIcon from '@mui/icons-material/SpellcheckRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import DataUsageRoundedIcon from '@mui/icons-material/DataUsageRounded';
import FileUploadCustom from '../../components/uploadFiles';
import { analyzeResumeAPI } from '../../services';

const HERO_GRADIENT =
  'linear-gradient(90deg, rgba(51, 94, 222, 1) 0%, rgba(39, 39, 125, 1) 35%, rgba(54, 94, 214, 1) 100%)';

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
        background: 'var(--bg-app)',
        overflowX: 'hidden',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <Box
        sx={{
          background: HERO_GRADIENT,
          color: 'white',
          py: 3.5,
          px: { xs: 2.5, sm: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: 'auto', position: 'relative' }}>
          <IconButton
            onClick={() => navigate('/ai-resume-studio')}
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
            aria-label="Back to AI Resume Studio"
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-family)',
              fontWeight: 700,
              textAlign: 'center',
              fontSize: {
                xs: 'var(--font-size-section-header)',
                sm: 'var(--font-size-page-title)',
              },
              mb: 1,
            }}
          >
            Get Deep Insights on Your Resume
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              textAlign: 'center',
              fontSize: 'var(--font-size-page-subtitle)',
              opacity: 0.95,
              mb: 2,
            }}
          >
            Analyze strengths, gaps and keyword matches between your resume and the job description
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              textAlign: 'center',
              maxWidth: 540,
              mx: 'auto',
              fontSize: 'var(--font-size-helper)',
              opacity: 0.9,
              mb: 3,
            }}
          >
            Upload your resume and get a detailed AI-powered breakdown of how to make it stronger and more competitive.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
            <Chip
              icon={<InsightsRoundedIcon sx={{ fontSize: 18 }} />}
              label="Deep Analysis"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
            <Chip
              icon={<TrackChangesRoundedIcon sx={{ fontSize: 18 }} />}
              label="Keyword Match"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
            <Chip
              icon={<TrendingUpRoundedIcon sx={{ fontSize: 18 }} />}
              label="Improvement Tips"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />}
              label="AI-Powered"
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'var(--label-font-weight)',
                '& .MuiChip-icon': { color: 'aliceblue' },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ── Main content ──────────────────────────────────── */}
      <Box
        sx={{
          width: '100%',
          boxSizing: 'border-box',
          px: { xs: 2, sm: 4 },
          pt: 4,
          pb: 6,
          maxWidth: 720,
          mx: 'auto',
        }}
      >
        <Card
          sx={{
            width: '100%',
            borderRadius: 2.5,
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            overflow: 'visible',
          }}
        >
          {analyzing ? (
            /* ── Analyzing state ── */
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 4,
                minHeight: 340,
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <InsightsRoundedIcon sx={{ color: 'white', fontSize: 40 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  mb: 0.5,
                }}
              >
                Analyzing Your Resume
              </Typography>
              <Typography
                variant="body2"
                color="var(--text-muted)"
                sx={{ fontFamily: 'var(--font-family)', mb: 2.5 }}
              >
                Running 20+ AI checks — getting deep insights and improvement tips…
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(progress, 100)}
                sx={{
                  width: '100%',
                  maxWidth: 360,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'var(--bg-light)',
                  '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: 'var(--primary)' },
                }}
              />
              <Typography
                variant="caption"
                color="var(--text-muted)"
                sx={{ fontFamily: 'var(--font-family)', mt: 1 }}
              >
                {Math.round(Math.min(progress, 100))}% complete
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Card header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <InsightsRoundedIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }}
                    color="var(--text-primary)"
                  >
                    Resume Scan
                  </Typography>
                  <Typography
                    variant="body2"
                    color="var(--text-secondary)"
                    sx={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-helper)' }}
                  >
                    Upload your resume to get a detailed AI-powered analysis
                  </Typography>
                </Box>
              </Box>

              {/* What we'll analyze */}
              <Box
                sx={{
                  bgcolor: 'var(--bg-light)',
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                  border: '1px solid var(--divider)',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--font-size-helper)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    mb: 1.5,
                  }}
                >
                  What we&apos;ll evaluate:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {ANALYSIS_CHECKS.map((check) => {
                    const Icon = check.icon;
                    return (
                      <Chip
                        key={check.label}
                        icon={<Icon sx={{ fontSize: '15px !important', color: 'var(--primary) !important' }} />}
                        label={check.label}
                        size="small"
                        sx={{
                          fontFamily: 'var(--font-family)',
                          bgcolor: 'var(--bg-paper)',
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                          fontSize: '0.8rem',
                          border: '1px solid var(--divider)',
                          '& .MuiChip-icon': { color: 'var(--primary)' },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* Upload area */}
              <Typography
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 500,
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--text-primary)',
                  mb: 1,
                }}
              >
                Upload Your Resume
              </Typography>
              <FileUploadCustom
                id="resume-analyzer-upload"
                label=""
                title="Choose your resume or drag & drop it here"
                subtitle="PDF only · Max 10MB"
                accept=".pdf"
                allowedExtensions={['.pdf']}
                maxSizeMB={10}
                onFileUpload={(file) => setResumeFile(file)}
                sx={{ width: '100%' }}
              />

              {analyzeError && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ fontFamily: 'var(--font-family)', mt: 1.5 }}
                >
                  {analyzeError}
                </Typography>
              )}

              <Button
                variant="contained"
                fullWidth
                startIcon={<InsightsRoundedIcon />}
                onClick={handleAnalyze}
                disabled={!resumeFile}
                sx={{
                  mt: 2.5,
                  py: 1.5,
                  bgcolor: 'var(--primary)',
                  color: 'white',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 600,
                  borderRadius: 2,
                  fontSize: '1rem',
                  '&:hover': { bgcolor: 'var(--primary-dark)' },
                  '&:disabled': {
                    bgcolor: 'rgba(0,0,0,0.12)',
                    color: 'rgba(0,0,0,0.26)',
                  },
                }}
              >
                Analyze My Resume
              </Button>

              <Typography
                variant="caption"
                color="var(--text-muted)"
                sx={{
                  fontFamily: 'var(--font-family)',
                  display: 'block',
                  textAlign: 'center',
                  mt: 1,
                  fontSize: 'var(--font-size-helper)',
                }}
              >
                Upload your resume to get strengths, gaps, and actionable improvement tips
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
