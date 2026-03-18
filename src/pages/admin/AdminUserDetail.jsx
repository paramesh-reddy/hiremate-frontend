import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Skeleton,
  LinearProgress,
  Avatar,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PageContainer from '../../components/common/PageContainer';
import { StatCard, SectionCard, EmptyState } from '../../components/admin';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { getAdminUserUsageAPI } from '../../services';

function getInitials(email) {
  if (!email) return '?';
  return email.slice(0, 2).toUpperCase();
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getAdminUserUsageAPI(id)
      .then((res) => setData(res?.data || null))
      .catch((err) => setError(err?.response?.data?.detail || err.message || 'Failed to load user'))
      .finally(() => setLoading(false));
  }, [id]);

  const visits = data?.career_page_visits || {};
  const visitEntries = Object.entries(visits);
  const totalVisits = visitEntries.reduce((acc, [, c]) => acc + c, 0);
  const maxVisit = Math.max(...visitEntries.map(([, c]) => c), 1);

  return (
    <PageContainer
      sx={{
        maxWidth: 1400,
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
        bgcolor: 'var(--bg-light)',
      }}
    >
      {/* Back breadcrumb */}
      <Button
        startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
        onClick={() => navigate('/admin/users')}
        sx={{
          mb: 3,
          textTransform: 'none',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          bgcolor: 'transparent',
          pl: 0,
          '&:hover': {
            color: 'var(--primary)',
            bgcolor: 'transparent',
          },
        }}
      >
        Back to Users
      </Button>

      {/* Error banner */}
      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '10px',
            bgcolor: 'var(--error-bg)',
            border: '1px solid rgba(220, 38, 38, 0.2)',
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--error-dark)', fontWeight: 500 }}>
            {error}
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '12px' }} />
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '12px' }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : data ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* User Identity Card */}
          <SectionCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  fontSize: 18,
                  fontWeight: 700,
                  bgcolor: 'var(--light-blue-bg-15)',
                  color: 'var(--primary)',
                  flexShrink: 0,
                }}
              >
                {getInitials(data.email)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 18, md: 22 },
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {data.email || '—'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="body2" sx={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    ID: <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{data.user_id}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Resumes: <strong>{data.resumes_count ?? 0}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Career Visits: <strong>{totalVisits}</strong>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </SectionCard>

          {/* Usage Analytics */}
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary)',
                mb: 2,
                letterSpacing: '-0.01em',
              }}
            >
              Usage Analytics
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={BookmarkBorderRoundedIcon}
                  label="Jobs Saved"
                  value={data.jobs?.saved ?? 0}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={SendRoundedIcon}
                  label="Jobs Applied"
                  value={data.jobs?.applied ?? 0}
                  accent
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={PsychologyRoundedIcon}
                  label="Field Answers"
                  value={data.user_field_answers_count ?? 0}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={DescriptionRoundedIcon}
                  label="Form Submissions"
                  value={data.user_submission_history_count ?? 0}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Career Page Visits by Type */}
          <SectionCard title="Career Page Visits by Type">
            {visitEntries.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: 13 }}>
                No visits recorded
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {visitEntries.map(([type, count]) => (
                  <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        minWidth: 160,
                        fontWeight: 500,
                        flexShrink: 0,
                      }}
                    >
                      {type.replace(/_/g, ' ')}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(count / maxVisit) * 100}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: '999px',
                        bgcolor: 'var(--grey-4)',
                        '& .MuiLinearProgress-bar': { borderRadius: '999px', bgcolor: 'var(--primary)' },
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--primary)',
                        minWidth: 36,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </SectionCard>

          {/* Recent Activity Timeline */}
          <SectionCard title="Recent Activity">
            {visitEntries.length === 0 ? (
              <EmptyState
                icon={TimelineRoundedIcon}
                title="No recent activity"
                description="Career page visits and form submissions will appear here."
              />
            ) : (
              <Box
                component="ul"
                sx={{
                  m: 0,
                  p: 0,
                  listStyle: 'none',
                  borderLeft: '2px solid var(--divider)',
                  pl: 2.5,
                  ml: 0.5,
                }}
              >
                {visitEntries.slice(0, 10).map(([type, count]) => (
                  <Box
                    component="li"
                    key={type}
                    sx={{
                      position: 'relative',
                      pb: 2.5,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -11,
                        top: 5,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'var(--primary)',
                        border: '2px solid var(--bg-paper)',
                      },
                      '&:last-child': { pb: 0 },
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', mb: 0.25 }}>
                      {type.replace(/_/g, ' ')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {count} occurrence{count !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </SectionCard>
        </Box>
      ) : null}
    </PageContainer>
  );
}
