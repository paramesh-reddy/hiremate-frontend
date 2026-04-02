import { useState } from 'react';
import {
  Box, Typography, IconButton, Grid, useTheme, alpha,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
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
import PageContainer from '../../components/common/PageContainer';

const MOCK_BRIEFING = {
  company: 'Stripe',
  role: 'Senior Frontend Engineer',
  logo: '💳',
  industry: 'Fintech · Payments',
  size: '8,000+ employees',
  recruiterThread: {
    recruiterName: 'Sarah Chen',
    recruiterTitle: 'Technical Recruiter',
    lastContact: 'March 15, 2026',
    summary:
      'Sarah reached out via LinkedIn after you applied. She confirmed the role is on the Payments UI team and that they are looking for someone with strong React performance experience. She mentioned the team is moving fast and values engineers who can own features end-to-end.',
    keyTopics: ['System Design', 'React Performance', 'API integration', 'Ownership mindset'],
  },
  interviewRounds: [
    { round: 1, name: 'Recruiter Screen', duration: '30 min', focus: 'Background, motivation, culture fit', status: 'completed' },
    { round: 2, name: 'Technical Screen', duration: '60 min', focus: 'Frontend coding — React + JS fundamentals', status: 'upcoming' },
    { round: 3, name: 'System Design', duration: '60 min', focus: 'Design a scalable frontend architecture', status: 'upcoming' },
    { round: 4, name: 'Behavioural Panel', duration: '45 min × 2', focus: 'Leadership, conflict, execution', status: 'upcoming' },
  ],
  cultureSignals: [
    { signal: 'Ownership & Autonomy', detail: 'Stripe engineers own features from spec to production. Expect questions about times you took initiative without being asked.', icon: FlashOnRoundedIcon, color: '#2563eb' },
    { signal: 'High engineering bar', detail: 'Code reviews are rigorous. They look for clean, well-tested code and appreciation of edge cases.', icon: CodeRoundedIcon, color: '#3b82f6' },
    { signal: 'User-first thinking', detail: 'They build developer tools — expect to be asked how you balance speed with API ergonomics.', icon: PeopleAltRoundedIcon, color: '#0ea5e9' },
    { signal: 'Written communication', detail: 'Stripe is known for detailed writing. They may ask about a doc or design decision you wrote up.', icon: EditNoteRoundedIcon, color: '#06b6d4' },
  ],
  topicsToPrep: [
    { topic: 'React performance optimization', priority: 'high', readiness: 82 },
    { topic: 'JavaScript event loop & async patterns', priority: 'high', readiness: 71 },
    { topic: 'Frontend system design (component architecture, state management at scale)', priority: 'high', readiness: 55 },
    { topic: 'Payment flows & PCI compliance basics', priority: 'medium', readiness: 40 },
    { topic: 'Stripe API & webhook design', priority: 'medium', readiness: 35 },
    { topic: 'CSS-in-JS / Tailwind patterns', priority: 'low', readiness: 88 },
  ],
};

const TABS = ['Overview', 'Timeline', 'Culture', 'Prep Topics'];

const priorityMeta = {
  high: { color: '#2563eb', bg: 'rgba(37,99,235,0.1)', label: 'High' },
  medium: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Med' },
  low: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', label: 'Low' },
};

export default function CompanyBriefing() {
  useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const briefing = MOCK_BRIEFING;
  const [activeTab, setActiveTab] = useState(0);

  const bg = isDark ? '#0f0f13' : '#f4f5f9';
  const surface = isDark ? '#16161e' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const muted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  return (
    <PageContainer
      sx={{
        height: 'calc(100vh - var(--navbar-height))',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: 0,
        bgcolor: 'background.default',
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
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: isDark ? '0 1px 12px rgba(0,0,0,0.2)' : '0 1px 0 rgba(0,0,0,0.04)',
        }}
      >
        <IconButton
          onClick={() => navigate('/interview-practice')}
          size="small"
          sx={{
            color: muted,
            border: `1px solid ${border}`,
            borderRadius: 1.5,
            '&:hover': { color: '#2563eb', borderColor: 'rgba(37,99,235,0.35)', bgcolor: 'rgba(37,99,237,0.06)' },
          }}
        >
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>

        {/* Company identity */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {briefing.logo}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, color: 'text.primary' }}
          >
            {briefing.company} · {briefing.role}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: muted, mt: 0.15 }}>
            {briefing.industry} · {briefing.size}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.6,
            borderRadius: 6,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(14,165,233,0.1))',
            border: '1px solid rgba(37,99,235,0.25)',
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: '#2563eb' }} />
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb' }}>AI Generated</Typography>
        </Box>
      </Box>

      {/* ── Tab bar ── */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          px: { xs: 2, md: 3 },
          py: 1.25,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {TABS?.map((tab, i) => (
          <Box
            key={tab}
            onClick={() => setActiveTab(i)}
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: 2,
              cursor: 'pointer',
              fontWeight: activeTab === i ? 700 : 500,
              fontSize: '0.8rem',
              color: activeTab === i ? '#2563eb' : muted,
              bgcolor: activeTab === i ? alpha('#2563eb', 0.1) : 'transparent',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: activeTab === i ? alpha('#2563eb', 0.15) : 'action.hover' },
            }}
          >
            {tab}
          </Box>
        ))}
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ mx: 'auto', p: { xs: 2.5, md: 4 } }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >

              {/* ─── TAB 0: Overview (Recruiter Thread) ─── */}
              {activeTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Hero banner */}
                  <Box
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: 4,
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(14,165,233,0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(14,165,233,0.05) 100%)',
                      border: '1px solid',
                      borderColor: isDark ? alpha('#2563eb', 0.2) : alpha('#2563eb', 0.15),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }}>
                        <EmailRoundedIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'text.primary' }}>
                          Recruiter Thread Summary
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: muted, mt: 0.15 }}>
                          {briefing.recruiterThread.recruiterName}, {briefing.recruiterThread.recruiterTitle} · Last contact: {briefing.recruiterThread.lastContact}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)', lineHeight: 1.85, mb: 3 }}>
                      {briefing.recruiterThread.summary}
                    </Typography>
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2.5 }}>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: muted, mb: 1.25 }}>
                        Key Topics Mentioned
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {briefing.recruiterThread.keyTopics.map((t) => (
                          <Box
                            key={t}
                            sx={{
                              px: 1.75,
                              py: 0.5,
                              borderRadius: 6,
                              border: `1px solid rgba(37,99,235,0.3)`,
                              bgcolor: 'rgba(37,99,235,0.08)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#2563eb',
                            }}
                          >
                            {t}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  {/* Quick stats row */}
                  <Grid container spacing={2}>
                    {[
                      { icon: <CalendarTodayRoundedIcon sx={{ fontSize: 18 }} />, label: 'Interview Rounds', value: '4 Rounds', color: '#2563eb' },
                      { icon: <PeopleRoundedIcon sx={{ fontSize: 18 }} />, label: 'Team Size', value: '12 Engineers', color: '#3b82f6' },
                      { icon: <BarChartRoundedIcon sx={{ fontSize: 18 }} />, label: 'Prep Topics', value: `${briefing.topicsToPrep.length} Topics`, color: '#0ea5e9' },
                      { icon: <TipsAndUpdatesRoundedIcon sx={{ fontSize: 18 }} />, label: 'Culture Signals', value: `${briefing.cultureSignals.length} Insights`, color: '#06b6d4' },
                    ].map((stat) => (
                      <Grid item xs={6} md={3} key={stat.label}>
                        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
                          <Box
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              bgcolor: surface,
                              border: `1px solid ${border}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1,
                            }}
                          >
                            <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: `${stat.color}18`, color: stat.color, width: 'fit-content' }}>
                              {stat.icon}
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', color: muted, fontWeight: 600 }}>{stat.label}</Typography>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#fff' : '#0f0f13', lineHeight: 1 }}>
                              {stat.value}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* ─── TAB 1: Timeline ─── */}
              {activeTab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'text.primary', mb: 0.5 }}>
                    Interview Process Timeline
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: muted, mb: 2 }}>
                    {briefing.interviewRounds.filter((r) => r.status === 'completed').length} of {briefing.interviewRounds.length} rounds completed
                  </Typography>

                  {briefing.interviewRounds.map((r, idx) => (
                    <motion.div
                      key={r.round}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.07 }}
                    >
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        {/* Timeline track */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: r.status === 'completed'
                                ? 'linear-gradient(135deg, #2563eb, #0ea5e9)'
                                : 'background.paper',
                              border: '2px solid',
                              borderColor: r.status === 'completed' ? 'transparent' : 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: r.status === 'completed' ? '0 4px 16px rgba(37,99,235,0.35)' : 'none',
                            }}
                          >
                            {r.status === 'completed' ? (
                              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#fff' }} />
                            ) : (
                              <Typography sx={{ fontWeight: 900, fontSize: '0.8rem', color: muted }}>
                                {r.round}
                              </Typography>
                            )}
                          </Box>
                          {idx < briefing.interviewRounds.length - 1 && (
                            <Box
                              sx={{
                                width: 2,
                                flex: 1,
                                my: 0.75,
                                minHeight: 32,
                                background: r.status === 'completed'
                                  ? 'linear-gradient(to bottom, #2563eb, rgba(37,99,235,0.2))'
                                  : border,
                              }}
                            />
                          )}
                        </Box>

                        {/* Content */}
                        <Box
                          sx={{
                            flex: 1,
                            pb: idx < briefing.interviewRounds.length - 1 ? 3 : 0,
                          }}
                        >
                          <Box
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              bgcolor: 'background.paper',
                              border: '1px solid',
                              borderColor: r.status === 'completed' ? alpha('#2563eb', 0.2) : 'divider',
                              background: r.status === 'completed' && isDark
                                ? 'linear-gradient(135deg, rgba(37,99,235,0.08), transparent)'
                                : r.status === 'completed'
                                  ? 'linear-gradient(135deg, rgba(37,99,235,0.04), transparent)'
                                  : 'background.paper',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: 'text.primary' }}>
                                {r.name}
                              </Typography>
                              <Box
                                sx={{
                                  px: 1.25,
                                  py: 0.3,
                                  borderRadius: 4,
                                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  color: muted,
                                }}
                              >
                                {r.duration}
                              </Box>
                              {r.status === 'completed' && (
                                <Box
                                  sx={{
                                    px: 1.25,
                                    py: 0.3,
                                    borderRadius: 4,
                                    bgcolor: 'rgba(37,99,235,0.1)',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: '#2563eb',
                                  }}
                                >
                                  ✓ Done
                                </Box>
                              )}
                            </Box>
                            <Typography sx={{ fontSize: '0.83rem', color: muted, lineHeight: 1.7 }}>
                              {r.focus}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              )}

              {/* ─── TAB 2: Culture ─── */}
              {activeTab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'text.primary', mb: 0.5 }}>
                      Company Culture Signals
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: muted }}>
                      Derived from employee reviews, job descriptions, and public statements
                    </Typography>
                  </Box>
                  {briefing.cultureSignals.map((c, idx) => (
                    <motion.div
                      key={c.signal}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3.5,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          gap: 2.5,
                          alignItems: 'flex-start',
                          transition: 'all 0.2s',
                          '&:hover': {
                            border: `1px solid ${c.color}40`,
                            boxShadow: `0 4px 24px ${c.color}12`,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            bgcolor: `${c.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: c.color,
                          }}
                        >
                          <c.icon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'text.primary', mb: 0.75 }}>
                            {c.signal}
                          </Typography>
                          <Typography sx={{ fontSize: '0.85rem', color: muted, lineHeight: 1.8 }}>
                            {c.detail}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 4,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: c.color,
                            flexShrink: 0,
                            alignSelf: 'center',
                          }}
                        />
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              )}

              {/* ─── TAB 3: Prep Topics ─── */}
              {activeTab === 3 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'text.primary', mb: 0.5 }}>
                      Topics to Prepare
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: muted }}>
                      Derived from the JD and recruiter conversation
                    </Typography>
                  </Box>
                  {briefing.topicsToPrep.map((t, idx) => {
                    const pm = priorityMeta[t.priority];
                    const rc = t.readiness >= 70 ? '#2563eb' : t.readiness >= 45 ? '#3b82f6' : '#0ea5e9';
                    return (
                      <motion.div
                        key={t.topic}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.07 }}
                      >
                        <Box
                          sx={{
                            p: 2.75,
                            borderRadius: 3.5,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Box
                              sx={{
                                px: 1.5,
                                py: 0.35,
                                borderRadius: 4,
                                bgcolor: pm.bg,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                color: pm.color,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              }}
                            >
                              {pm.label}
                            </Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', flex: 1 }}>
                              {t.topic}
                            </Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: rc }}>
                              {t.readiness}%
                            </Typography>
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: muted }}>Readiness</Typography>
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
                                animate={{ width: `${t.readiness}%` }}
                                transition={{ duration: 0.7, delay: idx * 0.07, ease: 'easeOut' }}
                                style={{
                                  height: '100%',
                                  background: `linear-gradient(90deg, ${rc}, ${rc}99)`,
                                  borderRadius: 4,
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </motion.div>
                    );
                  })}
                </Box>
              )}

            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </PageContainer>
  );
}
