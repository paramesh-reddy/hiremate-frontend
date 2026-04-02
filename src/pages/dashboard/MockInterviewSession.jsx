import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, IconButton, Grid, Chip, Tooltip, useTheme, LinearProgress, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { Trophy, Wrench, Compass, Book, Clock, Lightbulb, Mic, Sparkles, ChevronRight, CheckCircle2, X } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';

const ICON_MAP = {
  wrench: Wrench,
  compass: Compass,
  book: Book,
  clock: Clock,
};

const QUESTIONS = [
  {
    text: 'Tell me about a time you had to deal with a difficult technical challenge. How did you handle it?',
    category: 'Problem Solving',
    difficulty: 'Medium',
    icon: 'wrench',
    tip: 'Be specific about the obstacle. Quantify the impact of your fix — numbers always land better than adjectives.',
    starKeywords: {
      s: ['while', 'at my', 'we were', 'working on', 'our team', 'the project', 'when i', 'last year', 'last month', 'during'],
      t: ['my role', 'i was responsible', 'i needed to', 'the goal was', 'tasked with', 'had to', 'needed to'],
      a: ['i decided', 'i built', 'i implemented', 'i wrote', 'i led', 'i refactored', 'i fixed', 'i proposed', 'i created', 'i designed'],
      r: ['result', 'reduced', 'improved', 'increased', 'shipped', 'resolved', '%', 'seconds', 'days', 'users', 'faster', 'better'],
    },
  },
  {
    text: 'Describe a situation where you had to make a technical decision with incomplete information.',
    category: 'Decision Making',
    difficulty: 'Hard',
    icon: 'compass',
    tip: 'Show that you can move forward under uncertainty. Mention what you did to reduce risk and how you validated the decision.',
    starKeywords: {
      s: ['while', 'we had', 'the situation', 'at the time', 'faced with', 'when', 'during'],
      t: ['needed to decide', 'had to choose', 'my task', 'responsible for', 'i had to'],
      a: ['i gathered', 'i prototyped', 'i consulted', 'i decided', 'i chose', 'i tested', 'i researched'],
      r: ['worked out', 'deployed', 'successful', 'learned', 'shipped', 'reduced', 'improved', 'result'],
    },
  },
  {
    text: 'How do you stay up-to-date with the latest in your field? Give a concrete example.',
    category: 'Growth Mindset',
    difficulty: 'Easy',
    icon: 'book',
    tip: 'Name a specific resource and a specific thing you applied at work. Vague answers about "following blogs" score poorly.',
    starKeywords: {
      s: ['recently', 'last month', 'i read', 'i watched', 'i attended', 'i discovered', 'i found'],
      t: ['wanted to learn', 'needed to understand', 'to apply', 'to improve'],
      a: ['i tried', 'i implemented', 'i built', 'i experimented', 'i used', 'i applied', 'i practiced'],
      r: ['now i use', 'it helped', 'it improved', 'we adopted', 'shipped', 'better', 'faster'],
    },
  },
  {
    text: 'Tell me about a time you had to deliver a project under tight deadline pressure.',
    category: 'Time Management',
    difficulty: 'Medium',
    icon: 'clock',
    tip: 'Interviewers want to see composure and scope management — not heroic all-nighters. Show how you communicated with stakeholders.',
    starKeywords: {
      s: ['the deadline', 'we had', 'sprint', 'launch date', 'tight timeline', 'under pressure'],
      t: ['responsible for', 'i had to', 'my task', 'needed to ship', 'i was asked'],
      a: ['i prioritized', 'i cut scope', 'i communicated', 'i asked', 'i delegated', 'i focused', 'i broke down'],
      r: ['shipped', 'delivered', 'on time', 'met the deadline', 'launched', 'success'],
    },
  },
];

const STAR_CONFIG = {
  s: { label: 'Situation', desc: 'Set the scene', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  t: { label: 'Task', desc: 'Your responsibility', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  a: { label: 'Action', desc: 'Steps you took', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  r: { label: 'Result', desc: 'Quantified outcome', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
};

const DIFF_META = {
  Easy: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  Medium: { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  Hard: { color: '#1d4ed8', bg: 'rgba(29,78,216,0.1)' },
};

const SAMPLE_AI_FEEDBACK = [
  "Good start on Situation — consider adding a specific timestamp or team context to ground the interviewer.",
  "Strong Action section. Try to quantify the impact in the Result part more precisely.",
  "Excellent use of STAR structure! Your Result is concrete and memorable.",
  "Your Task is clear. The Action section could benefit from naming specific tools or techniques you used.",
];

function detectStar(text, keywords) {
  const lower = text.toLowerCase();
  const covered = {};
  for (const [key, words] of Object.entries(keywords)) {
    covered[key] = words.some((w) => lower.includes(w));
  }
  return covered;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function scoreColor(s) {
  return s >= 75 ? '#2563eb' : s >= 50 ? '#0ea5e9' : 'rgba(37,99,235,0.6)';
}

export default function MockInterviewSession() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const bg = 'background.default';
  const surface = 'background.paper';
  const border = 'divider';
  const muted = 'text.secondary';
  const textColor = 'text.primary';

  const [activeIndex, setActiveIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [baseText, setBaseText] = useState('');
  const timerRef = useRef(null);

  const { isListening, transcript, start, stop, reset: resetTranscript, isSupported, error: speechError } = useSpeechRecognition();

  // Handle live transcription appending
  useEffect(() => {
    if (isListening) {
      setUserAnswer(baseText + (baseText && transcript ? ' ' : '') + transcript);
    }
  }, [transcript, isListening, baseText]);

  const toggleListening = () => {
    if (isListening) {
      stop();
    } else {
      setBaseText(userAnswer);
      resetTranscript();
      start();
    }
  };

  const currentQuestion = QUESTIONS[activeIndex];
  const starCoverage = detectStar(userAnswer, currentQuestion?.starKeywords ?? {});
  const coveredCount = Object.values(starCoverage).filter(Boolean).length;
  const progress = (activeIndex / QUESTIONS.length) * 100;

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (coveredCount === 4 && userAnswer.length > 50) {
      setShowEncouragement(true);
      const t = setTimeout(() => setShowEncouragement(false), 3000);
      return () => clearTimeout(t);
    }
  }, [coveredCount, userAnswer.length]);

  const handleSubmit = () => {
    if (!userAnswer.trim() || isAiThinking) return;
    setIsAiThinking(true);
    const feedback = SAMPLE_AI_FEEDBACK[activeIndex % SAMPLE_AI_FEEDBACK.length];
    const star = detectStar(userAnswer, currentQuestion.starKeywords);
    const starScore = Math.round((Object.values(star).filter(Boolean).length / 4) * 100);
    const answerObj = {
      question: currentQuestion.text,
      category: currentQuestion.category,
      icon: currentQuestion.icon,
      answer: userAnswer,
      star,
      starScore,
      feedback,
    };

    setTimeout(() => {
      setAnswers((prev) => [...prev, answerObj]);
      setIsAiThinking(false);
      if (activeIndex === QUESTIONS.length - 1) {
        clearInterval(timerRef.current);
        setSessionDone(true);
      } else {
        setActiveIndex((i) => i + 1);
        setUserAnswer('');
      }
    }, 1600);
  };

  // ── Session complete screen ─────────────────────────────────────────────
  if (sessionDone) {
    const avgScore = Math.round(answers.reduce((s, a) => s + a.starScore, 0) / answers.length);
    const starTotals = { s: 0, t: 0, a: 0, r: 0 };
    answers.forEach((a) => {
      Object.entries(a.star).forEach(([k, v]) => { if (v) starTotals[k]++; });
    });

    return (
      <PageContainer sx={{ height: 'calc(100vh - var(--navbar-height))', overflow: 'auto', p: 0, bgcolor: bg }}>
        <Box sx={{ mx: 'auto', p: { xs: 2.5, md: 5 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Box
              sx={{
                p: { xs: 3, md: 4.5 },
                borderRadius: 4,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(14,165,233,0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(14,165,233,0.06) 100%)',
                border: `1px solid ${isDark ? 'rgba(37,99,235,0.22)' : 'rgba(37,99,235,0.15)'}`,
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <Trophy size={48} color="#2563eb" strokeWidth={1.5} />
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.5rem', md: '2rem' }, color: textColor, mb: 0.5 }}>
                Session Complete!
              </Typography>
              <Typography variant="body2" sx={{ color: muted, mb: 3 }}>
                You answered {answers.length} questions in {formatTime(elapsed)}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 0.5,
                  px: 3,
                  py: 1.25,
                  borderRadius: 3,
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${border}`,
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: '2.8rem', color: scoreColor(avgScore), lineHeight: 1 }}>
                  {avgScore}%
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: muted }}>avg STAR score</Typography>
              </Box>
            </Box>
          </motion.div>

          {/* STAR coverage summary */}
          <Grid container spacing={2}>
            {(['s', 't', 'a', 'r']).map((key, i) => {
              const cfg = STAR_CONFIG[key];
              const count = starTotals[key];
              const pct = Math.round((count / answers.length) * 100);
              return (
                <Grid item xs={6} md={3} key={key}>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.3 }}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3.5,
                        bgcolor: cfg.bg,
                        border: `1px solid ${cfg.color}30`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 900, fontSize: '1.8rem', color: cfg.color, lineHeight: 1 }}>
                        {pct}%
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: cfg.color }}>{cfg.label}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: muted }}>{count}/{answers.length} answers</Typography>
                    </Box>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* Per-question breakdown */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: textColor }}>Question Breakdown</Typography>
            {answers.map((a, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.07 + 0.5 }}>
                <Box
                  sx={{
                    p: 2.75,
                    borderRadius: 3.5,
                    bgcolor: surface,
                    border: `1px solid ${border}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                    <Box sx={{ mt: 0.5 }}>
                      {(() => {
                        const QIcon = ICON_MAP[a.icon] || Book;
                        return <QIcon size={20} color="#2563eb" />;
                      })()}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
                        <Box sx={{ px: 1.25, py: 0.25, borderRadius: 4, bgcolor: 'rgba(37,99,235,0.1)', fontSize: '0.68rem', fontWeight: 700, color: '#2563eb' }}>
                          {a.category}
                        </Box>
                        <Box sx={{ px: 1.25, py: 0.25, borderRadius: 4, bgcolor: `${scoreColor(a.starScore)}18`, fontSize: '0.68rem', fontWeight: 700, color: scoreColor(a.starScore) }}>
                          {a.starScore}% STAR
                        </Box>
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: textColor, lineHeight: 1.55 }}>
                        {a.question}
                      </Typography>
                    </Box>
                  </Box>

                  {/* STAR badges */}
                  <Box sx={{ display: 'flex', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
                    {(['s', 't', 'a', 'r']).map((key) => {
                      const cfg = STAR_CONFIG[key];
                      const active = a.star[key];
                      return (
                        <Box
                          key={key}
                          sx={{
                            px: 1.5,
                            py: 0.35,
                            borderRadius: 4,
                             bgcolor: active ? cfg.bg : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                             border: `1px solid ${active ? cfg.color : 'divider'}`,
                             fontSize: '0.72rem',
                             fontWeight: 700,
                             color: active ? cfg.color : 'text.disabled',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          {active && <CheckRoundedIcon sx={{ fontSize: 11 }} />}
                          {cfg.label}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* AI feedback */}
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: 2.5,
                      bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${border}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: '#2563eb' }} />
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb' }}>AI Feedback</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)', lineHeight: 1.75 }}>
                      {a.feedback}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pb: 2 }}>
            <Box
              onClick={() => navigate('/interview-practice')}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 3, py: 1.4, borderRadius: 2.5,
                border: '1px solid divider', bgcolor: surface,
                cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', color: textColor,
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'rgba(37,99,235,0.3)', bgcolor: 'rgba(37,99,235,0.05)' },
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 17 }} />
              Back to Dashboard
            </Box>
            <Box
              onClick={() => { setActiveIndex(0); setUserAnswer(''); setAnswers([]); setSessionDone(false); setElapsed(0); timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 3.5, py: 1.4, borderRadius: 2.5,
                background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', color: '#fff',
                boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(37,99,235,0.4)' },
              }}
            >
              <ReplayRoundedIcon sx={{ fontSize: 17 }} />
              Practice Again
            </Box>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  // ── Active session screen ───────────────────────────────────────────────
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
            border: '1px solid divider',
            borderRadius: 1.5,
            '&:hover': { color: '#2563eb', borderColor: 'rgba(37,99,235,0.35)', bgcolor: 'rgba(37,99,235,0.06)' },
          }}
        >
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, color: textColor }}>
            Mock Interview Session
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: muted, mt: 0.15 }}>
            Question {activeIndex + 1} of {QUESTIONS.length}
          </Typography>
        </Box>

        {/* Timer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.75,
            py: 0.75,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${border}`,
          }}
        >
          <TimerRoundedIcon sx={{ fontSize: 15, color: muted }} />
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: textColor, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(elapsed)}
          </Typography>
        </Box>

        {/* Step dots */}
        <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
          {QUESTIONS.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === activeIndex ? 22 : 8,
                height: 8,
                borderRadius: 4,
                transition: 'all 0.25s',
                bgcolor: i < activeIndex
                  ? '#0ea5e9'
                  : i === activeIndex
                    ? '#2563eb'
                    : 'divider',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Progress bar */}
      <Box sx={{ height: 3, bgcolor: 'action.hover' }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #2563eb, #0ea5e9)', borderRadius: 2 }}
        />
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ mx: 'auto', p: { xs: 2.5, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* ─ Question card ─ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  p: { xs: 2.75, md: 3.75 },
                  borderRadius: 4,
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(37,99,235,0.16) 0%, rgba(14,165,233,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(37,99,235,0.07) 0%, rgba(14,165,233,0.04) 100%)',
                  border: `1px solid ${isDark ? 'rgba(37,99,235,0.22)' : 'rgba(37,99,235,0.15)'}`,
                  boxShadow: isDark ? '0 8px 32px rgba(37,99,235,0.08)' : 'none',
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(37,99,235,0.1)', mt: 0.5 }}>
                    {(() => {
                      const QIcon = ICON_MAP[currentQuestion.icon] || Book;
                      return <QIcon size={28} color="#2563eb" />;
                    })()}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                      <Box
                        sx={{
                          px: 1.5, py: 0.35, borderRadius: 4,
                          bgcolor: 'rgba(37,99,235,0.12)', fontSize: '0.7rem', fontWeight: 700, color: '#2563eb',
                        }}
                      >
                        {currentQuestion.category}
                      </Box>
                      <Box
                        sx={{
                          px: 1.5, py: 0.35, borderRadius: 4,
                          bgcolor: DIFF_META[currentQuestion.difficulty].bg,
                          fontSize: '0.7rem', fontWeight: 700,
                          color: DIFF_META[currentQuestion.difficulty].color,
                        }}
                      >
                        {currentQuestion.difficulty}
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.08rem', lineHeight: 1.65, color: textColor, mb: 2 }}>
                      {currentQuestion.text}
                    </Typography>
                    <Box
                      sx={{
                        px: 2, py: 1.25, borderRadius: 2.5,
                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${border}`,
                        display: 'flex', alignItems: 'flex-start', gap: 1.25,
                      }}
                    >
                      <Lightbulb size={16} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.8rem', color: muted, lineHeight: 1.75 }}>{currentQuestion.tip}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </AnimatePresence>

          {/* ─ STAR guide strip ─ */}
          <Grid container spacing={1.25}>
            {(['s', 't', 'a', 'r']).map((key) => {
              const cfg = STAR_CONFIG[key];
              const active = starCoverage[key];
              return (
                <Grid item xs={6} md={3} key={key}>
                  <motion.div animate={{ scale: active ? 1.02 : 1 }} transition={{ duration: 0.18 }}>
                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: 3,
                        border: `1.5px solid ${active ? cfg.color : border}`,
                        bgcolor: active ? cfg.bg : surface,
                        transition: 'all 0.3s',
                        boxShadow: active ? `0 4px 16px ${cfg.color}18` : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: active ? cfg.color : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                          color: active ? '#fff' : muted,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          flexShrink: 0,
                          transition: 'all 0.3s',
                          boxShadow: active ? `0 3px 10px ${cfg.color}55` : 'none',
                        }}
                      >
                        {active ? <CheckRoundedIcon sx={{ fontSize: 13 }} /> : key.toUpperCase()}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: active ? cfg.color : textColor, lineHeight: 1.2 }}>
                          {cfg.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.62rem', color: muted }} noWrap>{cfg.desc}</Typography>
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* ─ Answer textarea ─ */}
          <Box
            sx={{
              borderRadius: 4,
              bgcolor: surface,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <Box
              sx={{
                px: 3, py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Mic size={16} color="#2563eb" />
                <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: textColor }}>Your Answer</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '8px 16px',
                      borderRadius: 12,
                      background: isDark ? '#1e293b' : '#f1f5f9',
                      border: `1px solid ${border}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      marginRight: 8
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          bgcolor: '#ef4444', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#fff',
                          boxShadow: '0 0 12px rgba(239,68,68,0.4)',
                          animation: 'pulse-red 2s infinite'
                        }}
                      >
                        <Mic size={16} />
                      </Box>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: textColor }}>
                        Recording...
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: '0.82rem', color: muted, fontVariantNumeric: 'tabular-nums', minWidth: 40 }}>
                      {formatTime(elapsed % 3600)}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        onClick={stop} 
                        size="small" 
                        sx={{ 
                          width: 28, height: 28, 
                          bgcolor: '#ef4444', color: '#fff',
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: '#dc2626' }
                        }}
                      >
                        <Box sx={{ width: 10, height: 10, bgcolor: '#fff', borderRadius: 0.5 }} />
                      </IconButton>
                      <IconButton 
                        onClick={stop} 
                        size="small" 
                        sx={{ color: muted }}
                      >
                        <X size={18} />
                      </IconButton>
                    </Box>
                  </motion.div>
                )}

                {isSupported && (
                  <Tooltip title={isListening ? "Stop Recording" : "Value Voice Input"}>
                    <IconButton
                      onClick={toggleListening}
                      size="small"
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: isListening ? '#ef4444' : alpha('#2563eb', 0.06),
                        color: isListening ? '#fff' : '#2563eb',
                        border: isListening ? 'none' : `1px solid ${alpha('#2563eb', 0.1)}`,
                        boxShadow: isListening 
                          ? '0 4px 12px rgba(239,68,68,0.35)' 
                          : `0 0 0 4px ${alpha('#2563eb', 0.03)}`,
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&:hover': { 
                          bgcolor: isListening ? '#dc2626' : alpha('#2563eb', 0.1),
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <Mic size={20} />
                    </IconButton>
                  </Tooltip>
                )}
                {userAnswer && (
                  <Tooltip title="Clear Answer">
                    <IconButton 
                      onClick={() => { setUserAnswer(''); stop(); }} 
                      size="small" 
                      sx={{ color: muted, '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) } }}
                    >
                      <ReplayRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
              disabled={isAiThinking}
              placeholder={`Start with the Situation...\n\n"While working on [project] at [company], we were facing [challenge]..."`}
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
                color: 'text.primary',
                boxSizing: 'border-box',
              }}
            />

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
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: userAnswer.length < 80 ? '#f59e0b' : muted }}>
                  {userAnswer.length} chars
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: muted }}>Ctrl+Enter to submit</Typography>
              </Box>

              <Box
                onClick={!isAiThinking && userAnswer.trim().length >= 30 ? handleSubmit : undefined}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 3, py: 1,
                  borderRadius: 2.5,
                  background: !isAiThinking && userAnswer.trim().length >= 30
                    ? 'linear-gradient(135deg, #2563eb, #0ea5e9)'
                    : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                  color: !isAiThinking && userAnswer.trim().length >= 30 ? '#fff' : muted,
                  cursor: !isAiThinking && userAnswer.trim().length >= 30 ? 'pointer' : 'default',
                  fontWeight: 700, fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  boxShadow: !isAiThinking && userAnswer.trim().length >= 30 ? '0 4px 16px rgba(37,99,235,0.35)' : 'none',
                  '&:hover': !isAiThinking && userAnswer.trim().length >= 30 ? { transform: 'translateY(-1px)' } : {},
                }}
              >
                {isAiThinking ? (
                  <>
                    <Box
                      sx={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: isDark ? '#fff' : '#555',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    Evaluating…
                  </>
                ) : activeIndex === QUESTIONS.length - 1 ? (
                  <>
                    <CheckCircle2 size={18} />
                    Finish Session
                  </>
                ) : (
                  <>
                    <ChevronRight size={18} />
                    Next Question
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Encouragement toast */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            style={{
              position: 'fixed',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.88rem',
                boxShadow: '0 8px 32px rgba(16,185,129,0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                whiteSpace: 'nowrap',
              }}
            >
              <Sparkles size={18} fill="#fff" />
              All 4 STAR components detected — great answer structure!
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
      `}} />
    </PageContainer>
  );
}
