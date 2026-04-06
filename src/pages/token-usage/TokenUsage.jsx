import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import PageContainer from '../../components/common/PageContainer';

const usageRows = [
  { date: 'Apr 3, 02:20 PM', type: 'Included', model: 'composer-2', tokens: '352.2K', cost: 'Included' },
  { date: 'Apr 3, 02:16 PM', type: 'Included', model: 'composer-2', tokens: '1.1M', cost: 'Included' },
  { date: 'Apr 3, 02:08 PM', type: 'Included', model: 'composer-2', tokens: '337.2K', cost: 'Included' },
  { date: 'Apr 3, 02:08 PM', type: 'Included', model: 'composer-2', tokens: '14.2K', cost: 'Included' },
  { date: 'Apr 3, 01:51 PM', type: 'Included', model: 'composer-2', tokens: '2.2M', cost: 'Included' },
  { date: 'Apr 3, 01:30 PM', type: 'Included', model: 'composer-2', tokens: '176.2K', cost: 'Included' },
  { date: 'Apr 3, 01:27 PM', type: 'Included', model: 'composer-2', tokens: '806.9K', cost: 'Included' },
  { date: 'Apr 3, 01:25 PM', type: 'Included', model: 'composer-2', tokens: '357.9K', cost: 'Included' },
  { date: 'Apr 3, 01:16 PM', type: 'Included', model: 'composer-2', tokens: '1.2M', cost: 'Included' },
  { date: 'Apr 3, 01:06 PM', type: 'Included', model: 'auto', tokens: '1.5M', cost: 'Included' },
  { date: 'Apr 3, 01:01 PM', type: 'Included', model: 'auto', tokens: '1.7M', cost: 'Included' },
  { date: 'Apr 3, 12:44 PM', type: 'Included', model: 'auto', tokens: '307.4K', cost: 'Included' },
];

export default function TokenUsage() {
  return (
    <PageContainer
      maxWidth="1280px"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        /* Fill viewport minus vertical padding so the card reaches the bottom */
        minHeight: { xs: 'calc(100dvh - 32px)', sm: 'calc(100dvh - 48px)' },
        py: { xs: 2, sm: 3 },
        px: { xs: 1.5, sm: 2.5, md: 3.5 },
      }}
    >
      <Card
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
          border: 1,
          borderColor: 'var(--border-color)',
          overflow: 'hidden',
          bgcolor: 'var(--bg-paper)',
        }}
      >
        <TableContainer
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    bgcolor: 'var(--bg-paper)',
                    py: 1.5,
                    borderBottom: '1px solid var(--border-color)',
                    width: '28%',
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    bgcolor: 'var(--bg-paper)',
                    py: 1.5,
                    borderBottom: '1px solid var(--border-color)',
                    width: '14%',
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    bgcolor: 'var(--bg-paper)',
                    py: 1.5,
                    borderBottom: '1px solid var(--border-color)',
                    width: '24%',
                  }}
                >
                  Model
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    bgcolor: 'var(--bg-paper)',
                    py: 1.5,
                    borderBottom: '1px solid var(--border-color)',
                    width: '18%',
                  }}
                >
                  Tokens
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    bgcolor: 'var(--bg-paper)',
                    py: 1.5,
                    borderBottom: '1px solid var(--border-color)',
                    width: '16%',
                  }}
                >
                  Cost
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usageRows.map((row, index) => (
                <TableRow
                  key={`${row.date}-${row.model}-${index}`}
                  sx={{
                    '&:last-child td, &:last-child th': { borderBottom: 0 },
                    '& td': { borderColor: 'var(--border-color)' },
                    '&:hover': { bgcolor: 'rgba(99,102,241,0.04)' },
                  }}
                >
                  <TableCell sx={{ color: 'var(--text-primary)', py: 1.4, fontWeight: 500 }}>{row.date}</TableCell>
                  <TableCell sx={{ color: 'var(--text-primary)', py: 1.4 }}>{row.type}</TableCell>
                  <TableCell sx={{ color: 'var(--text-primary)', py: 1.4 }}>{row.model}</TableCell>
                  <TableCell align="right" sx={{ color: 'var(--text-primary)', py: 1.4, fontWeight: 500 }}>
                    {row.tokens}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'var(--text-primary)', py: 1.4, fontWeight: 500 }}>
                    {row.cost}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </PageContainer>
  );
}
