import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

const HERO_GRADIENT =
  'linear-gradient(90deg, rgba(51, 94, 222, 1) 0%, rgba(39, 39, 125, 1) 35%, rgba(54, 94, 214, 1) 100%)';

const STATS = [
  { icon: PeopleRoundedIcon, value: '50k+', label: 'Resumes Created' },
  { icon: VerifiedRoundedIcon, value: '94%', label: 'ATS Pass Rate' },
  { icon: BoltRoundedIcon, value: '30s', label: 'Avg. Generate Time' },
];

const TOOLS = [
  {
    route: '/resume-generator',
    icon: AutoAwesomeRoundedIcon,
    category: 'AI-Powered',
    title: 'Resume Generator',
    subtitle: 'Build a tailored, job-winning resume in seconds',
    features: [
      'Customized to any job description',
      'ATS-optimized & recruiter-ready',
      '6 professional templates',
      'One-click PDF download',
    ],
    cta: 'Build My Resume',
    accent: false,
  },
  {
    route: '/job-scan',
    icon: TrackChangesRoundedIcon,
    category: 'ATS Analysis',
    title: 'ATS Scanner',
    subtitle: 'Know your ATS score before you apply',
    features: [
      'Real-time ATS score out of 100',
      'Keyword gap analysis',
      'Hard & soft skills match',
      'Recruiter-specific tips',
    ],
    cta: 'Scan My Resume',
    accent: true,
  },
  {
    route: '/resume-analyzer',
    icon: InsightsRoundedIcon,
    category: 'Deep Analysis',
    title: 'Resume Scan',
    subtitle: 'Get deep AI insights on your resume quality',
    features: [
      '20+ quality checks',
      'Strengths & gap analysis',
      'Impact & clarity score',
      'Actionable fix suggestions',
    ],
    cta: 'Analyze Resume',
    accent: false,
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: UploadFileRoundedIcon,
    title: 'Upload or Paste',
    desc: 'Upload your resume or paste a job description — our AI instantly gets to work.',
  },
  {
    step: '02',
    icon: AutoFixHighRoundedIcon,
    title: 'AI Analyzes & Tailors',
    desc: 'Our AI matches your profile to the role and optimizes every section for ATS.',
  },
  {
    step: '03',
    icon: EmojiEventsRoundedIcon,
    title: 'Apply with Confidence',
    desc: 'Download your ATS-ready resume and apply knowing you stand out from the crowd.',
  },
];

export default function AiResumeStudio() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'var(--bg-app)', fontFamily: 'var(--font-family)' }}>
      {/* ── HERO ─────────────────────────────────────────── */}
      <Box
        sx={{
          background: HERO_GRADIENT,
          color: 'white',
          py: { xs: 5, sm: 7 },
          px: { xs: 3, sm: 6 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.04)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -100,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />

        <Chip
          label="AI Resume Studio"
          size="small"
          sx={{
            mb: 2.5,
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.95)',
            fontFamily: 'var(--font-family)',
            fontWeight: 700,
            fontSize: '0.78rem',
            letterSpacing: 0.5,
            border: '1px solid rgba(255,255,255,0.25)',
            height: 26,
          }}
        />

        <Typography
          variant="h3"
          sx={{
            fontFamily: 'var(--font-family)',
            fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2.3rem', md: '2.7rem' },
            mb: 1.5,
            lineHeight: 1.2,
            maxWidth: 680,
            mx: 'auto',
          }}
        >
          Land More Interviews with AI-Powered Resume Tools
        </Typography>

        <Typography
          sx={{
            fontFamily: 'var(--font-family)',
            fontSize: { xs: '0.95rem', sm: '1.05rem' },
            opacity: 0.88,
            mb: 4,
            maxWidth: 520,
            mx: 'auto',
            lineHeight: 1.65,
          }}
        >
          Generate tailored resumes, scan ATS compatibility, and get deep insights — all in one place.
        </Typography>

        {/* Feature chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mb: 5 }}>
          {['AI-Powered', 'ATS Optimized', 'Deep Insights', 'Instant Results'].map((label) => (
            <Chip
              key={label}
              label={label}
              size="small"
              sx={{
                fontFamily: 'var(--font-family)',
                bgcolor: 'rgba(255,255,255,0.18)',
                color: 'white',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </Box>

        {/* Stats row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 4, sm: 6 },
            flexWrap: 'wrap',
          }}
        >
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Box key={stat.value} sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    mb: 0.3,
                  }}
                >
                  <Icon sx={{ fontSize: 18, opacity: 0.75 }} />
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontWeight: 800,
                      fontSize: '1.5rem',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.78rem',
                    opacity: 0.72,
                    letterSpacing: 0.2,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── TOOL CARDS ──────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 6 },
          pt: 6,
          pb: 4,
          maxWidth: 1200,
          mx: 'auto',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-family)',
            fontWeight: 700,
            fontSize: { xs: '1.3rem', sm: '1.6rem' },
            color: 'var(--text-primary)',
            textAlign: 'center',
            mb: 0.5,
          }}
        >
          Choose Your Tool
        </Typography>
        <Typography
          sx={{
            fontFamily: 'var(--font-family)',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            fontSize: 'var(--font-size-helper)',
            mb: 4,
          }}
        >
          Three powerful tools to accelerate your job search
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.route}
                onClick={() => navigate(tool.route)}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  cursor: 'pointer',
                  boxShadow: tool.accent
                    ? '0 4px 24px rgba(51,94,222,0.16)'
                    : '0 2px 10px rgba(0,0,0,0.07)',
                  border: tool.accent
                    ? '1.5px solid rgba(51,94,222,0.28)'
                    : '1.5px solid var(--divider)',
                  position: 'relative',
                  overflow: 'visible',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: tool.accent
                      ? '0 10px 36px rgba(51,94,222,0.22)'
                      : '0 8px 28px rgba(0,0,0,0.12)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {tool.accent && (
                  <Chip
                    label="Most Popular"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: 'var(--primary)',
                      color: 'white',
                      fontFamily: 'var(--font-family)',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      height: 24,
                      borderRadius: 1.5,
                      '& .MuiChip-label': { px: 1.5 },
                    }}
                  />
                )}

                {/* Icon */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: tool.accent ? 'var(--primary)' : 'var(--light-blue-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 26, color: tool.accent ? 'white' : 'var(--primary)' }} />
                </Box>

                {/* Category */}
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: 0.9,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    mb: 0.4,
                  }}
                >
                  {tool.category}
                </Typography>

                {/* Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem',
                    mb: 0.5,
                  }}
                >
                  {tool.title}
                </Typography>

                {/* Subtitle */}
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    mb: 2.5,
                    lineHeight: 1.55,
                  }}
                >
                  {tool.subtitle}
                </Typography>

                {/* Feature bullets */}
                <Box sx={{ flex: 1, mb: 3 }}>
                  {tool.features.map((feature) => (
                    <Box
                      key={feature}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.9 }}
                    >
                      <CheckRoundedIcon
                        sx={{ fontSize: 15, color: 'var(--success)', flexShrink: 0 }}
                      />
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.84rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.4,
                        }}
                      >
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* CTA */}
                <Button
                  variant={tool.accent ? 'contained' : 'outlined'}
                  fullWidth
                  endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '17px !important' }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(tool.route);
                  }}
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    py: 1.1,
                    ...(tool.accent
                      ? {
                          bgcolor: 'var(--primary)',
                          color: 'white',
                          '&:hover': { bgcolor: 'var(--primary-dark)' },
                        }
                      : {
                          color: 'var(--primary)',
                          borderColor: 'var(--primary)',
                          '&:hover': { bgcolor: 'var(--light-blue-bg)' },
                        }),
                  }}
                >
                  {tool.cta}
                </Button>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: 'var(--bg-light)',
          borderTop: '1px solid var(--divider)',
          borderBottom: '1px solid var(--divider)',
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 5, sm: 6 },
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              fontWeight: 700,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              color: 'var(--text-primary)',
              textAlign: 'center',
              mb: 0.5,
            }}
          >
            How It Works
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              fontSize: 'var(--font-size-helper)',
              mb: 4,
            }}
          >
            From job description to interview-ready in 3 steps
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: { xs: 2, sm: 3 },
            }}
          >
            {HOW_IT_WORKS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Box
                  key={step.step}
                  sx={{
                    bgcolor: 'var(--bg-paper)',
                    borderRadius: 2.5,
                    p: 3,
                    border: '1px solid var(--divider)',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Step number watermark */}
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontSize: '3.5rem',
                      fontWeight: 900,
                      color: 'rgba(51,94,222,0.07)',
                      lineHeight: 1,
                      mb: 0.5,
                      userSelect: 'none',
                    }}
                  >
                    {step.step}
                  </Typography>

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: 'var(--light-blue-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <Icon sx={{ fontSize: 22, color: 'var(--primary)' }} />
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      mb: 0.75,
                      fontSize: '0.97rem',
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-family)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.84rem',
                      lineHeight: 1.65,
                    }}
                  >
                    {step.desc}
                  </Typography>

                  {/* Connector arrow (between steps, not on last) */}
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <Box
                      sx={{
                        display: { xs: 'none', sm: 'block' },
                        position: 'absolute',
                        right: -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--primary)',
                        opacity: 0.3,
                        fontSize: '1.4rem',
                        zIndex: 1,
                        pointerEvents: 'none',
                      }}
                    >
                      →
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ── BOTTOM SPACER ───────────────────────────────── */}
      <Box sx={{ pb: 5 }} />
    </Box>
  );
}
