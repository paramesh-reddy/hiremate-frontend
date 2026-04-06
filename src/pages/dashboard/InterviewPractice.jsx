import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInterviewApplicationsAPI } from '../../services/interviewService';
import {
  Box, Typography, Button, Dialog, DialogContent, TextField,
  InputAdornment, IconButton, CircularProgress, Chip, alpha,
  useTheme, Skeleton, Tooltip, Card, Stack,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { createApplicationFromJDAPI } from '../../services/applicationsService';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import PageContainer from '../../components/common/PageContainer';

const JOB_DESCRIPTION_MAX = 10000;

function getInitials(title = '') {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words[0]) return words[0].slice(0, 2).toUpperCase();
  return 'IN';
}

const THEME = {
  primary: 'var(--primary, #335ede)',
  primarySoft: 'var(--light-blue-bg, rgba(51, 94, 222, 0.08))',
  border: 'var(--divider, rgba(0, 0, 0, 0.08))',
  textPrimary: 'var(--text-primary, #1e293b)',
  textSecondary: 'var(--text-secondary, #64748b)',
};

function scoreColor(score) {
  if (score >= 75) return '#10b981'; // Success Green
  if (score >= 50) return THEME.primary; // Primary Blue
  return '#f59e0b'; // Amber
}

function scoreLabel(score) {
  if (score >= 75) return 'Ready';
  if (score >= 50) return 'Getting there';
  return 'Needs work';
}

const defaultInterviews = [
  { id: '1', title: 'Senior Frontend Developer', companyName: 'Stripe', readinessScore: 72, weakSpots: ['System Design', 'Go Basics', 'Payment Flows'], insights: 'Stripe values engineers who think about user experience holistically. Highlight how your UI work drives business metrics.' },
  { id: '2', title: 'Full Stack Engineer', companyName: 'TechFlow Systems', readinessScore: 85, weakSpots: ['Redis Caching', 'Microservices Architecture'], insights: 'Emphasize your experience with distributed systems and horizontal scaling strategies.' },
  { id: '3', title: 'React & JS Fundamentals', companyName: 'General Prep', readinessScore: 45, weakSpots: ['Closures & Scoping', 'Async/Await Patterns', 'Event Loop'], insights: 'Great for drilling core JS concepts. Focus on closures and the event loop — these come up in every frontend interview.' },
];

const TOOLS = [
  { 
    key: 'questions', 
    category: 'Interview Prep',
    title: 'Q&A Guide',
    subtitle: 'Master the most likely questions',
    desc: 'Study likely, technical & HR questions with model answers and STAR breakdowns.', 
    icon: PsychologyRoundedIcon, 
    cta: 'Study Questions',
    route: 'questions', 
    badge: 'Popular',
    accent: false
  },
  { 
    key: 'session', 
    category: 'Live Practice',
    title: 'Mock Session',
    subtitle: 'Practice with a real-time AI coach',
    desc: 'Live AI interviewer. Get instant STAR feedback per question.', 
    icon: MicRoundedIcon, 
    cta: 'Start Interview',
    route: 'session', 
    badge: 'Live',
    accent: true
  },
  { 
    key: 'briefing', 
    category: 'Intelligence',
    title: 'Company Brief',
    subtitle: 'Get the inside track before you go',
    desc: 'Pre-interview intel: recruiter thread, rounds, culture & prep topics.', 
    icon: BusinessRoundedIcon, 
    cta: 'View Briefing',
    route: 'briefing', 
    badge: null,
    accent: false
  },
];

export default function InterviewPractice() {
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isDark = theme.palette.mode === 'dark';

  const [modalOpen, setModalOpen] = useState(false);
  const [jobLink, setJobLink] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [localInterviews, setLocalInterviews] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', 'active-interviews'],
    queryFn: async () => {
      const response = await getInterviewApplicationsAPI();
      return response.data;
    }
  });

  const interviews = useMemo(() => {
    const apps = (applications || []).map(app => ({
      id: String(app.id),
      title: app.role || 'Software Engineer',
      companyName: app.company,
      readinessScore: app.confidence ? Math.round(app.confidence * 100) : 0,
      weakSpots: [], 
      insights: app.interview_process || 'Preparing for your interview...',
      isReal: true
    }));
    return [...apps, ...localInterviews];
  }, [applications, localInterviews]);

  // Handle initial selection
  useEffect(() => {
    if (!selectedId && interviews.length > 0) {
      setSelectedId(interviews[0].id);
    }
  }, [interviews, selectedId]);

  const selected = interviews.find((i) => i.id === selectedId);
  const scSelected = scoreColor(selected?.readinessScore ?? 0);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return interviews;
    const q = searchQuery.toLowerCase();
    return interviews.filter((i) => i.title.toLowerCase().includes(q) || i.companyName.toLowerCase().includes(q));
  }, [searchQuery, interviews]);

  const handleCreate = async () => {
    if (!jobDescription.trim() && !jobLink.trim()) return;
    setIsGenerating(true);
    setModalOpen(false);
    
    try {
      const response = await createApplicationFromJDAPI({
        job_description: jobDescription,
        job_url: jobLink
      });
      
      const newApp = response.data;
      
      // Invalidate query to refresh sidebar
      await queryClient.invalidateQueries(['applications', 'active-interviews']);
      
      // Select the new one
      setSelectedId(String(newApp.id));
      
      // Cleanup
      setJobLink('');
      setJobDescription('');
    } catch (err) {
      console.error('Failed to create prep session:', err);
      // Fallback: show error to user?
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageContainer sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'row', p: 0, overflow: 'hidden', bgcolor: 'background.default' }}>

      {/* ─── LEFT SIDEBAR ─────────────────────────────── */}
      <Box sx={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', overflow: 'hidden' }}>

        {/* Sidebar header */}
        <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 2, borderBottom: `1px solid ${THEME.border}` }}>
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: 0.8,
              color: THEME.primary,
              textTransform: 'uppercase',
              mb: 2,
            }}
          >
            Prep Sessions
          </Typography>
          <Button
            fullWidth variant="contained" disableElevation startIcon={<AddRoundedIcon />}
            onClick={() => setModalOpen(true)}
            sx={{ 
              borderRadius: 1, py: 1, fontWeight: 600, textTransform: 'none', 
              fontSize: '0.85rem', bgcolor: THEME.primary,
              '&:hover': { bgcolor: '#2a4bc4' }
            }}
          >
            New Session
          </Button>
          
          <Box sx={{ 
            mt: 2, display: 'flex', alignItems: 'center', gap: 1, 
            px: 1.5, py: 0.75, borderRadius: 1.5, bgcolor: isDark ? alpha('#fff', 0.03) : '#f8fafc',
            border: `1px solid ${THEME.border}`,
            '&:focus-within': { borderColor: THEME.primary, bgcolor: isDark ? alpha('#fff', 0.05) : '#fff' },
            transition: 'all 0.2s'
          }}>
            <SearchRoundedIcon sx={{ fontSize: 18, color: THEME.textSecondary }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions…"
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8125rem', color: THEME.textPrimary, fontFamily: 'inherit' }}
            />
          </Box>
        </Box>

        {/* Session list */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 1, py: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 } }}>
          {isGenerating && (
            <Box sx={{ p: 1.5, mb: 1, borderRadius: 1.5, border: `1px solid ${THEME.border}`, bgcolor: THEME.primarySoft }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Box sx={{ flex: 1 }}><Skeleton height={14} width="70%" /><Skeleton height={12} width="45%" /></Box>
              </Box>
            </Box>
          )}
          {filtered.map((item, idx) => {
            const isActive = item.id === selectedId;
            const sc = scoreColor(item.readinessScore);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
                <Box
                  onClick={() => setSelectedId(item.id)}
                  sx={{ 
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, mb: 0.5, 
                    borderRadius: 1.5, cursor: 'pointer', border: '1px solid', transition: 'all 0.2s', 
                    borderColor: isActive ? alpha('#335ede', 0.2) : 'transparent', 
                    bgcolor: isActive ? THEME.primarySoft : 'transparent', 
                    '&:hover': { bgcolor: isActive ? alpha('#335ede', 0.12) : 'rgba(0,0,0,0.03)', '& .del-btn': { opacity: 1 } } 
                  }}
                >
                  <Box sx={{ 
                    width: 32, height: 32, borderRadius: 1, 
                    background: isActive ? THEME.primary : THEME.primarySoft, 
                    color: isActive ? '#fff' : THEME.primary, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: 700, fontSize: '0.6875rem', flexShrink: 0 
                  }}>
                    {getInitials(item.title)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.8125rem', color: THEME.textPrimary }}>{item.title}</Typography>
                    <Typography noWrap sx={{ color: THEME.textSecondary, fontSize: '0.75rem' }}>{item.companyName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sc }} />
                    <IconButton className="del-btn" size="small" onClick={(e) => { e.stopPropagation(); }} sx={{ opacity: 0, transition: 'opacity 0.2s', p: 0.4, '&:hover': { color: 'error.main' } }}>
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Box>
              </motion.div>
            );
          })}
          {filtered.length === 0 && !isGenerating && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography sx={{ color: THEME.textSecondary, fontSize: '0.8125rem' }}>No sessions found</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 } }}>
        <AnimatePresence mode="wait">
          {!selectedId ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box 
                sx={{ 
                  height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center'
                }}
              >
                <Box 
                  sx={{ 
                    width: 80, height: 80, borderRadius: '50%', 
                    bgcolor: THEME.primarySoft, border: `3px solid ${isDark ? alpha('#335ede', 0.2) : alpha('#335ede', 0.1)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    mb: 3, animation: 'pulse 2s infinite'
                  }}
                >
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 40, color: THEME.primary }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800, fontSize: '1.5rem', 
                    color: THEME.textPrimary, mb: 1, letterSpacing: '-0.01em'
                  }}
                >
                  Ready to ace your interviews?
                </Typography>
                <Typography 
                  sx={{ 
                    color: THEME.textSecondary, fontSize: '0.9375rem', 
                    lineHeight: 1.5, mb: 4, maxWidth: 440
                  }}
                >
                  Create a tailored prep session for a specific job or pick from your history. Our AI analyzes the JD to build your master Q&A.
                </Typography>
                <Button 
                  variant="contained" disableElevation startIcon={<AddRoundedIcon />} 
                  onClick={() => setModalOpen(true)} 
                  sx={{ borderRadius: 1, px: 3, py: 1.1, fontWeight: 600, bgcolor: THEME.primary }}
                >
                  Create Your First Session
                </Button>
              </Box>
            </motion.div>
          ) : (
            <motion.div key={selectedId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Box sx={{ p: { xs: 2.5, md: 4 }, mx: 'auto' }}>

                {/* ── Hero header ── */}
                <Box sx={{ 
                  borderRadius: 2, overflow: 'hidden', mb: 4, bgcolor: 'background.paper',
                  border: `1px solid ${THEME.border}`, p: { xs: 3, md: 4 }, 
                  boxShadow: isDark ? 'none' : '0 1px 2px rgba(15, 23, 42, 0.04)' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.8, color: THEME.primary, textTransform: 'uppercase' }}>Active Prep Session</Typography>
                        <Chip label={selected?.isReal ? 'Tracker Linked' : 'Manual Prep'} size="small" sx={{ fontWeight: 600, fontSize: '0.6875rem', bgcolor: THEME.primarySoft, color: THEME.primary, height: 24, border: `1px solid ${THEME.border}` }} />
                      </Box>
                      <Typography sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5, fontSize: { xs: '1.5rem', md: '1.75rem' }, color: THEME.textPrimary }}>
                        {selected?.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessRoundedIcon sx={{ fontSize: 18, color: THEME.textSecondary }} />
                        <Typography sx={{ color: THEME.textSecondary, fontWeight: 500, fontSize: '0.95rem' }}>{selected?.companyName}</Typography>
                      </Box>
                    </Box>

                    {/* Readiness ring */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2, px: 3, borderRadius: 2, bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc', border: `1px solid ${THEME.border}` }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={100} size={50} thickness={4.5} sx={{ color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', position: 'absolute' }} />
                        <CircularProgress variant="determinate" value={selected?.readinessScore ?? 0} size={50} thickness={4.5} sx={{ color: scSelected, transition: 'all 0.6s ease' }} />
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: THEME.textPrimary }}>{selected?.readinessScore ?? 0}%</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: THEME.textPrimary, fontSize: '0.9375rem', mb: 0.25 }}>Interview Readiness</Typography>
                        <Typography sx={{ fontWeight: 600, color: scSelected, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{scoreLabel(selected?.readinessScore ?? 0)}</Typography>
                      </Box>
                    </Box>
                  </Box>

                   {/* Gap tags */}
                   {selected?.weakSpots?.length > 0 && (
                    <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${THEME.border}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: THEME.primary }} />
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.8, color: THEME.primary, textTransform: 'uppercase' }}>
                          Priority gaps to address
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selected.weakSpots.map((s) => (
                          <Chip key={s} label={s} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: THEME.primarySoft, border: `1px solid ${THEME.border}`, color: THEME.textPrimary, height: 28 }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* ── AI Insight ── */}
                <Box sx={{ mb: 4, p: 3, borderRadius: 2, display: 'flex', gap: 2.5, alignItems: 'flex-start', bgcolor: 'background.paper', border: `1px solid ${THEME.border}`, boxShadow: isDark ? 'none' : '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
                  <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: THEME.primarySoft, color: THEME.primary, flexShrink: 0, mt: 0.25 }}>
                    <TipsAndUpdatesRoundedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.8, color: THEME.primary, textTransform: 'uppercase', mb: 0.5 }}>AI Coach Insight</Typography>
                    <Typography sx={{ color: THEME.textSecondary, lineHeight: 1.7, fontSize: '0.9375rem' }}>{selected?.insights}</Typography>
                  </Box>
                </Box>

                {/* ── Practice tools grid ── */}
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: THEME.textPrimary, mb: 2 }}>
                  Your Training Suit
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  {TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Card
                        key={tool.key}
                        onClick={() => navigate(`/interview-practice/${selectedId}/${tool.route}`)}
                        elevation={0}
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          p: 2,
                          pt: tool.accent ? 2.5 : 2,
                          borderRadius: 2,
                          border: tool.accent
                            ? `1.5px solid ${alpha('#335ede', 0.28)}`
                            : `1px solid ${THEME.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          bgcolor: 'background.paper',
                          boxShadow: tool.accent ? `0 4px 20px ${alpha('#335ede', isDark ? 0.2 : 0.1)}` : 'none',
                          overflow: 'visible',
                          '&:hover': {
                            boxShadow: tool.accent
                              ? `0 8px 28px ${alpha('#335ede', isDark ? 0.3 : 0.16)}`
                              : isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0, 0, 0, 0.08)',
                            borderColor: alpha('#335ede', 0.4),
                            transform: 'translateY(-2px)'
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              bgcolor: tool.accent ? THEME.primary : THEME.primarySoft,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Icon sx={{ fontSize: 24, color: tool.accent ? '#fff' : THEME.primary }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.8, color: THEME.primary, textTransform: 'uppercase', mb: 0.35 }}>
                              {tool.category}
                            </Typography>
                            <Typography sx={{ fontWeight: 700, color: THEME.textPrimary, fontSize: '0.98rem', lineHeight: 1.25, mb: 0.5 }}>
                              {tool.title}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography sx={{ color: THEME.textSecondary, fontSize: '0.8rem', lineHeight: 1.45, mb: 3, flex: 1 }}>
                          {tool.desc}
                        </Typography>

                        <Button
                          fullWidth
                          variant={tool.accent ? 'contained' : 'outlined'}
                          size="small"
                          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '16px !important' }} />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            borderRadius: 1.5,
                            py: 0.85,
                            ...(tool.accent
                              ? {
                                  bgcolor: THEME.primary,
                                  color: '#fff',
                                  '&:hover': { bgcolor: '#2a4bc4' },
                                }
                              : {
                                  color: THEME.primary,
                                  borderColor: THEME.primary,
                                  '&:hover': { bgcolor: THEME.primarySoft },
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
              </motion.div>
            )}
        </AnimatePresence>
      </Box>

      {/* ─── CREATE MODAL ─────────────────────────────── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}>
        {/* Modal header */}
        <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5, bgcolor: 'background.paper', borderBottom: `1px solid ${THEME.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: THEME.primarySoft }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: THEME.primary }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.textPrimary }}>Start a Prep Session</Typography>
            </Box>
            <IconButton size="small" onClick={() => setModalOpen(false)} sx={{ color: THEME.textSecondary }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography sx={{ color: THEME.textSecondary, ml: 5.5, fontSize: '0.9rem' }}>
            Paste the JD and our AI will generate a custom prep pack for you.
          </Typography>
        </Box>

        <DialogContent sx={{ p: 3.5 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.82rem' }}>Job Link <Typography component="span" variant="caption" sx={{ color: 'text.disabled', fontWeight: 400 }}>(optional)</Typography></Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 2.5, border: '1.5px solid', borderColor: 'divider', overflow: 'hidden', '&:focus-within': { borderColor: '#2563eb' }, transition: 'border-color 0.2s' }}>
              <Box sx={{ px: 1.5, py: 1.2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>https://</Typography>
              </Box>
              <input value={jobLink} onChange={(e) => setJobLink(e.target.value)} placeholder="linkedin.com/jobs/..." style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '10px 14px', fontSize: '0.88rem', color: isDark ? '#e2e8f0' : '#1e293b', fontFamily: 'inherit' }} />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Job Description</Typography>
              <Typography variant="caption" sx={{ color: jobDescription.length > 9000 ? 'warning.main' : 'text.disabled' }}>
                {(JOB_DESCRIPTION_MAX - jobDescription.length).toLocaleString()} left
              </Typography>
            </Box>
            <TextField fullWidth multiline rows={7} placeholder={'Paste the full job posting here…\n\nThe more detail you include, the better your personalized Q&A and gap analysis will be.'} value={jobDescription} onChange={(e) => setJobDescription(e.target.value.slice(0, JOB_DESCRIPTION_MAX))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontSize: '0.9rem', lineHeight: 1.7, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb' } } }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button fullWidth variant="outlined" onClick={() => setModalOpen(false)} sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none', py: 1.2, color: THEME.textSecondary, borderColor: THEME.border }}>
              Cancel
            </Button>
            <Button fullWidth variant="contained" disableElevation onClick={handleCreate} disabled={!jobDescription.trim() && !jobLink.trim()} startIcon={<AutoAwesomeRoundedIcon />} sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none', py: 1.2, bgcolor: THEME.primary, '&:hover': { bgcolor: '#2a4bc4' } }}>
              Generate Prep Pack
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
