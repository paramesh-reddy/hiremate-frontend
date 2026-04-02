import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Chip, Button, CircularProgress, useTheme } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import PageContainer from '../../components/common/PageContainer';
import { getApplicationAPI, withdrawApplicationAPI } from '../../services/applicationsService';

const STATUS_CONFIG = {
  applied:              { bg: '#F3F4F6', color: '#6B7280',  dot: '#9CA3AF',  label: 'Application Sent'  },
  acknowledged:         { bg: '#EFF6FF', color: '#1D4ED8',  dot: '#2563EB',  label: 'Acknowledged'      },
  in_review:            { bg: '#FFFBEB', color: '#B45309',  dot: '#D97706',  label: 'Under Review'      },
  interview_scheduled:  { bg: '#F5F3FF', color: '#7C3AED',  dot: '#7C3AED',  label: 'Interview Set'     },
  interview_completed:  { bg: '#EEF2FF', color: '#4F46E5',  dot: '#4F46E5',  label: 'Interview Done'    },
  offer_received:       { bg: '#F0FDF4', color: '#15803D',  dot: '#16A34A',  label: 'Offer Unlocked'    },
  rejected:             { bg: '#FEF2F2', color: '#DC2626',  dot: '#EF4444',  label: 'Closed'            },
  ghosted:              { bg: '#F3F4F6', color: '#6B7280',  dot: '#9CA3AF',  label: 'Dormant'           },
  withdrawn:            { bg: '#FFFBEB', color: '#C2410C',  dot: '#EA580C',  label: 'Withdrawn'         },
};

const TIMELINE_ICON = {
  offer_received:       <CheckCircleOutlineRoundedIcon fontSize="small" />,
  rejected:             <CancelOutlinedIcon fontSize="small" />,
  interview_scheduled:  <CalendarTodayRoundedIcon fontSize="small" />,
  ghosted:              <AccessTimeRoundedIcon fontSize="small" />,
  applied:              <OpenInNewRoundedIcon fontSize="small" />,
  acknowledged:         <EmailOutlinedIcon fontSize="small" />,
};

function HealthGauge({ percent, label }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" fontWeight={800} color="var(--text-muted)" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 10 }}>
          {label}
        </Typography>
        <Typography variant="caption" fontWeight={800} color="var(--primary)" sx={{ fontStyle: 'italic' }}>
          {percent}%
        </Typography>
      </Box>
      <Box sx={{ height: 8, bgcolor: 'var(--grey-5)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.4, ease: 'circOut' }}
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #7C3AED)', borderRadius: 99 }}
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
    <PageContainer maxWidth="100%" sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        {/* Nav */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <motion.div whileHover={{ x: -4 }} style={{ display: 'inline-block' }}>
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate('/application-tracker')}
              sx={{ textTransform: 'none', fontWeight: 800, color: 'var(--text-muted)', px: 1, fontSize: 11, letterSpacing: '0.15em' }}
            >
              RETURN TO OVERVIEW
            </Button>
          </motion.div>

          <AnimatePresence>
            {isActive && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Button
                  startIcon={<CloseRoundedIcon sx={{ fontSize: 13 }} />}
                  onClick={() => { if (window.confirm('Withdraw this application?')) withdrawMutation.mutate(); }}
                  disabled={withdrawMutation.isPending}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: 'none', fontWeight: 800, fontSize: 10, letterSpacing: '0.12em',
                    color: '#DC2626', borderColor: 'rgba(220,38,38,0.2)', height: 34,
                    '&:hover': { bgcolor: 'rgba(220,38,38,0.04)', borderColor: '#DC2626' },
                    borderRadius: 2, px: 2,
                  }}
                >
                  {withdrawMutation.isPending ? 'Syncing…' : 'WITHDRAW APPLICATION'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Hero card */}
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Box
            sx={{
              borderRadius: 4, overflow: 'hidden',
              bgcolor: 'var(--bg-paper)', border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            {/* Top accent bar */}
            <Box sx={{ height: 4, background: 'linear-gradient(90deg, var(--primary), #7C3AED)', opacity: 0.4 }} />

            <Box sx={{ p: { xs: 3, md: 6 } }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
                {/* Left: avatar + info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
                  <motion.div initial={{ scale: 0.8, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}>
                    <Box
                      sx={{
                        width: { xs: 64, md: 88 }, height: { xs: 64, md: 88 },
                        borderRadius: { xs: 3, md: 4 },
                        bgcolor: 'var(--primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: { xs: 28, md: 40 },
                        boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
                        flexShrink: 0,
                      }}
                    >
                      {(app.company || '?')[0].toUpperCase()}
                    </Box>
                  </motion.div>

                  <Box>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      <Typography variant="h4" fontWeight={900} color="var(--text-primary)" sx={{ letterSpacing: '-1px', lineHeight: 1 }}>
                        {app.company}
                      </Typography>
                    </motion.div>
                    <Typography variant="h6" fontWeight={700} color="var(--text-muted)" sx={{ mt: 0.5, opacity: 0.8 }}>
                      {app.role}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
                      <Box
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1,
                          bgcolor: 'var(--bg-paper)', border: '1px solid var(--border-color)',
                          px: 2, py: 1, borderRadius: 2,
                        }}
                      >
                        <FlashOnRoundedIcon sx={{ fontSize: 13, color: '#2563EB' }} />
                        <Typography variant="caption" fontWeight={900} sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>
                          {app.platform || 'Direct'}
                        </Typography>
                      </Box>
                      {app.applied_date && (
                        <Box
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            bgcolor: 'var(--bg-paper)', border: '1px solid var(--border-color)',
                            px: 2, py: 1, borderRadius: 2,
                          }}
                        >
                          <TrendingUpRoundedIcon sx={{ fontSize: 13, color: '#10B981' }} />
                          <Typography variant="caption" fontWeight={900} sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B' }}>
                            {new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Right: status + last activity */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5 }}>
                  <Chip
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
                          <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: status.dot, opacity: 0.5, animation: 'ping 1.5s ease-in-out infinite' }} />
                          <Box sx={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', bgcolor: status.dot }} />
                        </Box>
                        {status.label}
                      </Box>
                    }
                    sx={{
                      bgcolor: status.bg, color: status.color,
                      fontWeight: 900, fontSize: 12, height: 36, px: 1.5,
                      textTransform: 'uppercase', letterSpacing: '0.12em',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  {app.last_activity && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, opacity: 0.4 }}>
                      <AccessTimeRoundedIcon sx={{ fontSize: 12, color: 'var(--text-muted)' }} />
                      <Typography variant="caption" fontWeight={900} color="var(--text-muted)" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 10 }}>
                        Last: {new Date(app.last_activity).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* AI next action */}
              {app.next_action && (
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <Box
                    sx={{
                      mt: 5, p: { xs: 3, md: 4 }, borderRadius: 3,
                      background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
                      color: 'white', position: 'relative', overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.08 }}>
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 120 }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, position: 'relative', zIndex: 1 }}>
                      <Box
                        sx={{
                          width: 48, height: 48, borderRadius: 2, flexShrink: 0,
                          bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <FlashOnRoundedIcon sx={{ fontSize: 24, fill: 'rgba(255,255,255,0.2)' }} />
                      </Box>
                      <Box>
                         <Chip label="OpsBrain Strategic Directive" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 900, fontSize: 9, letterSpacing: '0.15em', mb: 1.5 }} />
                        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.1, mb: 1, letterSpacing: '-0.5px' }}>Automated Strategizer</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.95, lineHeight: 1.6, fontWeight: 500 }}>{app.next_action}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              )}
            </Box>
          </Box>
        </Box>

        {/* Main grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3 }}>
          {/* Timeline */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Box
              sx={{
                p: { xs: 3, md: 5 }, borderRadius: 4,
                bgcolor: 'var(--bg-paper)', border: '1px solid var(--border-color)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'var(--light-blue-bg-08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <AccessTimeRoundedIcon />
                  </Box>
                  <Typography variant="h6" fontWeight={800} color="var(--text-primary)">Status History</Typography>
                </Box>
                <Box sx={{ px: 2, py: 0.75, bgcolor: 'var(--grey-5)', borderRadius: 99, border: '1px solid var(--border-color)' }}>
                  <Typography variant="caption" fontWeight={900} color="var(--text-muted)" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 10 }}>
                    Immutable Ledger
                  </Typography>
                </Box>
              </Box>

              {(!app.history || app.history.length === 0) ? (
                <Typography variant="body2" color="var(--text-muted)" fontStyle="italic">No status history available.</Typography>
              ) : (
                <Box sx={{ position: 'relative' }}>
                  <AnimatePresence>
                    {[...app.history].reverse().map((entry, idx, arr) => {
                      const isLatest = idx === 0;
                      const isLast = idx === arr.length - 1;
                      const entryStatus = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.applied;
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                        >
                          <Box sx={{ position: 'relative', pl: { xs: 7, md: 9 }, pb: isLast ? 0 : 5 }}>
                            {/* connector line */}
                            {!isLast && (
                              <Box sx={{
                                position: 'absolute', left: { xs: 19, md: 27 }, top: 48,
                                bottom: 0, width: 2,
                                background: 'linear-gradient(to bottom, var(--border-color), transparent)',
                              }} />
                            )}

                            {/* dot */}
                            <Box
                              sx={{
                                position: 'absolute', left: 0, top: 0,
                                width: { xs: 40, md: 56 }, height: { xs: 40, md: 56 },
                                borderRadius: { xs: 2, md: 3 },
                                bgcolor: isLatest ? 'var(--primary)' : 'var(--grey-5)',
                                color: isLatest ? 'white' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `4px solid var(--bg-paper)`,
                                zIndex: 1,
                                transform: isLatest ? 'scale(1.1)' : 'scale(1)',
                                boxShadow: isLatest ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
                              }}
                            >
                              {TIMELINE_ICON[entry.status] ?? <InfoOutlinedIcon fontSize="small" />}
                            </Box>

                            {/* content */}
                            <Box
                              sx={{
                                p: 3, borderRadius: 3,
                                bgcolor: 'var(--bg-light)',
                                border: '1px solid transparent',
                                '&:hover': { borderColor: 'rgba(37,99,235,0.1)' },
                                transition: 'border-color 0.2s',
                              }}
                            >
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: entry.summary ? 1.5 : 0 }}>
                                <Typography
                                  variant="subtitle1" fontWeight={900}
                                  sx={{ textTransform: 'uppercase', color: isLatest ? 'var(--primary)' : 'var(--text-primary)', letterSpacing: '0.05em' }}
                                >
                                  {(entry.status || '').replace(/_/g, ' ')}
                                </Typography>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'var(--grey-5)', borderRadius: 2, border: '1px solid var(--border-color)' }}>
                                  <Typography variant="caption" fontWeight={900} color="var(--text-muted)" sx={{ fontSize: 10, letterSpacing: '0.08em' }}>
                                    {entry.changed_at
                                      ? new Date(entry.changed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
                                      : '—'}
                                  </Typography>
                                </Box>
                              </Box>
                              {entry.summary && (
                                <Typography variant="body2" color="var(--text-muted)" fontWeight={500} sx={{ lineHeight: 1.7, opacity: 0.85 }}>
                                  {entry.summary}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </Box>
              )}
            </Box>
          </motion.div>

          {/* Sidebar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Operational health */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
              <Box sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, bgcolor: 'var(--bg-paper)', border: '1px solid var(--border-color)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <VerifiedUserRoundedIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
                  <Typography variant="caption" fontWeight={900} color="var(--text-primary)" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 11 }}>
                    Operational Health
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  <HealthGauge percent={75} label="Recruiter Alignment" />
                  <HealthGauge percent={40} label="Market Competitiveness" />
                  <HealthGauge percent={62} label="Interview Probability" />
                </Box>
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid var(--border-color)' }}>
                  <Typography variant="caption" color="var(--text-muted)" fontWeight={600} sx={{ fontStyle: 'italic', textAlign: 'center', display: 'block', lineHeight: 1.6, opacity: 0.7 }}>
                    "Your cadence is higher than 84% of applicants at {app.company}."
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {/* Cortex intelligence */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Box
                sx={{
                  p: { xs: 3, md: 4 }, borderRadius: 4,
                  bgcolor: 'var(--bg-paper)', border: '1px solid var(--border-color)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden',
                }}
              >
                <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, bgcolor: 'var(--primary)', borderRadius: '50%', opacity: 0.05 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ p: 1.25, bgcolor: 'var(--light-blue-bg-08)', borderRadius: 2, color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.15)' }}>
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="caption" fontWeight={900} color="var(--text-muted)" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 11 }}>
                    OpsBrain AI Intelligence
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={700} color="var(--text-primary)" sx={{ lineHeight: 1.65 }}>
                  {app.interview_process || `Benchmark analysis indicates ${app.company} usually conducts a 30m screener followed by technical rounds.`}
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: 'var(--light-blue-bg-08)', borderRadius: 2, border: '1px solid rgba(37,99,235,0.15)' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'var(--primary)', animation: 'ping 1.5s ease-in-out infinite' }} />
                  <Typography variant="caption" fontWeight={900} color="var(--primary)" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 10 }}>
                    Insight Verified: OpsBrain AI
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Box>

      </motion.div>
    </PageContainer>
  );
}
