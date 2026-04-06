import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import {
  Box, Typography, IconButton, Grid, Chip, Tooltip, useTheme, alpha, CircularProgress, Button, Dialog,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Card
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { getInterviewQuestionsAPI, evaluateInterviewAnswerAPI, saveInterviewSessionAPI, getInterviewHistoryAPI } from '../../services/interviewService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { Trophy, Wrench, Compass, Book, Clock, Lightbulb, Mic, Sparkles, ChevronRight, CheckCircle2, X, Target, Zap, PlayCircle, BrainCircuit, MessageSquare, Info, CloudCog, Award, History, LayoutGrid, CheckCircle } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';

const ICON_MAP = {
  Wrench: Wrench,
  Compass: Compass,
  Book: Book,
  Clock: Clock,
};

const THEME = {
  primary: 'var(--primary)',
  primarySoft: 'var(--light-blue-bg-08)',
  border: 'var(--border-color)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  bgPage: 'var(--bg-default)',
  bgCard: 'var(--bg-paper)',
  bgLight: 'var(--bg-light)',
  shadow: 'var(--dashboard-card-shadow)',
};

const STAR_CONFIG = {
  s: { label: 'Situation', desc: 'Context of the event', color: 'var(--primary)', bg: 'var(--light-blue-bg-08)' },
  t: { label: 'Task', desc: 'Your responsibility', color: 'var(--secondary)', bg: 'var(--light-blue-bg-08)' },
  a: { label: 'Action', desc: 'Steps you specifically took', color: 'var(--info)', bg: 'var(--light-blue-bg-08)' },
  r: { label: 'Result', desc: 'Quantified outcome', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.08)' },
};

const DIFF_META = {
  Easy: { color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.08)' },
  Medium: { color: 'var(--primary)', bg: 'var(--light-blue-bg-08)' },
  Hard: { color: 'var(--error)', bg: 'rgba(220, 38, 38, 0.08)' },
};

const UNIVERSAL_STAR_KEYWORDS = {
  s: ['while', 'at my', 'we were', 'working on', 'our team', 'the project', 'when i', 'during', 'situation', 'context'],
  t: ['my role', 'i was responsible', 'i needed to', 'the goal was', 'tasked with', 'had to', 'objective'],
  a: ['i decided', 'i built', 'i implemented', 'i wrote', 'i led', 'i refactored', 'i fixed', 'i proposed', 'i created', 'i designed'],
  r: ['result', 'reduced', 'improved', 'increased', 'shipped', 'resolved', '%', 'seconds', 'days', 'users', 'faster', 'better', 'outcome'],
};

function detectStar(text) {
  const lower = text.toLowerCase();
  const covered = {};
  for (const [key, words] of Object.entries(UNIVERSAL_STAR_KEYWORDS)) {
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
  return s >= 75 ? 'var(--success)' : s >= 50 ? 'var(--primary)' : 'var(--text-secondary)';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── DEBOUNCE HOOK ───────────────────────────────────────────────────────────
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);
  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
}

// ── TIMER COMPONENT ──────────────────────────────────────────────────────────
const TimerDisplay = memo(({ onTick }) => {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (onTick) onTick(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [onTick]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 2.25, py: 0.85, borderRadius: 2, bgcolor: 'var(--bg-light)', border: `1px solid var(--border-color)` }}>
      <TimerRoundedIcon sx={{ fontSize: 18, color: 'var(--primary)' }} />
      <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {formatTime(elapsed)}
      </Typography>
    </Box>
  );
});

// ── QUESTION COMPONENT ───────────────────────────────────────────────────────
const QuestionHero = memo(({ question, index, total, border, surface, textColor, muted, DIFF_META }) => (
  <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
    <Box sx={{ p: 4, borderRadius: 3, bgcolor: surface, border: `1px solid ${border}`, boxShadow: 'var(--dashboard-card-shadow)' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
         <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)', display: 'flex' }}>
           {(() => { const QIcon = ICON_MAP[question?.icon] || Book; return <QIcon size={22} />; })()}
         </Box>
         <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', mb: 0.25 }}>Scenario Strategy</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={question?.category} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'transparent', border: `1px solid ${border}`, color: muted }} />
              <Chip label={`${question?.complexity} · ${question?.duration}`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: (DIFF_META[question?.complexity] || DIFF_META.Medium).bg, color: (DIFF_META[question?.complexity] || DIFF_META.Medium).color }} />
            </Box>
         </Box>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: textColor, lineHeight: 1.5, mb: 3 }}>{question?.question_text}</Typography>
      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--bg-light)', border: `1px solid ${border}`, display: 'flex', gap: 2 }}>
        <Zap size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
        <Typography sx={{ fontSize: '0.85rem', color: muted, lineHeight: 1.6, fontWeight: 500 }}>{question?.overview}</Typography>
      </Box>
    </Box>
  </motion.div>
));

// ── STAR GUIDE COMPONENT ─────────────────────────────────────────────────────
const StarGuideSidebar = memo(({ starCoverage, config, border, muted, textColor }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: 1, mb: 1, px: 1 }}>Answer Architecture (STAR)</Typography>
    {Object.entries(config).map(([key, cfg]) => {
      const active = starCoverage[key];
      return (
        <Box 
          key={key} 
          sx={{ 
            p: 2.25, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2.5,
            border: '1px solid', 
            borderColor: active ? cfg.color : 'transparent',
            bgcolor: active ? cfg.bg : 'transparent',
            transition: 'all 0.3s'
          }}
        >
          <Box sx={{ 
            width: 32, height: 32, borderRadius: 1.25, bgcolor: active ? cfg.color : border, 
            color: active ? '#fff' : muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem' 
          }}>
            {active ? <CheckRoundedIcon sx={{ fontSize: 18 }} /> : key.toUpperCase()}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: active ? cfg.color : textColor }}>{cfg.label}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: muted, fontWeight: 600 }}>{cfg.desc}</Typography>
          </Box>
          {active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginLeft: 'auto' }}><Sparkles size={16} color={cfg.color} /></motion.div>}
        </Box>
      );
    })}
  </Box>
));

// ── OPTIMIZATION: Isolated Editor Component ──────────────────────────────────
const ResponseEditor = memo(({ transcript, isListening, activeIndex, onFullTextChange, isAiThinking, textColor, muted, THEME, border, surface, toggleListening }) => {
  const [internalText, setInternalText] = useState('');
  const [baseText, setBaseText] = useState('');
  
  // Sync when Question changes
  useEffect(() => {
    setInternalText('');
    setBaseText('');
  }, [activeIndex]);

  // Sync transcription to local state
  useEffect(() => {
    if (isListening) {
      const full = baseText + (baseText && transcript ? ' ' : '') + transcript;
      setInternalText(full);
      onFullTextChange(full, false); // Debounced in parent or immediate if needed
    }
  }, [transcript, isListening, baseText, onFullTextChange]);

  const handleTextareaChange = (e) => {
    const val = e.target.value;
    setInternalText(val);
    setBaseText(val); // When typing, keyboard becomes the new base
    onFullTextChange(val, true); // Signal typing to parent
  };

  const wordCount = internalText.trim() ? internalText.trim().split(/\s+/).length : 0;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: surface }}>
      <Box sx={{ px: 4, py: 2.25, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: isListening ? 'var(--error)' : 'var(--primary)', animation: isListening ? 'pulse-red 1s infinite' : 'none' }} />
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Response Studio</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ textAlign: 'right', mr: 2 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: muted }}>Capture Mode</Typography>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: isListening ? 'var(--error)' : THEME.primary }}>{isListening ? 'Voice Active' : 'Keyboard'}</Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
          <IconButton 
            onClick={() => {
              if (!isListening) setBaseText(internalText); // Capture current text as base before mic starts
              toggleListening();
            }} 
            sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: isListening ? 'var(--error)' : 'var(--light-blue-bg-08)', color: isListening ? '#fff' : THEME.primary, '&:hover': { bgcolor: isListening ? 'var(--error-dark)' : 'var(--light-blue-bg-12)' } }}
          >
             {isListening ? <X size={22} /> : <Mic size={22} />}
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ flex: 1, position: 'relative' }}>
        <textarea
          value={internalText}
          onChange={handleTextareaChange}
          placeholder={`Synthesize your response using the STAR method on the left...\n\nExample: "In my previous role as [Position] at [Company], the situation was..."`}
          disabled={isAiThinking}
          autoFocus
          style={{
            width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none',
            padding: '40px 50px', fontFamily: 'inherit', fontSize: '1.25rem', lineHeight: 1.8,
            background: 'transparent', color: textColor, boxSizing: 'border-box'
          }}
        />
        
        <Box sx={{ position: 'absolute', bottom: 30, right: 40, display: 'flex', alignItems: 'center', gap: 3, px: 2, py: 1, borderRadius: 2, bgcolor: 'var(--bg-light)', border: `1px solid ${border}` }}>
           <Box sx={{ textAlign: 'right' }}>
             <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: muted, textTransform: 'uppercase' }}>Volume</Typography>
             <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>{internalText.length} chars / {wordCount} words</Typography>
           </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default function MockInterviewSession() {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const theme = useTheme();
  const queryClient = useQueryClient();
  
  const [view, setView] = useState('start'); // start, active, complete
  const [activeIndex, setActiveIndex] = useState(0);
  const [starFeedback, setStarFeedback] = useState({ s: false, t: false, a: false, r: false });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showEncouragement, setShowEncouragement] = useState(false);

  // Refs for performance - keep track of things without parent re-renders
  const currentAnswerRef = useRef('');
  const totalSecondsRef = useRef(0);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['interview-questions', 'session', interviewId],
    queryFn: async () => {
      const response = await getInterviewQuestionsAPI(interviewId);
      return response.data;
    },
    enabled: !!interviewId
  });

  const { data: history = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['interview-history', interviewId],
    queryFn: async () => {
      const response = await getInterviewHistoryAPI();
      return (response.data || []).filter(s => String(s.application_id) === String(interviewId));
    },
    enabled: !!interviewId
  });

  const { isListening, transcript, start, stop, reset: resetTranscript } = useSpeechRecognition();

  // ── OPTIMIZATION: Debounced Feedback ─────────────────────────────────────
  const debouncedStarUpdate = useDebounce((text) => {
    const nextCoverage = detectStar(text);
    setStarFeedback(nextCoverage);
    
    const count = Object.values(nextCoverage).filter(Boolean).length;
    if (count === 4 && text.length > 50) {
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }
  }, 250);

  const handleFullTextChange = useCallback((text, isTyping) => {
    currentAnswerRef.current = text;
    if (isTyping) {
      debouncedStarUpdate(text);
    } else {
      setStarFeedback(detectStar(text));
    }
  }, [debouncedStarUpdate]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      resetTranscript();
      start();
    }
  }, [isListening, start, stop, resetTranscript]);

  const currentQuestion = questions[activeIndex];

  const handleSubmit = async () => {
    const text = currentAnswerRef.current;
    if (!text.trim() || isAiThinking) return;
    setIsAiThinking(true);
    stop();

    try {
      const response = await evaluateInterviewAnswerAPI(
        interviewId,
        currentQuestion?.question_text,
        text
      );

      const evaluation = response.data;
      const newAnswer = {
        question: currentQuestion?.question_text,
        answer: text,
        star_score: evaluation.star_score,
        star_breakdown: evaluation.star_breakdown,
        feedback: evaluation.feedback,
      };
      
      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      if (activeIndex < questions.length - 1) {
        setActiveIndex(activeIndex + 1);
        currentAnswerRef.current = '';
        setStarFeedback({ s: false, t: false, a: false, r: false });
        setIsAiThinking(false);
      } else {
        const totalScore = Math.round(updatedAnswers.reduce((acc, curr) => acc + (curr.star_score || 0), 0) / updatedAnswers.length);
        
        await saveInterviewSessionAPI(interviewId, {
          answers: updatedAnswers,
          duration_seconds: totalSecondsRef.current,
          total_score: totalScore
        });
        queryClient.invalidateQueries(['interview-history', interviewId]);
        setView('complete');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setIsAiThinking(false);
    }
  };

  const bg = THEME.bgPage;
  const surface = THEME.bgCard;
  const border = THEME.border;
  const muted = THEME.textSecondary;
  const textColor = THEME.textPrimary;

  if (isLoading) {
    return (
      <Box sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: bg }}>
        <CircularProgress sx={{ color: THEME.primary }} />
      </Box>
    );
  }

  // ── START / HISTORY SCREEN ─────────────────────────────────────────────
  if (view === 'start') {
    return (
      <PageContainer sx={{ display: 'flex', flexDirection: 'column', p: 0, bgcolor: bg, height: 'calc(100vh - var(--navbar-height))', overflow: 'auto' }}>
        <Box sx={{ bgcolor: surface, borderBottom: `1px solid ${border}`, pt: { xs: 4, md: 5 }, pb: { xs: 4, md: 5 } }}>
          <Box sx={{ mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <IconButton onClick={() => navigate('/interview-practice')} sx={{ bgcolor: 'var(--light-blue-bg-08)', color: textColor, borderRadius: 1.25, width: 36, height: 36, '&:hover': { bgcolor: 'var(--light-blue-bg-15)', color: THEME.primary } }}><ArrowBackRoundedIcon sx={{ fontSize: 20 }} /></IconButton>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: THEME.primary, textTransform: 'uppercase', letterSpacing: 1 }}>Live Coaching</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: textColor, letterSpacing: '-0.02em', mb: 1.5 }}>Mock Interview Session</Typography>
              <Typography sx={{ color: muted, fontSize: '1rem', maxWidth: 540, lineHeight: 1.6 }}>Practice interview scenarios with real-time AI feedback on your STAR structured answers. Review your history below.</Typography>
            </Box>
            <Button variant="contained" disableElevation startIcon={<PlayCircle size={22} />} onClick={() => setView('active')} sx={{ borderRadius: 2, px: 4, py: 1.75, fontWeight: 700, bgcolor: THEME.primary, color: 'var(--primary-contrast)', textTransform: 'none', fontSize: '0.95rem', minWidth: 180, '&:hover': { bgcolor: 'var(--primary-dark)', boxShadow: '0 4px 12px rgba(51, 94, 222, 0.2)' } }}>Start New Session</Button>
          </Box>
        </Box>
        <Box sx={{ mx: 'auto', width: '100%', p: { xs: 3, md: 5 } }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box><Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: textColor, mb: 0.5 }}>Attempt History</Typography><Typography sx={{ color: muted, fontSize: '0.9rem' }}>Comprehensive log of your previous performance and AI coaching feedback.</Typography></Box>
          </Box>
          <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border}`, bgcolor: surface, overflow: 'hidden', boxShadow: THEME.shadow }}>
            {isHistoryLoading ? (
               <Box sx={{ display: 'flex', py: 12, justifyContent: 'center' }}><CircularProgress size={32} sx={{ color: THEME.primary }} /></Box>
            ) : history.length === 0 ? (
              <Box sx={{ p: 12, textAlign: 'center' }}><Box sx={{ mb: 3, opacity: 0.15, display: 'flex', justifyContent: 'center' }}><Trophy size={64} /></Box><Typography sx={{ color: muted, fontWeight: 600, fontSize: '1rem' }}>No session logs found. Start your first attempt to begin tracking progress!</Typography></Box>
            ) : (
              <TableContainer sx={{ bgcolor: 'transparent' }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead><TableRow sx={{ '& th': { fontWeight: 600, fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: muted, bgcolor: 'var(--bg-light)', borderBottom: `1px solid ${border}`, textAlign: 'left', py: 1.75, px: 3 } }}><TableCell>Session Date</TableCell><TableCell>Questions Covered</TableCell><TableCell>Session Duration</TableCell><TableCell>Performance Score</TableCell><TableCell align="right" sx={{ textAlign: 'right !important' }}>Action</TableCell></TableRow></TableHead>
                  <TableBody>
                    {history.map((s) => (
                      <TableRow key={s.id} hover sx={{ cursor: 'pointer', transition: 'background-color 0.15s ease', '&:nth-of-type(even)': { bgcolor: 'var(--bg-light)' }, '&:last-child td': { borderBottom: 0 }, '& td': { py: 2.25, px: 3, borderBottom: `1px solid ${border}` } }} onClick={() => navigate(`/interview-practice/${interviewId}/session/${s.id}`)}>
                        <TableCell><Typography sx={{ fontWeight: 600, color: textColor, fontSize: '0.8125rem', lineHeight: 1.3 }}>{formatDate(s.date)}</Typography><Typography sx={{ color: muted, fontSize: '0.7rem', mt: 0.25 }}>Completed Attempt</Typography></TableCell>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ p: 0.5, borderRadius: 1, bgcolor: THEME.primarySoft, color: THEME.primary, display: 'flex' }}><Target size={14} /></Box><Typography sx={{ fontWeight: 600, color: textColor, fontSize: '0.8125rem' }}>{s.answer_count} Scenarios</Typography></Box></TableCell>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'var(--bg-light)', color: muted, display: 'flex' }}><Clock size={14} /></Box><Typography sx={{ fontWeight: 600, color: textColor, fontSize: '0.8125rem' }}>{Math.floor(s.duration / 60)}m {s.duration % 60}s</Typography></Box></TableCell>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress variant="determinate" value={100} size={28} thickness={5} sx={{ color: 'var(--light-blue-bg-08)', position: 'absolute' }} /><CircularProgress variant="determinate" value={s.score} size={28} thickness={5} sx={{ color: scoreColor(s.score) }} /></Box><Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: scoreColor(s.score) }}>{s.score}%</Typography></Box></TableCell>
                        <TableCell align="right"><IconButton size="small" sx={{ color: THEME.primary, p: 0.5 }}><ChevronRight size={18} /></IconButton></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </PageContainer>
    );
  }

  // ── COMPLETE / SUMMARY SCREEN (AI RESUME STUDIO ABSOLUTE ALIGNMENT) ──────
  if (view === 'complete') {
    const finalScore = Math.round(answers.reduce((acc, curr) => acc + (curr.star_score || 0), 0) / answers.length);
    
    return (
      <PageContainer sx={{ display: 'flex', flexDirection: 'column', bgcolor: bg, p: 0, height: 'calc(100vh - var(--navbar-height))', overflow: 'auto' }}>
        <Box sx={{ flex: 1, p: 4, pt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center',justifyContent: "center" }}>
          
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Typography variant="h3" sx={{ fontWeight: 950, color: textColor, letterSpacing: '-0.04em', mb: 1, textTransform: 'none' }}>Great job, Hero!</Typography>
            <Typography sx={{ color: muted, fontSize: '1rem', fontWeight: 500 }}>Congratulations on concluding your interview session successfully.</Typography>
          </motion.div>

          {/* Studio Metrics Grid — Exact replication of tools card grid */}
          <Box sx={{ width: '100%', maxWidth: 1000, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}>
             {[
               { category: 'Performance', title: 'Final Score', val: `${finalScore}%`, icon: Award, accent: true },
               { category: 'Engagement', title: 'Scenarios Completed', val: answers.length, icon: LayoutGrid, accent: false },
               { category: 'Efficiency', title: 'Session Duration', val: formatTime(totalSecondsRef.current), icon: Clock, accent: false },
             ].map((m, i) => (
               <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i*0.1) }}>
                 <Card 
                   elevation={0}
                   sx={{
                     p: 2.5,
                     borderRadius: 2,
                     border: m.accent ? '1.5px solid rgba(51, 94, 222, 0.28)' : `1px solid ${border}`,
                     bgcolor: '#fff',
                     boxShadow: m.accent ? '0 4px 20px rgba(51, 94, 222, 0.1)' : 'none',
                     transition: 'all 0.2s',
                     '&:hover': {
                       boxShadow: m.accent ? '0 8px 28px rgba(51, 94, 222, 0.16)' : '0 4px 16px rgba(0, 0, 0, 0.08)',
                       borderColor: 'rgba(51, 94, 222, 0.4)'
                     }
                   }}
                 >
                   <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1.5 }}>
                     <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: m.accent ? THEME.primary : THEME.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       <m.icon size={22} color={m.accent ? '#fff' : THEME.primary} />
                     </Box>
                     <Box sx={{ flex: 1, minWidth: 0 }}>
                       <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.8, color: THEME.primary, textTransform: 'uppercase', mb: 0.35 }}>{m.category}</Typography>
                       <Typography sx={{ fontWeight: 700, color: THEME.textPrimary, fontSize: '0.94rem', lineHeight: 1.25 }}>{m.title}</Typography>
                     </Box>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                     <Typography sx={{ fontSize: '1.5rem', fontWeight: 950, color: textColor }}>{m.val}</Typography>
                     {m.accent && <Box sx={{ p: 0.75, borderRadius: 2.5, bgcolor: 'rgba(34, 197, 94, 0.08)', color: 'var(--success)', display: 'flex' }}><Trophy size={16} /></Box>}
                   </Box>
                 </Card>
               </motion.div>
             ))}
          </Box>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ display: 'flex', gap: 16 }}>
             <Button 
               onClick={() => setView('start')}
               variant="outlined" 
               sx={{ 
                 py: 1.8, px: 5, borderRadius: 2, border: `1px solid ${border}`, color: textColor, fontWeight: 800, textTransform: 'none', fontSize: '0.95rem',
                 borderColor: border, '&:hover': { bgcolor: border, borderColor: border }
               }}
               startIcon={<History size={18} />}
             >
               View History
             </Button>
             <Button 
               onClick={() => navigate('/interview-practice')}
               variant="contained" 
               disableElevation
               sx={{ 
                 py: 1.8, px: 6, borderRadius: 2, bgcolor: THEME.primary, fontWeight: 800, textTransform: 'none', fontSize: '0.95rem',
                 '&:hover': { bgcolor: 'var(--primary-dark)', boxShadow: '0 4px 12px rgba(51, 94, 222, 0.2)' }
               }}
               startIcon={<CheckCircle size={18} />}
             >
               Interview Practice
             </Button>
          </motion.div>

        </Box>
      </PageContainer>
    );
  }

  // ── ACTIVE SESSION SCREEN ──────────────────────────────────────────────────
  return (
    <PageContainer sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0, bgcolor: bg }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: { xs: 2, md: 4 }, py: 1.75, bgcolor: surface, borderBottom: `1px solid ${border}`, zIndex: 10 }}>
        <IconButton onClick={() => navigate('/interview-practice')} size="small" sx={{ color: muted, border: `1px solid ${border}`, borderRadius: 1.25, width: 36, height: 36, '&:hover': { color: THEME.primary, borderColor: THEME.primary, bgcolor: THEME.primarySoft } }}><ArrowBackRoundedIcon fontSize="small" /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: textColor }}>Live Mock Interview</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.2 }}>
             <Typography sx={{ fontSize: '0.72rem', color: THEME.primary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>Scenario {activeIndex + 1} of {questions.length}</Typography>
             <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: border }} />
             <Box sx={{ display: 'flex', gap: 0.5 }}>{questions.map((_, i) => (<Box key={i} sx={{ width: i === activeIndex ? 16 : 6, height: 6, borderRadius: 3, bgcolor: i < activeIndex ? 'var(--success)' : i === activeIndex ? THEME.primary : border, transition: 'all 0.3s' }} />))}</Box>
          </Box>
        </Box>
        <TimerDisplay onTick={(val) => { totalSecondsRef.current = val; }} />
        <Button variant="contained" disableElevation onClick={handleSubmit} disabled={isAiThinking} sx={{ ml: 2, borderRadius: 1.5, textTransform: 'none', fontWeight: 800, bgcolor: THEME.primary, '&:hover': { bgcolor: 'var(--primary-dark)' } }}>{isAiThinking ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : activeIndex === questions.length - 1 ? 'Finish Session' : 'Next Question'}</Button>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Box sx={{ width: '38%', borderRight: `1px solid ${border}`, bgcolor: 'var(--bg-light)', display: 'flex', flexDirection: 'column', p: 4, gap: 4, overflow: 'auto' }}>
          <QuestionHero question={currentQuestion} index={activeIndex} total={questions.length} border={border} surface={surface} textColor={textColor} muted={muted} DIFF_META={DIFF_META} />
          <StarGuideSidebar starCoverage={starFeedback} config={STAR_CONFIG} border={border} muted={muted} textColor={textColor} />
        </Box>

        <ResponseEditor 
          transcript={transcript} 
          isListening={isListening} 
          activeIndex={activeIndex} 
          onFullTextChange={handleFullTextChange} 
          isAiThinking={isAiThinking} 
          textColor={textColor} 
          muted={muted} 
          THEME={THEME} 
          border={border} 
          surface={surface} 
          toggleListening={toggleListening} 
        />
      </Box>

      <AnimatePresence>
        {showEncouragement && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} style={{ position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
            <Box sx={{ px: 4, py: 2, borderRadius: 2, bgcolor: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 10px 40px rgba(16,185,129,0.3)' }}><Sparkles size={22} fill="currentColor" /><Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>Perfect STAR Match Detected!</Typography></Box>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
