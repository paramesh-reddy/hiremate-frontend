/**
 * ResumeHtmlPreview — WYSIWYG live preview.
 *
 * Calls /resume/preview-html which uses the EXACT same Jinja2 templates as the PDF download.
 * Preview == Download. Guaranteed pixel-perfect match.
 *
 * Flow:
 *   profile / design change → 400ms debounce → POST /preview-html with profile_override
 *   → render returned HTML in <iframe srcDoc> (no page reload, seamless)
 *
 * First load: skeleton shown until first HTML arrives.
 * Subsequent updates: spinner badge in corner, old HTML stays visible (no flash).
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Skeleton } from '@mui/material';

const LETTER_PAGE_HEIGHT = 1056; // Letter page @ 96dpi (11 inches * 96)
import { previewResumeHtmlAPI } from '../../services';

const DEBOUNCE_MS = 400;

export default function ResumeHtmlPreview({
  profile,
  templateId,
  fontFamily,
  fontSize,
  lineHeight,
  jobTitle = '',
  jobDescription = '',
  designConfig,
}) {
  const [htmlContent, setHtmlContent] = useState('');
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [contentHeight, setContentHeight] = useState(LETTER_PAGE_HEIGHT);

  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const iframeRef = useRef(null);

  const measureContent = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc?.body) return;
      const h = doc.body.scrollHeight;
      if (h > 0) setContentHeight(Math.max(LETTER_PAGE_HEIGHT, h));
    } catch { /* ignore */ }
  }, []);

  const fetchHtml = useCallback(async (params) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setRefreshing(true);
    try {
      const { data } = await previewResumeHtmlAPI(params, { signal: ctrl.signal });
      setHtmlContent(typeof data === 'string' ? data : '');
      setFirstLoaded(true);
    } catch (err) {
      // Ignore aborted requests — a newer one is already in flight
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
      // On unexpected error keep existing content visible
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const params = {
      job_title: jobTitle || '',
      job_description: jobDescription || '',
      template_id: templateId || 'classic',
      font_family: fontFamily || undefined,
      font_size: fontSize || undefined,
      line_height: lineHeight || undefined,
      design_config: designConfig || undefined,
      profile_override: profile,
    };

    if (!firstLoaded) {
      // First render — call immediately (no debounce) so skeleton resolves fast
      fetchHtml(params);
      return;
    }

    // Subsequent changes — debounce to avoid API spam while user types
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      fetchHtml(params);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, templateId, fontFamily, fontSize, lineHeight, jobTitle, jobDescription, designConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ── Skeleton: shown only until the very first HTML arrives ──────────────
  if (!firstLoaded) {
    return (
      <Box sx={{ p: '0.5in', bgcolor: 'white', minHeight: 1056, fontFamily: 'inherit' }}>
        {/* Name */}
        <Skeleton variant="text" sx={{ mx: 'auto', mb: 0.5 }} width="55%" height={34} />
        <Skeleton variant="text" sx={{ mx: 'auto', mb: 3 }} width="72%" height={18} />
        {/* 4 sections */}
        {[['30%', 3], ['28%', 3], ['32%', 4], ['26%', 2]].map(([titleW, lines], si) => (
          <Box key={si} sx={{ mb: 2.5 }}>
            <Skeleton variant="text" width={titleW} height={16} sx={{ mb: 0.5 }} />
            <Box sx={{ bgcolor: '#e5e7eb', height: 1, mb: 1 }} />
            {Array.from({ length: lines }).map((_, li) => (
              <Skeleton key={li} variant="text" width={`${68 + (li % 3) * 8}%`} height={15} sx={{ mb: 0.25 }} />
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  // ── Live iframe: Render at full content height, no internal scrolling ──
  // Parent container (in index.jsx) handles scrolling so preview matches PDF layout exactly
  return (
    <Box sx={{ position: 'relative', width: '100%', bgcolor: 'white' }}>
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        title="Resume Preview"
        sandbox="allow-same-origin"
        scrolling="no"
        onLoad={measureContent}
        style={{
          width: '100%',
          height: `${contentHeight}px`,
          border: 'none',
          display: 'block',
          opacity: refreshing ? 0.5 : 1,
          transition: 'opacity 0.2s ease',
          overflow: 'hidden',
        }}
      />
      {/* Loading overlay — centered spinner + label, shown while preview is updating */}
      {refreshing && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '3px solid rgba(37,99,235,0.18)',
              borderTopColor: '#2563EB',
              animation: 'rh-spin 0.7s linear infinite',
              '@keyframes rh-spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Box
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#2563EB',
              fontFamily: 'var(--font-family, sans-serif)',
              bgcolor: 'rgba(255,255,255,0.85)',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backdropFilter: 'blur(4px)',
            }}
          >
            Updating preview…
          </Box>
        </Box>
      )}
    </Box>
  );
}
