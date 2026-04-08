// Acceptance checklist:
// - PDF with multi-column layout parses correctly (PyMuPDF reads all columns via get_text()).
// - 120 companies triggers two batches (100 + 20), no UI freeze (sequential chunk loop).
// - First SSE event appears within ~5 seconds (web_search_preview grounding).
// - 401 mid-stream shows Snackbar, does not crash (streamJobs calls onError with string message).
// - Missing OpenAI key returns 503 with readable message (service raises HTTPException 503).

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Divider,
  LinearProgress,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import CustomStepper from '../../components/common/CustomStepper';
import CompanyUpload from '../../components/CompanySearch/CompanyUpload';
import SearchFilters from '../../components/CompanySearch/SearchFilters';
import CorpusSearchFilters from '../../components/CompanySearch/CorpusSearchFilters';
import CorpusJobList from '../../components/CompanySearch/CorpusJobList';
import CompanyLinksTable from '../../components/CompanySearch/CompanyLinksTable';
import JobResultsList from '../../components/CompanySearch/JobResultsList';
import { resolveLinks, streamJobs, fetchJobsCorpus } from '../../services/companySearchService';
import { RESUME_STUDIO_THEME as THEME } from '../../utilities/resumeStudioTheme';

const STEPS = [
  { label: 'Upload Companies', description: 'PDF or DOCX company list' },
  { label: 'Resolve Links', description: 'Careers site + LinkedIn for manual apply' },
  { label: 'Search Jobs', description: 'Stream open roles per company' },
];

const CHUNK_SIZE = 100;

const EMPTY_CORPUS_FILTERS = {
  q: '',
  company: '',
  role: '',
  location: '',
  skills: [],
  posted_from: '',
  posted_to: '',
};

const primaryBtnSx = {
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.8125rem',
  height: 36,
  minHeight: 36,
  px: 2,
  borderRadius: 1,
  bgcolor: THEME.primary,
  boxShadow: 'none',
  '&:hover': { bgcolor: THEME.primaryDark, boxShadow: 'none' },
};

const outlinedBtnSx = {
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.8125rem',
  height: 36,
  borderRadius: 1,
  borderColor: THEME.mutedBorder,
  color: THEME.textSecondary,
};

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function parseCommaSeparatedCompanies(text) {
  if (!text?.trim()) return [];
  const parts = text.split(/[,;\n]+/);
  const seen = new Set();
  const out = [];
  for (const part of parts) {
    const name = part.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name });
  }
  return out;
}

function mergeCompanyLists(existing, incoming) {
  const seen = new Set(existing.map((c) => c.name.toLowerCase()));
  const out = [...existing];
  for (const item of incoming) {
    const key = item.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

const CORPUS_PAGE_SIZE = 12;

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
}

export default function JobRecommendationPage() {
  const [mainTab, setMainTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const [corpusFilters, setCorpusFilters] = useState(() => ({ ...EMPTY_CORPUS_FILTERS }));
  const debouncedCorpusFilters = useDebounced(corpusFilters, 400);
  const [corpusPage, setCorpusPage] = useState(1);

  const clearCorpusFilters = () => {
    setCorpusFilters({ ...EMPTY_CORPUS_FILTERS });
  };

  useEffect(() => {
    setCorpusPage(1);
  }, [debouncedCorpusFilters]);

  const corpusQueryParams = useMemo(() => {
    const p = { page: corpusPage, page_size: CORPUS_PAGE_SIZE };
    const f = debouncedCorpusFilters;
    if (f.q?.trim()) p.q = f.q.trim();
    if (f.company?.trim()) p.company = f.company.trim();
    if (f.role?.trim()) p.role = f.role.trim();
    if (f.location?.trim()) p.location = f.location.trim();
    if (f.skills?.length) p.skills = f.skills.join(',');
    if (f.posted_from) p.posted_from = f.posted_from;
    if (f.posted_to) p.posted_to = f.posted_to;
    return p;
  }, [debouncedCorpusFilters, corpusPage]);

  const { data: corpusData, isLoading: corpusLoading, isFetching: corpusFetching } = useQuery({
    queryKey: ['jobs-corpus', corpusQueryParams],
    queryFn: () => fetchJobsCorpus(corpusQueryParams).then((r) => r.data),
    staleTime: 30_000,
  });

  const [companies, setCompanies] = useState([]);
  const [manualCompaniesText, setManualCompaniesText] = useState('');

  const [filters, setFilters] = useState({ role: '', location: '', skills: [] });
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksError, setLinksError] = useState('');

  const [events, setEvents] = useState([]);
  const [streamDone, setStreamDone] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [completedCount, setCompletedCount] = useState(0);

  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const showError = (msg) => setSnackbar({ open: true, message: String(msg) });

  const enterStep2 = async () => {
    setActiveStep(1);
    setLinksError('');
    setLinksLoading(true);
    setLinks([]);

    try {
      const chunks = chunkArray(companies, CHUNK_SIZE);
      const allLinks = [];
      for (const chunk of chunks) {
        const { data } = await resolveLinks({
          companies: chunk,
          role: filters.role || undefined,
          location: filters.location || undefined,
        });
        allLinks.push(...data.results);
      }
      setLinks(allLinks);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to resolve company links.';
      setLinksError(msg);
      showError(msg);
    } finally {
      setLinksLoading(false);
    }
  };

  const startSearch = async () => {
    setActiveStep(2);
    setEvents([]);
    setStreamDone(false);
    setStreamError('');
    setCompletedCount(0);

    setEvents(links.map((l) => ({ company: l.name, jobs: [], status: 'pending', message: null })));

    const chunks = chunkArray(links, CHUNK_SIZE);

    for (const chunk of chunks) {
      await new Promise((resolve) => {
        streamJobs(
          {
            companies: chunk,
            role: filters.role || undefined,
            skills: filters.skills.length > 0 ? filters.skills : undefined,
            location: filters.location || undefined,
          },
          (event) => {
            setCompletedCount((c) => c + 1);
            setEvents((prev) => {
              const idx = prev.findIndex((e) => e.company === event.company);
              if (idx === -1) return [...prev, event];
              const next = [...prev];
              next[idx] = event;
              return next;
            });
          },
          () => resolve(),
          (err) => {
            const msg = typeof err === 'string' ? err : (err?.message || 'Streaming error occurred.');
            setStreamError(msg);
            showError(msg);
            resolve();
          }
        );
      });
    }

    setStreamDone(true);
  };

  const totalCompanies = links.length || companies.length;
  const progressPct = totalCompanies > 0 ? Math.round((completedCount / totalCompanies) * 100) : 0;

  const panelSx = {
    bgcolor: THEME.surface,
    borderRadius: 2,
    border: `1px solid ${THEME.border}`,
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
    overflow: 'hidden',
    mb: 3,
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        width: '100%',
        bgcolor: THEME.pageBg,
        fontFamily: 'var(--font-family)',
        pb: 5,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          mx: 0,
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          pt: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: THEME.primarySoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <RecommendRoundedIcon sx={{ fontSize: 24, color: THEME.primary }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                color: THEME.textPrimary,
                mb: 0.5,
                lineHeight: 1.2,
              }}
            >
              Job Recommendation
            </Typography>
            <Typography sx={{ color: THEME.textSecondary, fontSize: '0.95rem', lineHeight: 1.45 }}>
              Discover curated roles from our job corpus, or run a guided bulk search across your target companies.
            </Typography>
          </Box>
        </Box>

        <Box sx={panelSx}>
          <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 1, borderBottom: `1px solid ${THEME.border}`, bgcolor: THEME.surface }}>
            <Tabs
              value={mainTab}
              onChange={(_, v) => setMainTab(v)}
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: THEME.textSecondary,
                  py: 1.25,
                },
                '& .Mui-selected': { color: `${THEME.primary} !important` },
                '& .MuiTabs-indicator': { bgcolor: THEME.primary, height: 3, borderRadius: '3px 3px 0 0' },
              }}
            >
              <Tab
                icon={<TravelExploreRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Recommended roles"
              />
              <Tab
                icon={<CloudUploadRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Bulk upload"
              />
            </Tabs>
          </Box>

          {mainTab === 0 && (
            <>
              <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 2.5, pb: 2 }}>
                <CorpusSearchFilters
                  filters={corpusFilters}
                  onChange={setCorpusFilters}
                  onClear={clearCorpusFilters}
                />
                {(corpusFetching && !corpusLoading) && (
                  <LinearProgress
                    sx={{
                      mt: 2,
                      borderRadius: 1,
                      height: 3,
                      bgcolor: 'rgba(51, 94, 222, 0.08)',
                      '& .MuiLinearProgress-bar': { bgcolor: THEME.primary },
                    }}
                  />
                )}
              </Box>
              <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5, pt: 0 }}>
                <CorpusJobList
                  jobs={corpusData?.items}
                  loading={corpusLoading}
                  total={corpusData?.total ?? 0}
                  page={corpusPage}
                  pageSize={CORPUS_PAGE_SIZE}
                  onPageChange={setCorpusPage}
                  onClearFilters={clearCorpusFilters}
                />
              </Box>
            </>
          )}

          {mainTab === 1 && (
            <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2.5 }}>
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${THEME.border}`,
                  bgcolor: THEME.previewCanvas,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: THEME.textPrimary, mb: 0.5 }}>
                  Bulk search workflow
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary, lineHeight: 1.55 }}>
                  Upload a PDF/DOCX list or paste company names. We resolve official career pages and LinkedIn search
                  links, then stream AI-powered job discovery per company—ideal for high-volume outbound searches.
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <CustomStepper steps={STEPS} activeStep={activeStep} variant="compact" />
              </Box>

              {activeStep === 0 && (
                <Box>
                  <CompanyUpload companies={companies} onCompaniesChange={setCompanies} />

                  <Box sx={{ my: 3 }}>
                    <Divider sx={{ borderColor: THEME.border }}>
                      <Typography
                        sx={{
                          px: 1.5,
                          fontSize: '0.75rem',
                          color: THEME.textSecondary,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        Or paste names
                      </Typography>
                    </Divider>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary, mb: 1, lineHeight: 1.5 }}>
                      Enter companies separated by commas or new lines. New names merge with your list above.
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      placeholder="Acme Inc, Beta Corp, Contoso…"
                      value={manualCompaniesText}
                      onChange={(e) => setManualCompaniesText(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.875rem',
                          borderRadius: 2,
                          bgcolor: THEME.surface,
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: THEME.mutedBorder,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(51, 94, 222, 0.35)',
                        },
                      }}
                    />
                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        disabled={!manualCompaniesText.trim()}
                        onClick={() => {
                          const parsed = parseCommaSeparatedCompanies(manualCompaniesText);
                          if (parsed.length === 0) return;
                          setCompanies((prev) => mergeCompanyLists(prev, parsed));
                          setManualCompaniesText('');
                        }}
                        sx={outlinedBtnSx}
                      >
                        Add to list
                      </Button>
                    </Box>
                  </Box>

                  {companies.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary, mb: 1.5, lineHeight: 1.5 }}>
                        Optionally set target role and location before resolving links:
                      </Typography>
                      <SearchFilters filters={filters} onChange={setFilters} />
                    </Box>
                  )}

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      disableElevation
                      disabled={companies.length === 0}
                      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '16px !important' }} />}
                      onClick={enterStep2}
                      sx={primaryBtnSx}
                    >
                      Next — Resolve Links
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <SearchFilters filters={filters} onChange={setFilters} />
                  </Box>

                  {linksError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {linksError}
                    </Alert>
                  )}

                  <CompanyLinksTable rows={links} loading={linksLoading} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }} flexWrap="wrap" gap={1}>
                    <Button
                      startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
                      onClick={() => setActiveStep(0)}
                      sx={{ ...outlinedBtnSx, border: 'none' }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      disableElevation
                      disabled={linksLoading || links.length === 0}
                      endIcon={<SearchRoundedIcon sx={{ fontSize: '16px !important' }} />}
                      onClick={startSearch}
                      sx={primaryBtnSx}
                    >
                      Start Search
                    </Button>
                  </Stack>
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  {!streamDone && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary }}>Searching…</Typography>
                        <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary }}>
                          {completedCount} / {totalCompanies}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progressPct}
                        sx={{
                          borderRadius: 1,
                          height: 6,
                          bgcolor: 'rgba(51, 94, 222, 0.08)',
                          '& .MuiLinearProgress-bar': { bgcolor: THEME.primary },
                        }}
                      />
                    </Box>
                  )}

                  {streamDone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', color: 'success.dark', fontWeight: 600 }}>
                        Search complete — {totalCompanies} companies scanned
                      </Typography>
                      <Button
                        startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setActiveStep(1)}
                        sx={{ ...outlinedBtnSx, border: 'none' }}
                      >
                        Back
                      </Button>
                    </Box>
                  )}

                  {streamError && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {streamError}
                    </Alert>
                  )}

                  <JobResultsList events={events} />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
