import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Divider,
  LinearProgress,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/* ─── Static data ─────────────────────────────────────── */

const TOP_FIXES = [
  { label: 'Quantify impact', count: 3, locked: false },
  { label: 'Repetition', count: 2, locked: false },
  { label: 'Leadership', count: null, locked: true },
  { label: 'Use of bullets', count: 4, locked: false },
  { label: 'Communication', count: null, locked: true },
];

const COMPLETED = [
  { label: 'Buzzwords', count: 10 },
  { label: 'Dates', count: 10 },
  { label: 'Unnecessary sentences', count: 10 },
];

const ISSUE_CARDS = [
  {
    icon: 'cancel',
    title: 'Quantify impact',
    desc: 'Add more numbers to quantify your accomplishments',
    badge: 'IMPACT',
    locked: false,
  },
  {
    icon: 'cancel',
    title: 'Repetition',
    desc: 'Use different action words and phrases instead of overusing the same ones',
    badge: 'IMPACT',
    locked: false,
  },
  {
    icon: 'lock',
    title: 'Leadership',
    desc: 'This check is only for Pro users. Upgrade to unlock this check.',
    badge: 'SKILLS',
    locked: true,
  },
];

const DID_WELL = [
  { title: 'Page density', desc: 'Your page layout looks right.' },
  { title: 'Dates are in the right format', desc: 'Your dates are in the right format.' },
  { title: 'Verb tenses', desc: 'Your action verbs are in the right tense.' },
];

const SCORE = 36;
const MAX_SCORE = 100;

/* ─── Circular Score SVG ──────────────────────────────── */
function ScoreCircle({ score, max = 100, size = 90 }) {
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (score / max) * circumference;
  const color = score < 40 ? '#ef4444' : score < 70 ? '#f59e0b' : '#22c55e';

  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={7} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>
          {score}
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── Fix Issue Card ─────────────────────────────────── */
function IssueCard({ card }) {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 2.5,
        p: 2.5,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #f0f0f0',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {card.locked ? (
          <LockRoundedIcon sx={{ color: '#9ca3af', fontSize: 20, mt: 0.25 }} />
        ) : (
          <CancelRoundedIcon sx={{ color: '#ef4444', fontSize: 20, mt: 0.25 }} />
        )}
        <Box>
          <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', mb: 0.3 }}>
            {card.title}
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {card.desc}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2, flexShrink: 0 }}>
        <Chip
          label={card.badge}
          size="small"
          sx={{
            bgcolor: '#1f2937',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: 0.5,
            height: 22,
            borderRadius: 0.8,
            '& .MuiChip-label': { px: 1 },
          }}
        />
        {!card.locked && (
          <Button
            size="small"
            variant="contained"
            endIcon={<EastRoundedIcon sx={{ fontSize: '13px !important' }} />}
            sx={{
              bgcolor: '#3b82f6',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.78rem',
              borderRadius: 1.5,
              px: 1.5,
              py: 0.5,
              textTransform: 'none',
              '&:hover': { bgcolor: '#2563eb' },
            }}
          >
            FIX
          </Button>
        )}
      </Box>
    </Box>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function ResumeAnalyzeScore() {
  const navigate = useNavigate();
  const location = useLocation();

  const resumeUrl = location.state?.resumeUrl || null;
  const fileName = location.state?.fileName || 'resume.pdf';
  const analysis = location.state?.analysis || null;

  const score = analysis?.score ?? SCORE;
  const maxScore = analysis?.max_score ?? MAX_SCORE;
  const topFixes = analysis?.top_fixes ?? TOP_FIXES;
  const completed = analysis?.completed ?? COMPLETED;
  const issueCards = analysis?.issues ?? ISSUE_CARDS;
  const didWell = analysis?.did_well ?? DID_WELL;

  const [activeTab, setActiveTab] = useState('latest');
  const [activeSection, setActiveSection] = useState('fixes');
  const [numPages, setNumPages] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(null);

  const pdfContainerRef = useCallback((node) => {
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(node);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        bgcolor: 'var(--bg-app)',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* ── LEFT SCORE SIDEBAR ───────────────────────────── */}
      <Box
        sx={{
          width: 230,
          minWidth: 230,
          bgcolor: 'white',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          flexShrink: 0,
        }}
      >
        {/* Score circle */}
        <Box sx={{ px: 2, pt: 3, pb: 2, textAlign: 'center' }}>
          <ScoreCircle score={score} max={maxScore} />
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: 1.2,
              color: '#9ca3af',
              mt: 0.5,
              textTransform: 'uppercase',
            }}
          >
            Overall
          </Typography>
        </Box>

        <Divider />

        {/* TOP FIXES */}
        <Box sx={{ pt: 1.5 }}>
          <Typography
            sx={{
              px: 2,
              py: 0.5,
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: 1.5,
              color: '#9ca3af',
              textTransform: 'uppercase',
            }}
          >
            Top Fixes
          </Typography>

          {topFixes.map((fix) => (
            <Box
              key={fix.label}
              onClick={() => !fix.locked && setActiveSection('fixes')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                cursor: fix.locked ? 'default' : 'pointer',
                borderRadius: 1,
                mx: 0.5,
                '&:hover': { bgcolor: '#f9fafb' },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.84rem',
                  color: fix.locked ? '#9ca3af' : '#374151',
                  fontFamily: 'var(--font-family)',
                }}
              >
                {fix.label}
              </Typography>
              {fix.locked ? (
                <LockRoundedIcon sx={{ fontSize: 13, color: '#c4c9d4' }} />
              ) : (
                <Chip
                  label={fix.count}
                  size="small"
                  sx={{
                    height: 19,
                    minWidth: 24,
                    bgcolor: '#fee2e2',
                    color: '#ef4444',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    '& .MuiChip-label': { px: 0.8 },
                  }}
                />
              )}
            </Box>
          ))}

          <Box sx={{ px: 1.5, mt: 1 }}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#374151',
                color: '#374151',
                fontSize: '0.72rem',
                fontWeight: 700,
                py: 0.5,
                borderRadius: 1.5,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                '&:hover': { bgcolor: '#f9fafb', borderColor: '#1f2937' },
              }}
            >
              11 MORE ISSUES +
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* COMPLETED */}
        <Box>
          <Typography
            sx={{
              px: 2,
              py: 0.5,
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: 1.5,
              color: '#9ca3af',
              textTransform: 'uppercase',
            }}
          >
            Completed
          </Typography>

          {completed.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
              }}
            >
              <Typography
                sx={{ fontSize: '0.84rem', color: '#374151', fontFamily: 'var(--font-family)' }}
              >
                {item.label}
              </Typography>
              <Chip
                label={item.count}
                size="small"
                sx={{
                  height: 19,
                  minWidth: 24,
                  bgcolor: '#d1fae5',
                  color: '#059669',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  '& .MuiChip-label': { px: 0.8 },
                }}
              />
            </Box>
          ))}

          <Box sx={{ px: 1.5, mt: 1 }}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#6b7280',
                color: '#6b7280',
                fontSize: '0.72rem',
                fontWeight: 700,
                py: 0.5,
                borderRadius: 1.5,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                '&:hover': { bgcolor: '#f9fafb' },
              }}
            >
              1 MORE CHECKS +
            </Button>
          </Box>
        </Box>

        {/* Tools */}
        <Divider sx={{ my: 1.5 }} />
        <Box>
          <Typography
            sx={{
              px: 2,
              py: 0.5,
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: 1.5,
              color: '#9ca3af',
              textTransform: 'uppercase',
            }}
          >
            Tools
          </Typography>
          {[
            { label: 'Resume Rewriter', icon: <AutoFixHighRoundedIcon sx={{ fontSize: 15 }} /> },
            { label: 'ATS Keywords', icon: <InsightsRoundedIcon sx={{ fontSize: 15 }} /> },
          ].map((tool) => (
            <Box
              key={tool.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                px: 2,
                py: 1,
                cursor: 'pointer',
                borderRadius: 1,
                mx: 0.5,
                '&:hover': { bgcolor: '#f9fafb' },
              }}
            >
              <Box sx={{ color: '#6b7280' }}>{tool.icon}</Box>
              <Typography
                sx={{ fontSize: '0.84rem', color: '#374151', fontFamily: 'var(--font-family)' }}
              >
                {tool.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Unlock button */}
        <Box sx={{ p: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<StarRoundedIcon sx={{ fontSize: '16px !important' }} />}
            sx={{
              bgcolor: '#1f2937',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.78rem',
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { bgcolor: '#111827' },
            }}
          >
            Unlock full report
          </Button>
        </Box>
      </Box>

      {/* ── CENTER ANALYSIS AREA ────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: { xs: 2, md: 3 },
          py: 3,
          minWidth: 0,
        }}
      >
        {/* Back button + tabs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Tooltip title="Back to Analyzer">
            <IconButton
              size="small"
              onClick={() => navigate('/resume-analyzer')}
              sx={{ bgcolor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#f9fafb' } }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', bgcolor: 'white', borderRadius: 2, p: 0.5, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {[
              { id: 'latest', label: 'LATEST SCORE', icon: <BoltRoundedIcon sx={{ fontSize: 14 }} /> },
              { id: 'previous', label: 'PREVIOUS SCORE', icon: <HistoryRoundedIcon sx={{ fontSize: 14 }} /> },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="small"
                startIcon={tab.icon}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  bgcolor: activeTab === tab.id ? '#1a1a2e' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: 0.5,
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 1.5,
                  textTransform: 'uppercase',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: activeTab === tab.id ? '#1a1a2e' : '#f3f4f6',
                  },
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Greeting */}
        <Typography
          sx={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#1a1a2e',
            mb: 0.3,
            fontFamily: 'var(--font-family)',
          }}
        >
          Good afternoon, User.
        </Typography>
        <Typography sx={{ color: '#6b7280', mb: 2.5, fontFamily: 'var(--font-family)' }}>
          Welcome to your resume review.
        </Typography>

        {/* Score summary card */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 2.5,
            p: 3,
            mb: 3,
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
          }}
        >
          <Typography
            sx={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#1a1a2e',
              mb: 1,
              fontFamily: 'var(--font-family)',
            }}
          >
            Your resume scored {score} out of {maxScore}.
          </Typography>
          <Typography
            sx={{ color: '#6b7280', mb: 2.5, fontSize: '0.9rem', lineHeight: 1.7, fontFamily: 'var(--font-family)' }}
          >
            It seems like your resume scored poorly on key checks that hiring managers and resume
            screening software scan your resume for. But don't worry! With a few simple changes to
            your resume, you can increase your score by 40+ points. We'll go through them in this
            report.
          </Typography>

          {/* Score comparison bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', letterSpacing: 0.5 }}>
              YOUR RESUME
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: 0.5 }}>
              TOP RESUMES
            </Typography>
          </Box>

          <Box sx={{ position: 'relative', borderRadius: 10, overflow: 'visible' }}>
            <LinearProgress
              variant="determinate"
              value={score}
              sx={{
                height: 18,
                borderRadius: 10,
                bgcolor: '#f3f4f6',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #1f2937, #374151)',
                  borderRadius: 10,
                },
              }}
            />
            {/* Top resumes marker */}
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: -3,
                height: 24,
                width: 3,
                bgcolor: '#22c55e',
                borderRadius: 2,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af' }}>0</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af' }}>100</Typography>
          </Box>

          <Box
            sx={{
              mt: 2.5,
              p: 2,
              bgcolor: '#fffbeb',
              borderRadius: 2,
              border: '1px solid #fef3c7',
              display: 'flex',
              gap: 1.5,
            }}
          >
            <Typography sx={{ fontSize: '1rem' }}>💡</Typography>
            <Typography sx={{ fontSize: '0.84rem', color: '#92400e', lineHeight: 1.6, fontFamily: 'var(--font-family)' }}>
              Use the feedback to find and fix errors in your resume, then reupload it to get a new
              score. <strong>80% of people increase their score by over 20 points</strong> with just
              three uploads and revisions.
            </Typography>
          </Box>
        </Box>

        {/* Steps to increase score */}
        <Typography
          sx={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#1a1a2e',
            mb: 0.8,
            fontFamily: 'var(--font-family)',
          }}
        >
          Steps to increase your score
        </Typography>
        <Typography
          sx={{ color: '#6b7280', mb: 2.5, fontSize: '0.88rem', lineHeight: 1.6, fontFamily: 'var(--font-family)' }}
        >
          Here are some recruiter checks that are bringing your score down. Click into each to learn
          where you went wrong and how to improve your score.
        </Typography>

        {issueCards.map((card, i) => (
          <IssueCard key={i} card={card} />
        ))}

        {/* More issues */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 2.5,
            p: 2.5,
            mb: 3,
            textAlign: 'center',
            border: '1.5px dashed #e5e7eb',
          }}
        >
          <LockRoundedIcon sx={{ color: '#9ca3af', mb: 0.5 }} />
          <Typography sx={{ fontWeight: 600, color: '#374151', mb: 0.3, fontFamily: 'var(--font-family)' }}>
            11 more issues unlocked
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#6b7280', mb: 1.5, fontFamily: 'var(--font-family)' }}>
            Upgrade to Pro to unlock all issues and get the full picture.
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<StarRoundedIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              bgcolor: '#1f2937',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { bgcolor: '#111827' },
            }}
          >
            Unlock Full Report
          </Button>
        </Box>

        {/* What you did well */}
        <Typography
          sx={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#1a1a2e',
            mb: 0.8,
            fontFamily: 'var(--font-family)',
          }}
        >
          What you did well
        </Typography>
        <Typography
          sx={{ color: '#6b7280', mb: 2.5, fontSize: '0.88rem', lineHeight: 1.6, fontFamily: 'var(--font-family)' }}
        >
          We ran 20+ checks on your resume. Here's a rundown of three key areas you did well in –
          well done.
        </Typography>

        {didWell.map((item, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              mb: 2,
              bgcolor: 'white',
              borderRadius: 2.5,
              p: 2.5,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0',
            }}
          >
            <CheckCircleRoundedIcon sx={{ color: '#22c55e', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
            <Box>
              <Typography
                sx={{ fontWeight: 600, fontSize: '0.92rem', color: '#1a1a2e', mb: 0.3, fontFamily: 'var(--font-family)' }}
              >
                {item.title}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#6b7280', fontFamily: 'var(--font-family)' }}>
                {item.desc}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── RIGHT RESUME PREVIEW ────────────────────────── */}
      <Box
        sx={{
          width: { xs: '0%', md: '42%' },
          minWidth: { md: 340 },
          bgcolor: '#f1f3f5',
          borderLeft: '1px solid #e5e7eb',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: 'white',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e', fontFamily: 'var(--font-family)' }}
          >
            Resume Preview
          </Typography>
          {fileName && (
            <Chip
              label={fileName.length > 22 ? fileName.slice(0, 22) + '...' : fileName}
              size="small"
              sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontSize: '0.72rem', height: 22 }}
            />
          )}
        </Box>

        {/* PDF / file display */}
        <Box
          ref={pdfContainerRef}
          sx={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
            bgcolor: '#e8e8e8',
            px: 2,
            py: 2,
          }}
        >
          {resumeUrl ? (
            <>
              {pdfLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#e8e8e8',
                    zIndex: 2,
                  }}
                >
                  <CircularProgress size={32} sx={{ color: 'var(--primary)' }} />
                </Box>
              )}
              <Document
                file={resumeUrl}
                onLoadSuccess={({ numPages: n }) => {
                  setNumPages(n);
                  setPdfLoading(false);
                }}
                onLoadError={() => setPdfLoading(false)}
                loading={null}
              >
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <Box
                    key={i}
                    sx={{
                      mb: 2,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                      display: 'inline-block',
                      width: '100%',
                    }}
                  >
                    <Page
                      pageNumber={i + 1}
                      width={containerWidth ? containerWidth - 32 : undefined}
                      renderAnnotationLayer
                      renderTextLayer
                    />
                  </Box>
                ))}
              </Document>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 1.5,
                color: '#9ca3af',
              }}
            >
              <InsightsRoundedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
              <Typography sx={{ fontSize: '0.9rem', fontFamily: 'var(--font-family)' }}>
                No resume to preview
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/resume-analyzer')}
                sx={{
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  fontSize: '0.8rem',
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Upload Resume
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
