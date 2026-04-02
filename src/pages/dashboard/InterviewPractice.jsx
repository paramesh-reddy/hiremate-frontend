import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Dialog, DialogContent, TextField,
  InputAdornment, IconButton, CircularProgress, Chip, alpha,
  useTheme, Skeleton, Tooltip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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

function scoreColor(score) {
  if (score >= 75) return '#2563eb'; // Primary Blue
  if (score >= 50) return '#0ea5e9'; // Sky Blue
  return 'rgba(37,99,235,0.6)'; // Muted Blue
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
  { key: 'questions', label: 'Q&A Generator', desc: 'Study likely, technical & HR questions with model answers and STAR breakdowns.', icon: PsychologyRoundedIcon, color: '#2563eb', bg: 'rgba(37,99,235,0.1)', route: 'questions', badge: 'Popular' },
  { key: 'session', label: 'Mock Interview', desc: 'Live AI interviewer. Answer out loud or type — get instant STAR feedback per question.', icon: MicRoundedIcon, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', route: 'session', badge: 'Live' },
  { key: 'briefing', label: 'Company Briefing', desc: 'Pre-interview intel: recruiter thread, interview rounds, culture signals & prep topics.', icon: BusinessRoundedIcon, color: '#2563eb', bg: 'rgba(37,99,235,0.1)', route: 'briefing', badge: null },
];

export default function InterviewPractice() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [modalOpen, setModalOpen] = useState(false);
  const [jobLink, setJobLink] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [interviews, setInterviews] = useState(defaultInterviews);
  const [selectedId, setSelectedId] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);

  const selected = interviews.find((i) => i.id === selectedId);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return interviews;
    const q = searchQuery.toLowerCase();
    return interviews.filter((i) => i.title.toLowerCase().includes(q) || i.companyName.toLowerCase().includes(q));
  }, [searchQuery, interviews]);

  const handleCreate = () => {
    if (!jobDescription.trim() && !jobLink.trim()) return;
    setIsGenerating(true);
    setModalOpen(false);
    const raw = jobDescription.trim().split('\n')[0]?.trim() || jobLink.trim() || 'New Interview';
    const title = raw.length > 48 ? raw.slice(0, 45) + '…' : raw;
    setTimeout(() => {
      const id = String(Date.now());
      const newItem = { id, title, companyName: 'Analyzing JD…', readinessScore: 0, weakSpots: [], insights: 'AI is generating your personalized prep plan…' };
      setInterviews((p) => [newItem, ...p]);
      setSelectedId(id);
      setIsGenerating(false);
      setJobLink('');
      setJobDescription('');
    }, 2400);
  };

  return (
    <PageContainer sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'row', p: 0, overflow: 'hidden', bgcolor: 'background.default' }}>

      {/* ─── LEFT SIDEBAR ─────────────────────────────── */}
      <Box sx={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>

        {/* Sidebar header */}
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, color: 'text.disabled', mb: 2 }}>
            Prep Sessions
          </Typography>
          <Button
            fullWidth variant="contained" startIcon={<AddRoundedIcon />}
            onClick={() => setModalOpen(true)}
            sx={{ borderRadius: 2.5, py: 1.1, fontWeight: 700, textTransform: 'none', fontSize: '0.9rem', boxShadow: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)', '&:hover': { boxShadow: '0 8px 20px rgba(37,99,235,0.3)', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }}
          >
            New Session
          </Button>
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
            <SearchRoundedIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions…"
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem', color: isDark ? '#e2e8f0' : '#1e293b', fontFamily: 'inherit' }}
            />
          </Box>
        </Box>

        {/* Session list */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 1.5, pb: 2, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 } }}>
          {isGenerating && (
            <Box sx={{ p: 1.5, mb: 1, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Skeleton variant="circular" width={36} height={36} />
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
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, mb: 0.75, borderRadius: 2.5, cursor: 'pointer', border: '1px solid', transition: 'all 0.2s ease', borderColor: isActive ? '#2563eb' : 'transparent', bgcolor: isActive ? alpha('#2563eb', 0.09) : 'transparent', '&:hover': { bgcolor: isActive ? alpha('#2563eb', 0.12) : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', '& .del-btn': { opacity: 1 } } }}
                >
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, background: isActive ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', flexShrink: 0 }}>
                    {getInitials(item.title)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 700, fontSize: '0.82rem', color: isActive ? '#2563eb' : 'text.primary' }}>{item.title}</Typography>
                    <Typography variant="caption" noWrap sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>{item.companyName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: sc, boxShadow: `0 0 6px ${sc}` }} />
                    <IconButton className="del-btn" size="small" onClick={(e) => { e.stopPropagation(); setInterviews((p) => p.filter((x) => x.id !== item.id)); if (selectedId === item.id) setSelectedId(null); }} sx={{ opacity: 0, transition: 'opacity 0.2s', p: 0.4, '&:hover': { color: 'error.main' } }}>
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Box>
              </motion.div>
            );
          })}
          {filtered.length === 0 && !isGenerating && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.82rem' }}>No sessions found</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 } }}>
        <AnimatePresence mode="wait">
          {!selectedId ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center', maxWidth: 380, p: 4 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: 4, background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(14,165,233,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 38, color: '#2563eb' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>Ready to ace your interviews?</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
                  Create a prep session for a specific job or pick from your history on the left.
                </Typography>
                <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setModalOpen(true)} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', boxShadow: 'none' }}>
                  Create Your First Session
                </Button>
              </Box>
            </motion.div>
          ) : (
            <motion.div key={selectedId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Box sx={{ p: { xs: 2.5, md: 4 }, mx: 'auto' }}>

                {/* ── Hero header ── */}
                <Box sx={{ borderRadius: 4, overflow: 'hidden', mb: 4, background: isDark ? 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(14,165,233,0.12) 100%)' : 'linear-gradient(135deg, rgba(37,99,235,0.09) 0%, rgba(14,165,233,0.06) 100%)', border: '1px solid', borderColor: isDark ? 'rgba(37,99,235,0.2)' : 'rgba(37,99,235,0.12)', p: { xs: 2.5, md: 3.5 }, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip label="Active Session" size="small" sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: alpha('#2563eb', 0.12), color: '#2563eb', height: 22 }} />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 0.75, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        {selected?.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{selected?.companyName}</Typography>
                      </Box>
                    </Box>

                    {/* Readiness ring */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, p: 2.5, borderRadius: 3.5, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)', border: '1px solid', borderColor: 'divider', minWidth: 110 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={100} size={60} thickness={4} sx={{ color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)', position: 'absolute' }} />
                        <CircularProgress variant="determinate" value={selected?.readinessScore ?? 0} size={60} thickness={4} sx={{ color: scoreColor(selected?.readinessScore ?? 0), filter: `drop-shadow(0 0 8px ${scoreColor(selected?.readinessScore ?? 0)}88)` }} />
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: scoreColor(selected?.readinessScore ?? 0) }}>{selected?.readinessScore ?? 0}%</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.7rem' }}>Readiness</Typography>
                      <Chip label={scoreLabel(selected?.readinessScore ?? 0)} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(scoreColor(selected?.readinessScore ?? 0), 0.12), color: scoreColor(selected?.readinessScore ?? 0) }} />
                    </Box>
                  </Box>

                  {/* Gap tags */}
                  {selected?.weakSpots?.length > 0 && (
                    <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 15, color: '#2563eb' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.68rem' }}>
                          Priority gaps to address
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {selected.weakSpots.map((s) => (
                          <Chip key={s} label={s} size="small" sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: isDark ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.08)', color: '#2563eb', border: '1px dashed rgba(37,99,235,0.35)', borderRadius: 1.5 }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* ── AI Insight ── */}
                <Box sx={{ mb: 4, p: 2.5, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'flex-start', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(37,99,235,0.12)', flexShrink: 0, mt: 0.25 }}>
                    <TipsAndUpdatesRoundedIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.68rem', display: 'block', mb: 0.5 }}>AI Coach Insight</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>{selected?.insights}</Typography>
                  </Box>
                </Box>

                {/* ── Practice tools grid ── */}
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'text.disabled', fontSize: '0.68rem', display: 'block', mb: 2 }}>
                  Practice Tools
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  {TOOLS.map((tool, idx) => {
                    const Icon = tool.icon;
                    return (
                      <motion.div key={tool.key} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                        <Box
                          onClick={() => navigate(`/interview-practice/${selectedId}/${tool.route}`)}
                          sx={{ p: 2.5, borderRadius: 3.5, cursor: 'pointer', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden', boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.04)', '&:hover': { borderColor: tool.color, boxShadow: `0 8px 28px ${tool.color}22`, transform: 'translateY(-2px)' } }}
                        >
                          {/* BG glow */}
                          <Box sx={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', bgcolor: tool.color, opacity: 0.06, filter: 'blur(20px)' }} />
                          {tool.badge && (
                            <Chip label={tool.badge} size="small" sx={{ position: 'absolute', top: 14, right: 14, height: 18, fontSize: '0.58rem', fontWeight: 800, bgcolor: tool.color, color: 'white', borderRadius: 1 }} />
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1.5 }}>
                            <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: tool.bg, flexShrink: 0 }}>
                              <Icon sx={{ fontSize: 22, color: tool.color }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3, mt: 0.3 }}>{tool.label}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, fontSize: '0.82rem', mb: 2 }}>{tool.desc}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: tool.color }}>
                              {idx < 2 ? 'Start now' : 'Open'}
                            </Typography>
                            <ArrowForwardRoundedIcon sx={{ fontSize: 14, color: tool.color }} />
                          </Box>
                        </Box>
                      </motion.div>
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
        <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5, background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(14,165,233,0.06))', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(37,99,235,0.15)' }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: '#2563eb' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Start a Prep Session</Typography>
            </Box>
            <IconButton size="small" onClick={() => setModalOpen(false)} sx={{ color: 'text.secondary' }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 5.5 }}>
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
            <Button fullWidth variant="outlined" onClick={() => setModalOpen(false)} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', py: 1.3, color: 'text.secondary', borderColor: 'divider' }}>
              Cancel
            </Button>
            <Button fullWidth variant="contained" onClick={handleCreate} disabled={!jobDescription.trim() && !jobLink.trim()} startIcon={<AutoAwesomeRoundedIcon />} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', py: 1.3, boxShadow: 'none', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', '&:hover': { boxShadow: '0 8px 20px rgba(37,99,235,0.35)' } }}>
              Generate Prep Pack
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
