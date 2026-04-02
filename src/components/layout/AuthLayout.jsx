import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import logoImg from '../../assets/logo.png';

const FEATURES = [
  { icon: '📬', text: 'Auto-tracks job emails from Gmail in real-time' },
  { icon: '🤖', text: 'AI resume builder tailored to every job description' },
  { icon: '🧩', text: 'Chrome extension — apply to any job in one click' },
  { icon: '🎯', text: 'Interview prep with AI mock Q&A for your role' },
];

export default function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>

      {/* ── Left panel ── */}
      <Box
        sx={{
          flex: { md: '0 0 48%' },
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: 6,
          py: 5,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <Box sx={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, zIndex: 1 }}>
          <Box component="img" src={logoImg} alt="HireMate" sx={{ height: 36, objectFit: 'contain' }} />
        </Box>

        {/* Hero copy */}
        <Box sx={{ zIndex: 1 }}>
          <Box
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 0.5, borderRadius: 10,
              bgcolor: 'rgba(99,102,241,0.18)',
              border: '1px solid rgba(99,102,241,0.35)',
              mb: 2.5,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#818cf8' }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.04em' }}>
              AI-POWERED JOB TRACKER
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: { md: 32, lg: 38 },
              fontWeight: 800,
              color: '#f8fafc',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
              mb: 1.5,
            }}
          >
            Your entire job search,{' '}
            <Box component="span" sx={{
              background: 'linear-gradient(90deg, #818cf8, #60a5fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              on autopilot.
            </Box>
          </Typography>

          <Typography sx={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.6, mb: 4, maxWidth: 380 }}>
            HireMate reads your Gmail, classifies every recruiter email with AI,
            and keeps your pipeline updated — automatically.
          </Typography>

          {/* Feature list */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {FEATURES.map((f) => (
              <Box key={f.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: 2, flexShrink: 0,
                  bgcolor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {f.icon}
                </Box>
                <Typography sx={{ fontSize: 14, color: '#cbd5e1', fontWeight: 500 }}>
                  {f.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom tagline */}
        <Box sx={{ zIndex: 1 }}>
          <Typography sx={{ fontSize: 13, color: '#475569' }}>
            Trusted by job seekers who hate tracking spreadsheets.
          </Typography>
        </Box>
      </Box>

      {/* ── Right panel (form) ── */}
      <Box
        sx={{
          flex: { md: '0 0 52%' },
          bgcolor: 'var(--bg-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 5, md: 4 },
          px: { xs: 2, sm: 5 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
