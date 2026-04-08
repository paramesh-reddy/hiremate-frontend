import { useState } from 'react';
import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { RESUME_STUDIO_THEME as THEME } from '../../utilities/resumeStudioTheme';

const PAGE_SIZE = 10;

const cellSx = {
  fontSize: '0.875rem',
  color: THEME.textPrimary,
  borderColor: THEME.border,
};

const headCellSx = {
  ...cellSx,
  fontWeight: 600,
  fontSize: '0.6875rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: THEME.textSecondary,
};

function LinkCell({ href, label }) {
  if (!href) {
    return (
      <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary }}>—</Typography>
    );
  }
  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        color: THEME.primary,
        textDecoration: 'none',
        fontSize: '0.8125rem',
        fontWeight: 600,
        '&:hover': { textDecoration: 'underline', color: THEME.primaryDark },
      }}
    >
      {label}
      <OpenInNewRoundedIcon sx={{ fontSize: 13 }} />
    </Box>
  );
}

export default function CompanyLinksTable({ rows = [], loading = false }) {
  const [page, setPage] = useState(0);

  const visible = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={44} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  if (rows.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <TableContainer
        sx={{
          border: `1px solid ${THEME.border}`,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  bgcolor: THEME.previewCanvas,
                  borderBottom: `1px solid ${THEME.border}`,
                  py: 1.25,
                },
              }}
            >
              <TableCell sx={headCellSx}>Company</TableCell>
              <TableCell sx={headCellSx}>Careers (scraped)</TableCell>
              <TableCell sx={headCellSx}>LinkedIn (manual)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((row, idx) => (
              <TableRow
                key={idx}
                sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' }, '&:last-child td': { border: 0 } }}
              >
                <TableCell sx={cellSx}>{row.name}</TableCell>
                <TableCell sx={cellSx}>
                  <LinkCell href={row.career_url} label="Open careers" />
                </TableCell>
                <TableCell sx={cellSx}>
                  <LinkCell href={row.linkedin_search_url} label="Search & apply" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > PAGE_SIZE && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          sx={{ color: THEME.textSecondary, '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
        />
      )}
    </Box>
  );
}
