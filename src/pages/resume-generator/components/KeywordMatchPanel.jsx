import { Box, Chip, Tooltip, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/**
 * Displays keyword match score and breakdown after resume generation.
 *
 * Props:
 *   keywordDetails – { score, matched, missing, critical_missing }
 *                   as returned by the backend score_keywords() function.
 */
export default function KeywordMatchPanel({ keywordDetails }) {
  if (!keywordDetails) return null;

  const { score = 0, matched = [], missing = [], critical_missing = [] } = keywordDetails;

  const isGreen = score >= 85;
  const isYellow = score >= 65 && score < 85;
  const color = isGreen ? '#059669' : isYellow ? '#D97706' : '#DC2626';
  const bgColor = isGreen ? '#ECFDF5' : isYellow ? '#FFFBEB' : '#FEF2F2';
  const borderColor = isGreen ? '#6EE7B7' : isYellow ? '#FCD34D' : '#FCA5A5';

  const totalKeywords = matched.length + missing.length;

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 1.5,
        mb: 2,
      }}
    >
      {/* Score header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: critical_missing.length > 0 || matched.length > 0 ? 2 : 0 }}>
        {isGreen
          ? <CheckCircleOutlineIcon sx={{ color, fontSize: 20 }} />
          : isYellow
          ? <WarningAmberIcon sx={{ color, fontSize: 20 }} />
          : <ErrorOutlineIcon sx={{ color, fontSize: 20 }} />
        }
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color, fontFamily: 'var(--font-family)' }}>
          {score}% Keyword Match
        </Typography>
        {totalKeywords > 0 && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-family)' }}>
            {matched.length} / {totalKeywords} matched
          </Typography>
        )}
      </Box>

      {/* Critical missing */}
      {critical_missing.length > 0 && (
        <Box sx={{ mb: matched.length > 0 ? 1.5 : 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 0.75,
              fontWeight: 600,
              color: '#DC2626',
              fontFamily: 'var(--font-family)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '0.68rem',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 14 }} />
            Critical missing
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {critical_missing.map((kw, i) => (
              <Chip
                key={i}
                label={kw.term}
                size="small"
                color="error"
                variant="outlined"
                sx={{ fontFamily: 'var(--font-family)', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Matched keywords */}
      {matched.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 0.75,
              fontWeight: 600,
              color: '#059669',
              fontFamily: 'var(--font-family)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '0.68rem',
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
            Matched
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {matched.slice(0, 15).map((kw, i) => (
              <Tooltip key={i} title={`${kw.category ?? ''} · ${kw.importance ?? ''}`} placement="top">
                <Chip
                  label={kw.term}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontFamily: 'var(--font-family)', fontSize: '0.75rem' }}
                />
              </Tooltip>
            ))}
            {matched.length > 15 && (
              <Chip
                label={`+${matched.length - 15} more`}
                size="small"
                variant="outlined"
                sx={{ fontFamily: 'var(--font-family)', fontSize: '0.75rem' }}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
