import { useState, useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { Box, IconButton, Typography, CircularProgress, Tooltip } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import FitScreenRoundedIcon from '@mui/icons-material/FitScreenRounded';
import { pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.25;

export default function PdfViewer({ src, file, width, height = 480, fillContainer = false, sx = {} }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(width || 600);
  const pageWidth = fillContainer ? containerWidth : (width || (typeof window !== 'undefined' ? Math.min(600, window.innerWidth - 96) : 600));

  useEffect(() => {
    if (!fillContainer || !containerRef.current) return;
    const el = containerRef.current;
    const updateWidth = () => {
      if (el) setContainerWidth(el.clientWidth || 600);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fillContainer]);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileProp = file || (src ? { url: src } : null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err) => {
    setError(err?.message || 'Failed to load PDF');
    setLoading(false);
  };

  const goToPrevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPageNumber((p) => Math.min(numPages || 1, p + 1));
  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP));
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP));
  const fitToPage = () => {
    if (!containerRef.current || !fillContainer) return;
    const w = containerRef.current.clientWidth || 600;
    const pageW = 612;
    const fitScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, w / pageW));
    setScale(fitScale);
  };

  if (!fileProp) return null;

  return (
    <Box ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', flex: fillContainer ? 1 : undefined, minHeight: fillContainer ? '100%' : undefined, ...sx }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 0.75,
          px: 1,
          bgcolor: 'rgba(0,0,0,0.04)',
          borderRadius: '8px 8px 0 0',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={goToPrevPage} disabled={pageNumber <= 1} sx={{ p: 0.5 }}>
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ fontFamily: 'var(--font-family)', minWidth: 48, textAlign: 'center' }}>
            {pageNumber} / {numPages || '—'}
          </Typography>
          <IconButton size="small" onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)} sx={{ p: 0.5 }}>
            <ChevronRightRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {fillContainer && (
            <Tooltip title="Fit to page">
              <IconButton size="small" onClick={fitToPage} sx={{ p: 0.5 }}>
                <FitScreenRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={zoomOut} disabled={scale <= MIN_SCALE} sx={{ p: 0.5 }}>
            <ZoomOutRoundedIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ fontFamily: 'var(--font-family)', minWidth: 36 }}>
            {Math.round(scale * 100)}%
          </Typography>
          <IconButton size="small" onClick={zoomIn} disabled={scale >= MAX_SCALE} sx={{ p: 0.5 }}>
            <ZoomInRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: fillContainer ? '60vh' : height,
          overflow: 'auto',
          bgcolor: '#525659',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          py: 1.5,
        }}
      >
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 4 }}>
            <CircularProgress size={32} sx={{ color: 'white' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-family)' }}>
              Loading PDF...
            </Typography>
          </Box>
        )}
        {error && (
          <Typography variant="body2" sx={{ color: '#ff6b6b', fontFamily: 'var(--font-family)', p: 2 }}>
            {error}
          </Typography>
        )}
        {!error && (
          <Document
            file={fileProp}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              width={pageWidth}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={null}
            />
          </Document>
        )}
      </Box>
    </Box>
  );
}
