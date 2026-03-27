import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import { Link } from 'react-router-dom';

import PageContainer from '../../components/common/PageContainer';
import { getDashboardSummaryAPI, listJobsAPI } from '../../services';

import CareerHealthScore from '../../components/dashboard/CareerHealthScore';
import StatCards from '../../components/dashboard/StatCards';
import StatsRow from '../application-tracker/StatsRow';
import ApplicationFunnel from '../../components/dashboard/ApplicationFunnel';
import ActivityHeatmap from '../../components/dashboard/ActivityHeatmap';
import CompanyTracker from '../../components/dashboard/CompanyTracker';
import RecentApplications from '../../components/dashboard/RecentApplications';
import SavedJobs from '../../components/dashboard/SavedJobs';
import SmartInsights from '../../components/dashboard/SmartInsights';
import DateFilter from '../../components/dashboard/DateFilter';

function buildDateParams(dateRange) {
  if (dateRange?.from && dateRange?.to) {
    return { from_date: dateRange.from, to_date: dateRange.to };
  }
  return { days: dateRange?.preset ?? 7 };
}

export default function Home() {
  const [dateRange, setDateRange] = useState({ preset: 7, from: null, to: null });
  const [summary, setSummary] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const preset = dateRange?.preset;
  const from = dateRange?.from;
  const to = dateRange?.to;

  const fetchData = useCallback(async () => {
    const p = buildDateParams({ preset, from, to });
    setLoading(true);
    setError(null);
    try {
      const summaryOpts = { limit: 10, ...p };
      const jobsOpts = p.from_date && p.to_date
        ? { from_date: p.from_date, to_date: p.to_date }
        : p;
      const [summaryRes, jobsRes] = await Promise.all([
        getDashboardSummaryAPI(summaryOpts),
        listJobsAPI(jobsOpts),
      ]);
      setSummary(summaryRes?.data || null);
      setJobs(jobsRes?.data || []);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load dashboard');
      setSummary(null);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [preset, from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PageContainer
      sx={{
        py: { xs: 2, md: 3 },
        bgcolor: 'var(--bg-light)',
        overflowX: 'hidden',
        px: { xs: 2, sm: 3, md: 3.5 },
        '--dashboard-card-shadow': '0 1px 2px rgba(16, 24, 40, 0.04)',
        '--dashboard-card-shadow-hover': '0 8px 24px rgba(16, 24, 40, 0.08)',
        '--dashboard-card-radius': '14px',
        '--dashboard-border-subtle': 'rgba(16, 24, 40, 0.06)',
        '--dashboard-section-label': '11px',
        '--dashboard-section-gap': '24px',
        '--dashboard-card-px': '22px',
        '--dashboard-card-py': '20px',
        '--dashboard-block-gap': '24px',
        '--dashboard-label-gap': '4px',
        '--dashboard-row-min-height': '48px',
        '--heat-0': 'var(--grey-5)',
        '--heat-1': '#ede9fe',
        '--heat-2': '#ddd6fe',
        '--heat-3': '#a78bfa',
        '--heat-4': '#6d28d9',
      }}
    >
      {error && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1.5,
            bgcolor: 'rgba(220, 38, 38, 0.06)',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            border: '1px solid rgba(220, 38, 38, 0.12)',
          }}
        >
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {error}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--dashboard-section-gap)' }}>
        {/* Header + Date filter */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            justifyContent: 'space-between',
            gap: 2,
            width: '100%',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: 'var(--text-primary)', fontSize: { xs: '1.375rem', md: '1.5rem' }, letterSpacing: -0.2 }}
            >
              Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.875rem', mt: 0.5 }}>
              Track your pipeline performance and keep momentum.
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0, marginLeft: { sm: 'auto' } }}>
            <DateFilter value={dateRange} onChange={setDateRange} />
          </Box>
        </Box>

        {/* Career Health Score — full width */}
        <CareerHealthScore summary={summary} jobs={jobs} loading={loading} />

        {/* Stat Cards — compact (replaced with unified StatsRow) */}
        <StatsRow jobs={jobs || []} />

        {/* Funnel + Heatmap — 2 columns side by side */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.8fr 1fr' },
            gap: 'var(--dashboard-block-gap)',
            '& > *': { minWidth: 0 },
          }}
        >
          <ApplicationFunnel jobs={jobs} loading={loading} />
          <ActivityHeatmap applicationsByDay={summary?.applications_by_day} loading={loading} />
        </Box>

        {/* Company Tracker — full width */}
        <CompanyTracker companiesViewed={summary?.companies_viewed} jobs={jobs} loading={loading} />

        {/* Recent Apps + Saved Jobs — 2 columns */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 'var(--dashboard-block-gap)',
            '& > *': { minWidth: 0 },
          }}
        >
          <RecentApplications applications={summary?.recent_applications} loading={loading} />
          <SavedJobs jobs={jobs} loading={loading} />
        </Box>

        {/* Smart Insights — full width */}
        <SmartInsights summary={summary} jobs={jobs} loading={loading} />

        {/* Go to Applications */}
        <Box>
          <Button
            component={Link}
            to="/application-tracker"
            variant="outlined"
            startIcon={<WorkOutlineRoundedIcon />}
            sx={{
              borderColor: 'var(--dashboard-border-subtle)',
              color: 'var(--text-primary)',
              textTransform: 'none',
              py: 1.15,
              px: 2,
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'rgba(37, 99, 235, 0.22)',
                bgcolor: 'var(--light-blue-bg-08)',
                color: 'var(--primary)',
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            Go to Applications
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
