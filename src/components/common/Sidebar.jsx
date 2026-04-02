import { useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { logout } from '../../store/auth/authSlice';
import { toggleTheme } from '../../store/theme/themeSlice';
import { getProfileCompletion } from '../../pages/profile/utils/profileCompletion';
import SignOutConfirmDialog from './SignOutConfirmDialog';
import logoImg from '../../assets/logo.png';

const MAIN_NAV = [
  { label: 'Dashboard', path: '/', icon: SpaceDashboardRoundedIcon },
  { label: 'Application Tracker', path: '/application-tracker', icon: ViewKanbanRoundedIcon },
  { label: 'AI Resume Studio', path: '/ai-resume-studio', icon: AutoFixHighRoundedIcon, badge: 'AI' },
  { label: 'Interview Practice', path: '/interview-practice', icon: MicRoundedIcon },
];

const ACCOUNT_NAV = [
  { label: 'Profile', path: '/profile', icon: AccountCircleRoundedIcon },
  { label: 'Settings', path: '/settings', icon: TuneRoundedIcon },
];

const ADMIN_NAV = { label: 'Admin', path: '/admin', icon: AdminPanelSettingsRoundedIcon };

const USER_MENU = [
  { label: 'Profile', path: '/profile', icon: AccountCircleRoundedIcon },
  { label: 'Subscription & Billing', path: '/pricing', icon: CreditCardRoundedIcon },
  { label: 'Settings', path: '/settings', icon: TuneRoundedIcon },
  { label: 'Help & Support', path: '/help', icon: HelpOutlineRoundedIcon },
];

// Icon color map for each route (inactive state)
const ICON_COLORS = {
  '/': '#6366f1',
  '/application-tracker': '#0ea5e9',
  '/ai-resume-studio': '#8b5cf6',
  '/interview-practice': '#10b981',
  '/profile': '#f59e0b',
  '/settings': '#64748b',
  '/admin': '#ef4444',
};

function SectionLabel({ children }) {
  return (
    <Typography
      sx={{
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.09em',
        color: 'var(--text-muted)',
        px: 1.5,
        mt: 2.5,
        mb: 0.5,
        textTransform: 'uppercase',
        fontFamily: 'var(--font-family)',
        userSelect: 'none',
      }}
    >
      {children}
    </Typography>
  );
}

function NavItem({ label, path, icon: Icon, location, badge, incomplete }) {
  const exact = path === '/';
  const isActive = exact ? location.pathname === '/' : location.pathname.startsWith(path);
  const iconColor = ICON_COLORS[path] || 'var(--primary)';

  return (
    <Box
      component={NavLink}
      to={path}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1,
        py: 0.875,
        borderRadius: '10px',
        mb: 0.375,
        textDecoration: 'none',
        position: 'relative',
        color: isActive ? iconColor : 'var(--text-secondary)',
        bgcolor: isActive ? `${iconColor}14` : 'transparent',
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: isActive ? `${iconColor}1a` : 'rgba(0,0,0,0.035)',
          color: isActive ? iconColor : 'var(--text-primary)',
        },
      }}
    >
      {/* Icon container */}
      <Box
        sx={{
          width: 33,
          height: 33,
          borderRadius: '9px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: isActive ? `${iconColor}1f` : 'rgba(0,0,0,0.03)',
          border: isActive ? `1px solid ${iconColor}28` : '1px solid transparent',
          transition: 'all 0.15s ease',
        }}
      >
        <Icon
          sx={{
            fontSize: 17,
            color: isActive ? iconColor : 'var(--text-muted)',
            transition: 'color 0.15s',
          }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: '0.875rem',
          fontWeight: isActive ? 600 : 500,
          fontFamily: 'var(--font-family)',
          color: 'inherit',
          lineHeight: 1,
          userSelect: 'none',
          flex: 1,
        }}
      >
        {label}
      </Typography>

      {badge && (
        <Box
          sx={{
            px: 0.75,
            py: 0.2,
            borderRadius: '5px',
            bgcolor: isActive ? `${iconColor}22` : 'rgba(139,92,246,0.1)',
            color: isActive ? iconColor : '#8b5cf6',
            fontSize: '0.6rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-family)',
          }}
        >
          {badge}
        </Box>
      )}

      {incomplete && !isActive && (
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: '#f59e0b',
            flexShrink: 0,
            boxShadow: '0 0 0 2px rgba(245,158,11,0.2)',
          }}
        />
      )}
    </Box>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);
  const isAdmin = useSelector((state) => state.auth?.user?.is_admin) === true;
  const user = useSelector((state) => state.auth.user);
  const profileForm = useSelector((state) => state.profile?.form);
  const { percent: profilePercent } = getProfileCompletion(profileForm);
  const profileIncomplete = profileForm != null && profilePercent < 100;

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : '';
  const displayEmail = user?.email || '';
  const avatarLetter = (user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase();

  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const userMenuOpen = Boolean(userMenuAnchor);

  const confirmSignOut = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Box
      component="nav"
      sx={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        height: '100vh',
        bgcolor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* ── Logo ── */}
      <Box
        sx={{
          px: 2.5,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <Box
          component="img"
          src={logoImg}
          alt="OpsBrain"
          sx={{ height: 32, objectFit: 'contain' }}
        />
      </Box>

      {/* ── Scrollable Nav ── */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.25, pb: 2 }}>
        <SectionLabel>Workspace</SectionLabel>
        {MAIN_NAV.map((item) => (
          <NavItem key={item.path} {...item} location={location} />
        ))}

        <SectionLabel>Account</SectionLabel>
        {ACCOUNT_NAV.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            location={location}
            incomplete={item.path === '/profile' ? profileIncomplete : undefined}
          />
        ))}
        {isAdmin && <NavItem {...ADMIN_NAV} location={location} />}

        {/* Report an Issue */}
        {(() => {
          const isActive = location.pathname === '/report-issue';
          const activeColor = '#f59e0b';
          return (
            <Box
              onClick={() => navigate('/report-issue')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                px: 1,
                py: 0.875,
                borderRadius: '10px',
                mt: 0.375,
                cursor: 'pointer',
                color: isActive ? activeColor : 'var(--text-secondary)',
                bgcolor: isActive ? `${activeColor}14` : 'transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isActive ? `${activeColor}1a` : 'rgba(245,158,11,0.07)',
                  color: activeColor,
                  '& .report-icon-wrap': { bgcolor: `${activeColor}1f`, borderColor: `${activeColor}28` },
                  '& .report-icon': { color: activeColor },
                },
              }}
            >
              <Box
                className="report-icon-wrap"
                sx={{
                  width: 33,
                  height: 33,
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: isActive ? `${activeColor}1f` : 'rgba(0,0,0,0.03)',
                  border: isActive ? `1px solid ${activeColor}28` : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <BugReportRoundedIcon
                  className="report-icon"
                  sx={{ fontSize: 17, color: isActive ? activeColor : 'var(--text-muted)', transition: 'color 0.15s' }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'var(--font-family)',
                  color: 'inherit',
                  userSelect: 'none',
                }}
              >
                Report an Issue
              </Typography>
            </Box>
          );
        })()}

        {/* Sign Out */}
        <Box
          onClick={() => setSignOutDialogOpen(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 1,
            py: 0.875,
            borderRadius: '10px',
            mt: 0.375,
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: 'rgba(220,38,38,0.07)',
              color: '#dc2626',
              '& .logout-icon-wrap': { bgcolor: 'rgba(220,38,38,0.12)', borderColor: 'rgba(220,38,38,0.2)' },
              '& .logout-icon': { color: '#dc2626' },
            },
          }}
        >
          <Box
            className="logout-icon-wrap"
            sx={{
              width: 33,
              height: 33,
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: 'rgba(0,0,0,0.03)',
              border: '1px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <LogoutRoundedIcon
              className="logout-icon"
              sx={{ fontSize: 17, color: 'var(--text-muted)', transition: 'color 0.15s' }}
            />
          </Box>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              fontFamily: 'var(--font-family)',
              color: 'inherit',
              userSelect: 'none',
            }}
          >
            Sign Out
          </Typography>
        </Box>
      </Box>

      {/* ── Bottom Fixed Section ── */}
      <Box
        sx={{
          flexShrink: 0,
          px: 1.25,
          pb: 1.5,
          pt: 1,
          borderTop: '1px solid var(--border-color)',
        }}
      >
        {/* Theme toggle */}
        <Box
          onClick={() => dispatch(toggleTheme())}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.25,
            py: 0.875,
            borderRadius: '10px',
            mb: 1,
            cursor: 'pointer',
            bgcolor: darkMode ? 'rgba(99,102,241,0.06)' : 'rgba(0,0,0,0.02)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.15s',
            '&:hover': {
              bgcolor: darkMode ? 'rgba(99,102,241,0.1)' : 'rgba(0,0,0,0.045)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {darkMode ? (
              <DarkModeRoundedIcon sx={{ fontSize: 15, color: '#818cf8' }} />
            ) : (
              <WbSunnyRoundedIcon sx={{ fontSize: 15, color: '#f59e0b' }} />
            )}
            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)',
              }}
            >
              {darkMode ? 'Dark mode' : 'Light mode'}
            </Typography>
          </Box>
          {/* Toggle pill */}
          <Box
            sx={{
              width: 34,
              height: 19,
              borderRadius: 10,
              bgcolor: darkMode ? '#6366f1' : '#d1d5db',
              position: 'relative',
              transition: 'background 0.25s',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 2.5,
                left: darkMode ? 17 : 2.5,
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: 'white',
                transition: 'left 0.25s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}
            />
          </Box>
        </Box>

        {/* Chrome Extension CTA */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(99,102,241,0.18)',
            mb: 1.25,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -12,
              right: -12,
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'rgba(99,102,241,0.07)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.625 }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '6px',
                bgcolor: 'rgba(37,99,235,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ExtensionRoundedIcon sx={{ fontSize: 13, color: 'var(--primary)' }} />
            </Box>
            <Typography
              sx={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--primary)',
                fontFamily: 'var(--font-family)',
              }}
            >
              Chrome Extension
            </Typography>
            <Box
              sx={{
                ml: 'auto',
                px: 0.625,
                py: 0.1,
                borderRadius: '4px',
                bgcolor: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                fontSize: '0.6rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-family)',
              }}
            >
              FREE
            </Box>
          </Box>
          <Typography
            sx={{
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)',
              mb: 1,
              lineHeight: 1.45,
            }}
          >
            Apply to jobs faster with one click.
          </Typography>
          <Box
            component="button"
            sx={{
              width: '100%',
              py: 0.75,
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              color: 'white',
              fontSize: '0.775rem',
              fontWeight: 700,
              fontFamily: 'var(--font-family)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              transition: 'all 0.15s',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
                boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'translateY(0)' },
            }}
          >
            <BoltRoundedIcon sx={{ fontSize: 14 }} />
            Install Free
          </Box>
        </Box>

        {/* User profile card */}
        <Box
          onClick={(e) => setUserMenuAnchor(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 0.875,
            borderRadius: '10px',
            cursor: 'pointer',
            border: '1px solid var(--border-color)',
            bgcolor: 'var(--bg-paper)',
            transition: 'all 0.15s',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.03)',
              borderColor: 'rgba(0,0,0,0.1)',
            },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              fontSize: '0.875rem',
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
            }}
          >
            {avatarLetter}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 1.3,
              }}
            >
              {displayName || 'User'}
            </Typography>
            <Typography
              noWrap
              sx={{
                fontSize: '0.69rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-family)',
                lineHeight: 1.3,
              }}
            >
              {displayEmail}
            </Typography>
          </Box>
          <KeyboardArrowDownRoundedIcon
            sx={{
              fontSize: 16,
              color: 'var(--text-muted)',
              flexShrink: 0,
              transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}
          />
        </Box>
      </Box>

      {/* ── User dropdown menu ── */}
      <Menu
        anchorEl={userMenuAnchor}
        open={userMenuOpen}
        onClose={() => setUserMenuAnchor(null)}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        slotProps={{
          paper: {
            sx: {
              mb: 1,
              minWidth: 230,
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* User info header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(124,58,237,0.05) 100%)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                fontSize: '0.875rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
              }}
            >
              {avatarLetter}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--text-primary)',
                }}
              >
                {displayName || 'User'}
              </Typography>
              <Typography
                noWrap
                sx={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                {displayEmail}
              </Typography>
            </Box>
          </Box>
        </Box>

        {USER_MENU.map(({ label, path, icon: Icon }) => (
          <MenuItem
            key={path}
            onClick={() => { setUserMenuAnchor(null); navigate(path); }}
            sx={{
              fontSize: '0.875rem',
              fontFamily: 'var(--font-family)',
              py: 1,
              px: 2,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Icon sx={{ fontSize: 17, color: 'var(--text-secondary)' }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ primary: { sx: { fontSize: '0.875rem', fontFamily: 'var(--font-family)', fontWeight: 500 } } }}
            >
              {label}
            </ListItemText>
          </MenuItem>
        ))}

        <Divider sx={{ borderColor: 'var(--border-color)', my: 0.5 }} />

        <MenuItem
          onClick={() => { setUserMenuAnchor(null); setSignOutDialogOpen(true); }}
          sx={{
            py: 1,
            px: 2,
            '&:hover': { bgcolor: 'rgba(220,38,38,0.05)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <LogoutRoundedIcon sx={{ fontSize: 17, color: '#dc2626' }} />
          </ListItemIcon>
          <ListItemText
            slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-family)', color: '#dc2626' } } }}
          >
            Sign Out
          </ListItemText>
        </MenuItem>
      </Menu>

      <SignOutConfirmDialog
        open={signOutDialogOpen}
        onClose={() => setSignOutDialogOpen(false)}
        onConfirm={confirmSignOut}
      />
    </Box>
  );
}
