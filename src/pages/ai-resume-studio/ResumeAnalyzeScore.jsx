import { useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  LinearProgress,
  CircularProgress,
  Card,
  Stack,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/* ─── Defaults (fallback if navigation state missing) ───────────────── */

const THEME = {
  primary: 'var(--primary, #335ede)',
  primarySoft: 'rgba(51, 94, 222, 0.08)',
  border: 'var(--divider, rgba(0,0,0,0.08))',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
};

const TOP_FIXES = [
  { label: 'Quantify impact', count: 3, locked: false },
  { label: 'Repetition', count: 2, locked: false },
  { label: 'Leadership & ownership', count: 2, locked: false },
  { label: 'Use of bullets', count: 4, locked: false },
  { label: 'Communication clarity', count: 2, locked: false },
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
    desc: 'Add metrics and numbers to quantify your accomplishments.',
    badge: 'IMPACT',
    locked: false,
  },
  {
    icon: 'cancel',
    title: 'Repetition',
    desc: 'Vary action verbs and phrasing so bullets do not sound repetitive.',
    badge: 'IMPACT',
    locked: false,
  },
  {
    icon: 'cancel',
    title: 'Leadership & collaboration',
    desc: 'Surface examples of leading initiatives, mentoring, or cross-functional work.',
    badge: 'SKILLS',
    locked: false,
  },
];

const DID_WELL = [
  { title: 'Page density', desc: 'Your page layout looks right.' },
  { title: 'Dates are in the right format', desc: 'Your dates are in a clear format.' },
  { title: 'Verb tenses', desc: 'Your action verbs are in the right tense.' },
];

const SCORE = 36;
const MAX_SCORE = 100;

function normalizeIssues(list) {
  if (!Array.isArray(list)) return ISSUE_CARDS;
  return list.map((item) => ({
    ...item,
    locked: false,
    icon: item?.icon === 'lock' || item?.icon === 'locked' ? 'cancel' : item?.icon || 'cancel',
  }));
}

function normalizeTopFixes(list) {
  if (!Array.isArray(list)) return TOP_FIXES;
  return list.map((f) => ({ ...f, locked: false }));
}

function buildAnalytics(issueCards, completed, didWell, topFixes, score, maxScore) {
  const issues = Array.isArray(issueCards) ? issueCards : [];
  const pass = Array.isArray(completed) ? completed : [];
  const strengths = Array.isArray(didWell) ? didWell : [];
  const fixes = Array.isArray(topFixes) ? topFixes : [];

  let impact = 0;
  let skills = 0;
  issues.forEach((i) => {
    const b = String(i?.badge || '').toUpperCase();
    if (b.includes('IMPACT')) impact += 1;
    else skills += 1;
  });
  const issueTotal = issues.length;
  const prioritySignals = fixes.reduce(
    (acc, f) => acc + (typeof f.count === 'number' ? f.count : 0),
    0,
  );

  return {
    issueTotal,
    impact,
    skills,
    passing: pass.length,
    strengths: strengths.length,
    prioritySignals,
    scorePct: Math.round((score / Math.max(maxScore, 1)) * 100),
  };
}

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
function IssueCard({ card, onFix }) {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: 2,
        p: 2.5,
        mb: 2,
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 0 },
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        border: `1px solid ${THEME.border}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0 }}>
        <CancelRoundedIcon sx={{ color: '#ef4444', fontSize: 22, mt: 0.15, flexShrink: 0 }} />
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: THEME.textPrimary, mb: 0.5 }}>
            {card.title}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: THEME.textSecondary, lineHeight: 1.55 }}>
            {card.desc}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: { xs: 0, sm: 2 }, flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}>
        <Chip
          label={card.badge}
          size="small"
          sx={{
            bgcolor: '#1e293b',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: 0.06,
            height: 24,
            borderRadius: 1,
            '& .MuiChip-label': { px: 1 },
          }}
        />
        <Button
          size="small"
          variant="contained"
          disableElevation
          endIcon={<EastRoundedIcon sx={{ fontSize: '14px !important' }} />}
          onClick={onFix}
          sx={{
            bgcolor: THEME.primary,
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.8125rem',
            borderRadius: 1,
            px: 1.75,
            py: 0.5,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: 'var(--primary-dark, #2a4bc4)' },
          }}
        >
          Fix
        </Button>
      </Box>
    </Box>
  );
}

function ReportAnalytics({ analytics }) {
  const a = analytics;
  return (
    <Box
      id="resume-analytics"
      sx={{
        mb: 3,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: `1px solid ${THEME.border}`,
        bgcolor: '#fff',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        scrollMarginTop: 24,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <BarChartRoundedIcon sx={{ color: THEME.primary, fontSize: 22 }} />
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: THEME.textPrimary, lineHeight: 1.3 }}>
            Analytics overview
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary, lineHeight: 1.45 }}>
            Full snapshot of this analysis run — issues, passing checks, and category mix.
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1.5,
          mb: 2.5,
          width: '100%',
        }}
      >
        {[
          { label: 'Score', value: `${a.scorePct}%`, hint: 'vs max' },
          { label: 'Issues flagged', value: a.issueTotal, hint: 'to improve' },
          { label: 'Checks passed', value: a.passing, hint: 'this run' },
          { label: 'Strengths', value: a.strengths, hint: 'highlighted' },
        ].map((row) => (
          <Box
            key={row.label}
            sx={{
              p: 1.75,
              borderRadius: 1.5,
              bgcolor: '#f8fafc',
              border: `1px solid ${THEME.border}`,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: 0.06,
                color: THEME.textSecondary,
                textTransform: 'uppercase',
                mb: 0.75,
              }}
            >
              {row.label}
            </Typography>
            <Typography sx={{ fontSize: '1.375rem', fontWeight: 800, color: THEME.textPrimary, lineHeight: 1.15 }}>
              {row.value}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: THEME.textSecondary, mt: 0.35 }}>{row.hint}</Typography>
          </Box>
        ))}
      </Box>

      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.06, color: THEME.textSecondary, textTransform: 'uppercase', mb: 1 }}>
        Issue mix by category
      </Typography>
      <Stack spacing={1.25}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: THEME.textPrimary }}>Impact & metrics</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary }}>{a.impact} issues</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={a.issueTotal ? (a.impact / a.issueTotal) * 100 : 0}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: '#f1f5f9',
              '& .MuiLinearProgress-bar': { bgcolor: THEME.primary, borderRadius: 1 },
            }}
          />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: THEME.textPrimary }}>Skills & presentation</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary }}>{a.skills} issues</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={a.issueTotal ? (a.skills / a.issueTotal) * 100 : 0}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: '#f1f5f9',
              '& .MuiLinearProgress-bar': { bgcolor: '#0d9488', borderRadius: 1 },
            }}
          />
        </Box>
      </Stack>

      {a.prioritySignals > 0 && (
        <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary, mt: 2, lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-primary)' }}>{a.prioritySignals}</strong> priority signals across your top fix areas — see the sidebar for detail.
        </Typography>
      )}
    </Box>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function ResumeAnalyzeScore() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((s) => s.auth?.user);

  const resumeUrl = location.state?.resumeUrl || null;
  const fileName = location.state?.fileName || 'resume.pdf';
  const analysis = location.state?.analysis || null;

  const score = analysis?.score ?? SCORE;
  const maxScore = analysis?.max_score ?? MAX_SCORE;
  const topFixes = useMemo(
    () => normalizeTopFixes(analysis?.top_fixes ?? TOP_FIXES),
    [analysis?.top_fixes],
  );
  const completed = analysis?.completed ?? COMPLETED;
  const issueCards = useMemo(
    () => normalizeIssues(analysis?.issues ?? ISSUE_CARDS),
    [analysis?.issues],
  );
  const didWell = analysis?.did_well ?? DID_WELL;

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'there';
  const greeting =
    typeof window !== 'undefined'
      ? new Date().getHours() < 12
        ? 'Good morning'
        : new Date().getHours() < 17
          ? 'Good afternoon'
          : 'Good evening'
      : 'Hello';

  const scoreSummaryIntro =
    score >= 75
      ? `Strong work — your resume is in great shape. Use the prioritized fixes below to push even higher and stand out to recruiters and ATS.`
      : score >= 50
        ? `You're on the right track. The items below are ranked by impact — addressing them can materially improve how both recruiters and ATS systems read your resume.`
        : `We've identified high-impact improvements below. Tackling these first typically yields the biggest score gains and clearer positioning for roles you're targeting.`;

  const [activeTab, setActiveTab] = useState('latest');
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

  const pdfPageWidth = useMemo(() => {
    if (!containerWidth) return undefined;
    const padding = 32;
    const raw = containerWidth - padding;
    return Math.min(Math.max(raw, 220), 720);
  }, [containerWidth]);

  const analytics = useMemo(
    () => buildAnalytics(issueCards, completed, didWell, topFixes, score, maxScore),
    [issueCards, completed, didWell, topFixes, score, maxScore],
  );

  const [previewOpen, setPreviewOpen] = useState(true);

  const scrollToIssues = () => {
    const el = document.getElementById('resume-analysis-issues');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        minWidth: 0,
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        bgcolor: '#fafbfc',
        fontFamily: 'var(--font-family)',
        boxSizing: 'border-box',
      }}
    >
      {/* ── LEFT SCORE SIDEBAR ───────────────────────────── */}
      <Box
        sx={{
          width: 240,
          minWidth: 240,
          bgcolor: '#fff',
          borderRight: `1px solid ${THEME.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          flexShrink: 0,
          boxShadow: '1px 0 0 rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Score circle */}
        <Box sx={{ px: 2, pt: 3, pb: 2, textAlign: 'center' }}>
          <ScoreCircle score={score} max={maxScore} />
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: 0.08,
              color: THEME.textSecondary,
              mt: 0.75,
              textTransform: 'uppercase',
            }}
          >
            Overall score
          </Typography>
        </Box>

        <Divider />

        {/* TOP FIXES */}
        <Box sx={{ pt: 1.5 }}>
          <Typography
            sx={{
              px: 2,
              py: 0.5,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: 0.08,
              color: THEME.textSecondary,
              textTransform: 'uppercase',
            }}
          >
            Priority fixes
          </Typography>

          {topFixes.map((fix) => (
            <Box
              key={fix.label}
              onClick={() => scrollToIssues()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                cursor: 'pointer',
                borderRadius: 1,
                mx: 0.5,
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: THEME.primarySoft },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: THEME.textPrimary,
                  fontWeight: 500,
                }}
              >
                {fix.label}
              </Typography>
              <Chip
                label={fix.count != null ? fix.count : '—'}
                size="small"
                sx={{
                  height: 22,
                  minWidth: 28,
                  bgcolor: '#fef2f2',
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* COMPLETED */}
        <Box>
          <Typography
            sx={{
              px: 2,
              py: 0.5,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: 0.08,
              color: THEME.textSecondary,
              textTransform: 'uppercase',
            }}
          >
            Passing checks
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
              <Typography sx={{ fontSize: '0.8125rem', color: THEME.textPrimary, fontWeight: 500 }}>
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

        </Box>

        {/* Tools */}
        <Divider sx={{ my: 1.5, borderColor: THEME.border }} />
        <Box>
          <Typography
            sx={{
              px: 2,
              py: 0.5,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: 0.08,
              color: THEME.textSecondary,
              textTransform: 'uppercase',
            }}
          >
            Next steps
          </Typography>
          {[
            {
              label: 'Resume generator',
              to: '/resume-generator',
              icon: <AutoFixHighRoundedIcon sx={{ fontSize: 18, color: THEME.primary }} />,
            },
            {
              label: 'ATS job scan',
              to: '/job-scan',
              icon: <InsightsRoundedIcon sx={{ fontSize: 18, color: THEME.primary }} />,
            },
          ].map((tool) => (
            <Box
              key={tool.label}
              onClick={() => navigate(tool.to)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                px: 2,
                py: 1.1,
                cursor: 'pointer',
                borderRadius: 1,
                mx: 0.5,
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: THEME.primarySoft },
              }}
            >
              {tool.icon}
              <Typography sx={{ fontSize: '0.8125rem', color: THEME.textPrimary, fontWeight: 600 }}>
                {tool.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />
      </Box>

      {/* ── CENTER ANALYSIS AREA ────────────────────────── */}
      <Box
        sx={{
          flex: '1 1 0%',
          overflow: 'auto',
          px: { xs: 2, sm: 2.5, md: 3 },
          py: 3,
          minWidth: 0,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <PageBreadcrumb
          items={[
            { label: 'AI Resume Studio', to: '/ai-resume-studio', showBackIcon: true },
            { label: 'Resume Scan', to: '/resume-analyzer' },
            { label: 'Analysis report' },
          ]}
          sx={{ mb: 2, pb: 1.5 }}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 3 }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              bgcolor: '#fff',
              borderRadius: 2,
              p: 0.5,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              alignSelf: { xs: 'flex-start', sm: 'center' },
            }}
          >
            {[
              { id: 'latest', label: 'Latest score', icon: <BoltRoundedIcon sx={{ fontSize: 16 }} /> },
              { id: 'previous', label: 'Previous', icon: <HistoryRoundedIcon sx={{ fontSize: 16 }} /> },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="small"
                startIcon={tab.icon}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  bgcolor: activeTab === tab.id ? THEME.primary : 'transparent',
                  color: activeTab === tab.id ? '#fff' : THEME.textSecondary,
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  px: 1.75,
                  py: 0.65,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: activeTab === tab.id ? 'var(--primary-dark, #2a4bc4)' : THEME.primarySoft,
                  },
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {previewOpen ? (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<CloseRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setPreviewOpen(false)}
                sx={{
                  borderColor: THEME.border,
                  color: THEME.textSecondary,
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                  borderRadius: 1,
                  px: 1.5,
                  '&:hover': { borderColor: THEME.primary, bgcolor: THEME.primarySoft, color: THEME.primary },
                }}
              >
                Hide preview
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setPreviewOpen(true)}
                sx={{
                  borderColor: THEME.primary,
                  color: THEME.primary,
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                  borderRadius: 1,
                  px: 1.5,
                  '&:hover': { bgcolor: THEME.primarySoft },
                }}
              >
                Show resume preview
              </Button>
            )}
          </Stack>
        </Stack>

        {activeTab === 'previous' && (
          <Card
            elevation={0}
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: 2,
              border: `1px solid ${THEME.border}`,
              bgcolor: '#fff',
            }}
          >
            <Typography sx={{ fontSize: '0.875rem', color: THEME.textSecondary }}>
              History view is coming soon. This report reflects your latest analysis run.
            </Typography>
          </Card>
        )}

        {/* Greeting */}
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.4rem' },
            fontWeight: 800,
            color: THEME.textPrimary,
            mb: 0.5,
          }}
        >
          {greeting}, {displayName}.
        </Typography>
        <Typography sx={{ color: THEME.textSecondary, mb: 2.5, fontSize: '0.9375rem', lineHeight: 1.5 }}>
          Full AI analysis of your resume — prioritized fixes, passing checks, and strengths.
        </Typography>

        {activeTab === 'latest' && (
        <>
        {/* Score summary card */}
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            p: 3,
            mb: 3,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            border: `1px solid ${THEME.border}`,
          }}
        >
          <Typography
            sx={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: THEME.textPrimary,
              mb: 1,
            }}
          >
            Your resume scored {score} out of {maxScore}
          </Typography>
          <Typography
            sx={{ color: THEME.textSecondary, mb: 2.5, fontSize: '0.9375rem', lineHeight: 1.65 }}
          >
            {scoreSummaryIntro}
          </Typography>

          {/* Score comparison bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: THEME.textSecondary, letterSpacing: 0.06 }}>
              YOUR RESUME
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', letterSpacing: 0.06 }}>
              STRONG RESUMES (BENCHMARK)
            </Typography>
          </Box>

          <Box sx={{ position: 'relative', borderRadius: 10, overflow: 'visible' }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (score / maxScore) * 100)}
              sx={{
                height: 18,
                borderRadius: 10,
                bgcolor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${THEME.primary}, #1e40af)`,
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

        <ReportAnalytics analytics={analytics} />

        <Box id="resume-analysis-issues" sx={{ scrollMarginTop: 24 }}>
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: THEME.textPrimary,
            mb: 0.75,
          }}
        >
          Priority improvements
        </Typography>
        <Typography
          sx={{ color: THEME.textSecondary, mb: 2.5, fontSize: '0.875rem', lineHeight: 1.6 }}
        >
          Actionable items ranked by impact. Use Fix to jump to the resume generator or keep this report open while you edit.
        </Typography>

        {issueCards.map((card, i) => (
          <IssueCard
            key={`${card.title}-${i}`}
            card={card}
            onFix={() => navigate('/resume-generator')}
          />
        ))}
        </Box>

        {/* What you did well */}
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: THEME.textPrimary,
            mb: 0.75,
          }}
        >
          Strengths we found
        </Typography>
        <Typography
          sx={{ color: THEME.textSecondary, mb: 2.5, fontSize: '0.875rem', lineHeight: 1.6 }}
        >
          Highlights from our checks — keep reinforcing these in your next draft.
        </Typography>

        {didWell.map((item, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              mb: 2,
              bgcolor: '#fff',
              borderRadius: 2,
              p: 2.5,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              border: `1px solid ${THEME.border}`,
            }}
          >
            <CheckCircleRoundedIcon sx={{ color: '#16a34a', fontSize: 22, mt: 0.15, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: THEME.textPrimary, mb: 0.35 }}>
                {item.title}
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: THEME.textSecondary, lineHeight: 1.5 }}>
                {item.desc}
              </Typography>
            </Box>
          </Box>
        ))}
        </>
        )}
      </Box>

      {/* ── RIGHT RESUME PREVIEW ────────────────────────── */}
      {previewOpen && (
      <Box
        sx={{
          width: { xs: '0%', md: '40%' },
          minWidth: { md: 360 },
          bgcolor: '#fafbfc',
          borderLeft: `1px solid ${THEME.border}`,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: '#fff',
            borderBottom: `1px solid ${THEME.border}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: THEME.textPrimary, mb: 0.25 }}>
              Resume preview
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: THEME.textSecondary, fontWeight: 500 }}>
              PDF · scroll to review alongside feedback
            </Typography>
          </Box>
          {fileName ? (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: THEME.textSecondary,
                fontWeight: 600,
                textAlign: 'right',
                maxWidth: '52%',
                wordBreak: 'break-word',
                lineHeight: 1.35,
              }}
            >
              {fileName}
            </Typography>
          ) : null}
        </Box>

        <Box
          ref={pdfContainerRef}
          sx={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
            bgcolor: '#eef1f4',
            px: 2,
            py: 2,
            minHeight: 0,
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
                    bgcolor: 'rgba(238, 241, 244, 0.92)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10,
                  }}
                >
                  <CircularProgress size={40} thickness={4} sx={{ color: THEME.primary }} />
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
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: '0 4px 24px rgba(15, 23, 42, 0.12)',
                      bgcolor: '#fff',
                      display: 'block',
                      width: '100%',
                    }}
                  >
                    <Page
                      pageNumber={i + 1}
                      width={pdfPageWidth}
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
                minHeight: 280,
                gap: 1.5,
                color: THEME.textSecondary,
              }}
            >
              <InsightsRoundedIcon sx={{ fontSize: 48, opacity: 0.35 }} />
              <Typography sx={{ fontSize: '0.9rem' }}>No resume to preview</Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/resume-analyzer')}
                sx={{
                  borderColor: THEME.primary,
                  color: THEME.primary,
                  fontSize: '0.8125rem',
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { borderColor: THEME.primary, bgcolor: THEME.primarySoft },
                }}
              >
                Upload resume
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      )}
    </Box>
  );
}
