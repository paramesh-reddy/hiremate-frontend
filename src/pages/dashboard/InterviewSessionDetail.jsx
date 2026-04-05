import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, IconButton, Grid, Chip, Tooltip, useTheme, 
  CircularProgress, Button, alpha, LinearProgress, Stack, Card, Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getInterviewSessionDetailAPI } from '../../services/interviewService';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import { Trophy, Wrench, Compass, Book, Clock, Lightbulb, Sparkles, ChevronRight, CheckCircle2, Star, Target, BrainCircuit, Award, Calendar, Timer } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';

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
  s: { label: 'Situation', desc: 'Set the scene', color: 'var(--primary)', bg: 'var(--light-blue-bg-08)' },
  t: { label: 'Task', desc: 'Your responsibility', color: 'var(--secondary)', bg: 'var(--light-blue-bg-08)' },
  a: { label: 'Action', desc: 'Steps you took', color: 'var(--info)', bg: 'var(--light-blue-bg-08)' },
  r: { label: 'Result', desc: 'Quantified outcome', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.08)' },
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── FIXED COLORS FOR ALPHA() ──
const SUCCESS_HEX = '#10b981';
const PRIMARY_HEX = '#335ede';
const MUTED_HEX = '#64748b';

function scoreColorHex(s) {
  return s >= 75 ? SUCCESS_HEX : s >= 50 ? PRIMARY_HEX : MUTED_HEX;
}

export default function InterviewSessionDetail() {
  const { interviewId, sessionId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['interview-session', sessionId],
    queryFn: async () => {
      const response = await getInterviewSessionDetailAPI(sessionId);
      return response.data;
    },
    enabled: !!sessionId
  });

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

  if (error || !session) {
    return (
      <Box sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: bg, p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 950, letterSpacing: '-0.02em' }}>Session Log Not Found</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ borderRadius: 2, px: 4 }}>Go Back</Button>
      </Box>
    );
  }

  return (
    <PageContainer sx={{ display: 'flex', flexDirection: 'column', p: 0, bgcolor: bg, height: 'calc(100vh - var(--navbar-height))', overflow: 'auto' }}>
      
      {/* ── Sticky Header (Studio Elite) ── */}
      <Box 
        sx={{ 
          position: 'sticky', top: 0, zIndex: 100,
          p: { xs: 2.5, md: 3 }, 
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${border}`, 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ border: `1px solid ${border}`, borderRadius: 1.5, width: 44, height: 44, color: textColor, '&:hover': { bgcolor: THEME.bgLight } }}>
             <ArrowBackRoundedIcon />
          </IconButton>
          <Box>
            <Typography sx={{ fontWeight: 950, fontSize: '1.25rem', color: textColor, letterSpacing: '-0.03em', lineHeight: 1 }}>Session Breakdown</Typography>
            <Typography sx={{ color: muted, fontSize: '0.75rem', fontWeight: 800, mt: 0.5, textTransform: 'uppercase', letterSpacing: 1.5 }}>Journal Ref ID — #{sessionId}</Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          disableElevation
          startIcon={<ReplayRoundedIcon />}
          onClick={() => navigate(`/interview-practice/${interviewId}/session`)}
          sx={{
            borderRadius: 2, px: 4, py: 1.5, fontWeight: 800, textTransform: 'none',
            bgcolor: THEME.primary, '&:hover': { bgcolor: 'var(--primary-dark)' }
          }}
        >
          Practice Again
        </Button>
      </Box>

      {/* ── Zero-Gravity Content ── */}
      <Box sx={{ mx: 'auto', width: '100%', p: { xs: 3, md: 6 }, display: 'flex', flexDirection: 'column', gap: 6 }}>
        
        {/* Performance Hero Bar — Balanced row of Studio Cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
           <Grid container spacing={3}>
              {[
                { category: 'Performance', title: 'Overall Accuracy', val: `${session.score}%`, icon: Award, accent: true, color: scoreColorHex(session.score) },
                { category: 'Efficiency', title: 'Session Time', val: formatTime(session.duration), icon: Timer, accent: false, color: PRIMARY_HEX },
                { category: 'Reference', title: 'Completion Date', val: new Date(session.date).toLocaleDateString(), icon: Calendar, accent: false, color: PRIMARY_HEX },
              ].map((m, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card 
                      elevation={0}
                      sx={{
                        p: 3,
                        height: '100%',
                        borderRadius: 2,
                        border: m.accent ? `1.5px solid ${alpha(m.color, 0.28)}` : `1px solid ${border}`,
                        bgcolor: '#fff',
                        boxShadow: m.accent ? `0 4px 20px ${alpha(m.color, 0.08)}` : 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: m.accent ? `0 8px 28px ${alpha(m.color, 0.12)}` : '0 4px 16px rgba(0,0,0,0.04)',
                          borderColor: alpha(m.color, 0.4)
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.25, mb: 2.5 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: m.accent ? m.color : THEME.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <m.icon size={22} color={m.accent ? '#fff' : THEME.primary} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.8, color: THEME.primary, textTransform: 'uppercase', mb: 0.3 }}>{m.category}</Typography>
                          <Typography sx={{ fontWeight: 700, color: THEME.textPrimary, fontSize: '0.94rem', lineHeight: 1.2 }}>{m.title}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '2.5rem', fontWeight: 950, color: m.accent ? m.color : textColor, letterSpacing: '-0.02em', lineHeight: 1 }}>{m.val}</Typography>
                        {m.accent && <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: muted, textTransform: 'uppercase' }}>STAR Accuracy</Typography>}
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
           </Grid>
        </motion.div>

        {/* AI Insights Bar — Full Width Accent Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
           <Card 
             elevation={0}
             sx={{ 
                p: 4.5, borderRadius: 2, 
                border: '1.5px solid rgba(51, 94, 222, 0.28)',
                bgcolor: '#fff',
                boxShadow: '0 4px 20px rgba(51, 94, 222, 0.05)',
                display: 'flex', flexDirection: 'column', gap: 3
             }}
           >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.25 }}>
                 <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: THEME.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BrainCircuit size={24} />
                 </Box>
                 <Typography sx={{ fontWeight: 950, fontSize: '1.4rem', color: THEME.primary, letterSpacing: '-0.02em' }}>Coach Intelligence</Typography>
              </Box>
              <Typography sx={{ color: textColor, fontWeight: 500, fontSize: '1.1rem', lineHeight: 1.8 }}>
                 "You consistently balanced Situation and Action perfectly across {session.answers.length} scenarios. To reach high-tier efficiency, focus on quantifying the **Result** specifically for technical implementations."
              </Typography>
              <Box sx={{ mt: 1, p: 2.5, borderRadius: 2, bgcolor: THEME.bgLight, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Sparkles size={18} color="var(--primary)" />
                 <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: textColor }}>Top Highlight: Crystal clear behavioral storytelling detected.</Typography>
              </Box>
           </Card>
        </motion.div>

        {/* Detailed Breakdown — Flat Question Stack */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
           <Typography sx={{ fontWeight: 950, fontSize: '1.5rem', color: textColor, px: 1, letterSpacing: '-0.03em' }}>Question-by-Question Deep Dive</Typography>
           
           {session.answers.map((a, idx) => (
             <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 3, md: 5 }, borderRadius: 2, border: `1px solid ${border}`, bgcolor: '#fff', 
                    display: 'flex', flexDirection: 'column', gap: 4, transition: 'all 0.2s', 
                    '&:hover': { borderColor: THEME.primary, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' } 
                  }}
                >
                   <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: THEME.primarySoft, color: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, flexShrink: 0, fontSize: '1.1rem' }}>
                         {idx + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                         <Box sx={{ display: 'flex', gap: 1, mb: 1.25 }}>
                            <Chip label={a.category} size="small" sx={{ height: 18, fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', bgcolor: THEME.primarySoft, color: THEME.primary, borderRadius: 1 }} />
                            <Chip label={`${a.star_score}% Performance`} size="small" sx={{ height: 18, fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', bgcolor: alpha(scoreColorHex(a.star_score), 0.08), color: scoreColorHex(a.star_score), borderRadius: 1, border: `1px solid ${alpha(scoreColorHex(a.star_score), 0.2)}` }} />
                         </Box>
                         <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: textColor, lineHeight: 1.4 }}>{a.question}</Typography>
                      </Box>
                   </Box>

                   <Box sx={{ p: 3.5, borderRadius: 2, bgcolor: THEME.bgLight, border: `1px solid ${border}` }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.65rem', color: muted, textTransform: 'uppercase', mb: 1.5, letterSpacing: 1 }}>Your Response</Typography>
                      <Typography sx={{ fontSize: '1.05rem', color: textColor, lineHeight: 1.9, fontWeight: 500 }}>"{a.answer}"</Typography>
                   </Box>

                   <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {Object.keys(STAR_CONFIG).map((key) => {
                         const cfg = STAR_CONFIG[key];
                         const active = a.star_breakdown?.[key];
                         return (
                            <Box key={key} sx={{ px: 2, py: 0.8, borderRadius: 2, border: active ? `1.5px solid ${cfg.color}` : `1px solid ${border}`, bgcolor: active ? cfg.bg : 'transparent', display: 'flex', alignItems: 'center', gap: 1 }}>
                               {active ? <CheckRoundedIcon sx={{ fontSize: 16, color: cfg.color }} /> : <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${border}` }} />}
                               <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: active ? cfg.color : muted, textTransform: 'uppercase' }}>{cfg.label}</Typography>
                            </Box>
                         )
                      })}
                   </Box>

                   <Box sx={{ p: 3.5, borderRadius: 2, bgcolor: 'rgba(51, 94, 222, 0.04)', border: `1.5px solid rgba(51, 94, 222, 0.15)`, display: 'flex', gap: 2.5 }}>
                      <Box sx={{ mt: 0.3 }}><AutoAwesomeRoundedIcon sx={{ color: THEME.primary, fontSize: 24 }} /></Box>
                      <Box>
                         <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: THEME.primary, mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Deep Analysis & Strategy</Typography>
                         <Typography sx={{ fontSize: '0.98rem', color: textColor, lineHeight: 1.8, fontWeight: 500 }}>{a.feedback}</Typography>
                      </Box>
                   </Box>
                </Card>
             </motion.div>
           ))}
        </Box>
      </Box>
    </PageContainer>
  );
}
