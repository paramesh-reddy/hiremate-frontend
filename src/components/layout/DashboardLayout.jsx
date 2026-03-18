import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../common/Sidebar';

export default function DashboardLayout() {
  const location = useLocation();
  const profileOnly = location.state?.fromRegister === true;

  // After register: show profile page only (no sidebar)
  if (profileOnly) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'var(--bg-default)' }}>
        <Outlet />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--bg-default)' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          minHeight: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
