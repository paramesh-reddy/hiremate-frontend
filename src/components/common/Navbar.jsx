import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { logout } from '../../store/auth/authSlice';
import SignOutConfirmDialog from './SignOutConfirmDialog';
import logoImg from '../../assets/logo.png';

const menuItems = [
  { label: 'Profile', path: '/profile', icon: PersonRoundedIcon },
  { label: 'Subscription & Billing', path: '/pricing', icon: CreditCardRoundedIcon },
  { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
  { label: 'Help & Support', path: '/help', icon: HelpOutlineRoundedIcon },
];

export default function Navbar({ showProfile = true }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : '';
  const displayEmail = user?.email || '';
  const avatarLetter = (user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    handleMenuClose();
    navigate(path);
  };

  const openSignOutDialog = () => {
    handleMenuClose();
    setSignOutDialogOpen(true);
  };

  const closeSignOutDialog = () => setSignOutDialogOpen(false);

  const confirmSignOut = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: '60px',
        bgcolor: 'var(--navbar-bg)',
        color: 'var(--text-primary)',
        boxShadow: '0 1px 0 0 var(--border-color)',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: '60px !important',
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src={logoImg}
            alt="OpsBrain"
            sx={{ height: 36, objectFit: 'contain' }}
          />
        </Box>
        {showProfile && (
          <>
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                py: 0.5,
                px: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'var(--sidebar-item-hover-bg)' },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#f97316',
                  fontSize: '0.95rem',
                }}
              >
                {avatarLetter}
              </Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: 'var(--text-primary)',
                  }}
                >
                  {displayName || 'User'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary, #64748b)',
                    lineHeight: 1.2,
                  }}
                >
                  {displayEmail}
                </Typography>
              </Box>
              <KeyboardArrowDownRoundedIcon
                sx={{
                  fontSize: 20,
                  color: 'var(--text-secondary, #64748b)',
                  transform: open ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}
              />
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    minWidth: 240,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    borderRadius: 2,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  {displayName || 'User'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary, #64748b)',
                    mt: 0.25,
                  }}
                >
                  {displayEmail}
                </Typography>
              </Box>
              <Divider />
              {menuItems.map(({ label, path, icon: Icon }) => (
                <MenuItem key={path} onClick={() => handleMenuItemClick(path)}>
                  <ListItemIcon>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </MenuItem>
              ))}
              <Divider />
              <MenuItem onClick={openSignOutDialog}>
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Sign Out"
                  primaryTypographyProps={{ sx: { color: 'error.main', fontWeight: 600 } }}
                />
              </MenuItem>
            </Menu>
            <SignOutConfirmDialog
              open={signOutDialogOpen}
              onClose={closeSignOutDialog}
              onConfirm={confirmSignOut}
            />
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
