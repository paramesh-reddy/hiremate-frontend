import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ResumeHtmlPreview from '../ResumeHtmlPreview';
import KeywordMatchPanel from './KeywordMatchPanel';
import { KeywordMatchCompact } from './SharedComponents';
import { RESUME_STUDIO_THEME as T } from '../../../utilities/resumeStudioTheme';

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
    <Box
      sx={{
        flex: 1,
        minWidth: 200,
        height: { md: '100vh' },
        minHeight: { xs: 500 },
        display: 'flex',
        flexDirection: 'column',
        bgcolor: T.previewCanvas,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: { xs: 1.5, sm: 2 },
          py: 1,
          bgcolor: T.surface,
          borderBottom: `1px solid ${T.border}`,
          minHeight: TOOLBAR_HEIGHT,
        }}
      >
        <Typography sx={{ fontSize: '0.8125rem', color: T.textSecondary, fontFamily: 'var(--font-family)', fontWeight: 500 }}>
          Live preview — updates as you edit
        </Typography>
        {jobDescription?.trim() ? (
          <KeywordMatchCompact keywordCount={keywordMatch?.matched_count ?? 0} totalKeywords={keywordMatch?.total_keywords ?? 0} matchPct={keywordMatch?.percent ?? 0} />
        ) : (
          <Box
            onClick={() => { setJdDialogMode('add'); setShowJdUploadDialog(true); }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.25,
              py: 0.5,
              borderRadius: 1,
              border: `1px dashed rgba(51, 94, 222, 0.35)`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              '&:hover': { bgcolor: T.primarySoft, borderColor: 'rgba(51, 94, 222, 0.55)' },
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: T.primary }} />
            <Typography sx={{ fontSize: '0.8125rem', color: T.primary, fontWeight: 600, fontFamily: 'var(--font-family)', whiteSpace: 'nowrap' }}>
              Add JD for match score
            </Typography>
          </Box>
        )}
      </Box>
      {keywordDetails && !tailoring && (
        <Box sx={{ flexShrink: 0, px: { xs: 1.5, sm: 2 }, pt: 1.5, pb: 0 }}>
          <KeywordMatchPanel keywordDetails={keywordDetails} />
        </Box>
      )}
      {tailoring && (
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: { xs: 1.5, sm: 2 },
            py: 1,
            bgcolor: T.primarySoft,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <CircularProgress size={16} thickness={5} sx={{ color: T.primary }} />
          <Typography sx={{ fontSize: '0.8125rem', fontFamily: 'var(--font-family)', color: T.primary, fontWeight: 600 }}>
            Re-tailoring resume to match job description…
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          bgcolor: T.previewCanvas,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          py: 3,
          px: { xs: 1.5, sm: 2 },
          opacity: tailoring ? 0.5 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 816,
            bgcolor: T.surface,
            boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08)',
            borderRadius: 1,
            border: `1px solid ${T.border}`,
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
