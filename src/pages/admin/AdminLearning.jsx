import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Grid,
  IconButton,
  Collapse,
  Pagination,
  Tooltip,
} from '@mui/material';
import PageContainer from '../../components/common/PageContainer';
import DateFilter from '../../components/dashboard/DateFilter';
import {
  StatCard,
  SectionCard,
  SkeletonBox,
  EmptyState,
} from '../../components/admin';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import {
  getAdminLearningFormStructuresAPI,
  getAdminLearningUserAnswersAPI,
  getAdminLearningSubmissionsAPI,
  getAdminSubmissionLogsAPI,
  getAdminSubmissionLogDetailAPI,
} from '../../services';

function buildDateParams(range) {
  if (range?.from && range?.to) return { from_date: range.from, to_date: range.to };
  return {};
}

const tableCellHeadSx = {
  fontWeight: 700,
  fontSize: 13,
  bgcolor: 'var(--grey-4)',
  borderBottom: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  letterSpacing: '0.02em',
  py: 1.5,
};

const tableRowSx = {
  '&:hover': { bgcolor: 'var(--light-blue-bg-02)' },
  '& td': { borderBottom: '1px solid var(--divider)', fontSize: 13, py: 1.5 },
};

/* ---------- Expandable Submission Row ---------- */

function SubmissionRow({ row }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleToggle = () => {
    if (!open && !detail) {
      setLoadingDetail(true);
      getAdminSubmissionLogDetailAPI(row.id)
        .then((res) => setDetail(res?.data || null))
        .catch(() => setDetail(null))
        .finally(() => setLoadingDetail(false));
    }
    setOpen(!open);
  };

  const fields = detail?.submitted_fields || [];
  const analysis = detail?.mapping_analysis || {};

  const getStatusChip = (field) => {
    if (!field.autofill_value && !field.submitted_value) {
      return <Chip label="Unmapped" size="small" sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#dc2626', fontWeight: 600, fontSize: 11, height: 22 }} />;
    }
    if (field.was_edited) {
      return <Chip label="Changed" size="small" sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#d97706', fontWeight: 600, fontSize: 11, height: 22 }} />;
    }
    return <Chip label="Matched" size="small" sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#16a34a', fontWeight: 600, fontSize: 11, height: 22 }} />;
  };

  const accuracyColor = row.accuracy_pct >= 80 ? '#16a34a' : row.accuracy_pct >= 50 ? '#d97706' : '#dc2626';

  return (
    <>
      <TableRow hover sx={{ ...tableRowSx, cursor: 'pointer', '& td': { ...tableRowSx['& td'], borderBottom: open ? 'none' : '1px solid var(--divider)' } }} onClick={handleToggle}>
        <TableCell sx={{ width: 40, py: '6px !important' }}>
          <IconButton size="small" sx={{ p: 0.5 }}>
            {open ? <KeyboardArrowUpIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          {row.submitted_at ? new Date(row.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
        </TableCell>
        <TableCell sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Tooltip title={row.email} arrow><span>{row.email || '—'}</span></Tooltip>
        </TableCell>
        <TableCell>{row.domain || '—'}</TableCell>
        <TableCell>
          <Chip label={row.ats_platform || 'unknown'} size="small" sx={{ fontWeight: 600, fontSize: 11, bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)', height: 22, borderRadius: '999px' }} />
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 600 }}>{row.field_count || 0}</TableCell>
        <TableCell align="center">
          <Chip icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: '14px !important' }} />} label={row.correctly_mapped || 0} size="small"
            sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'rgba(34,197,94,0.1)', color: '#16a34a', height: 24, '& .MuiChip-icon': { color: '#16a34a' } }}
          />
        </TableCell>
        <TableCell align="center">
          <Chip icon={<EditRoundedIcon sx={{ fontSize: '13px !important' }} />} label={row.user_changed || 0} size="small"
            sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'rgba(245,158,11,0.12)', color: '#d97706', height: 24, '& .MuiChip-icon': { color: '#d97706' } }}
          />
        </TableCell>
        <TableCell align="center">
          <Chip icon={<ErrorOutlineRoundedIcon sx={{ fontSize: '14px !important' }} />} label={row.unmapped || 0} size="small"
            sx={{ fontWeight: 700, fontSize: 12, bgcolor: 'rgba(239,68,68,0.1)', color: '#dc2626', height: 24, '& .MuiChip-icon': { color: '#dc2626' } }}
          />
        </TableCell>
        <TableCell align="center">
          <Typography component="span" sx={{ fontWeight: 700, fontSize: 13, color: accuracyColor }}>{row.accuracy_pct ?? 0}%</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={10} sx={{ p: 0, border: 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: 3, py: 2, bgcolor: 'var(--bg-light)', borderBottom: '1px solid var(--divider)' }}>
              {loadingDetail ? (
                <SkeletonBox height={120} />
              ) : detail ? (
                <>
                  {/* Summary chips */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Field Mapping Detail</Typography>
                    {detail.url && (
                      <Typography component="a" href={detail.url} target="_blank" rel="noopener" sx={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {detail.url}
                      </Typography>
                    )}
                  </Box>
                  {fields.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: 13 }}>No field data available for this submission.</Typography>
                  ) : (
                    <TableContainer sx={{ borderRadius: '8px', border: '1px solid var(--divider)', bgcolor: 'var(--bg-paper)' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ ...tableCellHeadSx, fontSize: 12 }}>Field Label</TableCell>
                            <TableCell sx={{ ...tableCellHeadSx, fontSize: 12 }}>Autofill Value</TableCell>
                            <TableCell sx={{ ...tableCellHeadSx, fontSize: 12 }}>Submitted Value</TableCell>
                            <TableCell sx={{ ...tableCellHeadSx, fontSize: 12, width: 100 }} align="center">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fields.map((f, i) => {
                            const isChanged = f.was_edited;
                            const isUnmapped = !f.autofill_value && !f.submitted_value;
                            const rowBg = isChanged ? 'rgba(245,158,11,0.04)' : isUnmapped ? 'rgba(239,68,68,0.03)' : 'transparent';
                            return (
                              <TableRow key={`${f.field_fp}-${i}`} sx={{ bgcolor: rowBg, '& td': { fontSize: 12, py: 1, borderBottom: '1px solid var(--divider)' } }}>
                                <TableCell sx={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <Tooltip title={f.label || ''} arrow><span>{f.label || '—'}</span></Tooltip>
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <Tooltip title={f.autofill_value || '(none)'} arrow><span>{f.autofill_value || <em style={{ color: 'var(--text-muted)' }}>—</em>}</span></Tooltip>
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, color: isChanged ? '#d97706' : 'var(--text-primary)', fontWeight: isChanged ? 600 : 400, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <Tooltip title={f.submitted_value || '(none)'} arrow><span>{f.submitted_value || <em style={{ color: 'var(--text-muted)' }}>—</em>}</span></Tooltip>
                                </TableCell>
                                <TableCell align="center">{getStatusChip(f)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  {/* Unmapped fields from analysis */}
                  {(analysis.unmapped_fields || []).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#dc2626', mb: 1 }}>
                        Unmapped Fields ({analysis.unmapped_fields.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {analysis.unmapped_fields.map((uf, i) => (
                          <Chip key={`unmapped-${i}`} label={uf.label || uf.fingerprint} size="small"
                            sx={{ fontSize: 11, fontWeight: 500, bgcolor: 'rgba(239,68,68,0.08)', color: '#dc2626', height: 22, borderRadius: '6px' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: 13 }}>Failed to load detail.</Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

/* ---------- Main Component ---------- */

export default function AdminLearning() {
  const [tab, setTab] = useState(0);
  const [formStructures, setFormStructures] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [dateRange, setDateRange] = useState({ preset: 30, from: null, to: null });
  const [loading, setLoading] = useState({ form: true, answers: true, subs: true, logs: true });
  const [error, setError] = useState(null);

  /* Mapping Logs state */
  const [logs, setLogs] = useState(null);
  const [logsPage, setLogsPage] = useState(1);
  const LOGS_LIMIT = 15;

  const fetchFormStructures = useCallback(() => {
    setLoading((l) => ({ ...l, form: true }));
    getAdminLearningFormStructuresAPI()
      .then((res) => setFormStructures(res?.data || null))
      .catch(() => setFormStructures(null))
      .finally(() => setLoading((l) => ({ ...l, form: false })));
  }, []);

  const fetchUserAnswers = useCallback(() => {
    setLoading((l) => ({ ...l, answers: true }));
    getAdminLearningUserAnswersAPI()
      .then((res) => setUserAnswers(res?.data || null))
      .catch(() => setUserAnswers(null))
      .finally(() => setLoading((l) => ({ ...l, answers: false })));
  }, []);

  const fetchSubmissions = useCallback(() => {
    setLoading((l) => ({ ...l, subs: true }));
    const params = buildDateParams(dateRange);
    getAdminLearningSubmissionsAPI(params)
      .then((res) => setSubmissions(res?.data || null))
      .catch((err) => {
        setError(err?.response?.data?.detail || err.message);
        setSubmissions(null);
      })
      .finally(() => setLoading((l) => ({ ...l, subs: false })));
  }, [dateRange]);

  const fetchLogs = useCallback(() => {
    setLoading((l) => ({ ...l, logs: true }));
    const params = { ...buildDateParams(dateRange), page: logsPage, limit: LOGS_LIMIT };
    getAdminSubmissionLogsAPI(params)
      .then((res) => setLogs(res?.data || null))
      .catch(() => setLogs(null))
      .finally(() => setLoading((l) => ({ ...l, logs: false })));
  }, [dateRange, logsPage]);

  useEffect(() => {
    fetchFormStructures();
    fetchUserAnswers();
  }, [fetchFormStructures, fetchUserAnswers]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    if (tab === 3) fetchLogs();
  }, [tab, fetchLogs]);

  const topDomains = formStructures?.top_domains || [];
  const atsPlatforms = formStructures?.ats_platforms || [];
  const bySource = userAnswers?.by_source || [];
  const topUsersAnswers = userAnswers?.top_users || [];
  const byDay = submissions?.by_day || [];
  const byDomain = submissions?.by_domain || [];
  const topUsersSubs = submissions?.top_users || [];
  const logsList = logs?.submissions || [];
  const logsTotal = logs?.total || 0;
  const logsTotalPages = Math.ceil(logsTotal / LOGS_LIMIT);

  /* Compute aggregate stats for Mapping Logs tab */
  const avgAccuracy = logsList.length > 0 ? Math.round(logsList.reduce((s, l) => s + (l.accuracy_pct || 0), 0) / logsList.length) : 0;
  const totalChanged = logsList.reduce((s, l) => s + (l.user_changed || 0), 0);
  const totalUnmapped = logsList.reduce((s, l) => s + (l.unmapped || 0), 0);

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
          pb: 3,
          borderBottom: '1px solid var(--divider)',
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
            AI Learning & Automation
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5, fontSize: 14 }}>
            Form structures, user answers, submission history, and mapping logs
          </Typography>
        </Box>
        {(tab === 2 || tab === 3) && <DateFilter value={dateRange} onChange={setDateRange} />}
      </Box>

      {/* Error banner */}
      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '10px',
            bgcolor: 'var(--error-bg)',
            border: '1px solid rgba(220,38,38,0.2)',
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--error-dark)', fontWeight: 500 }}>
            {error}
          </Typography>
        </Box>
      )}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        TabIndicatorProps={{ style: { height: 3, borderRadius: '2px' } }}
        sx={{
          mb: 3,
          borderBottom: '1px solid var(--divider)',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--text-secondary)',
            minHeight: 44,
            px: 2,
          },
          '& .Mui-selected': { color: 'var(--primary)' },
        }}
      >
        <Tab label="Form Structures" />
        <Tab label="User Answers" />
        <Tab label="Submissions" />
        <Tab label="Mapping Logs" />
      </Tabs>

      {/* — Tab 0: Form Structures — */}
      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {loading.form ? (
            <SkeletonBox height={280} />
          ) : formStructures ? (
            <>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={DataObjectRoundedIcon}
                    label="Total Form Structures"
                    value={formStructures.total ?? 0}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={AccountTreeRoundedIcon}
                    label="Top Domains"
                    value={topDomains.length}
                    sublabel="By sample count"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={PsychologyRoundedIcon}
                    label="ATS Platforms"
                    value={atsPlatforms.length}
                  />
                </Grid>
              </Grid>

              <SectionCard title="Top Domains by Sample Count">
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableCellHeadSx}>Domain</TableCell>
                        <TableCell sx={tableCellHeadSx} align="right">Count</TableCell>
                        <TableCell sx={tableCellHeadSx} align="right">Samples</TableCell>
                        <TableCell sx={{ ...tableCellHeadSx, width: '30%' }}>Share</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topDomains.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ border: 'none' }}>
                            <EmptyState icon={InboxOutlinedIcon} title="No domains" description="No form structure data yet." />
                          </TableCell>
                        </TableRow>
                      ) : (
                        topDomains.slice(0, 20).map((d, i) => {
                          const maxS = Math.max(...topDomains.map((x) => x.sample_count || 0), 1);
                          const pct = ((d.sample_count || 0) / maxS) * 100;
                          return (
                            <TableRow key={(d.domain || '') + i} hover sx={tableRowSx}>
                              <TableCell>{d.domain || '—'}</TableCell>
                              <TableCell align="right">{d.count ?? 0}</TableCell>
                              <TableCell align="right">{d.sample_count ?? 0}</TableCell>
                              <TableCell>
                                <LinearProgress
                                  variant="determinate"
                                  value={pct}
                                  sx={{
                                    height: 5,
                                    borderRadius: '999px',
                                    bgcolor: 'var(--grey-4)',
                                    '& .MuiLinearProgress-bar': { borderRadius: '999px', bgcolor: 'var(--primary)' },
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SectionCard>

              <SectionCard title="ATS Distribution">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {atsPlatforms.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      No ATS data available
                    </Typography>
                  ) : (
                    atsPlatforms.map((a) => (
                      <Chip
                        key={a.ats_platform}
                        label={`${a.ats_platform}  ${a.count}`}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: 12,
                          bgcolor: 'var(--light-blue-bg-08)',
                          color: 'var(--primary)',
                          border: '1px solid var(--light-blue-bg-15)',
                          borderRadius: '999px',
                          height: 26,
                        }}
                      />
                    ))
                  )}
                </Box>
              </SectionCard>
            </>
          ) : null}
        </Box>
      )}

      {/* — Tab 1: User Answers — */}
      {tab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {loading.answers ? (
            <SkeletonBox height={280} />
          ) : userAnswers ? (
            <>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={PsychologyRoundedIcon}
                    label="Total User Answers"
                    value={userAnswers.total ?? 0}
                  />
                </Grid>
              </Grid>

              <SectionCard title="By Source">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {bySource.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      No source data
                    </Typography>
                  ) : (
                    bySource.map((s) => (
                      <Box
                        key={s.source}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: '8px',
                          bgcolor: 'var(--light-blue-bg-08)',
                          border: '1px solid var(--light-blue-bg-15)',
                        }}
                      >
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                          {s.source || 'unknown'}
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          · {s.count}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </SectionCard>

              <SectionCard title="Top Power Users">
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableCellHeadSx}>User ID</TableCell>
                        <TableCell sx={tableCellHeadSx} align="right">Answers</TableCell>
                        <TableCell sx={tableCellHeadSx} align="right">Used Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topUsersAnswers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} sx={{ border: 'none' }}>
                            <EmptyState title="No user answers" description="Data will appear as users interact." />
                          </TableCell>
                        </TableRow>
                      ) : (
                        topUsersAnswers.map((u) => (
                          <TableRow key={u.user_id} hover sx={tableRowSx}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{u.user_id}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>{u.answers_count}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'var(--primary)' }}>{u.total_used_count}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SectionCard>
            </>
          ) : null}
        </Box>
      )}

      {/* — Tab 2: Submissions — */}
      {tab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {loading.subs ? (
            <SkeletonBox height={280} />
          ) : submissions ? (
            <>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={SendRoundedIcon}
                    label="Total Submissions"
                    value={submissions.total ?? 0}
                    sublabel="In selected date range"
                    accent
                  />
                </Grid>
              </Grid>

              <SectionCard title="Submissions by Day">
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableCellHeadSx}>Date</TableCell>
                        <TableCell sx={tableCellHeadSx} align="right">Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {byDay.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} sx={{ border: 'none' }}>
                            <EmptyState title="No submissions in range" description="Try a different date range." />
                          </TableCell>
                        </TableRow>
                      ) : (
                        byDay.map((d, i) => (
                          <TableRow key={(d.date || '') + i} hover sx={tableRowSx}>
                            <TableCell>{d.date || '—'}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>{d.count ?? 0}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SectionCard>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <SectionCard title="Submissions by Domain">
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={tableCellHeadSx}>Domain</TableCell>
                          <TableCell sx={tableCellHeadSx} align="right">Count</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(byDomain || []).slice(0, 10).map((d, i) => (
                          <TableRow key={(d.domain || '') + i} hover sx={tableRowSx}>
                            <TableCell>{d.domain || 'unknown'}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>{d.count ?? 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </SectionCard>

                <SectionCard title="Top Users by Submissions">
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={tableCellHeadSx}>User ID</TableCell>
                          <TableCell sx={tableCellHeadSx} align="right">Count</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(topUsersSubs || []).slice(0, 10).map((u) => (
                          <TableRow key={u.user_id} hover sx={tableRowSx}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{u.user_id}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'var(--primary)' }}>{u.count ?? 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </SectionCard>
              </Box>
            </>
          ) : null}
        </Box>
      )}

      {/* — Tab 3: Mapping Logs — */}
      {tab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {loading.logs ? (
            <SkeletonBox height={380} />
          ) : logs ? (
            <>
              {/* Summary stat cards */}
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={SendRoundedIcon}
                    label="Total Submissions"
                    value={logsTotal}
                    sublabel="In selected range"
                    accent
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={PercentRoundedIcon}
                    label="Avg Accuracy"
                    value={`${avgAccuracy}%`}
                    sublabel="Current page"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={EditRoundedIcon}
                    label="User Changes"
                    value={totalChanged}
                    sublabel="Current page"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    icon={ErrorOutlineRoundedIcon}
                    label="Unmapped Fields"
                    value={totalUnmapped}
                    sublabel="Current page"
                  />
                </Grid>
              </Grid>

              {/* Submissions table */}
              <SectionCard title="Submission Mapping Logs">
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...tableCellHeadSx, width: 40 }} />
                        <TableCell sx={tableCellHeadSx}>Date</TableCell>
                        <TableCell sx={tableCellHeadSx}>User</TableCell>
                        <TableCell sx={tableCellHeadSx}>Domain</TableCell>
                        <TableCell sx={tableCellHeadSx}>ATS</TableCell>
                        <TableCell sx={tableCellHeadSx} align="center">Fields</TableCell>
                        <TableCell sx={tableCellHeadSx} align="center">Matched ✓</TableCell>
                        <TableCell sx={tableCellHeadSx} align="center">Changed ✎</TableCell>
                        <TableCell sx={tableCellHeadSx} align="center">Unmapped ✗</TableCell>
                        <TableCell sx={tableCellHeadSx} align="center">Accuracy</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logsList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} sx={{ border: 'none' }}>
                            <EmptyState
                              icon={InboxOutlinedIcon}
                              title="No mapping logs"
                              description="Submission mapping data will appear after users apply to jobs via the Chrome extension."
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        logsList.map((row) => <SubmissionRow key={row.id} row={row} />)
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {logsTotalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                      count={logsTotalPages}
                      page={logsPage}
                      onChange={(_, p) => setLogsPage(p)}
                      size="small"
                      shape="rounded"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                        },
                        '& .Mui-selected': {
                          bgcolor: 'var(--primary) !important',
                          color: '#fff !important',
                        },
                      }}
                    />
                  </Box>
                )}
              </SectionCard>
            </>
          ) : null}
        </Box>
      )}
    </PageContainer>
  );
}
