import { useState } from 'react';
import {
  Box, Typography, IconButton, Grid, Chip, alpha, useTheme,
  LinearProgress, Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import PageContainer from '../../components/common/PageContainer';

const PRACTICE_QUESTIONS = [
  { text: 'Tell me about a time you had to deal with a difficult technical challenge.', category: 'Problem Solving', icon: '🔧' },
  { text: 'Describe a situation where you had a conflict with a team member.', category: 'Teamwork', icon: '🤝' },
  { text: 'Give me an example of when you led a project from start to finish.', category: 'Leadership', icon: '🚀' },
  { text: 'Tell me about a time you failed and what you learned from it.', category: 'Self-Awareness', icon: '🌱' },
  { text: 'Describe a time you had to meet a tight deadline under pressure.', category: 'Time Management', icon: '⏰' },
];

const STAR_KEYWORDS = {
  s: ['while', 'when i', 'at my', 'we were', 'working on', 'our team', 'the project', 'last year', 'last quarter', 'at the time', 'situation', 'context', 'during', 'in my', 'i was at'],
  t: ['my role', 'i was responsible', 'i needed to', 'the goal was', 'tasked with', 'had to', 'my task', 'needed to decide', 'responsible for', 'i was asked', 'my job'],
  a: ['i decided', 'i built', 'i implemented', 'i wrote', 'i led', 'i refactored', 'i fixed', 'i proposed', 'i asked', 'i gathered', 'i chose', 'i prototyped', 'i prioritized', 'i communicated', 'i worked', 'i created', 'i designed', 'i introduced', 'i reached out', 'i scheduled'],
  r: ['result', 'as a result', 'outcome', 'reduced', 'improved', 'increased', 'shipped', 'resolved', 'delivered', '%', 'seconds', 'days', 'users', 'revenue', 'latency', 'success', 'deployed', 'launched', 'faster', 'better', 'higher', 'lower'],
};

const STAR_CONFIG = {
  s: { label: 'Situation', desc: 'Set the context — when, where, what was happening', tip: 'Keep it to 1–2 sentences. Interviewers want context, not a full backstory.', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', example: '"While working at Acme as a junior developer last March..."' },
  t: { label: 'Task', desc: 'Your specific responsibility in that situation', tip: 'Use "I" not "we". Be clear about what YOU were responsible for.', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', example: '"My task was to rebuild the authentication flow..."' },
  a: { label: 'Action', desc: 'The specific steps you personally took', tip: 'This is the most important part. Name tools, techniques, and concrete decisions you made.', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', example: '"I decided to implement JWT with a refresh token strategy..."' },
  r: { label: 'Result', desc: 'The quantified outcome and business impact', tip: 'Always end with a number. Even estimates count — "roughly 40% faster" beats "much faster".', color: '#10b981', bg: 'rgba(16,185,129,0.08)', example: '"As a result, login time dropped from 3s to under 800ms."' },
};

function analyzeText(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [key, words] of Object.entries(STAR_KEYWORDS)) {
    const hits = words.filter((w) => lower.includes(w)).length;
    scores[key] = Math.min(100, Math.round((hits / 3) * 100));
  }
  return scores;
}

function calcOverall(scores) {
  return Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / 4);
}

function getWeakestFeedback(scores) {
  const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
  const tips = {
    s: '🎯 Add a sentence describing the context — when and where this happened, and what the environment was like.',
    t: '🎯 Clarify your specific responsibility. Try starting with "My task was to..." or "I was responsible for..."',
    a: '🎯 Your Action section needs more detail. Name the exact tools, decisions, or steps you took — be specific.',
    r: '🎯 Add a quantified result. Even an estimate works: "about 40% faster", "saved roughly 2 hours per week", "reduced errors by half".',
  };
  return tips[weakest[0]];
}

function ScoreRing({ score, color, size = 80 }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={7} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={7}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${dash} ${c}` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontWeight: 900, fontSize: size * 0.2, color }}>{score}</Typography>
      </Box>
    </Box>
  );
}

export default function StarCoach() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionScores, setSessionScores] = useState([]);

  const bg = isDark ? '#0f0f13' : '#f4f5f9';
  const surface = isDark ? '#16161e' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const muted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const textColor = isDark ? '#ffffff' : '#0f0f13';

  const currentQ = PRACTICE_QUESTIONS[questionIndex];
  const liveScores = analyzeText(answer);
  const liveCoveredCount = Object.values(liveScores).filter((v) => v > 0).length;

  const handleAnalyze = () => {
    if (answer.trim().length < 30) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const scores = analyzeText(answer);
      const overall = calcOverall(scores);
      setResult({ scores, overall, feedback: getWeakestFeedback(scores) });
      setSessionScores((prev) => [...prev, overall]);
      setIsAnalyzing(false);
    }, 1400);
  };

  const handleNext = () => {
    setAnswer('');
    setResult(null);
    setQuestionIndex((i) => (i + 1) % PRACTICE_QUESTIONS.length);
  };

  const avgScore = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : null;

  const overallColor = (s) => s >= 75 ? '#10b981' : s >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <PageContainer
      sx={{
        height: 'calc(100vh - var(--navbar-height))',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: 0,
        bgcolor: bg,
      }}
    >
      {/* ── Top bar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: { xs: 2, md: 3 },
          py: 1.5,
          bgcolor: surface,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <IconButton
          onClick={() => navigate('/interview-practice')}
          size="small"
          sx={{
            color: muted,
            border: `1px solid ${border}`,
            borderRadius: 1.5,
            '&:hover': { color: '#10b981', borderColor: 'rgba(16,185,129,0.35)', bgcolor: 'rgba(16,185,129,0.06)' },
          }}
        >
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, color: textColor }}>
            STAR Answer Coach
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: muted, mt: 0.15 }}>
            Behavioral Interview Practice
          </Typography>
        </Box>

        {/* Progress dots */}
        <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
          {PRACTICE_QUESTIONS.map((_, i) => (
            <Box
              key={i}
              onClick={() => { setAnswer(''); setResult(null); setQuestionIndex(i); }}
              sx={{
                width: i === questionIndex ? 22 : 8,
                height: 8,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.25s',
                bgcolor: i < sessionScores.length
                  ? '#10b981'
                  : i === questionIndex
                    ? '#6366f1'
                    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            />
          ))}
        </Box>

        {avgScore !== null && (
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: 2,
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 700 }}>Session Avg</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#10b981', lineHeight: 1 }}>{avgScore}%</Typography>
          </Box>
        )}
      </Box>

      {/* ── Scrollable body ── */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2.5, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* ─ Live STAR detection strip ─ */}
          <Grid container spacing={1.5}>
            {['s', 't', 'a', 'r'].map((key) => {
              const cfg = STAR_CONFIG[key];
              const live = liveScores[key] > 0;
              return (
                <Grid item xs={6} md={3} key={key}>
                  <Tooltip title={<span style={{ fontSize: 12 }}><b>Example:</b> {cfg.example}</span>} arrow placement="bottom">
                    <motion.div animate={{ scale: live ? 1.01 : 1 }} transition={{ duration: 0.2 }}>
                      <Box
                        sx={{
                          p: 1.75,
                          borderRadius: 3,
                          border: `1.5px solid ${live ? cfg.color : border}`,
                          bgcolor: live ? cfg.bg : surface,
                          transition: 'all 0.3s ease',
                          cursor: 'help',
                          boxShadow: live ? `0 4px 16px ${cfg.color}20` : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: live ? cfg.color : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                              color: live ? '#fff' : muted,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 900,
                              transition: 'all 0.3s',
                              boxShadow: live ? `0 3px 10px ${cfg.color}55` : 'none',
                              flexShrink: 0,
                            }}
                          >
                            {live ? <CheckRoundedIcon sx={{ fontSize: 13 }} /> : key.toUpperCase()}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: live ? cfg.color : textColor, lineHeight: 1.2 }}>
                              {cfg.label}
                            </Typography>
                            <Typography sx={{ fontSize: '0.62rem', color: muted }} noWrap>{cfg.desc}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </motion.div>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>

          {/* ─ Question card ─ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={questionIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <Box
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 4,
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.04) 100%)',
                  border: `1px solid ${isDark ? 'rgba(99,102,241,0.22)' : 'rgba(99,102,241,0.15)'}`,
                  boxShadow: isDark ? '0 8px 32px rgba(99,102,241,0.08)' : 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                  <Typography sx={{ fontSize: 34, flexShrink: 0, mt: 0.25 }}>{currentQ.icon}</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.35,
                          borderRadius: 4,
                          bgcolor: 'rgba(99,102,241,0.12)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#6366f1',
                        }}
                      >
                        {currentQ.category}
                      </Box>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.35,
                          borderRadius: 4,
                          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: muted,
                        }}
                      >
                        Q{questionIndex + 1} / {PRACTICE_QUESTIONS.length}
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.6, color: textColor }}>
                      {currentQ.text}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      disabled={questionIndex === 0}
                      onClick={() => { setAnswer(''); setResult(null); setQuestionIndex((i) => i - 1); }}
                      sx={{
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        borderRadius: 1.5,
                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                      }}
                    >
                      <NavigateBeforeRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => { setAnswer(''); setResult(null); setQuestionIndex((i) => (i + 1) % PRACTICE_QUESTIONS.length); }}
                      sx={{
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        borderRadius: 1.5,
                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                      }}
                    >
                      <NavigateNextRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </AnimatePresence>

          {/* ─ Answer input box ─ */}
          <Box
            sx={{
              borderRadius: 4,
              bgcolor: surface,
              border: `1px solid ${border}`,
              overflow: 'hidden',
              boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: `1px solid ${border}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: textColor }}>✍️ Your Answer</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: muted, mt: 0.25 }}>
                Use the STAR structure — try to hit all 4 components
              </Typography>
            </Box>

            {/* Textarea */}
            <textarea
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setResult(null); }}
              disabled={isAnalyzing}
              placeholder={`Start with the Situation...\n\n"While working on [project] at [company], we were [context]..."\n\nThen Task, Action, and Result.`}
              rows={7}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: '20px 24px',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: 1.85,
                background: 'transparent',
                color: isDark ? 'rgba(255,255,255,0.87)' : '#0f0f13',
                boxSizing: 'border-box',
              }}
            />

            {/* Footer */}
            <Box
              sx={{
                px: 3,
                py: 1.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: `1px solid ${border}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: answer.length < 80 ? '#f59e0b' : muted,
                  }}
                >
                  {answer.length} chars
                </Typography>
                {liveCoveredCount > 0 && (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.3,
                      borderRadius: 4,
                      bgcolor: liveCoveredCount === 4 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                      border: `1px solid ${liveCoveredCount === 4 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: liveCoveredCount === 4 ? '#10b981' : '#f59e0b',
                    }}
                  >
                    {liveCoveredCount}/4 STAR detected
                  </Box>
                )}
              </Box>

              <Box
                onClick={answer.trim().length >= 30 && !isAnalyzing ? handleAnalyze : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 3,
                  py: 1,
                  borderRadius: 2.5,
                  background: answer.trim().length >= 30 && !isAnalyzing
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                  color: answer.trim().length >= 30 && !isAnalyzing ? '#fff' : muted,
                  cursor: answer.trim().length >= 30 && !isAnalyzing ? 'pointer' : 'default',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  boxShadow: answer.trim().length >= 30 && !isAnalyzing ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
                  '&:hover': answer.trim().length >= 30 && !isAnalyzing ? { transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' } : {},
                }}
              >
                {isAnalyzing ? (
                  <>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                    Analyze Answer
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* ─ Results ─ */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                  {/* Score header */}
                  <Box
                    sx={{
                      p: 3.5,
                      borderRadius: 4,
                      bgcolor: surface,
                      border: `1px solid ${border}`,
                    }}
                  >
                    {/* Overall row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(99,102,241,0.12)',
                        }}
                      >
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: '#6366f1' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: textColor }}>STAR Analysis Results</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: muted }}>Based on keyword detection and structural analysis</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        {result.overall === 100 && <EmojiEventsRoundedIcon sx={{ color: '#f59e0b', fontSize: 20, mb: 0.25, display: 'block', ml: 'auto' }} />}
                        <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: overallColor(result.overall), lineHeight: 1 }}>
                          {result.overall}%
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: muted, fontWeight: 600 }}>Overall</Typography>
                      </Box>
                    </Box>

                    {/* Score rings */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {['s', 't', 'a', 'r'].map((key) => {
                        const cfg = STAR_CONFIG[key];
                        const score = result.scores[key];
                        return (
                          <Grid item xs={6} md={3} key={key}>
                            <Box
                              sx={{
                                p: 2.5,
                                borderRadius: 3,
                                bgcolor: cfg.bg,
                                border: `1px solid ${cfg.color}30`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1.25,
                              }}
                            >
                              <ScoreRing score={score} color={cfg.color} size={68} />
                              <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: cfg.color }}>{cfg.label}</Typography>
                              {score < 65 ? (
                                <Typography sx={{ fontSize: '0.68rem', color: muted, textAlign: 'center', lineHeight: 1.5 }}>
                                  {cfg.tip.slice(0, 55)}…
                                </Typography>
                              ) : (
                                <Box
                                  sx={{
                                    px: 1.25,
                                    py: 0.3,
                                    borderRadius: 4,
                                    bgcolor: `${cfg.color}20`,
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: cfg.color,
                                  }}
                                >
                                  ✓ Good
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>

                    {/* Progress bars */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {['s', 't', 'a', 'r'].map((key) => {
                        const cfg = STAR_CONFIG[key];
                        const score = result.scores[key];
                        const rc = score >= 65 ? '#10b981' : score >= 35 ? '#f59e0b' : '#ef4444';
                        return (
                          <Box key={key}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textColor }}>{cfg.label}</Typography>
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: rc }}>{score}%</Typography>
                            </Box>
                            <Box
                              sx={{
                                height: 7,
                                borderRadius: 4,
                                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                                overflow: 'hidden',
                              }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                style={{
                                  height: '100%',
                                  background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}aa)`,
                                  borderRadius: 4,
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Priority feedback card */}
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: isDark ? 'rgba(14,165,233,0.06)' : 'rgba(14,165,233,0.03)',
                      border: '1px solid rgba(14,165,233,0.18)',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0ea5e9', mb: 1.25 }}>
                      Priority Improvement
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.85, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}>
                      {result.feedback}
                    </Typography>
                  </Box>

                  {/* Action buttons */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box
                      onClick={() => { setAnswer(''); setResult(null); }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 3,
                        py: 1.25,
                        borderRadius: 2.5,
                        border: `1px solid ${border}`,
                        bgcolor: surface,
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: textColor,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#6366f150', bgcolor: 'rgba(99,102,241,0.05)' },
                      }}
                    >
                      <RefreshRoundedIcon sx={{ fontSize: 17 }} />
                      Rewrite
                    </Box>
                    <Box
                      onClick={handleNext}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 3.5,
                        py: 1.25,
                        borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: '#fff',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' },
                      }}
                    >
                      Next Question
                      <NavigateNextRoundedIcon sx={{ fontSize: 17 }} />
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />
    </PageContainer>
  );
}
