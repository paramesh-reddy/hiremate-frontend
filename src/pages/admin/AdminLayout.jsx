import { Box } from '@mui/material';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import Navbar from '../../components/common/Navbar';

const ADMIN_NAV = [
  { label: 'Overview', path: '/admin', icon: DashboardRoundedIcon },
  { label: 'Users', path: '/admin/users', icon: PeopleRoundedIcon },
  { label: 'Companies Viewed', path: '/admin/companies', icon: BusinessRoundedIcon },
  { label: 'Career Page Links', path: '/admin/career-pages', icon: LinkRoundedIcon },
  { label: 'Learning', path: '/admin/learning', icon: SchoolRoundedIcon },
  { label: 'Issues', path: '/admin/issues', icon: BugReportRoundedIcon },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--bg-light)' }}>
      <Navbar />
      <Box
        sx={{
          display: 'flex',
          marginTop: '60px',
          height: 'calc(100vh - 60px)',
          minHeight: 0,
        }}
      >
        {/* Admin Sidebar */}
        <Box
          component="nav"
          sx={{
            width: 240,
            flexShrink: 0,
            bgcolor: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--sidebar-border)',
            boxShadow: 'var(--sidebar-shadow)',
            py: 2,
            px: 1.5,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Brand badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              mb: 2.5,
              pb: 2.5,
              borderBottom: '1px solid var(--divider)',
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AdminPanelSettingsRoundedIcon sx={{ fontSize: 16, color: '#fff' }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                }}
              >
                Admin Panel
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.2,
                }}
              >
                Management console
              </Typography>
            </Box>
          </Box>

          {/* Section label */}
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              px: 2,
              mb: 1,
            }}
          >
            Navigation
          </Typography>

          <List disablePadding sx={{ flex: 1 }}>
            {ADMIN_NAV.map(({ label, path, icon: Icon }) => {
              const isActive =
                path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(path);
              return (
                <ListItemButton
                  key={path}
                  component={NavLink}
                  to={path}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'var(--sidebar-item-active-bg)',
                      color: 'var(--sidebar-item-active-color)',
                      '& .MuiListItemIcon-root': { color: 'var(--sidebar-item-active-color)' },
                      '&:hover': { bgcolor: 'var(--light-blue-bg-08)' },
                    },
                    '&:hover': { bgcolor: 'var(--sidebar-item-hover-bg)' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? 'var(--sidebar-item-active-color)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: 'var(--font-size-helper)',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'var(--bg-light)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
