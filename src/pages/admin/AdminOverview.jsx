import { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import PageContainer from '../../components/common/PageContainer';
import {
  StatCard,
  SectionCard,
  SimpleLineChart,
  RankedListCard,
  SkeletonBox,
} from '../../components/admin';
import {
  getAdminOverviewAPI,
  getAdminLearningSubmissionsAPI,
  getAdminCompaniesViewedAPI,
  getAdminCareerPageLinksAPI,
  getAdminLearningFormStructuresAPI,
} from '../../services';

const KPI_GRID = [
  { key: 'total_users', label: 'Total Users', icon: PeopleRoundedIcon, sublabel: 'All time', accent: true },
  { key: 'active_users_7d', label: 'Active (7d)', icon: TrendingUpRoundedIcon, sublabel: 'Last 7 days' },
  { key: 'active_users_30d', label: 'Active (30d)', icon: TrendingUpRoundedIcon, sublabel: 'Last 30 days' },
  { key: 'form_submissions', label: 'Form Submissions', icon: DescriptionRoundedIcon, sublabel: 'All time' },
  { key: 'career_page_visits', label: 'Career Visits', icon: VisibilityRoundedIcon, sublabel: 'All time' },
  { key: 'autofill_uses', label: 'Autofill Uses', icon: AutoAwesomeRoundedIcon, sublabel: 'All time' },
  { key: 'jobs_saved', label: 'Jobs Saved', icon: BookmarkBorderRoundedIcon, sublabel: 'All time' },
  { key: 'jobs_applied', label: 'Jobs Applied', icon: SendRoundedIcon, sublabel: 'All time' },
];

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [topCompanies, setTopCompanies] = useState([]);
  const [topLinks, setTopLinks] = useState([]);
  const [atsPlatforms, setAtsPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    setLoading(true);
    setError(null);
    Promise.all([
      getAdminOverviewAPI().then((res) => res?.data || null).catch((err) => {
        setError(err?.response?.data?.detail || err.message || 'Failed to load overview');
        return null;
      }),
      getAdminLearningSubmissionsAPI({}).then((res) => res?.data || null).catch(() => null),
      getAdminCompaniesViewedAPI({ page: 1, limit: 5, from_date: fromStr, to_date: toStr }).then((res) => res?.data?.companies || []).catch(() => []),
      getAdminCareerPageLinksAPI({ page: 1, limit: 5, from_date: fromStr, to_date: toStr }).then((res) => res?.data?.links || []).catch(() => []),
      getAdminLearningFormStructuresAPI().then((res) => (res?.data?.ats_platforms || []).map((a) => ({ ats_platform: a.ats_platform, count: a.count }))).catch(() => []),
    ])
      .then(([ov, sub, companies, links, ats]) => {
        setOverview(ov);
        setSubmissions(sub);
        setTopCompanies(companies);
        setTopLinks(links);
        setAtsPlatforms(ats);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = overview?.stats || {};
  const newUsersByDay = overview?.new_users_by_day || [];
  const submissionsByDay = submissions?.by_day || [];

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
      {/* Page Header */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 22, md: 28 },
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Admin Overview
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'var(--text-secondary)', mt: 0.5, fontSize: 14 }}
          >
            Platform-wide analytics and key metrics
          </Typography>
        </Box>
      </Box>

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

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {KPI_GRID.map(({ key, label, icon: Icon, sublabel, accent }) => (
          <Grid item xs={12} sm={6} lg={3} key={key}>
            <StatCard
              icon={Icon}
              label={label}
              value={stats[key]}
              sublabel={sublabel}
              accent={accent}
              loading={loading}
            />
          </Grid>
        ))}
      </Grid>

      {/* Growth Charts */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <SectionCard
            title="New Users — Last 30 Days"
            action={
              <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                30-day window
              </Typography>
            }
          >
            {loading ? (
              <SkeletonBox height={220} />
            ) : (
              <SimpleLineChart data={newUsersByDay} height={220} />
            )}
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Form Submissions by Day"
            action={
              <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                All time
              </Typography>
            }
          >
            {loading ? (
              <SkeletonBox height={220} />
            ) : (
              <SimpleLineChart
                data={submissionsByDay.map((d) => ({ date: d.date, count: d.count }))}
                height={220}
              />
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Activity Distribution */}
      <Box
        sx={{
          bgcolor: 'var(--bg-paper)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--dashboard-card-shadow)',
          p: 3,
        }}
      >
        <Box sx={{ mb: 2.5, pb: 2, borderBottom: '1px solid var(--divider)' }}>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Activity Distribution
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Top companies, career pages & ATS platforms — last 30 days
          </Typography>
        </Box>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={4}>
            <RankedListCard
              title="Top Companies"
              items={topCompanies.map((c) => ({
                company_name: c.company_name,
                unique_users: c.unique_users,
              }))}
              maxItems={5}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <RankedListCard
              title="Top Career Pages"
              items={topLinks.map((l) => ({
                page_url: l.page_url,
                visit_count: l.visit_count,
              }))}
              maxItems={5}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <RankedListCard
              title="Top ATS Platforms"
              items={atsPlatforms.map((a) => ({
                ats_platform: a.ats_platform,
                count: a.count,
              }))}
              maxItems={5}
            />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
