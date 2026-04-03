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

const PAGE_SIZE = 10;

const cellSx = {
  fontFamily: 'var(--font-family)',
  fontSize: '0.875rem',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-color)',
};

const headCellSx = {
  ...cellSx,
  fontWeight: 700,
  color: 'var(--text-secondary)',
  fontSize: '0.8125rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

function LinkCell({ href, label }) {
  if (!href) {
    return (
      <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>
        —
      </Typography>
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
        color: '#4f46e5',
        textDecoration: 'none',
        fontSize: '0.8125rem',
        fontFamily: 'var(--font-family)',
        '&:hover': { textDecoration: 'underline' },
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
          border: '1px solid var(--border-color)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
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
          sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-secondary)' }}
        />
      )}
    </Box>
  );
}
