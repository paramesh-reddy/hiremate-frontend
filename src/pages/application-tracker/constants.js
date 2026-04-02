import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DoneAllIcon from '@mui/icons-material/DoneAll';

// Use a consistent set of MUI icons (20px) for a cohesive look.
export const STATUSES = [
  { id: 'saved', label: 'Saved', icon: WorkOutlineIcon, color: 'var(--primary)', bgTint: 'var(--light-blue-bg-08)' },
  { id: 'applied', label: 'Applied', icon: CheckCircleOutlineIcon, color: 'var(--primary)', bgTint: 'var(--light-blue-bg-08)' },
  { id: 'interview', label: 'Interview', icon: ScheduleIcon, color: 'var(--primary)', bgTint: 'var(--light-blue-bg-08)' },
  { id: 'closed', label: 'Closed', icon: DoneAllIcon, color: 'var(--primary)', bgTint: 'var(--light-blue-bg-08)' },
];

export const PRIORITIES = [
  { id: 'low', label: 'Low', color: 'var(--text-muted)' },
  { id: 'medium', label: 'Medium', color: 'var(--warning)' },
  { id: 'high', label: 'High', color: 'var(--error)' },
];

export function normalizeStatus(raw) {
  if (!raw) return 'saved';
  const s = String(raw).toLowerCase();
  const map = {
    'i have not yet applied': 'saved',
    'not yet applied': 'saved',
    applied: 'applied',
    interviewing: 'interview',
    offer: 'closed',
    rejected: 'closed',
    withdrawn: 'closed',
  };
  return map[s] || (['saved', 'applied', 'interview', 'closed'].includes(s) ? s : 'saved');
}
