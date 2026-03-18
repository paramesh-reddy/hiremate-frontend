import { memo, useState } from 'react';
import { Card, Grid, Typography, Box, Link, IconButton, Menu, MenuItem } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { useDraggable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.25, ease: 'easeOut' },
  }),
};

function JobCard({ job, isDragging, onEdit, onDelete, index = 0 }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [hovered, setHovered] = useState(false);

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `job-${job.id}`,
    data: { job },
  });

  const appliedDate = job.created_at
    ? format(new Date(job.created_at), 'MMM d, yyyy')
    : null;

  const handleMenuClose = () => setAnchorEl(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit?.(job);
    }
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      layout
      style={{ width: '100%' }}
    >
      <Card
        ref={setNodeRef}
        variant="outlined"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          borderRadius: '14px',
          borderColor: 'transparent',
          bgcolor: 'var(--white)',
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: isDragging ? 0.6 : 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transform: 'translateY(0)',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
          },
          '&:focus-visible': {
            outline: '3px solid rgba(37,99,235,0.12)',
            outlineOffset: 2,
          },
        }}
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        aria-label={`${job.position_title || 'Untitled'} at ${job.company || 'Unknown company'}. ${job.location ? `Location: ${job.location}.` : ''} ${appliedDate ? `Applied ${appliedDate}.` : ''} Press Enter to edit, or drag to move.`}
        aria-pressed={false}
        aria-grabbed={isDragging}
        onKeyDown={handleKeyDown}
      >
        <Grid container sx={{ p: 2 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'var(--light-blue-bg-08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden
            >
              <Typography variant="caption" fontWeight={700} color="var(--primary)" sx={{ fontSize: 14 }}>
                {(job.company || '?')[0].toUpperCase()}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {job.position_title || 'Untitled'}
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mt: 0.5 }}>
                {job.company || '—'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                {appliedDate && <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>{appliedDate}</Typography>}
                <Box
                  sx={{
                    ml: 'auto',
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 999,
                    bgcolor: 'var(--grey-5)',
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {job.application_status || 'saved'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              {job.job_posting_url && (
                <IconButton
                  size="small"
                  component="a"
                  href={job.job_posting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Open ${job.position_title || 'job'} at ${job.company || 'company'} in new tab`}
                  sx={{ color: 'var(--text-muted)', p: 0.5 }}
                >
                  <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              {(hovered || anchorEl) && (
                <>
                  <IconButton
                    size="small"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnchorEl(e.currentTarget);
                    }}
                    aria-label="Open job card menu"
                    aria-haspopup="menu"
                    aria-expanded={Boolean(anchorEl)}
                    aria-controls={anchorEl ? `job-menu-${job.id}` : undefined}
                    sx={{ color: 'var(--text-muted)', p: 0.5 }}
                  >
                    <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Menu
                    id={`job-menu-${job.id}`}
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ sx: { borderRadius: 2, mt: 1.5, minWidth: 140 } }}
                    role="menu"
                    aria-label="Job card actions"
                  >
                    <MenuItem
                      onClick={() => {
                        onEdit?.(job);
                        handleMenuClose();
                      }}
                      role="menuitem"
                    >
                      <EditRoundedIcon sx={{ fontSize: 18, mr: 1 }} />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        onDelete?.(job);
                        handleMenuClose();
                      }}
                      sx={{ color: 'var(--error)' }}
                      role="menuitem"
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 18, mr: 1 }} />
                      Delete
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>
          </Grid>
        </Grid>
      </Card>
    </motion.div>
  );
}

export default memo(JobCard);
