import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Typography, Chip, Button, CircularProgress, useTheme, alpha, 
  Grid, Card, IconButton, Stack, Divider 
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import { 
  Briefcase, Globe, Target, BrainCircuit, Sparkles, 
  History, ShieldCheck, Zap 
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import { getApplicationAPI, withdrawApplicationAPI } from '../../services/applicationsService';

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

const STATUS_CONFIG = {
  applied:              { bg: 'rgba(148,163,184,0.1)', color: '#64748B',  dot: '#94A3B8',  label: 'Application Sent'  },
  acknowledged:         { bg: 'rgba(37,99,235,0.08)',  color: '#2563EB',  dot: '#2563EB',  label: 'Acknowledged'      },
  in_review:            { bg: 'rgba(245,158,11,0.08)',   color: '#D97706',  dot: '#F59E0B',  label: 'Under Review'      },
  interview_scheduled:  { bg: 'rgba(124,58,237,0.08)',  color: '#7C3AED',  dot: '#7C3AED',  label: 'Interview Set'     },
  interview_completed:  { bg: 'rgba(99,102,241,0.08)',  color: '#6366F1',  dot: '#6366F1',  label: 'Interview Done'    },
  offer_received:       { bg: 'rgba(16,185,129,0.08)',  color: '#10B981',  dot: '#10B981',  label: 'Offer Unlocked'    },
  rejected:             { bg: 'rgba(239,68,68,0.08)',   color: '#EF4444',  dot: '#EF4444',  label: 'Closed'            },
  ghosted:              { bg: 'rgba(148,163,184,0.1)',  color: '#64748B',  dot: '#94A3B8',  label: 'Dormant'           },
  withdrawn:            { bg: 'rgba(245,158,11,0.08)',   color: '#D97706',  dot: '#F59E0B',  label: 'Withdrawn'         },
};

const TIMELINE_ICON = {
  offer_received:       <CheckCircleOutlineRoundedIcon fontSize="small" />,
  rejected:             <CancelOutlinedIcon fontSize="small" />,
  interview_scheduled:  <CalendarTodayRoundedIcon fontSize="small" />,
  ghosted:              <AccessTimeRoundedIcon fontSize="small" />,
  withdrawn:            <CloseRoundedIcon fontSize="small" />,
};

function HealthGauge({ percent, label, icon: Icon }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {Icon && <Icon size={14} color={THEME.primary} />}
          <Typography variant="caption" fontWeight={850} color={THEME.textPrimary} sx={{ textTransform: 'uppercase', letterSpacing: '0.1rem', fontSize: '0.65rem' }}>
            {label}
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={900} color={THEME.primary} sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
          {percent}%
        </Typography>
      </Box>
      <Box sx={{ height: 8, bgcolor: THEME.bgLight, borderRadius: 99, overflow: 'hidden', border: `1px solid ${THEME.border}` }}>
        <motion.div
           initial={{ width: 0 }}
           animate={{ width: `${percent}%` }}
           transition={{ duration: 1.2, ease: 'easeOut' }}
           style={{ height: '100%', background: `linear-gradient(90deg, ${THEME.primary}, #7C3AED)`, borderRadius: 99 }}
        />
      </Box>
    </Box>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplicationAPI(id).then((r) => r.data),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => withdrawApplicationAPI(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['application', id] });
      qc.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!app) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, bgcolor: 'background.default' }}>
        <Typography variant="h6" fontWeight={700}>Application not found.</Typography>
        <Button onClick={() => navigate('/application-tracker')} variant="contained" sx={{ borderRadius: 24, textTransform: 'none' }}>
          Back to tracker
        </Button>
      </Box>
    );
  }

  const isActive = !['withdrawn', 'rejected', 'ghosted'].includes(app.current_status);
  const status = STATUS_CONFIG[app.current_status] ?? STATUS_CONFIG.applied;

  return (
    <PageContainer sx={{ display: 'flex', flexDirection: 'column', p: 0, bgcolor: THEME.bgPage, height: 'calc(100vh - var(--navbar-height))', overflow: 'auto' }}>
      
      {/* ── Sticky Header (Studio Elite) ── */}
      <Box 
        sx={{ 
          position: 'sticky', top: 0, zIndex: 100,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${THEME.border}`, 
          py: 2, px: { xs: 3, md: 6 }
        }}
      >
        <Box sx={{ mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <IconButton onClick={() => navigate('/application-tracker')} sx={{ border: `1px solid ${THEME.border}`, borderRadius: 1.5, width: 44, height: 44, color: THEME.textPrimary, '&:hover': { bgcolor: THEME.bgLight } }}>
               <ArrowBackRoundedIcon />
            </IconButton>
            <Box>
              <Typography sx={{ fontWeight: 950, fontSize: '1.25rem', color: THEME.textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>Application Track</Typography>
              <Typography sx={{ color: THEME.textSecondary, fontSize: '0.75rem', fontWeight: 800, mt: 0.5, textTransform: 'uppercase', letterSpacing: 1.5 }}>Reference ID — #{id.slice(-8).toUpperCase()}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Content Grid ── */}
      <Box sx={{ mx: 'auto', width: '100%', p: { xs: 3, md: 6 }, display: 'flex', flexDirection: 'column', gap: 5 }}>
        
        {/* Identity Hero Bar */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
           <Grid container spacing={4} sx={{ flexWrap: "nowrap" }} >
              {[
                { category: 'Position', title: app.role, val: app.company, icon: Briefcase, accent: true, color: '#335ede' },
                { category: 'Status', title: 'Current Phase', val: status.label, icon: Target, accent: false, color: status.dot },
                { category: 'Sync', title: 'Intelligence Port', val: app.platform || 'Direct-Connect', icon: Globe, accent: false, color: '#5b21b6' },
              ].map((m, i) => (
                <Grid item width={"100%"} key={i}>
                  <Card 
                    elevation={0}
                    sx={{
                      p: 4, height: '100%', borderRadius: 2.5,
                      border: m.accent ? `1.5px solid ${alpha(m.color, 0.28)}` : `1px solid ${THEME.border}`,
                      bgcolor: THEME.bgCard,
                      boxShadow: m.accent ? `0 4px 20px ${alpha(m.color, 0.08)}` : 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: m.accent ? `0 8px 28px ${alpha(m.color, 0.12)}` : '0 4px 16px rgba(0,0,0,0.04)',
                        borderColor: alpha(m.color, 0.4)
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.25, mb: 3 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: m.accent ? m.color : THEME.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <m.icon size={22} color={m.accent ? '#fff' : THEME.primary} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1, color: THEME.primary, textTransform: 'uppercase', mb: 0.3 }}>{m.category}</Typography>
                        <Typography noWrap sx={{ fontWeight: 850, color: THEME.textPrimary, fontSize: '0.94rem', lineHeight: 1.2 }}>{m.title}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 950, color: m.accent ? m.color : THEME.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{m.val}</Typography>
                  </Card>
                </Grid>
              ))}
           </Grid>
        </motion.div>

        {/* Intelligence Ledger Stack */}
        <Grid container spacing={4}>
          <Grid item width={"100%"}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1 }}>
                <History size={24} color={THEME.textPrimary} />
                <Typography sx={{ fontWeight: 950, fontSize: '1.5rem', color: THEME.textPrimary, letterSpacing: '-0.03em' }}>Application History</Typography>
              </Box>
              
            {(!app.history || app.history.length === 0) ? (
              <Typography sx={{ color: THEME.textSecondary, px: 1, fontStyle: 'italic' }}>No ledger entries detected.</Typography>
            ) : (
              <Box sx={{ position: 'relative', mt: 2 }}>
                {/* Visual Connector Line (Precisely Centered at 22px for 44px nodes) */}
                <Box 
                  sx={{ 
                    position: 'absolute', left: 21, top: 20, bottom: 20, width: 2, 
                    background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                    borderRadius: 1, zIndex: 0
                  }} 
                />

                <Stack spacing={4}>
                  {[...app.history].reverse().map((a, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <motion.div 
                        key={a.id} 
                        initial={{ opacity: 0, x: -10 }} 
                        whileInView={{ opacity: 1, x: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Box sx={{ display: 'flex', gap: { xs: 2.5, md: 5 }, position: 'relative', zIndex: 1, pl: { xs: 0, md: 0 } }}>
                          {/* Timeline Node */}
                          <Box 
                            sx={{ 
                              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                              bgcolor: isLatest ? THEME.primary : THEME.bgCard,
                              color: isLatest ? '#fff' : THEME.primary,
                              border: `2px solid ${isLatest ? THEME.primary : THEME.border}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: isLatest ? `0 0 15px ${alpha(theme.palette.primary.main, 0.35)}` : 'none',
                              zIndex: 2, transition: 'all 0.2s',
                              '&:hover': { transform: 'scale(1.05)', borderColor: THEME.primary }
                            }}
                          >
                            {TIMELINE_ICON[a.status] ?? <InfoOutlinedIcon fontSize="small" />}
                          </Box>

                          {/* Phase Detail Card */}
                          <Card 
                            elevation={0} 
                            sx={{ 
                              p: { xs: 3, md: 4 }, flex: 1, borderRadius: 2, 
                              border: `1px solid ${isLatest ? alpha(theme.palette.primary.main, 0.2) : THEME.border}`, 
                              bgcolor: THEME.bgCard, transition: 'all 0.2s',
                              '&:hover': { borderColor: THEME.primary, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' } 
                            }}
                          >
                             <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                                <Box>
                                  <Typography sx={{ fontWeight: 900, color: THEME.textPrimary, fontSize: '1.15rem', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
                                     {(a.status || '').replace(/_/g, ' ')}
                                  </Typography>
                                  <Typography sx={{ fontWeight: 800, fontSize: '0.7rem', color: THEME.textSecondary, textTransform: 'uppercase', mt: 0.75 }}>
                                    {new Date(a.changed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={isLatest ? "Latest" : "Log"} 
                                  size="small" 
                                  sx={{ 
                                    height: 20, fontWeight: 900, fontSize: '0.6rem', textTransform: 'uppercase', 
                                    bgcolor: THEME.bgLight, color: THEME.textSecondary, borderRadius: 1.5, border: `1px solid ${THEME.border}` 
                                  }} 
                                />
                             </Box>

                             <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: THEME.bgLight, border: `1px solid ${THEME.border}` }}>
                                <Typography sx={{ fontSize: '1rem', color: THEME.textPrimary, lineHeight: 1.8, fontWeight: 500 }}>
                                   {a.summary || "Phase evolution documented in tactical intelligence ledger."}
                                </Typography>
                             </Box>
                          </Card>
                        </Box>
                      </motion.div>
                    );
                  })}
                </Stack>
              </Box>
            )}
            </Box>
          </Grid>

          <Grid item width={"100%"} >
            <Stack spacing={3}>
              <Card sx={{ p: 4, borderRadius: 2, border: `1px solid ${THEME.border}`, bgcolor: THEME.bgCard }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <ShieldCheck size={20} color={THEME.primary} />
                  <Typography sx={{ fontWeight: 900, fontSize: '0.75rem', color: THEME.textPrimary, textTransform: 'uppercase', letterSpacing: '0.12rem' }}>Operational Health</Typography>
                </Box>
                <Stack spacing={4}>
                  <HealthGauge percent={75} label="Recruiter Alignment" icon={Target} />
                  <HealthGauge percent={40} label="Market Velocity" icon={Zap} />
                  <HealthGauge percent={62} label="Conversion Index" icon={TrendingUpRoundedIcon} />
                </Stack>
              </Card>

              <Card sx={{ p: 4, borderRadius: 2, border: `1px solid ${THEME.border}`, bgcolor: THEME.bgCard, position: 'relative', overflow: 'hidden' }}>
                 <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, bgcolor: THEME.primary, borderRadius: '50%', opacity: 0.05 }} />
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <AutoAwesomeRoundedIcon sx={{ color: THEME.primary, fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 900, fontSize: '0.75rem', color: THEME.textSecondary, textTransform: 'uppercase', letterSpacing: '0.12rem' }}>Cortex Insights</Typography>
                 </Box>
                 <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: THEME.textPrimary, lineHeight: 1.7 }}>
                    {app.interview_process || `Benchmark analysis indicates ${app.company} usually conducts a 30m screener followed by technical rounds.`}
                 </Typography>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
