import React from 'react';
import { Box, Typography, Button, Paper, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { ShieldAlert, Mail, ArrowRight, Zap } from 'lucide-react';

const PermissionGuard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleEnablePermissions = () => {
    // Redirect to the backend endpoint that triggers Google OAuth with Gmail scopes
    window.location.href = 'http://localhost:8000/api/auth/google/enable-gmail';
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: isDark ? '#0b0f19' : '#F0F4FF',
        minHeight: '80vh',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 540,
            p: { xs: 4, md: 6 },
            borderRadius: 6,
            textAlign: 'center',
            bgcolor: isDark ? '#111827' : '#FFFFFF',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            boxShadow: isDark 
              ? '0 25px 50px -12px rgba(0,0,0,0.5)' 
              : '0 20px 25px -5px rgba(0,0,0,0.05)',
          }}
        >
          {/* Icon Section */}
          <Box
            sx={{
              position: 'relative',
              width: 100,
              height: 100,
              mx: 'auto',
              mb: 4,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: alpha('#2563EB', isDark ? 0.2 : 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={48} color="#2563EB" />
            </motion.div>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: '#F59E0B',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `4px solid ${isDark ? '#111827' : '#FFFFFF'}`,
                color: '#fff',
              }}
            >
              <ShieldAlert size={16} />
            </Box>
          </Box>

          {/* Text Section */}
          <Typography
            variant="h4"
            fontWeight={900}
            gutterBottom
            sx={{
              letterSpacing: '-1px',
              color: isDark ? '#fff' : '#1E293B',
              mb: 2,
            }}
          >
            Enable Email Tracking
          </Typography>
          <Typography
            sx={{
              color: isDark ? '#9CA3AF' : '#64748B',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              mb: 5,
            }}
          >
            HireMate AI needs your permission to read job-related emails. 
            This allows us to automatically track your applications, interviews, 
            and offers in real-time without any manual data entry.
          </Typography>

          {/* Benefits Grid */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5, textAlign: 'left' }}>
            {[
              { icon: <Zap size={18} />, text: 'Auto-detect applications from 15,000+ companies' },
              { icon: <Zap size={18} />, text: 'Sync interview invites directly to your dashboard' },
              { icon: <Zap size={18} />, text: 'Zero manual data entry required' },
            ].map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: '#2563EB', flexShrink: 0 }}>{item.icon}</Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: isDark ? '#E5E7EB' : '#475569' }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* CTA */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            endIcon={<ArrowRight size={20} />}
            onClick={handleEnablePermissions}
            sx={{
              py: 2,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: '#2563EB',
              boxShadow: '0 10px 20px -5px rgba(37,99,235,0.4)',
              '&:hover': {
                bgcolor: '#1D4ED8',
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 30px -5px rgba(37,99,235,0.5)',
              },
              transition: 'all 0.2s',
            }}
          >
            Connect Gmail Account
          </Button>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 3,
              color: isDark ? '#4B5563' : '#94A3B8',
              fontWeight: 600,
            }}
          >
            Secure connection via Google OAuth • Data is encrypted & private
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default PermissionGuard;
