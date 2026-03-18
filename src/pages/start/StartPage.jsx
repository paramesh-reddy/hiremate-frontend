import { Box, Card, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import CustomButton from '../../components/common/CustomButton';

const CARDS = [
  {
    title: 'Get Personalized Recommendations',
    description: 'Take a short questionnaire and discover great roles curated for you.',
    buttonText: 'Get Recommendations',
    to: '/job-search',
    imagePlaceholder: 'Questionnaire or recommendations preview',
  },
  {
    title: 'Build Resumes & Autofill Applications',
    description: 'Fill out a profile to start autofilling with Simplify Copilot and tailoring resumes.',
    buttonText: 'Start Autofilling',
    to: '/profile',
    imagePlaceholder: 'Resume / application form preview',
  },
];

export default function StartPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'var(--bg-app)',
        py: { xs: 3, sm: 5 },
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'var(--font-family)',
      }}
    >
      <Card
        variant="outlined"
        sx={{
          maxWidth: 1080,
          width: '100%',
          borderRadius: 2,
          border: '1px solid var(--border-color)',
          bgcolor: 'var(--bg-paper)',
          boxShadow: '0 2px 16px var(--black-10)',
          overflow: 'hidden',
        }}
      >
        <Grid container sx={{ p: { xs: 3, sm: 5 }, '&:last-child': { pb: { xs: 3, sm: 5 } } }}>
          <Grid item xs={12}>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 'var(--font-size-page-title)', sm: '1.75rem' },
              fontWeight: 700,
              color: 'var(--text-primary)',
              mb: 4,
              textAlign: 'center',
            }}
          >
            Where would you like to start?
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              mb: 15,
              py: 2,
              px: 2.5,
              borderRadius: 2,
              bgcolor: 'var(--bg-light)',
              border: '1px solid var(--border-color)',
              maxWidth: 420,
              mx: 'auto',
            }}
          >
            <Box
              sx={{
                width: 55,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'var(--light-blue-bg-08)',
                border: '2px solid var(--light-blue)',
                flexShrink: 0,
              }}
            />
            <Box>
              <Typography
                component="span"
                sx={{
                  fontWeight: 600,
                  fontSize: 'var(--font-size-helper)',
                  color: 'var(--text-primary)',
                }}
              >
                Michael, Founder
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: 'var(--font-size-helper)',
                  color: 'var(--text-secondary)',
                  ml: 0.5,
                  display: { xs: 'block', sm: 'inline' },
                  mt: { xs: 0.25, sm: 0 },
                }}
              >
                Don&apos;t worry, you can do these in any order!
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 4,
              mb:15,
            }}
          >
          {CARDS.map((card, idx) => (
            <Card
              key={idx}
              variant="outlined"
              sx={{
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.6)',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease, background 0.2s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  height: 6,
                  bgcolor: 'var(--primary)',
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)',
                }}
              />
              <Grid container sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Grid item xs={12} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: 'var(--font-size-section-header)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    mb: 1.5,
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 'var(--font-size-helper)',
                    color: 'var(--text-secondary)',
                    mb: 2,
                    flex: 1,
                    lineHeight: 1.5,
                  }}
                >
                  {card.description}
                </Typography>
                <Box
                  sx={{
                    height: 140,
                    borderRadius: 1,
                    bgcolor: 'var(--light-blue-bg)',
                    border: '1px dashed var(--border-color)',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      fontSize: 'var(--font-size-helper)',
                    }}
                  >
                    {card.imagePlaceholder}
                  </Typography>
                </Box>
                <CustomButton
                  component={Link}
                  to={card.to}
                  sx={{
                    bgcolor: 'var(--btn-primary)',
                    color: 'var(--primary-contrast)',
                    py: 1.25,
                    fontSize: 'var(--font-size-helper)',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'var(--btn-primary-hover)',
                    },
                  }}
                >
                  {card.buttonText}
                </CustomButton>
                </Grid>
              </Grid>
            </Card>
          ))}
          </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
