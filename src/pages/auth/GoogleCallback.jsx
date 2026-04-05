import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginWithGoogle } from '../../store/auth/authSlice';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          first_name: payload.first_name || payload.name?.split(' ')[0] || '',
          last_name: payload.last_name || payload.name?.split(' ').slice(1).join(' ') || '',
          gmail_sync_enabled: !!payload.gmail_sync_enabled,
          is_admin: !!payload.is_admin,
        };
        dispatch(loginWithGoogle({ token, user }));
        navigate('/', { replace: true });
      } catch {
        navigate('/login?error=invalid_token', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [dispatch, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Signing you in...</p>
    </div>
  );
}
