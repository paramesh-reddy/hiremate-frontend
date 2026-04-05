import { useState, useMemo, useEffect } from 'react';
import { 
  Box, Typography, TextField, InputAdornment, Tabs, Tab, 
  useTheme, useMediaQuery, alpha, Chip, Tooltip, IconButton, 
  Grid, CircularProgress, Card, Stack, Skeleton, Button 
} from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getInterviewQuestionsAPI, loadMoreInterviewQuestionsAPI } from '../../services/interviewService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { Target, Settings, Users } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';

const THEME = {
  primary: 'var(--primary, #335ede)',
  primarySoft: 'var(--light-blue-bg, rgba(51, 94, 222, 0.08))',
  border: 'var(--divider, rgba(0, 0, 0, 0.08))',
  textPrimary: 'var(--text-primary, #1e293b)',
  textSecondary: 'var(--text-secondary, #64748b)',
};

const STAR_COLORS = { 
  s: '#3b82f6', 
  t: '#2563eb', 
  a: '#335ede', 
  r: '#10b981' 
};

const STAR_LABELS = { 
  s: 'Situation', 
  t: 'Task', 
  a: 'Action', 
  r: 'Result' 
};

const TAB_LABELS = [
  { label: 'Likely Questions', icon: Target },
  { label: 'Technical', icon: Settings },
  { label: 'HR & Culture', icon: Users },
  { label: 'Behavioral', icon: PsychologyRoundedIcon }
];

export default function InterviewQnAGenerator() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const profileTitle = location.state?.profileTitle || 'Software Engineer';

  const { interviewId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [detailTab, setDetailTab] = useState(0);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['interview-questions', interviewId],
    queryFn: async () => {
      const response = await getInterviewQuestionsAPI(interviewId);
      return response.data;
    },
    enabled: !!interviewId
  });

  const { mutate: loadMore, isPending: isGenerating } = useMutation({
    mutationFn: (category) => loadMoreInterviewQuestionsAPI(interviewId, category),
    onSuccess: () => {
      queryClient.invalidateQueries(['interview-questions', interviewId]);
    }
  });

  const CATEGORIES = ['Likely Questions', 'Technical', 'HR & Culture', 'Behavioral'];

  const filtered = useMemo(() => {
    let list = questions;
    const catName = CATEGORIES[activeTab];
    if (activeTab > 0) {
      list = list.filter(q => q.category.toLowerCase().includes(catName.split(' ')[0].toLowerCase()));
    }
    if (!search.trim()) return list;
    return list.filter((q) => (q.question_text || "").toLowerCase().includes(search.toLowerCase()));
  }, [search, questions, activeTab]);

  const selected = filtered[selectedIdx] ?? filtered[0];

  const prev = () => setSelectedIdx((i) => Math.max(0, i - 1));
  const next = () => setSelectedIdx((i) => Math.min(filtered.length - 1, i + 1));

  return (
    <PageContainer sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0, bgcolor: 'background.default' }}>

      {/* ── Top bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.5, bgcolor: 'background.paper', borderBottom: `1px solid ${THEME.border}` }}>
        <IconButton size="small" onClick={() => navigate('/interview-practice')} sx={{ color: THEME.textSecondary, bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04), borderRadius: 1.5, '&:hover': { bgcolor: THEME.primarySoft, color: THEME.primary } }}>
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.8, color: THEME.primary, textTransform: 'uppercase' }}>Interview Prep Pack</Typography>
          <Typography sx={{ fontWeight: 800, color: THEME.textPrimary, fontSize: '0.9375rem' }} noWrap>{profileTitle}</Typography>
        </Box>
        <Chip 
          label={`${filtered.length} curated questions`} 
          size="small" 
          sx={{ fontWeight: 700, fontSize: '0.6875rem', bgcolor: THEME.primarySoft, color: THEME.primary, border: `1px solid ${alpha('#335ede', 0.12)}` }} 
        />
      </Box>

      {/* ── Tabs ── */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${THEME.border}` }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => { setActiveTab(v); setSelectedIdx(0); setSearch(''); }}
          variant={isMobile ? 'scrollable' : 'standard'}
          sx={{
            px: 2,
            minHeight: 48,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              minHeight: 48,
              gap: 1,
              flexDirection: 'row',
              color: THEME.textSecondary,
              '&.Mui-selected': { color: THEME.primary },
              transition: 'all 0.2s',
            },
            '& .MuiTabs-indicator': {
              background: THEME.primary,
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          {TAB_LABELS.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={i}
                label={tab.label}
                icon={<Icon size={16} />}
                iconPosition="start"
              />
            );
          })}
        </Tabs>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {isLoading && (
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 10, bgcolor: alpha(theme.palette.background.paper, 0.8), display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} thickness={4} sx={{ color: THEME.primary }} />
              <Typography sx={{ mt: 2, fontWeight: 700, color: THEME.textPrimary }}>Customizing your prep pack...</Typography>
            </Box>
          </Box>
        )}

        {/* Question list */}
        <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
          <Box sx={{ p: 2, borderBottom: `1px solid ${THEME.border}` }}>
            <Box sx={{ 
              display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, 
              borderRadius: 2, border: `1px solid ${THEME.border}`, 
              bgcolor: isDark ? alpha('#fff', 0.03) : '#f8fafc',
              '&:focus-within': { borderColor: THEME.primary, bgcolor: isDark ? alpha('#fff', 0.05) : '#fff' },
              transition: 'all 0.2s'
            }}>
              <SearchRoundedIcon sx={{ fontSize: 18, color: THEME.textSecondary }} />
              <input 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); }} 
                placeholder="Search master Q&A…" 
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8125rem', color: THEME.textPrimary, fontFamily: 'inherit' }} 
              />
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 1.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 } }}>
            {filtered.map((q, idx) => {
              const isActive = selected?.id === q.id;
              return (
                <motion.div key={q.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Box 
                    onClick={() => setSelectedIdx(idx)} 
                    sx={{ 
                      p: 2, mb: 1, borderRadius: 2, cursor: 'pointer', border: '1px solid', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                      borderColor: isActive ? alpha('#335ede', 0.2) : 'transparent', 
                      bgcolor: isActive ? THEME.primarySoft : 'transparent', 
                      '&:hover': { 
                        bgcolor: isActive ? alpha('#335ede', 0.12) : alpha('#000', 0.03),
                        transform: isActive ? 'none' : 'translateX(4px)'
                      }, 
                      boxShadow: isActive ? `0 4px 12px ${alpha('#335ede', 0.1)}` : 'none' 
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontWeight: 800, color: isActive ? THEME.primary : THEME.textSecondary, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Question {idx + 1}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: q.complexity === 'Easy' ? '#10b981' : q.complexity === 'Medium' ? '#335ede' : '#7c3aed' }} />
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: THEME.textSecondary }}>{q.duration}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.5, color: THEME.textPrimary }}>{q.question_text}</Typography>
                  </Box>
                </motion.div>
              );
            })}
            {filtered.length === 0 && <Box sx={{ textAlign: 'center', py: 6 }}><Typography variant="body2" sx={{ color: THEME.textSecondary }}>No questions found in this category.</Typography></Box>}

            <Box sx={{ mt: 2, px: 0.5 }}>
              <Box
                component={motion.div}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  if (isGenerating) return;
                  const currentCat = activeTab === 0 ? null : TAB_LABELS[activeTab].label;
                  loadMore(currentCat);
                }}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  cursor: isGenerating ? 'wait' : 'pointer',
                  bgcolor: THEME.primarySoft,
                  border: `1px dashed ${alpha('#335ede', 0.3)}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha('#335ede', 0.12),
                    borderStyle: 'solid',
                    borderColor: THEME.primary
                  }
                }}
              >
                {isGenerating ? (
                  <CircularProgress size={16} thickness={6} sx={{ color: THEME.primary }} />
                ) : (
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: THEME.primary }} />
                )}
                <Typography sx={{ fontWeight: 800, color: THEME.primary, fontSize: '0.8125rem' }}>
                  {isGenerating ? 'Generating...' : 'Get More Questions'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Detail panel */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 4 }, '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 } }}>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                <Box sx={{ maxWidth: 900, mx: 'auto' }}>

                  {/* Question hero */}
                  <Box sx={{ 
                    p: { xs: 3, md: 4.5 }, borderRadius: 3, mb: 4, position: 'relative', overflow: 'hidden', 
                    bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : '#fff', 
                    border: `1px solid ${THEME.border}`,
                    boxShadow: isDark ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.04)' 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip 
                        label={selected.complexity} 
                        size="small" 
                        sx={{ 
                          fontWeight: 800, fontSize: '0.65rem', 
                          color: selected.complexity === 'Easy' ? '#10b981' : selected.complexity === 'Medium' ? THEME.primary : '#7c3aed', 
                          bgcolor: alpha(selected.complexity === 'Easy' ? '#10b981' : selected.complexity === 'Medium' ? '#335ede' : '#7c3aed', 0.08), 
                          height: 22 
                        }} 
                      />
                      <Chip label={selected.duration} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', color: THEME.textSecondary, bgcolor: alpha('#000', 0.04), height: 22 }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 2.5, fontSize: { xs: '1.5rem', md: '1.85rem' }, color: THEME.textPrimary, letterSpacing: '-0.02em' }}>
                      {selected.question_text}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, p: 2, borderRadius: 2, bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc' }}>
                      <PsychologyRoundedIcon sx={{ color: THEME.primary, mt: 0.25 }} />
                      <Typography sx={{ color: THEME.textSecondary, lineHeight: 1.7, fontSize: '0.9375rem', fontWeight: 500 }}>{selected.overview}</Typography>
                    </Box>
                  </Box>

                  {/* Intelligence Tabs */}
                  <Box sx={{ mb: 3, display: 'flex', gap: 1, borderBottom: `1px solid ${THEME.border}` }}>
                    {['Coach Insight', 'Model Answer'].map((label, i) => (
                      <Box
                        key={label}
                        onClick={() => setDetailTab(i)}
                        sx={{
                          px: 3, py: 1.5, cursor: 'pointer', position: 'relative',
                          color: detailTab === i ? THEME.primary : THEME.textSecondary,
                          fontWeight: 700, fontSize: '0.875rem',
                          transition: 'all 0.2s',
                          '&:hover': { color: THEME.primary }
                        }}
                      >
                        {label}
                        {detailTab === i && (
                          <motion.div layoutId="detailUnderline" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: THEME.primary, borderRadius: '3px 3px 0 0' }} />
                        )}
                      </Box>
                    ))}
                  </Box>

                  <AnimatePresence mode="wait">
                    {detailTab === 0 ? (
                      <motion.div key="insight" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                        <Grid container spacing={2.5}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 3, height: '100%', borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${THEME.border}`, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                                <Box sx={{ p: 0.75, borderRadius: 1, bgcolor: THEME.primarySoft, color: THEME.primary }}>
                                  <TipsAndUpdatesRoundedIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: THEME.primary, letterSpacing: 0.5 }}>The Interviewer's Intent</Typography>
                              </Box>
                              <Typography sx={{ color: THEME.textSecondary, lineHeight: 1.8, fontSize: '0.9375rem', fontWeight: 500 }}>"{selected.intent}"</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 3, height: '100%', borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${THEME.border}`, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                                <Box sx={{ p: 0.75, borderRadius: 1, bgcolor: alpha('#7c3aed', 0.08), color: '#7c3aed' }}>
                                  <ChecklistRoundedIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: THEME.textPrimary, letterSpacing: 0.5 }}>Success Criteria</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {selected.expectations.map((e) => (
                                  <Chip key={e} label={e} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha('#7c3aed', 0.1), color: '#7c3aed', borderRadius: 1, border: '1px solid transparent' }} />
                                ))}
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ p: 3, borderRadius: 2, bgcolor: THEME.primarySoft, border: `1px solid ${alpha('#335ede', 0.12)}`, display: 'flex', gap: 2.5 }}>
                              <Box sx={{ flexShrink: 0 }}>
                                <AutoAwesomeRoundedIcon sx={{ fontSize: 24, color: THEME.primary }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: THEME.primary, mb: 0.5 }}>AI Coach Tip</Typography>
                                <Typography sx={{ color: THEME.textSecondary, lineHeight: 1.8, fontSize: '0.9375rem', fontWeight: 500 }}>{selected.intent.includes('behavioral') ? "Focus on the Action and Result. The Situation should be no more than 15% of your total answer time." : "Keep your answer under 2 minutes. Be precise with technical terms but explain the high-level business impact."}</Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </motion.div>
                    ) : (
                      <motion.div key="model" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                        <Box sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${THEME.border}`, boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.04)' }}>
                          
                          {/* STAR Path Visualization */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, px: { xs: 1, md: 4 } }}>
                            {['S', 'T', 'A', 'R'].map((key, i) => {
                              const lowKey = key.toLowerCase();
                              const covered = selected.starBreakdown?.[lowKey];
                              const color = STAR_COLORS[lowKey];
                              return (
                                <Box key={key} sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                  <Tooltip title={STAR_LABELS[lowKey]} arrow>
                                    <Box sx={{ 
                                      width: 36, height: 36, borderRadius: '50%', 
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      bgcolor: covered ? color : isDark ? alpha('#fff', 0.05) : '#f1f5f9',
                                      color: covered ? '#fff' : THEME.textSecondary,
                                      fontWeight: 800, fontSize: '0.8125rem',
                                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                      boxShadow: covered ? `0 0 16px ${alpha(color, 0.4)}` : 'none',
                                      transform: covered ? 'scale(1.1)' : 'scale(1)'
                                    }}>
                                      {covered ? <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> : key}
                                    </Box>
                                  </Tooltip>
                                  {i < 3 && (
                                    <Box sx={{ flex: 1, height: 3, bgcolor: covered && selected.starBreakdown?.[['s','t','a','r'][i+1].toLowerCase()] ? STAR_COLORS[['s','t','a','r'][i+1].toLowerCase()] : isDark ? alpha('#fff', 0.05) : '#f1f5f9', mx: 1.5, borderRadius: 1 }} />
                                  )}
                                </Box>
                              );
                            })}
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                            <Box sx={{ p: 0.75, borderRadius: 1, bgcolor: THEME.primarySoft, color: THEME.primary }}>
                              <BusinessRoundedIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Typography sx={{ fontWeight: 800, color: THEME.textPrimary, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.72rem' }}>Master Model Answer</Typography>
                          </Box>
                          
                          <Typography variant="body1" sx={{ lineHeight: 2, fontSize: '1rem', color: THEME.textPrimary, whiteSpace: 'pre-line', fontWeight: 500, p: 3, borderRadius: 2, bgcolor: isDark ? alpha('#fff', 0.01) : '#fafbfc', border: `1px solid ${THEME.border}` }}>
                            {selected.sampleAnswer}
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pagination Control */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, p: 2, borderRadius: 2, bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc', border: `1px solid ${THEME.border}` }}>
                    <Button 
                      startIcon={<ChevronLeftRoundedIcon />} 
                      onClick={prev} 
                      disabled={selectedIdx === 0}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2, color: THEME.textSecondary }}
                    >
                      Previous
                    </Button>
                    <Typography sx={{ fontWeight: 800, color: THEME.textPrimary, fontSize: '0.9rem' }}>
                      {selectedIdx + 1} <Typography component="span" sx={{ color: THEME.textSecondary, fontSize: '0.8rem', fontWeight: 500, mx: 0.5 }}>of</Typography> {filtered.length}
                    </Typography>
                    <Button 
                      endIcon={<ChevronRightRoundedIcon />} 
                      onClick={next} 
                      disabled={selectedIdx >= filtered.length - 1}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2, color: THEME.textSecondary }}
                    >
                      Next Question
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            ) : (
              <Box sx={{ textAlign: 'center', py: 12 }}>
                <Box sx={{ mb: 3, opacity: 0.2 }}><PsychologyRoundedIcon sx={{ fontSize: 80 }} /></Box>
                <Typography sx={{ color: THEME.textSecondary, fontWeight: 500 }}>No questions found in this category.</Typography>
              </Box>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </PageContainer>
  );
}
