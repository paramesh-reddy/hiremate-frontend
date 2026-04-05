import { Box, Stepper, Step, StepLabel, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

function StepIcon({ active, completed, index }) {
  if (completed) {
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <CheckRoundedIcon sx={{ fontSize: 18, color: 'white' }} />
      </Box>
    );
  }
  if (active) {
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: 'var(--primary, #335ede)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(51, 94, 222, 0.35), 0 0 0 3px rgba(51, 94, 222, 0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Typography 
          sx={{ 
            fontSize: '0.875rem', 
            fontWeight: 800, 
            color: 'white', 
            lineHeight: 1,
            fontFamily: 'var(--font-family)',
          }}
        >
          {index + 1}
        </Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '2px solid var(--divider, #e5e7eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#fafbfc',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Typography 
        sx={{ 
          fontSize: '0.8125rem', 
          fontWeight: 700, 
        color: 'var(--placeholder, #94a3b8)',
        lineHeight: 1,
        fontFamily: 'var(--font-family)',
      }}
    >
        {index + 1}
      </Typography>
    </Box>
  );
}

export default function CustomStepper({ steps, activeStep, orientation = 'horizontal', variant = 'default' }) {
  const isVertical = orientation === 'vertical';

  return (
    <>
      {/* Desktop stepper */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Stepper
          activeStep={activeStep}
          orientation={isVertical ? 'vertical' : 'horizontal'}
          alternativeLabel={!isVertical}
          sx={{
            ...(variant === 'compact' && { py: 1 }),
            ...(variant === 'default' && { py: 2 }),
            '& .MuiStepConnector-line': {
              borderColor: 'var(--divider, #e5e7eb)',
              borderTopWidth: 2,
              ...(isVertical && { borderLeftWidth: 2, borderTopWidth: 0 }),
            },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
              borderColor: '#10b981',
            },
            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
              borderColor: 'var(--primary, #335ede)',
            },
            ...(isVertical && {
              '& .MuiStepConnector-root': {
                ml: '16px',
              },
            }),
          }}
        >
          {steps.map((step, idx) => (
            <Step key={step.label} completed={idx < activeStep}>
              <StepLabel
                StepIconComponent={(props) => <StepIcon {...props} index={idx} />}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: variant === 'compact' ? '0.8125rem' : '0.9375rem',
                    fontWeight: idx === activeStep ? 700 : 500,
                    color:
                      idx === activeStep
                        ? 'var(--text-primary)'
                        : idx < activeStep
                        ? 'var(--text-secondary)'
                        : 'var(--placeholder, #94a3b8)',
                    mt: isVertical ? 0 : 1,
                    fontFamily: 'var(--font-family)',
                    letterSpacing: '-0.01em',
                    transition: 'all 0.3s',
                  },
                  '& .MuiStepLabel-iconContainer': {
                    pr: isVertical ? 2 : 0,
                  },
                  ...(step.description && {
                    '& .MuiStepLabel-labelContainer': {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    },
                  }),
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: variant === 'compact' ? '0.8125rem' : '0.9375rem',
                      fontWeight: idx === activeStep ? 700 : 500,
                      color:
                        idx === activeStep
                          ? 'var(--text-primary)'
                          : idx < activeStep
                          ? 'var(--text-secondary)'
                          : 'var(--placeholder, #94a3b8)',
                      fontFamily: 'var(--font-family)',
                      letterSpacing: '-0.01em',
                      transition: 'all 0.3s',
                    }}
                  >
                    {step.label}
                  </Typography>
                  {step.description && (
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: idx === activeStep ? 'var(--text-secondary)' : 'var(--placeholder, #94a3b8)',
                        fontFamily: 'var(--font-family)',
                        mt: 0.25,
                        lineHeight: 1.4,
                      }}
                    >
                      {step.description}
                    </Typography>
                  )}
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Mobile compact indicator */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {steps.map((_, idx) => (
            <Box
              key={idx}
              sx={{
                height: 6,
                width: idx === activeStep ? 32 : 6,
                borderRadius: 3,
                bgcolor:
                  idx < activeStep
                    ? '#10b981'
                    : idx === activeStep
                    ? 'var(--primary, #335ede)'
                    : 'var(--divider, #e5e7eb)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </Box>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontFamily: 'var(--font-family)',
          }}
        >
          Step {activeStep + 1} of {steps.length}
        </Typography>
      </Box>
    </>
  );
}
