import { useState, useMemo } from 'react';
import {
  Box, Typography, IconButton, Grid, useTheme, alpha, CircularProgress, Button, Card, Divider, Chip, Tabs, Tab, Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { BrainCircuit, Layers, Activity, Book, ShieldCheck, Search, Building2, Timer, Target, Compass } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import { getCompanyBriefingAPI } from '../../services/briefingService';

const PRIMARY_HEX = '#335ede';
const PRIMARY_SOFT = 'rgba(51, 94, 222, 0.08)';
const SUCCESS_HEX = '#10b981';
const BORDER_HEX = 'rgba(0,0,0,0.08)';

const ICON_MAP = {
  FlashOnRoundedIcon: SpeedRoundedIcon,
  CodeRoundedIcon: CodeRoundedIcon,
  PeopleAltRoundedIcon: PeopleAltRoundedIcon,
  EditNoteRoundedIcon: EditNoteRoundedIcon,
  BusinessRoundedIcon: BusinessRoundedIcon,
  WorkspacePremiumRoundedIcon: WorkspacePremiumRoundedIcon,
  RocketLaunchRoundedIcon: RocketLaunchRoundedIcon,
  HubRoundedIcon: HubRoundedIcon,
  HandshakeRoundedIcon: HandshakeRoundedIcon,
  ShieldRoundedIcon: ShieldRoundedIcon,
  LocalFireDepartmentRoundedIcon: LocalFireDepartmentRoundedIcon,
  AutoGraphRoundedIcon: AutoGraphRoundedIcon,
  SupportAgentRoundedIcon: SupportAgentRoundedIcon,
};

// Intelligent helper to map signal text to proper icons if backend uses generic ones
const getSignalIcon = (signal, originalType) => {
  const s = signal.toLowerCase();
  if (s.includes('speed') || s.includes('velocity')) return RocketLaunchRoundedIcon;
  if (s.includes('quality') || s.includes('bar') || s.includes('standard')) return WorkspacePremiumRoundedIcon;
  if (s.includes('innovation') || s.includes('creative')) return PsychologyRoundedIcon;
  if (s.includes('customer') || s.includes('user')) return SupportAgentRoundedIcon;
  if (s.includes('trust') || s.includes('integrity') || s.includes('ownership')) return ShieldRoundedIcon;
  if (s.includes('team') || s.includes('collaboration')) return HandshakeRoundedIcon;
  if (s.includes('growth') || s.includes('scale')) return AutoGraphRoundedIcon;
  if (s.includes('intensity') || s.includes('passion')) return LocalFireDepartmentRoundedIcon;
  
  return ICON_MAP[originalType] || FlashOnRoundedIcon;
};

const TABS = [
  { label: 'Overview', icon: <InfoRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: 'Timeline', icon: <CalendarTodayRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: 'Culture', icon: <PsychologyRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: 'Prep Topics', icon: <TipsAndUpdatesRoundedIcon sx={{ fontSize: 18 }} /> }
];

const priorityMeta = {
  high: { color: PRIMARY_HEX, bg: PRIMARY_SOFT, label: 'High' },
  medium: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Med' },
  low: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', label: 'Low' },
};

export default function CompanyBriefing() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tabIndex, setTabIndex] = useState(0);

  const { data: briefedData, isLoading, error } = useQuery({
    queryKey: ['company-briefing', interviewId],
    queryFn: async () => {
      const response = await getCompanyBriefingAPI(interviewId);
      return response.data;
    },
    enabled: !!interviewId
  });

  const briefing = useMemo(() => {
    if (!briefedData) return null;
    return {
      ...briefedData,
      recruiterSummary: briefedData.summary,
      cultureSignals: briefedData.culture_signals,
      interviewRounds: briefedData.interview_rounds,
      topicsToPrep: briefedData.topics_to_prep
    };
  }, [briefedData]);

  const bg = isDark ? theme.palette.background.default : '#fafbfc';
  const surface = theme.palette.background.paper;
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textColor = theme.palette.text.primary;
  const muted = theme.palette.text.secondary;

  if (isLoading) {
    return (
      <Box sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: bg }}>
        <CircularProgress sx={{ mb: 3, color: PRIMARY_HEX }} />
        <Typography variant="body2" sx={{ color: muted, fontWeight: 600 }}>AI is researching company culture...</Typography>
      </Box>
    );
  }

  if (error || !briefing) {
    return (
      <Box sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: bg, p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>Research Interrupted</Typography>
        <Typography variant="body2" sx={{ mb: 4, color: muted }}>We couldn't generate a briefing for this company. Please ensure you have a valid internet connection.</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}>Go Back</Button>
      </Box>
    );
  }

  return (
    <PageContainer sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0, bgcolor: bg }}>
      
      {/* ── Studio Header (Consolidated Identity) ── */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, pt: { xs: 3, sm: 4 }, pb: 2, bgcolor: bg }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
           <IconButton onClick={() => navigate('/interview-practice')} size="small" sx={{ border: `1px solid ${border}`, borderRadius: 1.5, color: muted, bgcolor: surface }}>
              <ArrowBackRoundedIcon fontSize="small" />
           </IconButton>
           <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: muted, textTransform: 'uppercase', letterSpacing: 1.2 }}>
              Company Research Briefing
           </Typography>
        </Stack>

        {/* Studio Identity Box — NOW AT TOP */}
        <Card elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${border}`, bgcolor: surface, display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
           <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: PRIMARY_HEX, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BusinessRoundedIcon sx={{ fontSize: 28 }} />
           </Box>
           <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: textColor, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                 {briefing.company} · {briefing.role}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: muted, mt: 0.5, fontWeight: 600 }}>
                 {briefing.industry} · {briefing.size} Industry Intelligence
              </Typography>
           </Box>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.25, py: 1, borderRadius: 6, bgcolor: PRIMARY_SOFT, border: `1px solid ${alpha(PRIMARY_HEX, 0.2)}` }}>
              <BusinessRoundedIcon sx={{ fontSize: 16, color: PRIMARY_HEX }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: PRIMARY_HEX, textTransform: 'uppercase', letterSpacing: 0.5 }}>Studio Intelligence</Typography>
           </Box>
        </Card>

        {/* Standard Studio Tabs */}
        <Box sx={{ borderBottom: `1px solid ${border}` }}>
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: muted,
                px: 3,
                minWidth: 'auto',
                transition: 'all 0.2s',
              },
              '& .Mui-selected': { color: `${PRIMARY_HEX} !important` },
              '& .MuiTabs-indicator': { bgcolor: PRIMARY_HEX, height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            {TABS.map((t, i) => (
              <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} />
            ))}
          </Tabs>
        </Box>
      </Box>

      {/* ── Scrollable Body Area ── */}
      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, sm: 3, md: 5 }, py: 4 }}>
        <Box sx={{ mx: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div key={tabIndex} initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.01 }} transition={{ duration: 0.2 }}>

              {/* ─── TAB 0: Overview (Studio Accent Pattern) ─── */}
              {tabIndex === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  
                  {/* Studio Accent Card — The Intelligence Summary */}
                  <Card 
                    elevation={0} 
                    sx={{ 
                      p: 4.5, borderRadius: 2, 
                      border: `1.5px solid ${alpha(PRIMARY_HEX, 0.28)}`, 
                      bgcolor: surface, 
                      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(51,94,222,0.1)' 
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: PRIMARY_HEX, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(51,94,222,0.15)' }}>
                        <BrainCircuit size={24} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: textColor, letterSpacing: '-0.02em' }}>Expert Briefing Summary</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: muted, mt: 0.25, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>AI Research Stream · {new Date().toLocaleDateString()}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '1rem', color: textColor, lineHeight: 1.85, fontWeight: 500 }}>
                      {briefing.recruiterSummary}
                    </Typography>
                  </Card>

                  {/* Studio Stats Grid — 44x44 PrimarySoft Boxes */}
                  <Grid container spacing={2.5}>
                    {[
                      { icon: <Timer size={22} />, label: 'Pipeline', value: `${briefing.interviewRounds.length} Rounds`, color: PRIMARY_HEX },
                      { icon: <PeopleAltRoundedIcon sx={{ fontSize: 22 }} />, label: 'Scale', value: briefing.size, color: SUCCESS_HEX },
                      { icon: <Target size={22} />, label: 'Prep Focus', value: `${briefing.topicsToPrep.length} Topics`, color: '#3b82f6' },
                      { icon: <Compass size={22} />, label: 'Intelligence', value: `${briefing.cultureSignals.length} Insights`, color: '#0ea5e9' },
                    ].map((stat, i) => (
                      <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${border}`, bgcolor: surface, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: PRIMARY_SOFT, color: PRIMARY_HEX, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {stat.icon}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: PRIMARY_HEX, textTransform: 'uppercase', letterSpacing: 1, mb: 0.4 }}>{stat.label}</Typography>
                             <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: textColor, lineHeight: 1 }}>{stat.value}</Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* ─── TAB 1: Timeline (FIXED ARCHITECTURE) ─── */}
              {tabIndex === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: textColor, mb: 1, letterSpacing: '-0.02em' }}>Interview Process Architecture</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {briefing.interviewRounds.map((r, idx) => (
                      <Box key={r.round} sx={{ display: 'flex', gap: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
                          <Box 
                            sx={{ 
                              width: 36, height: 36, borderRadius: '50%', 
                              bgcolor: idx === 0 ? PRIMARY_HEX : surface, 
                              border: `1.5px solid ${idx === 0 ? PRIMARY_HEX : border}`, 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              color: idx === 0 ? '#fff' : muted, 
                              fontWeight: 900, fontSize: '0.9rem',
                              boxShadow: idx === 0 ? (isDark ? '0 4px 24px rgba(0,0,0,0.6)' : '0 8px 16px rgba(51,94,222,0.15)') : 'none',
                              zIndex: 1
                            }}
                          >
                            {idx + 1}
                          </Box>
                          {idx < briefing.interviewRounds.length - 1 && (
                            <Box 
                              sx={{ 
                                width: 0, flex: 1, minHeight: 40,
                                borderLeft: `2px dashed ${border}`,
                                my: 1
                              }} 
                            />
                          )}
                        </Box>
                        <Card elevation={0} sx={{ flex: 1, p: 3.5, mb: idx < briefing.interviewRounds.length - 1 ? 5 : 0, borderRadius: 2, bgcolor: surface, border: `1px solid ${border}`, transition: 'all 0.2s', '&:hover': { borderColor: PRIMARY_HEX } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                            <Typography sx={{ fontWeight: 900, color: textColor, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>{r.name}</Typography>
                            <Chip label={r.duration} size="small" sx={{ height: 24, fontSize: '0.72rem', fontWeight: 800, color: PRIMARY_HEX, bgcolor: PRIMARY_SOFT, borderRadius: 1.5, px: 1 }} />
                          </Stack>
                          <Typography sx={{ fontSize: '0.98rem', color: textColor, lineHeight: 1.8, fontWeight: 500 }}>{r.focus}</Typography>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* ─── TAB 2: Culture (Context-Aware Icons) ─── */}
              {tabIndex === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: textColor, mb: 1, letterSpacing: '-0.02em' }}>Culture Signals</Typography>
                  <Grid container spacing={2.5}>
                    {briefing.cultureSignals.map((c, idx) => {
                      const IconComp = getSignalIcon(c.signal, c.icon_type);
                      return (
                        <Grid item width={"100%"} key={idx}>
                          <Card 
                            elevation={0} 
                            sx={{ 
                              p: 3, height: '100%', borderRadius: 2, 
                              bgcolor: surface, border: `1px solid ${border}`, 
                              display: 'flex', gap: 2.5,
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: c.color, boxShadow: isDark ? `0 8px 32px rgba(0,0,0,0.5)` : `0 8px 24px ${alpha(c.color, 0.06)}` }
                            }}
                          >
                            <Box 
                              sx={{ 
                                width: 48, height: 48, borderRadius: 2, 
                                bgcolor: alpha(c.color, 0.08), color: c.color, 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                flexShrink: 0, boxShadow: `0 4px 12px ${alpha(c.color, 0.1)}`
                              }}
                            >
                              <IconComp sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: textColor, fontSize: '1rem', mb: 0.75 }}>{c.signal}</Typography>
                              <Typography sx={{ fontSize: '0.9rem', color: muted, lineHeight: 1.75, fontWeight: 500 }}>{c.detail}</Typography>
                            </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {/* ─── TAB 3: Study Objective ─── */}
              {tabIndex === 3 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: textColor, mb: 1 }}>Target Preparation Topics</Typography>
                  <Grid container spacing={2}>
                    {briefing?.topicsToPrep.map((t, idx) => {
                      const pm = priorityMeta[t.priority] || priorityMeta.medium;
                      const rc = t.readiness >= 70 ? SUCCESS_HEX : t.readiness >= 45 ? '#3b82f6' : PRIMARY_HEX;
                      return (
                        <Grid item width={'100%'} xs={12} key={idx}>
                          <Card elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: surface, border: `1px solid ${border}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                              <Chip label={pm.label} size="small" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 800, bgcolor: pm.bg, color: pm.color, textTransform: 'uppercase', borderRadius: 1 }} />
                              <Typography sx={{ fontWeight: 700, color: textColor, flex: 1 }}>{t.topic}</Typography>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: rc }}>{t.readiness}%</Typography>
                            </Box>
                            <Box sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${t.readiness}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ height: '100%', backgroundColor: rc }} />
                            </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </PageContainer>
  );
}
