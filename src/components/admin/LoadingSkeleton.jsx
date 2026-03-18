import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const shimmerSx = {
  borderRadius: 2,
  background:
    'linear-gradient(90deg, rgba(15, 23, 42, 0.03) 0%, rgba(15, 23, 42, 0.06) 40%, rgba(15, 23, 42, 0.03) 80%)',
  backgroundSize: '240% 100%',
  animation: 'shimmer 1.25s ease-in-out infinite',
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '120% 0' },
    '100%': { backgroundPosition: '-120% 0' },
  },
};

export function SkeletonBox({ height = 200, sx = {} }) {
  return (
    <Box
      sx={{
        height: typeof height === 'number' ? height : 200,
        ...shimmerSx,
        ...sx,
      }}
    />
  );
}

export function TableRowsSkeleton({ rows = 5, cols = 5 }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <TableRow key={i}>
          {[...Array(cols)].map((_, j) => (
            <TableCell key={j}>
              <Skeleton variant="text" width={j === 0 ? '80%' : 60} height={24} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default function LoadingSkeleton({ variant = 'box', rows, cols }) {
  if (variant === 'table') {
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            {[...Array(cols || 5)].map((_, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" width={80} height={20} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRowsSkeleton rows={rows || 5} cols={cols || 5} />
        </TableBody>
      </Table>
    );
  }
  return <SkeletonBox height={200} />;
}
