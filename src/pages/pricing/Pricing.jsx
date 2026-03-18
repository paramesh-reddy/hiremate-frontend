import { useState } from 'react';
import { Box, Typography, Button, Card, Grid, Alert, CircularProgress } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import { createOrderAPI, verifyPaymentAPI } from '../../services';

const PLANS = [
  {
    id: 'daily',
    title: 'Daily',
    description: "You've spent more by accident.",
    price: '99',
    period: 'day',
    highlight: false,
  },
  {
    id: 'weekly',
    title: 'Weekly',
    description: 'A night out or an interview, your call.',
    price: '399',
    period: 'week',
    highlight: true,
    badge: 'BEST DEAL',
  },
  {
    id: 'monthly',
    title: 'Monthly',
    description: "It's cheaper than skipping it, we've done the math.",
    price: '999',
    period: 'month',
    highlight: false,
  },
];

const FEATURES = [
  'Unlimited resume generation',
  'AI-powered auto-fill',
  'Smart role recommendations',
  'Unlimited resume storage',
  'Application tracker',
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
};

export default function Pricing() {
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubscribe = async (plan) => {
    setError(null);
    setSuccess(null);
    setLoadingPlanId(plan.id);

    try {
      const { data: orderData } = await createOrderAPI(plan.id);

      await loadRazorpayScript();
      if (window.Razorpay === undefined) {
        throw new Error('Payment gateway failed to load. Please try again.');
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'OpsBrain',
        description: `${plan.title} Plan - Brain for Jobs`,
        handler: async (response) => {
          try {
            await verifyPaymentAPI({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: plan.id,
            });
            setSuccess(`Successfully subscribed to ${plan.title} plan!`);
          } catch (err) {
            setError(err.response?.data?.detail || 'Payment verification failed');
          } finally {
            setLoadingPlanId(null);
          }
        },
        modal: {
          ondismiss: () => setLoadingPlanId(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to initiate payment';
      setError(msg);
      if (err.response?.status === 401) {
        navigate('/login', { state: { from: '/pricing' } });
      }
      setLoadingPlanId(null);
    }
  };

  return (
    <PageContainer maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Box sx={{ textAlign: 'center' }}>
        {/* Mission badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 2,
            py: 0.75,
            borderRadius: '9999px',
            bgcolor: 'var(--pricing-accent)',
            color: 'var(--white)',
            fontSize: 'var(--font-size-helper)',
            fontWeight: 600,
            mb: 3,
          }}
        >
          <CheckRoundedIcon sx={{ fontSize: 18 }} />
          On a mission to solve unemployment
        </Box>

        {/* Heading */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            fontWeight: 700,
            color: 'var(--text-primary)',
            mb: 1,
            '& span': { color: 'var(--pricing-accent)' },
          }}
        >
          Get Hired <span>2.6x</span> Faster.
        </Typography>
        <Typography
          sx={{
            fontSize: 'var(--font-size-body)',
            color: 'var(--text-secondary)',
            mb: 5,
            maxWidth: 480,
            mx: 'auto',
          }}
        >
          91% of our users report getting an interview within 2 weeks of subscribing
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Pricing cards */}
        <Box
          sx={{
            width: { xs: '100%', sm: '80%' },
            maxWidth: 1200,
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 5,
          }}
        >
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              sx={{
                position: 'relative',
                borderRadius: 'var(--pricing-card-radius)',
                boxShadow: 'var(--pricing-card-shadow)',
                border: 2,
                borderColor: plan.highlight ? 'var(--pricing-accent)' : 'var(--pricing-card-border)',
                overflow: 'visible',
              }}
            >
              {plan.badge && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: 12,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'var(--pricing-badge-bg)',
                    color: 'var(--white)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  {plan.badge}
                </Box>
              )}
              <Grid container sx={{ p: 3, pt: plan.badge ? 4 : 3 }}>
                <Grid item xs={12}>
                <Typography
                  sx={{
                    fontSize: 'var(--font-size-section-header)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    mb: 1,
                  }}
                >
                  {plan.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 'var(--font-size-helper)',
                    color: 'var(--text-secondary)',
                    mb: 2,
                  }}
                >
                  {plan.description}
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography component="span" sx={{ fontSize: 'var(--font-size-helper)', color: 'var(--text-secondary)' }}>
                    INR{' '}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {plan.price}
                  </Typography>
                  <Typography component="span" sx={{ fontSize: 'var(--font-size-helper)', color: 'var(--text-muted)' }}>
                    /{plan.period}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant={plan.highlight ? 'contained' : 'outlined'}
                  disabled={!!loadingPlanId}
                  onClick={() => handleSubscribe(plan)}
                  sx={{
                    py: 1.25,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 'var(--font-size-helper)',
                    borderRadius: 'var(--pricing-card-radius)',
                    ...(plan.highlight
                      ? {
                          bgcolor: 'var(--pricing-accent)',
                          color: 'var(--white)',
                          '&:hover': { bgcolor: 'var(--pricing-accent-dark)' },
                        }
                      : {
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)',
                          '&:hover': {
                            borderColor: 'var(--pricing-accent)',
                            bgcolor: 'var(--sidebar-item-hover-bg)',
                          },
                        }),
                  }}
                >
                  {loadingPlanId === plan.id ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
                </Grid>
              </Grid>
            </Card>
          ))}
        </Box>

        {/* Features */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: 2 }}>
          <LockRoundedIcon sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
          <Typography sx={{ fontSize: 'var(--font-size-helper)', color: 'var(--text-secondary)' }}>
            Every plan unlocks everything
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
            mb: 4,
          }}
        >
          {FEATURES.map((feature) => (
            <Box
              key={feature}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '9999px',
                bgcolor: 'var(--pricing-accent)',
                color: 'var(--white)',
                fontSize: 'var(--font-size-helper)',
                fontWeight: 500,
              }}
            >
              <CheckRoundedIcon sx={{ fontSize: 16 }} />
              {feature}
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            mb: 2,
          }}
        >
          Cancel anytime • No hidden fees • Instant access
        </Typography>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-helper)',
            fontWeight: 600,
            textDecoration: 'none',
            '&:hover': { color: 'var(--primary)' },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          Back to Dashboard
        </Box>
      </Box>
    </PageContainer>
  );
}
