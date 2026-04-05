import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

/**
 * App-standard breadcrumb for dashboard tool pages.
 *
 * @param {Array<{ label: string, to?: string, showBackIcon?: boolean }>} items
 *   Last item should omit `to` — it is the current page (not a link).
 * @param {string} [ariaLabel='Breadcrumb'] — accessible name for the nav landmark.
 */
export default function PageBreadcrumb({ items, ariaLabel = 'Breadcrumb', sx = {} }) {
  if (!items?.length) return null;

  const primary = 'var(--primary, #335ede)';

  const linkSx = {
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.5,
    fontSize: '0.8125rem',
    fontWeight: 600,
    fontFamily: 'var(--font-family)',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    lineHeight: 1.35,
    maxWidth: 'none',
    borderRadius: 0.75,
    transition: 'color 0.15s ease, background-color 0.15s ease',
    py: 0.25,
    px: 0.25,
    mx: -0.25,
    '&:hover': {
      color: primary,
      '& .MuiSvgIcon-root': { opacity: 1 },
    },
    '&:focus-visible': {
      outline: `2px solid ${primary}`,
      outlineOffset: 2,
    },
  };

  const currentSx = {
    fontSize: '0.8125rem',
    fontWeight: 600,
    fontFamily: 'var(--font-family)',
    color: 'var(--text-primary)',
    lineHeight: 1.35,
    letterSpacing: '-0.01em',
  };

  return (
    <Box
      sx={{
        pb: 1.5,
        mb: 2,
        borderBottom: '1px solid',
        borderColor: 'rgba(15, 23, 42, 0.08)',
        ...sx,
      }}
    >
      <Breadcrumbs
        aria-label={ariaLabel}
        separator={
          <ChevronRightRoundedIcon
            sx={{
              fontSize: 16,
              color: 'rgba(15, 23, 42, 0.72)',
              display: 'block',
            }}
            aria-hidden
          />
        }
        sx={{
          flexWrap: 'wrap',
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'wrap',
            alignItems: 'center',
            rowGap: 0.5,
          },
          '& .MuiBreadcrumbs-li': {
            display: 'inline-flex',
            alignItems: 'center',
            maxWidth: 'none',
          },
          '& .MuiBreadcrumbs-separator': {
            mx: 0.5,
          },
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.label}-${index}`;

          if (isLast || !item.to) {
            return (
              <Typography
                key={key}
                component="span"
                sx={{ ...currentSx, whiteSpace: 'normal', wordBreak: 'break-word' }}
                {...(isLast ? { 'aria-current': 'page' } : {})}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={key}
              component={RouterLink}
              to={item.to}
              underline="none"
              sx={linkSx}
              {...(item.showBackIcon ? { 'aria-label': `Back to ${item.label}` } : {})}
            >
              {item.showBackIcon ? (
                <ArrowBackRoundedIcon
                  sx={{ fontSize: 16, flexShrink: 0, opacity: 0.85, transition: 'opacity 0.15s ease' }}
                  aria-hidden
                />
              ) : null}
              <Typography
                component="span"
                sx={{ font: 'inherit', color: 'inherit', whiteSpace: 'normal', wordBreak: 'break-word' }}
              >
                {item.label}
              </Typography>
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
