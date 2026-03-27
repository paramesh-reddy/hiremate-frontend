import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ResumeHtmlPreview from '../ResumeHtmlPreview';
import KeywordMatchPanel from './KeywordMatchPanel';
import { KeywordMatchCompact } from './SharedComponents';

const TOOLBAR_HEIGHT = 48;

export default function PreviewPanel({
  profile,
  designConfig,
  jobRole,
  jobDescription,
  tailoring,
  keywordDetails,
  keywordMatch,
  setJdDialogMode,
  setShowJdUploadDialog,
}) {
  return (
    <Box sx={{ flex: 1, minWidth: 200, height: { md: '100vh' }, minHeight: { xs: 500 }, display: 'flex', flexDirection: 'column', bgcolor: '#F3F4F6', overflow: 'hidden' }}>
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          minHeight: TOOLBAR_HEIGHT,
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', fontFamily: 'var(--font-family)' }}>
          Live preview — updates instantly as you edit
        </Typography>
        {jobDescription?.trim() ? (
          <KeywordMatchCompact keywordCount={keywordMatch?.matched_count ?? 0} totalKeywords={keywordMatch?.total_keywords ?? 0} matchPct={keywordMatch?.percent ?? 0} />
        ) : (
          <Box
            onClick={() => { setJdDialogMode('add'); setShowJdUploadDialog(true); }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: '8px', border: '1px dashed rgba(37,99,235,0.3)', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { bgcolor: 'rgba(37,99,235,0.05)', borderColor: 'rgba(37,99,235,0.6)' } }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: 'var(--primary)' }} />
            <Typography sx={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, fontFamily: 'var(--font-family)', whiteSpace: 'nowrap' }}>
              Add JD to see match score
            </Typography>
          </Box>
        )}
      </Box>
      {keywordDetails && !tailoring && (
        <Box sx={{ flexShrink: 0, px: 2, pt: 1.5, pb: 0 }}>
          <KeywordMatchPanel keywordDetails={keywordDetails} />
        </Box>
      )}
      {tailoring && (
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, bgcolor: '#EFF6FF', borderBottom: '1px solid #BFDBFE' }}>
          <CircularProgress size={16} thickness={5} sx={{ color: '#2563EB' }} />
          <Typography sx={{ fontSize: '0.8rem', fontFamily: 'var(--font-family)', color: '#1D4ED8', fontWeight: 500 }}>
            Re-tailoring resume to match job description…
          </Typography>
        </Box>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', py: 3, px: 2, opacity: tailoring ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 816,
            bgcolor: '#FFFFFF',
            boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
            borderRadius: 1,
          }}
        >
          <ResumeHtmlPreview
            profile={profile}
            templateId={designConfig.template_id}
            fontFamily={designConfig.font_family}
            fontSize={designConfig.font_size}
            lineHeight={designConfig.line_height}
            jobTitle={jobRole}
            jobDescription={jobDescription}
            designConfig={designConfig}
          />
        </Box>
      </Box>
    </Box>
  );
}
