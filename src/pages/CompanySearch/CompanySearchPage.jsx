// Acceptance checklist:
// - PDF with multi-column layout parses correctly (PyMuPDF reads all columns via get_text()).
// - 120 companies triggers two batches (100 + 20), no UI freeze (sequential chunk loop).
// - First SSE event appears within ~5 seconds (web_search_preview grounding).
// - 401 mid-stream shows Snackbar, does not crash (streamJobs calls onError with string message).
// - Missing OpenAI key returns 503 with readable message (service raises HTTPException 503).

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  LinearProgress,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';

import CustomStepper from '../../components/common/CustomStepper';
import CompanyUpload from '../../components/CompanySearch/CompanyUpload';
import SearchFilters from '../../components/CompanySearch/SearchFilters';
import CompanyLinksTable from '../../components/CompanySearch/CompanyLinksTable';
import JobResultsList from '../../components/CompanySearch/JobResultsList';
import { resolveLinks, streamJobs } from '../../services/companySearchService';

const STEPS = [
  { label: 'Upload Companies', description: 'PDF or DOCX company list' },
  { label: 'Resolve Links', description: 'Careers site + LinkedIn for manual apply' },
  { label: 'Search Jobs', description: 'Stream open roles per company' },
];

const CHUNK_SIZE = 100;

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Split on commas, semicolons, or newlines; trim; dedupe case-insensitively within the paste. */
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

export default function CompanySearchPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Step 1
  const [companies, setCompanies] = useState([]);
  const [manualCompaniesText, setManualCompaniesText] = useState('');

  // Step 2
  const [filters, setFilters] = useState({ role: '', location: '', skills: [] });
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksError, setLinksError] = useState('');

  // Step 3
  const [events, setEvents] = useState([]);
  const [streamDone, setStreamDone] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [completedCount, setCompletedCount] = useState(0);

  // Global error snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const showError = (msg) => setSnackbar({ open: true, message: String(msg) });

  // ── Step 2: resolve links on entering step ────────────────────────────────

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

  // ── Step 3: stream jobs ───────────────────────────────────────────────────

  const startSearch = async () => {
    setActiveStep(2);
    setEvents([]);
    setStreamDone(false);
    setStreamError('');
    setCompletedCount(0);

    // Seed pending events immediately so the UI shows all companies
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: 'rgba(79,70,229,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BusinessRoundedIcon sx={{ fontSize: 22, color: '#4f46e5' }} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}
          >
            Company Job Search
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>
            Upload a list, or paste company names — then find open roles in bulk
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Box sx={{ mb: 3 }}>
        <CustomStepper steps={STEPS} activeStep={activeStep} variant="compact" />
      </Box>

      {/* ── Step 1: Upload ── */}
      {activeStep === 0 && (
        <Box>
          <CompanyUpload companies={companies} onCompaniesChange={setCompanies} />

          <Box sx={{ my: 3 }}>
            <Divider sx={{ borderColor: 'var(--border-color)' }}>
              <Typography
                sx={{
                  px: 1.5,
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-family)',
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
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)',
                mb: 1,
              }}
            >
              Enter companies separated by commas (or new lines). New names are merged with your list above.
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
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.875rem',
                  borderRadius: 2,
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
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 2.5,
                }}
              >
                Add to list
              </Button>
            </Box>
          </Box>

          {companies.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)', mb: 2 }}>
                Optionally set your target role and location before resolving links:
              </Typography>
              <SearchFilters filters={filters} onChange={setFilters} />
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              disabled={companies.length === 0}
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={enterStep2}
              sx={{
                fontFamily: 'var(--font-family)',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
              }}
            >
              Next — Resolve Links
            </Button>
          </Box>
        </Box>
      )}

      {/* ── Step 2: Links ── */}
      {activeStep === 1 && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <SearchFilters filters={filters} onChange={setFilters} />
          </Box>

          {linksError && (
            <Alert severity="error" sx={{ mb: 2, fontFamily: 'var(--font-family)' }}>
              {linksError}
            </Alert>
          )}

          <CompanyLinksTable rows={links} loading={linksLoading} />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => setActiveStep(0)}
              sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', color: 'var(--text-secondary)' }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              disabled={linksLoading || links.length === 0}
              endIcon={<SearchRoundedIcon />}
              onClick={startSearch}
              sx={{
                fontFamily: 'var(--font-family)',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
              }}
            >
              Start Search
            </Button>
          </Box>
        </Box>
      )}

      {/* ── Step 3: Results ── */}
      {activeStep === 2 && (
        <Box>
          {/* Progress bar */}
          {!streamDone && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>
                  Searching…
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>
                  {completedCount} / {totalCompanies}
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progressPct} sx={{ borderRadius: 1, height: 6 }} />
            </Box>
          )}

          {streamDone && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#047857', fontFamily: 'var(--font-family)', fontWeight: 600 }}>
                Search complete — {totalCompanies} companies scanned
              </Typography>
              <Button
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => setActiveStep(1)}
                sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', color: 'var(--text-secondary)' }}
              >
                Back
              </Button>
            </Box>
          )}

          {streamError && (
            <Alert severity="warning" sx={{ mb: 2, fontFamily: 'var(--font-family)' }}>
              {streamError}
            </Alert>
          )}

          <JobResultsList events={events} />
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ fontFamily: 'var(--font-family)', width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
