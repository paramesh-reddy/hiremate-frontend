import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { getPrivacyPolicyAPI } from '../../services';

const SIDEBAR_W = 240;

function SectionSkeleton() {
  return (
    <Box sx={{ mb: 5 }}>
      <Skeleton variant="text" width="40%" height={36} sx={{ mb: 1 }} />
      {[100, 90, 95, 80].map((w, i) => (
        <Skeleton key={i} variant="text" width={`${w}%`} height={20} sx={{ mb: 0.5 }} />
      ))}
    </Box>
  );
}

function formatContent(text) {
  // Render **bold** and newlines as JSX
  return text.split('\n').map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={li}>
        {parts.map((part, pi) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={pi}>{part.slice(2, -2)}</strong>
          ) : (
            part
          ),
        )}
        <br />
      </span>
    );
  });
}

export default function PrivacyPolicy() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  useEffect(() => {
    getPrivacyPolicyAPI()
      .then((res) => {
        setPolicy(res.data);
        setActiveId(res.data?.content?.sections?.[0]?.id ?? '');
      })
      .catch(() => setError('Failed to load privacy policy. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  // IntersectionObserver — highlight sidebar item as section scrolls into view
  useEffect(() => {
    if (!policy) return;
    const options = { rootMargin: '-20% 0px -70% 0px', threshold: 0 };
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveId(entry.target.id);
      });
    }, options);
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [policy]);

  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setDrawerOpen(false);
  };

  const sections = policy?.content?.sections ?? [];

  const navList = (
    <List disablePadding sx={{ px: 1 }}>
      {sections.map(({ id, title }) => (
        <ListItemButton
          key={id}
          onClick={() => scrollTo(id)}
          selected={activeId === id}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            '&.Mui-selected': {
              bgcolor: 'var(--sidebar-item-active-bg)',
              color: 'var(--sidebar-item-active-color)',
              '&:hover': { bgcolor: 'var(--light-blue-bg-08)' },
            },
            '&:hover': { bgcolor: 'var(--sidebar-item-hover-bg)' },
          }}
        >
          <ListItemText
            primary={title}
            primaryTypographyProps={{
              fontSize: '0.8125rem',
              fontWeight: activeId === id ? 600 : 400,
              lineHeight: 1.4,
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'var(--bg-default)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          px: { xs: 2, md: 5 },
          py: 2.5,
          borderBottom: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'var(--bg-default)',
        }}
      >
        {isMobile && (
          <IconButton size="small" onClick={() => setDrawerOpen(true)}>
            <MenuRoundedIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          HireMate
        </Typography>
        <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          / Privacy Policy
        </Typography>
        {policy && (
          <Chip
            label={`v${policy.version}`}
            size="small"
            sx={{ ml: 'auto', fontSize: '0.75rem' }}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Desktop sticky sidebar */}
        {!isMobile && (
          <Box
            component="nav"
            sx={{
              width: SIDEBAR_W,
              flexShrink: 0,
              position: 'sticky',
              top: 57,
              alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 57px)',
              overflowY: 'auto',
              py: 3,
              borderRight: '1px solid var(--divider)',
            }}
          >
            <Typography
              sx={{
                px: 2,
                mb: 1.5,
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
              }}
            >
              Contents
            </Typography>
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="text" height={36} sx={{ mx: 2, mb: 0.5 }} />
                ))
              : navList}
          </Box>
        )}

        {/* Mobile drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: SIDEBAR_W, pt: 2, bgcolor: 'var(--bg-default)' } }}
        >
          <Typography
            sx={{
              px: 2,
              mb: 1.5,
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
            }}
          >
            Contents
          </Typography>
          {navList}
        </Drawer>

        {/* Main content */}
        <Box
          component="article"
          sx={{
            flex: 1,
            maxWidth: 780,
            mx: 'auto',
            px: { xs: 2.5, md: 5 },
            py: 5,
          }}
        >
          {error && (
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'error.light',
                color: 'error.contrastText',
                mb: 4,
              }}
            >
              <Typography>{error}</Typography>
            </Box>
          )}

          {loading ? (
            <>
              <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 4 }} />
              {[0, 1, 2, 3].map((i) => (
                <SectionSkeleton key={i} />
              ))}
            </>
          ) : policy ? (
            <>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 0.5, color: 'var(--text-primary)' }}
              >
                {policy.title}
              </Typography>
              <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.875rem', mb: 0.5 }}>
                Effective date:{' '}
                <strong>{policy.content?.effective_date ?? '—'}</strong>
              </Typography>
              <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.875rem', mb: 4 }}>
                Last updated:{' '}
                <strong>
                  {new Date(policy.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </strong>
              </Typography>

              <Divider sx={{ mb: 4 }} />

              {sections.map((section, idx) => (
                <Box
                  key={section.id}
                  id={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el; }}
                  sx={{ mb: 5, scrollMarginTop: 80 }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 1.5, color: 'var(--text-primary)' }}
                  >
                    {idx + 1}. {section.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.75,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {formatContent(section.content)}
                  </Typography>
                  {idx < sections.length - 1 && <Divider sx={{ mt: 4 }} />}
                </Box>
              ))}

              <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid var(--divider)' }}>
                <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  For questions contact{' '}
                  <a
                    href={`mailto:${policy.content?.contact_email}`}
                    style={{ color: 'var(--primary)' }}
                  >
                    {policy.content?.contact_email}
                  </a>
                </Typography>
              </Box>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
