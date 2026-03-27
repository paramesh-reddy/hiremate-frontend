import './style.scss';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Alert } from '@mui/material';
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/inputs/CustomInput';
import { register as registerUser, clearError } from '../../store/auth/authSlice';

const REQUIRED_MSG = 'Required.';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const errors = {
    firstName: touched.firstName && !firstName.trim() ? REQUIRED_MSG : '',
    lastName: touched.lastName && !lastName.trim() ? REQUIRED_MSG : '',
    email: touched.email && !email.trim() ? REQUIRED_MSG : '',
    password: touched.password && !password.trim() ? REQUIRED_MSG : '',
  };
  const showErrors =
    touched.firstName || touched.lastName || touched.email || touched.password;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
    });
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    )
      return;
    dispatch(
      registerUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
      })
    );
  };

  return (
    <Box className="auth-page">
      <Typography variant="h4" fontWeight={700} color="text.primary">
        Sign up for an account
      </Typography>

      <Box component="form" noValidate onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}
        <Box className="auth-page__row">
          <CustomInput
            label="First Name"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
            error={showErrors && !!errors.firstName}
            helperText={showErrors ? errors.firstName : ''}
          />
          <CustomInput
            label="Last Name"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
            error={showErrors && !!errors.lastName}
            helperText={showErrors ? errors.lastName : ''}
          />
        </Box>
        <CustomInput
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={showErrors && !!errors.email}
          helperText={showErrors ? errors.email : ''}
        />
        <CustomInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={showErrors && !!errors.password}
          helperText={showErrors ? errors.password : ''}
        />
        <Typography className="auth-page__terms">
          By signing up you agree to our{' '}
          <Typography component="a" href="#">
            Terms and Conditions
          </Typography>
          {' '}and{' '}
          <Typography component="a" href="#">
            Privacy Policy
          </Typography>
          .
        </Typography>
        <CustomButton fullWidth type="submit" sx={{ py: 1.5 }} disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </CustomButton>
      </Box>

      <Typography className="auth-page__footer">
        Already have an account?{' '}
        <Typography component={Link} to="/login">
          Log in
        </Typography>
      </Typography>
    </Box>
  );
}
