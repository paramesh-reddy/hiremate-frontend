import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Backdrop,
  Tabs,
  Tab,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FitScreenRoundedIcon from '@mui/icons-material/FitScreenRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PageContainer from '../../components/common/PageContainer';
import CustomInput from '../../components/inputs/CustomInput';
import CustomSelect from '../../components/inputs/CustomSelect';
import SectionCard from '../../components/admin/SectionCard';
import ResumeHtmlPreview from './ResumeHtmlPreview';
import JobDescriptionInput from './JobDescriptionInput';
import { getResumeWorkspaceAPI, generateResumeAPI, previewResumeAPI, updateResumeAPI, deleteResumeAPI, uploadResumeAPI, getProfileDataAPI, saveResumeSnapshotAPI, analyzeKeywordsAPI, getJobAPI } from '../../services';
// previewResumeHtmlAPI is used inside ResumeHtmlPreview directly
import { BASE_URL } from '../../utilities/const';

const BACKEND_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');
const getResumeFullUrl = (url) =>
  url && (url.startsWith('http://') || url.startsWith('https://')) ? url : `${BACKEND_ORIGIN}${url || ''}`;

const HERO_GRADIENT =
  'linear-gradient(90deg, rgba(51, 94, 222, 1) 0%, rgba(39, 39, 125, 1) 35%, rgba(54, 94, 214, 1) 100%)';

const RESUME_GEN_STORAGE_KEY = 'resumeGeneratorView';
const RESUME_GEN_SELECTED_KEY = 'resumeGeneratorSelectedId';
const RESUME_GEN_PANEL_WIDTH_KEY = 'resumeGeneratorLeftPanelWidth';
const RESUME_GEN_LAST_TAILOR_JOB_KEY = 'resumeGeneratorLastTailorJobId';

const getStoredView = () => {
  if (typeof window === 'undefined') return 'inputs';
  try {
    return localStorage.getItem(RESUME_GEN_STORAGE_KEY) || 'inputs';
  } catch {
    return 'inputs';
  }
};

const setStoredView = (showInputs) => {
  try {
    localStorage.setItem(RESUME_GEN_STORAGE_KEY, showInputs ? 'inputs' : 'preview');
  } catch (e) {
    void e;
  }
};

const getStoredSelectedId = () => {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(RESUME_GEN_SELECTED_KEY);
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
};

const setStoredSelectedId = (id) => {
  try {
    if (id != null) localStorage.setItem(RESUME_GEN_SELECTED_KEY, String(id));
  } catch (e) {
    void e;
  }
};

const getStoredPanelWidth = () => {
  if (typeof window === 'undefined') return 50;
  try {
    const v = localStorage.getItem(RESUME_GEN_PANEL_WIDTH_KEY);
    const n = v ? parseFloat(v, 10) : 50;
    return Number.isFinite(n) && n >= 25 && n <= 75 ? n : 50;
  } catch {
    return 50;
  }
};

const setStoredPanelWidth = (pct) => {
  try {
    const n = Math.max(25, Math.min(75, pct));
    localStorage.setItem(RESUME_GEN_PANEL_WIDTH_KEY, String(n));
  } catch (e) {
    void e;
  }
};

const getStoredLastTailorJobId = () => {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(RESUME_GEN_LAST_TAILOR_JOB_KEY);
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
};

const setStoredLastTailorJobId = (id) => {
  try {
    if (id != null) localStorage.setItem(RESUME_GEN_LAST_TAILOR_JOB_KEY, String(id));
  } catch (e) {
    void e;
  }
};

const fetchResumes = (setResumes) => {
  getResumeWorkspaceAPI()
    .then(({ data }) => setResumes(Array.isArray(data?.resumes) ? data.resumes : []))
    .catch(() => setResumes([]));
};

const TEMPLATES = [
  { id: 'classic', label: 'Classic', img: '/resume-templates/classic.svg', ats: true },
  { id: 'accent', label: 'Accent', img: '/resume-templates/accent.svg', ats: true },
  { id: 'minimalist', label: 'Minimalist', img: '/resume-templates/minimalist.svg', ats: true },
  { id: 'modern', label: 'Modern', img: '/resume-templates/modern.svg', ats: false },
  { id: 'executive', label: 'Executive', img: '/resume-templates/executive.svg', ats: true },
  { id: 'harvard', label: 'Harvard', img: '/resume-templates/harvard.svg', ats: true },
  { id: 'elegant', label: 'Elegant ✦', img: '/resume-templates/elegant.svg', ats: true, premium: true },
  { id: 'impact', label: 'Impact ✦', img: '/resume-templates/impact.svg', ats: false, premium: true },
];

const EMPTY_EDUCATION = { degree: '', fieldOfStudy: '', institution: '', startYear: '', endYear: '', grade: '', location: '' };
const EMPTY_EXPERIENCE = { jobTitle: '', companyName: '', employmentType: '', startDate: '', endDate: '', location: '', workMode: '', description: '', techStack: '' };
const EMPTY_TECH_SKILL = { name: '', level: '', years: '' };
const EMPTY_SOFT_SKILL = { name: '' };
const EMPTY_PROJECT = { name: '', description: '', role: '', techStack: '', githubUrl: '', liveUrl: '', projectType: '' };

const DEFAULT_PROFILE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  professionalHeadline: '',
  professionalSummary: '',
  experiences: [{ ...EMPTY_EXPERIENCE }],
  educations: [{ ...EMPTY_EDUCATION }],
  techSkills: [{ ...EMPTY_TECH_SKILL }],
  softSkills: [{ ...EMPTY_SOFT_SKILL }],
  projects: [{ ...EMPTY_PROJECT }],
  links: { linkedInUrl: '', githubUrl: '', portfolioUrl: '', otherLinks: [] },
  preferences: { desiredRoles: '', employmentType: [], experienceLevel: '', openToRemote: '', willingToRelocate: '', preferredLocations: [], expectedSalaryRange: '' },
};

function ResumeSectionCard({ title, defaultOpen = false, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card sx={{ mb: 2, borderRadius: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'visible', border: '1px solid var(--border-color)' }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.75, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '0.9375rem' }} color="var(--text-primary)">
            {title}
          </Typography>
          {badge != null && !open && (
            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>{badge}</Typography>
          )}
        </Box>
        {open ? <ExpandLessRoundedIcon sx={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ExpandMoreRoundedIcon sx={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
      </Box>
      {open && <Box sx={{ px: 2, pb: 2, pt: 0 }}>{children}</Box>}
    </Card>
  );
}

function TemplateThumbnail({ id, label, img, selected, onSelect, ats }) {
  const [imgErr, setImgErr] = React.useState(false);
  // Palette colors for each template
  const palettes = { classic: '#374151', accent: '#1e3a5f', minimalist: '#222', modern: '#2d3748', executive: '#0f2952', harvard: '#000' };
  const bg = palettes[id] || '#374151';
  return (
    <Card
      onClick={onSelect}
      sx={{
        overflow: 'hidden',
        cursor: 'pointer',
        border: 2,
        borderColor: selected ? 'var(--primary)' : 'var(--border-color)',
        bgcolor: selected ? 'rgba(51, 94, 222, 0.04)' : 'white',
        boxShadow: selected ? '0 2px 12px rgba(51, 94, 222, 0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        '&:hover': {
          borderColor: selected ? 'var(--primary)' : 'rgba(51, 94, 222, 0.4)',
          bgcolor: selected ? 'rgba(51, 94, 222, 0.06)' : 'var(--bg-light)',
          boxShadow: selected ? '0 2px 12px rgba(51, 94, 222, 0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ aspectRatio: '120/160', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {!imgErr ? (
          <Box
            component="img"
            src={img}
            alt={label}
            loading="eager"
            onError={() => setImgErr(true)}
            sx={{ width: '100%', height: 'auto', objectFit: 'contain', flex: 1, p: 0.75, bgcolor: '#fafafa', display: 'block' }}
          />
        ) : (
          // Fallback thumbnail when SVG not found
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa', gap: 0.5, p: 1 }}>
            <Box sx={{ width: '80%', height: 6, bgcolor: bg, borderRadius: 0.5, mb: 0.5 }} />
            {[1, 0.7, 0.7, 0.5, 0.5, 0.5, 0.5].map((w, i) => (
              <Box key={i} sx={{ width: `${w * 80}%`, height: 3, bgcolor: '#d1d5db', borderRadius: 0.5, mt: i === 2 ? 0.75 : 0 }} />
            ))}
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.25, py: 0.75, borderTop: '1px solid var(--border-color)', bgcolor: selected ? 'rgba(51, 94, 222, 0.08)' : 'transparent' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontFamily: 'var(--font-family)', fontWeight: selected ? 600 : 500, color: selected ? 'var(--primary)' : 'var(--text-secondary)', display: 'block', lineHeight: 1.2 }}>
              {label}
            </Typography>
            {ats && (
              <Typography sx={{ fontSize: '0.6rem', color: '#059669', fontWeight: 600, fontFamily: 'var(--font-family)' }}>ATS</Typography>
            )}
          </Box>
          {selected ? <CheckCircleRoundedIcon sx={{ color: 'var(--primary)', fontSize: 18, flexShrink: 0 }} /> : null}
        </Box>
      </Box>
    </Card>
  );
}

// Extracts the bullet character from the bulletIcon setting string e.g. "• Bullet" → "•"
function getBulletChar(bulletIcon) {
  if (!bulletIcon) return '•';
  const ch = bulletIcon.trim().charAt(0);
  return ch || '•';
}

/**
 * BulletEditor — interactive bullet list editor.
 * Each line = one resume bullet, shown with the selected bullet character prefix.
 * If the stored value is a single paragraph (AI-generated), it auto-splits into bullets.
 * Enter = new bullet below. Backspace on empty row = remove row.
 */
function BulletEditor({ value, onChange, bulletChar = '•' }) {
  // Split into lines; also split single long paragraphs at sentence boundaries
  const toLines = (v) => {
    if (!v) return [''];
    const raw = v.split('\n').map((l) => l.trim()).filter(Boolean);
    if (raw.length >= 2) return raw;
    // Single paragraph — try splitting at ". " sentence boundary
    const para = raw[0] || '';
    if (para.length > 120) {
      const sentences = para.split(/\.\s+/).map((s) => s.trim()).filter(Boolean).map((s) => (s.endsWith('.') ? s : s + '.'));
      if (sentences.length >= 2) return sentences;
    }
    return raw.length ? raw : [''];
  };

  const [lines, setLines] = React.useState(() => toLines(value));
  const inputRefs = React.useRef([]);
  const pendingFocus = React.useRef(null);

  // Sync external value → internal lines (e.g. after Tailor More reloads profile)
  React.useEffect(() => {
    setLines(toLines(value));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  React.useEffect(() => {
    if (pendingFocus.current !== null) {
      const idx = pendingFocus.current;
      pendingFocus.current = null;
      setTimeout(() => inputRefs.current[idx]?.focus(), 20);
    }
  });

  const commit = (next) => {
    setLines(next);
    onChange(next.join('\n'));
  };

  const updateLine = (i, text) => {
    const next = [...lines]; next[i] = text; commit(next);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = [...lines.slice(0, i + 1), '', ...lines.slice(i + 1)];
      pendingFocus.current = i + 1;
      commit(next);
    } else if (e.key === 'Backspace' && lines[i] === '' && lines.length > 1) {
      e.preventDefault();
      const next = lines.filter((_, idx) => idx !== i);
      pendingFocus.current = Math.max(0, i - 1);
      commit(next);
    }
  };

  const removeLine = (i) => {
    if (lines.length <= 1) { commit(['']); return; }
    const next = lines.filter((_, idx) => idx !== i);
    pendingFocus.current = Math.max(0, i - 1);
    commit(next);
  };

  const addLine = () => {
    const next = [...lines, ''];
    pendingFocus.current = next.length - 1;
    commit(next);
  };

  return (
    <Box sx={{ border: '1px solid #D1D5DB', borderRadius: 1, bgcolor: 'white', overflow: 'hidden', '&:focus-within': { borderColor: '#2563EB', boxShadow: '0 0 0 2px rgba(37,99,235,0.1)' } }}>
      {lines.map((line, i) => (
        <Box
          key={i}
          sx={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #F9FAFB', '&:last-of-type': { borderBottom: 'none' }, '&:hover': { bgcolor: '#FAFAFA' }, '&:hover .bdel': { opacity: 1 } }}
        >
          <Box sx={{ px: 1.5, pt: '10px', color: '#9CA3AF', fontSize: '0.875rem', flexShrink: 0, userSelect: 'none', lineHeight: 1, fontWeight: 500 }}>
            {bulletChar}
          </Box>
          <TextField
            inputRef={(el) => { inputRefs.current[i] = el; }}
            variant="standard"
            fullWidth
            multiline
            value={line}
            onChange={(e) => updateLine(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            placeholder={i === 0 ? 'e.g. Led migration of monolith to microservices, reducing p99 latency by 40%…' : 'Add another bullet…'}
            InputProps={{ disableUnderline: true }}
            sx={{
              flex: 1,
              '& .MuiInputBase-root': { px: 0, py: '8px', fontSize: '0.875rem', lineHeight: 1.55, fontFamily: 'var(--font-family)', color: '#111827', bgcolor: 'transparent' },
              '& textarea': { resize: 'none' },
              '& .MuiInputBase-input::placeholder': { color: '#C4C9D4', opacity: 1, fontSize: '0.8rem' },
            }}
          />
          <IconButton
            className="bdel"
            size="small"
            tabIndex={-1}
            onClick={() => removeLine(i)}
            sx={{ opacity: 0, transition: 'opacity 0.12s', color: '#E5E7EB', '&:hover': { color: '#EF4444', bgcolor: 'transparent' }, m: '4px', flexShrink: 0 }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ))}
      <Box
        onClick={addLine}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, cursor: 'pointer', bgcolor: '#F9FAFB', color: '#9CA3AF', fontSize: '0.75rem', fontFamily: 'var(--font-family)', borderTop: '1px dashed #E5E7EB', '&:hover': { bgcolor: '#F3F4F6', color: '#374151' } }}
      >
        <AddRoundedIcon sx={{ fontSize: 14 }} /> Add bullet point
      </Box>
    </Box>
  );
}

function KeywordMatchCompact({ keywordCount = 0, totalKeywords = 0, matchPct = 0 }) {
  const pct = totalKeywords > 0 ? Math.round((keywordCount / totalKeywords) * 100) : matchPct;
  if (totalKeywords === 0 && matchPct === 0) return null;
  const color = pct >= 85 ? '#059669' : pct >= 65 ? '#D97706' : '#DC2626';
  const bgColor = pct >= 85 ? '#ECFDF5' : pct >= 65 ? '#FFFBEB' : '#FEF2F2';
  const borderColor = pct >= 85 ? '#A7F3D0' : pct >= 65 ? '#FDE68A' : '#FECACA';
  const circumference = 2 * Math.PI * 13;
  const dash = (pct / 100) * circumference;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        bgcolor: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      <Box sx={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="14" cy="14" r="13" fill="none" stroke={borderColor} strokeWidth="2.5" />
          <circle
            cx="14" cy="14" r="13"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color, lineHeight: 1 }}>{pct}</Typography>
        </Box>
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color, lineHeight: 1, fontFamily: 'var(--font-family)' }}>
          {pct}% match
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: '#6B7280', lineHeight: 1.2, mt: 0.25, fontFamily: 'var(--font-family)' }}>
          {keywordCount}/{totalKeywords} keywords
        </Typography>
      </Box>
    </Box>
  );
}

export default function ResumeGenerator() {
  const navigate = useNavigate();
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [view, setView] = useState('preview'); // 'generating' | 'preview'
  const [progress, setProgress] = useState(0);
  const [resumes, setResumes] = useState([]);
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editResume, setEditResume] = useState(null);
  const [editName, setEditName] = useState('');
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [generateError, setGenerateError] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState(getStoredSelectedId);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const creditsLeft = 4;
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'design'
  const [extensionBannerDismissed, setExtensionBannerDismissed] = useState(() => {
    try { return localStorage.getItem('resumeGenExtensionDismissed') === '1'; } catch { return false; }
  });
  const setExtensionBannerDismissedAndStore = (v) => {
    setExtensionBannerDismissed(v);
    try { if (v) localStorage.setItem('resumeGenExtensionDismissed', '1'); } catch { /* noop */ }
  };
  const [templateId, setTemplateId] = useState('classic');
  const [headerAlign, setHeaderAlign] = useState('Center');
  const [marginSize, setMarginSize] = useState('Medium');
  const [pageSize, setPageSize] = useState('Letter (21.59 cm x 27.94 cm)');
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [fontSize, setFontSize] = useState('11pt');
  const [lineHeight, setLineHeight] = useState('1.2');
  const [titleWidth, setTitleWidth] = useState(20);
  const [sectionSeparator, setSectionSeparator] = useState(true);
  const [nameCapitalize, setNameCapitalize] = useState(false);
  const [formatDates, setFormatDates] = useState('Long Name (January YYYY)');
  const [bulletIcon, setBulletIcon] = useState('• Bullet');
  const [profile, setProfile] = useState(() => ({ ...DEFAULT_PROFILE }));
  const [keywordMatch, setKeywordMatch] = useState(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(getStoredPanelWidth);
  const [showJdUploadDialog, setShowJdUploadDialog] = useState(false);
  const [_jobIdFromUrl, setJobIdFromUrl] = useState(() => {
    if (typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search);
    const id = p.get('job_id');
    return id && /^\d+$/.test(id) ? parseInt(id, 10) : null;
  });
  const [downloading, setDownloading] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [keywordRefreshTick, setKeywordRefreshTick] = useState(0);
  const profilePatchTimeoutRef = useRef(null);
  const profileRef = useRef(profile);
  const selectedResumeIdRef = useRef(selectedResumeId);
  const tailorContextRef = useRef(null);
  const tailorJobIdRef = useRef(null);

  const handleManualUpload = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name || '').toLowerCase().slice(-4);
    if (!['.pdf', '.doc', '.docx'].some((x) => ext.endsWith(x))) {
      return;
    }
    setUploading(true);
    uploadResumeAPI(file)
      .then(() => {
        getResumeWorkspaceAPI().then(({ data }) => {
          const list = Array.isArray(data?.resumes) ? data.resumes : [];
          setResumes(list);
          const defaultResume = list.find((r) => r.is_default) || list[0];
          if (defaultResume) {
            setSelectedResumeId(defaultResume.id);
            setStoredSelectedId(defaultResume.id);
          }
        });
      })
      .catch(() => {})
      .finally(() => {
        setUploading(false);
        e.target.value = '';
      });
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    getResumeWorkspaceAPI()
      .then(({ data }) => {
        const list = Array.isArray(data?.resumes) ? data.resumes : [];
        setResumes(list);
        const tc = data?.tailor_context;
        const params = new URLSearchParams(window.location.search);
        const urlJobId = params.get('job_id');
        if (urlJobId && /^\d+$/.test(urlJobId)) setJobIdFromUrl(parseInt(urlJobId, 10));
        else if (tc?.job_id != null) setJobIdFromUrl(tc.job_id);
        if (params.get('tailor') === '1') {
          const currentJobId = (urlJobId && /^\d+$/.test(urlJobId) ? parseInt(urlJobId, 10) : null) ?? tc?.job_id ?? null;
          const isSameJobAsLast = currentJobId != null && getStoredLastTailorJobId() === currentJobId;
          const showExistingForThisJob = list.length > 0 && isSameJobAsLast;
          if (tc?.job_description) {
            setJobDescription(tc.job_description);
            setJobRole(tc.job_title || '');
            if (showExistingForThisJob) {
              setView('preview');
              setStoredView('preview');
            } else {
              tailorJobIdRef.current = currentJobId;
              tailorContextRef.current = tc;
              setView('generating');
            }
          } else if (urlJobId && /^\d+$/.test(urlJobId)) {
            const jobId = parseInt(urlJobId, 10);
            getJobAPI(jobId)
              .then(({ data: job }) => {
                const jd = job?.job_description?.trim();
                if (jd && jd.length >= 50) {
                  setJobDescription(jd);
                  setJobRole(job?.position_title || '');
                  const sameJob = list.length > 0 && getStoredLastTailorJobId() === jobId;
                  if (sameJob) {
                    setView('preview');
                    setStoredView('preview');
                  } else {
                    tailorJobIdRef.current = jobId;
                    tailorContextRef.current = { job_description: jd, job_title: job?.position_title || '' };
                    setView('generating');
                  }
                } else {
                  setShowJdUploadDialog(true);
                }
              })
              .catch(() => setShowJdUploadDialog(true));
          } else {
            setShowJdUploadDialog(true);
          }
        } else if (list.length > 0) {
          setView('preview');
        }
        // Handle ?resume_id= URL param (from ResumeGeneratorStart "Select" button)
        const urlResumeId = params.get('resume_id');
        if (urlResumeId && /^\d+$/.test(urlResumeId)) {
          const id = parseInt(urlResumeId, 10);
          if (list.some((r) => r.id === id)) {
            setSelectedResumeId(id);
            setStoredSelectedId(id);
            setView('preview');
            setStoredView(false);
          }
        }
      })
      .catch(() => setResumes([]))
      .finally(() => setWorkspaceLoaded(true));
  }, []);

  useEffect(() => {
    if (resumes.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const urlResumeId = params.get('resume_id');
    if (urlResumeId && /^\d+$/.test(urlResumeId)) {
      const id = parseInt(urlResumeId, 10);
      if (resumes.some((r) => r.id === id)) {
        setSelectedResumeId(id);
        return;
      }
    }
    const storedId = getStoredSelectedId();
    const validId = storedId && resumes.some((r) => r.id === storedId) ? storedId : resumes[0].id;
    setSelectedResumeId(validId);
  }, [resumes]);

  useEffect(() => {
    const tc = tailorContextRef.current;
    if (view !== 'generating' || !tc?.job_description?.trim()) return;
    tailorContextRef.current = null;
    setGenerateError('');
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.random() * 6 + 3));
    }, 400);
    const jobTitle = (tc.job_title || '').trim() || 'Resume';
    generateResumeAPI({
      job_title: jobTitle,
      job_description: tc.job_description.trim(),
      template_id: templateId || 'classic',
      font_family: fontFamily,
      font_size: fontSize,
      line_height: lineHeight,
    })
      .then(({ data }) => {
        setProgress(100);
        fetchResumes(setResumes);
        setSelectedResumeId(data?.resume_id ?? null);
        if (tailorJobIdRef.current != null) setStoredLastTailorJobId(tailorJobIdRef.current);
        setView('preview');
        setStoredView('preview');
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err?.message || 'Resume generation failed. Please try again.';
        setGenerateError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        setView('preview');
      })
      .finally(() => clearInterval(progressInterval));
  }, [view, templateId, fontFamily, fontSize, lineHeight]);

  useEffect(() => {
    if (selectedResumeId != null) {
      setStoredSelectedId(selectedResumeId);
      selectedResumeIdRef.current = selectedResumeId;
    }
  }, [selectedResumeId]);

  useEffect(() => {
    if (workspaceLoaded && resumes.length === 0 && view === 'preview') navigate('/resume-generator', { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceLoaded, resumes.length]);

  useEffect(() => () => {
    if (profilePatchTimeoutRef.current) clearTimeout(profilePatchTimeoutRef.current);
  }, []);

  // Load profile for the editor. Priority: per-resume snapshot → global profile fallback.
  // Re-runs when the selected resume changes so each JD gets its own profile data.
  useEffect(() => {
    if (view !== 'preview') return;

    const applyProfile = (p) => {
      setProfile({
        firstName: p.firstName ?? '',
        lastName: p.lastName ?? '',
        email: p.email ?? '',
        phone: p.phone ?? '',
        city: p.city ?? '',
        country: p.country ?? '',
        professionalHeadline: p.professionalHeadline ?? '',
        professionalSummary: p.professionalSummary ?? '',
        experiences: Array.isArray(p.experiences) && p.experiences.length > 0 ? p.experiences : [{ ...EMPTY_EXPERIENCE }],
        educations: Array.isArray(p.educations) && p.educations.length > 0 ? p.educations : [{ ...EMPTY_EDUCATION }],
        techSkills: Array.isArray(p.techSkills) && p.techSkills.length > 0 ? p.techSkills.map((s) => ({ name: s.name ?? '', level: s.level ?? s.proficiencyLevel ?? '', years: s.years ?? s.yearsOfExperience ?? '' })) : [{ ...EMPTY_TECH_SKILL }],
        softSkills: Array.isArray(p.softSkills) && p.softSkills.length > 0 ? p.softSkills.map((s) => ({ name: s.name ?? '' })) : [{ ...EMPTY_SOFT_SKILL }],
        projects: Array.isArray(p.projects) && p.projects.length > 0 ? p.projects : [{ ...EMPTY_PROJECT }],
        links: p.links ? { linkedInUrl: p.links.linkedInUrl ?? '', githubUrl: p.links.githubUrl ?? '', portfolioUrl: p.links.portfolioUrl ?? '', otherLinks: p.links.otherLinks ?? [] } : { linkedInUrl: '', githubUrl: '', portfolioUrl: '', otherLinks: [] },
        preferences: p.preferences || DEFAULT_PROFILE.preferences,
      });
    };

    // Use the per-resume profile snapshot when available (per-JD customization)
    const snap = selectedResume?.resume_profile_snapshot;
    if (snap && typeof snap === 'object' && Object.keys(snap).length > 0) {
      applyProfile(snap);
      return;
    }

    // Fallback: load from the global profile
    getProfileDataAPI()
      .then(({ data }) => applyProfile(data || {}))
      .catch(() => setProfile({ ...DEFAULT_PROFILE }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedResume?.id]);

  useEffect(() => {
    if (view !== 'preview' || !jobDescription?.trim() || !selectedResume?.id) {
      setKeywordMatch(null);
      return;
    }
    analyzeKeywordsAPI({ job_description: jobDescription.trim(), resume_id: selectedResume.id })
      .then(({ data }) => setKeywordMatch({ matched_count: data?.matched_count ?? 0, total_keywords: data?.total_keywords ?? 0, percent: data?.percent ?? 0 }))
      .catch(() => setKeywordMatch(null));
  // keywordRefreshTick: incremented by handleTailorMore to force re-analysis after AI re-tailoring
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, jobDescription, selectedResume?.id, keywordRefreshTick]);

  profileRef.current = profile;

  const saveAndRefreshPreview = useCallback(() => {
    const currentProfile = profileRef.current;
    const payload = {
      firstName: currentProfile.firstName ?? '',
      lastName: currentProfile.lastName ?? '',
      email: currentProfile.email ?? '',
      phone: currentProfile.phone ?? '',
      city: currentProfile.city ?? '',
      country: currentProfile.country ?? '',
      professionalHeadline: currentProfile.professionalHeadline ?? '',
      professionalSummary: currentProfile.professionalSummary ?? '',
      experiences: Array.isArray(currentProfile.experiences) ? currentProfile.experiences : [],
      educations: Array.isArray(currentProfile.educations) ? currentProfile.educations : [],
      techSkills: Array.isArray(currentProfile.techSkills) ? currentProfile.techSkills.map((s) => ({ name: s.name ?? '', level: s.level ?? '', years: s.years ?? '' })) : [],
      softSkills: Array.isArray(currentProfile.softSkills) ? currentProfile.softSkills.map((s) => ({ name: s.name ?? '' })) : [],
      projects: Array.isArray(currentProfile.projects) ? currentProfile.projects : [],
      links: currentProfile.links || DEFAULT_PROFILE.links,
      preferences: currentProfile.preferences || DEFAULT_PROFILE.preferences,
    };
    // Save per-JD profile snapshot only — never touch the global profile from resume editor.
    // PDF download uses profile_override: profileRef.current directly, so no global sync needed.
    const selId = selectedResumeIdRef.current;
    if (selId && selId !== 0) {
      saveResumeSnapshotAPI(selId, payload).catch(() => {});
    }
  }, []);

  const scheduleProfilePatch = useCallback(() => {
    if (profilePatchTimeoutRef.current) clearTimeout(profilePatchTimeoutRef.current);
    profilePatchTimeoutRef.current = setTimeout(() => {
      profilePatchTimeoutRef.current = null;
      saveAndRefreshPreview();
    }, 700);
  }, [saveAndRefreshPreview]);

  const handleGenerate = async () => {
    if (!jobDescription?.trim()) return;
    setGenerateError('');
    setView('generating');
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.random() * 6 + 3));
    }, 400);
    try {
      const { data } = await generateResumeAPI({
        job_title: jobRole?.trim() || 'Resume',
        job_description: jobDescription?.trim(),
        template_id: templateId || 'classic',
        font_family: fontFamily,
        font_size: fontSize,
        line_height: lineHeight,
      });
      setProgress(100);
      fetchResumes(setResumes);
      setSelectedResumeId(data?.resume_id ?? null);
      setView('preview');
      setStoredView('preview');
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Resume generation failed. Please try again.';
      setGenerateError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setView('preview');
    } finally {
      clearInterval(progressInterval);
    }
  };

  const openEdit = (r) => {
    setEditResume(r);
    setEditName(r.resume_name || '');
    setEditText(r.resume_text || '');
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditResume(null);
  };
  const saveEdit = async () => {
    if (!editResume) return;
    const name = (editName || '').trim();
    if (!name) return;
    setSaving(true);
    try {
      const { data } = await updateResumeAPI(editResume.id, {
        resume_name: name,
        resume_text: editText ?? editResume.resume_text ?? '',
      });
      setResumes((prev) =>
        prev.map((r) =>
          r.id === data.id ? { ...r, resume_name: data.resume_name, resume_text: (data.resume_text ?? r.resume_text) } : r
        )
      );
      closeEdit();
    } catch (err) {
      console.error('Failed to save resume:', err);
    } finally {
      setSaving(false);
    }
  };
  const confirmDelete = (r) => setDeleteId(r.id);
  const cancelDelete = () => setDeleteId(null);
  const fromPopup = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tailor') === '1';

  const handlePanelResizeStart = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftPanelWidth;
    const onMove = (ev) => {
      const container = document.querySelector('[data-resume-preview-container]');
      const w = container?.offsetWidth || window.innerWidth;
      const pctChange = ((ev.clientX - startX) / w) * 100;
      const next = Math.max(25, Math.min(75, startWidth + pctChange));
      setLeftPanelWidth(next);
      setStoredPanelWidth(next);
    };
    const onEnd = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  }, [leftPanelWidth]);

  const handleJdUploadClose = useCallback(() => {
    setShowJdUploadDialog(false);
  }, []);

  const handleJdUploadSubmit = useCallback(() => {
    if (jobDescription?.trim()) {
      setShowJdUploadDialog(false);
      tailorContextRef.current = { job_description: jobDescription.trim(), job_title: jobRole?.trim() || '' };
      setView('generating');
    }
  }, [jobDescription, jobRole]);

  const handleDownload = async () => {
    if (!selectedResume) return;
    setDownloading(true);
    try {
      if (jobDescription?.trim()) {
        // Generate WeasyPrint PDF using same profile_override as the live preview —
        // this guarantees the downloaded PDF is pixel-perfect identical to what the user sees.
        const { data: blob } = await previewResumeAPI({
          job_title: jobRole?.trim() || 'Resume',
          job_description: jobDescription.trim(),
          template_id: templateId || 'classic',
          font_family: fontFamily,
          font_size: fontSize,
          line_height: lineHeight,
          profile_override: profileRef.current,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (selectedResume.resume_name?.replace(/\s/g, '_') || 'resume') + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // No JD — download the stored PDF
        const url = `${BASE_URL}/resume/${selectedResume.id}/file`;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error('Download failed');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = (selectedResume.resume_name?.replace(/\s/g, '_') || 'resume') + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveAndUse = async () => {
    if (!selectedResume) return;
    await handleDownload();
    if (fromPopup) {
      try {
        window.dispatchEvent(new CustomEvent('HIREMATE_RESUME_SAVED', { detail: { resumeId: selectedResume.id } }));
        window.close();
      } catch {
        window.close();
      }
    }
  };

  // Auto-Fit: measure iframe content height and scale font+lineHeight to fill one page.
  // WeasyPrint Letter page = 11in = 1056px @ 96dpi with 0.4in margins.
  // Screen preview body has matching 0.4in padding so scrollHeight ≈ PDF content height.
  const handleAutoFit = useCallback(() => {
    const PAGE_H = 1056; // Letter @ 96dpi
    const iframe = document.querySelector('iframe[title="Resume Preview"]');
    const body = iframe?.contentDocument?.body;
    if (!body) return;

    // getBoundingClientRect gives rendered height; fall back to scrollHeight
    const rect = body.getBoundingClientRect();
    const contentH = (rect.height > 50 ? rect.height : body.scrollHeight);
    if (contentH <= 50) return;

    // Target 96% so WeasyPrint rounding never overflows to page 2
    const ratio = (PAGE_H * 0.96) / contentH;
    const curPt = parseFloat(fontSize) || 11;
    const curLH = parseFloat(lineHeight) || 1.2;

    // Clamp to safe range and round cleanly
    const newPt = Math.min(13.5, Math.max(8, curPt * ratio));
    const newLH = Math.min(1.6, Math.max(1.0, curLH * ratio));
    setFontSize(`${Math.round(newPt * 2) / 2}pt`);
    setLineHeight(`${Math.round(newLH * 20) / 20}`);
  }, [fontSize, lineHeight]);

  // Tailor More: re-run AI generation with current JD to push keyword match above 90%
  const handleTailorMore = async () => {
    if (!jobDescription?.trim() || !selectedResume) return;
    setTailoring(true);
    try {
      await generateResumeAPI({
        job_title: jobRole?.trim() || 'Resume',
        job_description: jobDescription.trim(),
        template_id: templateId || 'classic',
        font_family: fontFamily,
        font_size: fontSize,
        line_height: lineHeight,
        resume_id: selectedResume.id,
        profile_override: profileRef.current,
      });
      // Reload workspace to pick up the new snapshot
      const { data: ws } = await getResumeWorkspaceAPI();
      const list = Array.isArray(ws?.resumes) ? ws.resumes : [];
      setResumes(list);
      const updated = list.find((r) => r.id === selectedResume.id);
      if (updated?.resume_profile_snapshot) {
        setProfile(updated.resume_profile_snapshot);
      }
      // Force keyword match to re-analyze against the newly tailored resume content
      setKeywordRefreshTick((t) => t + 1);
    } catch (err) {
      console.error('Tailor more failed:', err);
    } finally {
      setTailoring(false);
    }
  };

  const handleOpenInNewTab = async (r) => {
    const url = `${BASE_URL}/resume/${r.id}/file`;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Failed to load');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error('Preview failed:', err);
    }
  };

  const doDelete = async () => {
    if (deleteId == null) return;
    try {
      await deleteResumeAPI(deleteId);
      setResumes((prev) => {
        const next = prev.filter((r) => r.id !== deleteId);
        if (selectedResumeId === deleteId && next.length > 0) {
          setSelectedResumeId(next[0].id);
        } else if (next.length === 0) {
          setSelectedResumeId(null);
          navigate('/ai-resume-studio', { replace: true });
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to delete resume:', err);
    } finally {
      setDeleteId(null);
    }
  };

  const goToInput = () => navigate('/ai-resume-studio');

  const generatingView = (
    <Box sx={{ minHeight: '100%', background: 'var(--bg-app)', overflowX: 'hidden', fontFamily: 'var(--font-family)' }}>
      <Box sx={{ background: HERO_GRADIENT, color: 'white', py: 3.5, px: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Chip label="Welcome back, gurusai!" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'var(--label-font-weight)' }} />
          </Box>
          <Typography variant="h4" sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, textAlign: 'center', fontSize: { xs: 'var(--font-size-section-header)', sm: 'var(--font-size-page-title)' }, mb: 1 }}>
            Land Your Dream Job
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-family)', textAlign: 'center', fontSize: 'var(--font-size-page-subtitle)', opacity: 0.95, mb: 2 }}>
            with an AI-tailored resume
          </Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <AutoAwesomeRoundedIcon sx={{ color: 'white', fontSize: 40 }} />
        </Box>
        <Typography variant="h5" sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>
          Creating Your Perfect Resume{jobRole ? ` for ${jobRole}` : ''}
        </Typography>
        <Typography variant="body2" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', mb: 2 }}>
          Tailoring content and skills to match the job description...
        </Typography>
        <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{ width: '100%', maxWidth: 320, height: 8, borderRadius: 4, bgcolor: 'var(--bg-light)', '& .MuiLinearProgress-bar': { borderRadius: 4 } }} />
        <Typography variant="caption" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', mt: 1 }}>
          {Math.round(Math.min(progress, 100))}% complete
        </Typography>
      </Box>
    </Box>
  );

  const TOOLBAR_HEIGHT = 48;
  const previewView = (
    <>
      <Box sx={{ minHeight: '100%', background: '#FFFFFF', overflowX: 'hidden', fontFamily: 'var(--font-family)' }}>
        <Box data-resume-preview-container sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: { md: '100vh' }, overflow: 'hidden' }}>
          {/* Sidebar + middle panel */}
          <Box
            sx={{
              width: { xs: '100%', md: `${leftPanelWidth}%` },
              minWidth: { md: 280 },
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid #E5E7EB',
              boxShadow: '4px 0 16px rgba(0,0,0,0.07)',
              bgcolor: '#FAFAFA',
              overflow: 'hidden',
              zIndex: 2,
              position: 'relative',
            }}
          >
            {/* Top nav */}
            <Box
              sx={{
                px: 2,
                pt: 1.5,
                pb: 1,
                borderBottom: '1px solid #E5E7EB',
                bgcolor: '#FFFFFF',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              {/* Row 1: breadcrumb */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Button
                  startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={goToInput}
                  size="small"
                  sx={{ textTransform: 'none', fontFamily: 'var(--font-family)', color: '#374151', fontWeight: 500, px: 1, minWidth: 0 }}
                >
                  Documents
                </Button>
                <ChevronRightRoundedIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280', fontFamily: 'var(--font-family)' }}>
                  Resume Editor
                </Typography>
              </Box>
              {/* Row 2: action buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Download PDF (reflects your current edits)">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon />}
                    onClick={handleDownload}
                    disabled={!selectedResume || downloading}
                    sx={{ textTransform: 'none', fontFamily: 'var(--font-family)', borderColor: '#D1D5DB', color: '#374151', flex: 1 }}
                  >
                    {downloading ? 'Generating…' : 'Download'}
                  </Button>
                </Tooltip>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<GetAppRoundedIcon />}
                  onClick={handleSaveAndUse}
                  disabled={!selectedResume || downloading}
                  sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, fontFamily: 'var(--font-family)', flex: 1.6, whiteSpace: 'nowrap' }}
                >
                  Save & Use Resume
                </Button>
              </Box>
            </Box>
            {/* Tab bar */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                borderBottom: '1px solid #E5E7EB',
                px: 2,
                minHeight: 44,
                '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontFamily: 'var(--font-family)' },
                '& .Mui-selected': { color: '#1D4ED8', fontWeight: 500, bgcolor: '#F8FAFF', borderBottom: '2px solid #2563EB' },
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root:not(.Mui-selected)': { color: '#6B7280', borderBottom: '2px solid transparent' },
                '& .MuiTab-root:not(.Mui-selected):hover': { bgcolor: '#F3F4F6' },
              }}
            >
              <Tab icon={<EditNoteRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Edit Content" value="content" />
              <Tab icon={<PaletteRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Edit Design" value="design" />
            </Tabs>
            {/* Settings panel wrapper */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                borderRight: '1px solid #E5E7EB',
                boxShadow: 'inset -4px 0 8px -4px rgba(0,0,0,0.04)',
                bgcolor: '#FFFFFF',
                px: 2,
                py: 2,
                minHeight: 0,
              }}
            >
            {activeTab === 'content' && (
              <Box sx={{ px: 2, py: 2, width: '100%', boxSizing: 'border-box' }}>
                {/* Resume name — truncated, full name on hover */}
                <Tooltip title={selectedResume?.resume_name || ''} placement="bottom-start">
                  <Typography
                    variant="subtitle1"
                    noWrap
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      mb: 1.5,
                      fontSize: '0.9375rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {selectedResume?.resume_name}
                  </Typography>
                </Tooltip>

                {/* Job context card */}
                <Box sx={{ p: 1.5, bgcolor: 'var(--light-blue-bg)', borderRadius: 1.5, mb: 3, border: '1px solid rgba(51, 94, 222, 0.12)' }}>
                  {/* Job info row */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.25 }}>
                    <CheckCircleRoundedIcon sx={{ color: 'var(--primary)', fontSize: 20, mt: '2px', flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', display: 'block', lineHeight: 1.3 }}>
                        Resume tailored to job
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontWeight: 600,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4,
                        }}
                      >
                        {jobRole || 'Software Engineer'}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Buttons row — full width, evenly spaced */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={goToInput}
                      sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', flex: 1, fontSize: '0.75rem', py: 0.5 }}
                    >
                      Edit Job
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<FitScreenRoundedIcon sx={{ fontSize: '14px !important' }} />}
                      onClick={handleAutoFit}
                      sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', borderColor: '#6B7280', color: '#374151', flex: 1, fontSize: '0.75rem', py: 0.5 }}
                    >
                      Auto-Fit
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={tailoring ? <CircularProgress size={12} sx={{ color: 'white' }} /> : <AutoFixHighRoundedIcon sx={{ fontSize: '14px !important' }} />}
                      onClick={handleTailorMore}
                      disabled={tailoring || !jobDescription?.trim()}
                      sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', bgcolor: 'var(--primary)', flex: 1, fontSize: '0.75rem', py: 0.5 }}
                    >
                      {tailoring ? 'Tailoring…' : 'Tailor More'}
                    </Button>
                  </Box>
                </Box>
                <ResumeSectionCard title="Personal Information">
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <CustomInput label="First Name" placeholder="John" value={profile.firstName || ''} onChange={(e) => { setProfile((p) => ({ ...p, firstName: e.target.value })); scheduleProfilePatch(); }} />
                    <CustomInput label="Last Name" placeholder="Doe" value={profile.lastName || ''} onChange={(e) => { setProfile((p) => ({ ...p, lastName: e.target.value })); scheduleProfilePatch(); }} />
                    <CustomInput label="Email" placeholder="john@example.com" type="email" value={profile.email || ''} onChange={(e) => { setProfile((p) => ({ ...p, email: e.target.value })); scheduleProfilePatch(); }} sx={{ gridColumn: { sm: '1 / -1' } }} />
                    <CustomInput label="Phone" placeholder="+1 234 567 8900" value={profile.phone || ''} onChange={(e) => { setProfile((p) => ({ ...p, phone: e.target.value })); scheduleProfilePatch(); }} />
                    <CustomInput
                      label="Location"
                      placeholder="City, Country"
                      value={[profile.city, profile.country].filter(Boolean).join(', ')}
                      onChange={(e) => {
                        const parts = (e.target.value || '').split(',').map((s) => s.trim()).filter(Boolean);
                        const city = parts.length >= 2 ? parts.slice(0, -1).join(', ') : (parts[0] ?? '');
                        const country = parts.length >= 2 ? parts[parts.length - 1] : (parts[1] ?? '');
                        setProfile((p) => ({ ...p, city, country }));
                        scheduleProfilePatch();
                      }}
                      sx={{ gridColumn: { sm: '1 / -1' } }}
                    />
                  </Box>
                  <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <FormControlLabel control={<Switch color="primary" size="small" />} label="Hide Location" sx={{ fontFamily: 'var(--font-family)' }} />
                    <FormControlLabel control={<Switch color="primary" size="small" />} label="Hide Phone" sx={{ fontFamily: 'var(--font-family)' }} />
                    <FormControlLabel control={<Switch color="primary" size="small" />} label="Hide LinkedIn" sx={{ fontFamily: 'var(--font-family)' }} />
                    <FormControlLabel control={<Switch color="primary" size="small" defaultChecked />} label="Show Full URLs" sx={{ fontFamily: 'var(--font-family)' }} />
                  </Box>
                </ResumeSectionCard>
                <ResumeSectionCard title="Professional Summary">
                  <Typography variant="caption" color="var(--text-muted)" sx={{ display: 'block', mb: 1, fontFamily: 'var(--font-family)' }}>
                    A brief overview of your experience and key strengths. AI will tailor this to the job when you generate.
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={4}
                    placeholder="Write a 2-3 sentence summary about your background, key skills, and career goals..."
                    value={profile.professionalSummary || ''}
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, professionalSummary: e.target.value }));
                      scheduleProfilePatch();
                    }}
                    sx={{ fontFamily: 'var(--font-family)', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </ResumeSectionCard>
                <ResumeSectionCard title="Links">
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <CustomInput
                      label="LinkedIn URL"
                      placeholder="https://linkedin.com/in/yourname"
                      value={profile.links?.linkedInUrl || ''}
                      onChange={(e) => { setProfile((p) => ({ ...p, links: { ...(p.links || {}), linkedInUrl: e.target.value } })); scheduleProfilePatch(); }}
                    />
                    <CustomInput
                      label="GitHub URL"
                      placeholder="https://github.com/yourname"
                      value={profile.links?.githubUrl || ''}
                      onChange={(e) => { setProfile((p) => ({ ...p, links: { ...(p.links || {}), githubUrl: e.target.value } })); scheduleProfilePatch(); }}
                    />
                    <CustomInput
                      label="Portfolio URL"
                      placeholder="https://yourportfolio.com"
                      value={profile.links?.portfolioUrl || ''}
                      onChange={(e) => { setProfile((p) => ({ ...p, links: { ...(p.links || {}), portfolioUrl: e.target.value } })); scheduleProfilePatch(); }}
                    />
                  </Box>
                </ResumeSectionCard>
                <ResumeSectionCard title="Education" badge={profile.educations?.length ? `${profile.educations.length} entries` : null}>
                  {(profile.educations || []).map((edu, idx) => (
                    <Box key={idx} sx={{ mb: 2.5, p: 2, bgcolor: 'var(--bg-light)', borderRadius: 1, border: '1px solid var(--border-color)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'var(--font-family)', color: 'var(--text-secondary)' }}>Education #{idx + 1}</Typography>
                        <IconButton size="small" onClick={() => { setProfile((p) => ({ ...p, educations: p.educations.filter((_, i) => i !== idx).length ? p.educations.filter((_, i) => i !== idx) : [{ ...EMPTY_EDUCATION }] })); scheduleProfilePatch(); }} disabled={(profile.educations || []).length <= 1} sx={{ color: 'var(--text-muted)' }}>
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <CustomInput label="Institution" fullWidth sx={{ gridColumn: '1 / -1' }} placeholder="University / College name" value={edu.institution || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], institution: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="Degree" placeholder="B.Tech, BSc, M.Tech" value={edu.degree || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], degree: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="Field of Study" placeholder="Computer Science" value={edu.fieldOfStudy || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], fieldOfStudy: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="Start Year" placeholder="2018" value={edu.startYear || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], startYear: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="End Year / Graduation" placeholder="2022" value={edu.endYear || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], endYear: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="Grade / GPA" placeholder="8.5 CGPA or 3.8/4.0 GPA" value={edu.grade || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], grade: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="Location" placeholder="City, Country" value={edu.location || ''} onChange={(e) => { const next = [...(profile.educations || [])]; next[idx] = { ...next[idx], location: e.target.value }; setProfile((p) => ({ ...p, educations: next })); scheduleProfilePatch(); }} />
                      </Box>
                    </Box>
                  ))}
                  <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setProfile((p) => ({ ...p, educations: [...(p.educations || []), { ...EMPTY_EDUCATION }] }))} sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}>Add Education</Button>
                </ResumeSectionCard>
                <ResumeSectionCard title="Experience" badge={profile.experiences?.length ? `${profile.experiences.length} roles` : null}>
                  {(profile.experiences || []).map((exp, idx) => (
                    <Box key={idx} sx={{ mb: 2.5, p: 2, bgcolor: 'var(--bg-light)', borderRadius: 1, border: '1px solid var(--border-color)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'var(--font-family)', color: 'var(--text-secondary)' }}>Experience #{idx + 1}</Typography>
                        <IconButton size="small" onClick={() => { setProfile((p) => ({ ...p, experiences: p.experiences.filter((_, i) => i !== idx).length ? p.experiences.filter((_, i) => i !== idx) : [{ ...EMPTY_EXPERIENCE }] })); scheduleProfilePatch(); }} disabled={(profile.experiences || []).length <= 1} sx={{ color: 'var(--text-muted)' }}>
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <CustomInput label="Job Title" fullWidth sx={{ gridColumn: '1 / -1' }} value={exp.jobTitle || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], jobTitle: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="Company" value={exp.companyName || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], companyName: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="Location" placeholder="City, Country" value={exp.location || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], location: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="Start Date" placeholder="Jan 2022" value={exp.startDate || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], startDate: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="End Date" placeholder="Present" value={exp.endDate || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], endDate: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                          <Typography variant="caption" sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-muted)', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Bullet Points — shown exactly like this on your resume
                          </Typography>
                          <BulletEditor
                            bulletChar={getBulletChar(bulletIcon)}
                            value={exp.description || ''}
                            onChange={(val) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], description: val }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }}
                          />
                        </Box>
                        <CustomInput label="Tech Stack" fullWidth sx={{ gridColumn: '1 / -1' }} placeholder="React.js, Node.js, Python, AWS..." value={exp.techStack || ''} onChange={(e) => { const next = [...(profile.experiences || [])]; next[idx] = { ...next[idx], techStack: e.target.value }; setProfile((p) => ({ ...p, experiences: next })); scheduleProfilePatch(); }} />
                      </Box>
                    </Box>
                  ))}
                  <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setProfile((p) => ({ ...p, experiences: [...(p.experiences || []), { ...EMPTY_EXPERIENCE }] }))} sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}>Add Experience</Button>
                </ResumeSectionCard>
                <ResumeSectionCard
                  title="Skills"
                  badge={
                    ((profile.techSkills?.filter((s) => s.name?.trim()).length || 0) + (profile.softSkills?.filter((s) => s.name?.trim()).length || 0) > 0)
                      ? `${profile.techSkills?.filter((s) => s.name?.trim()).length || 0} technical, ${profile.softSkills?.filter((s) => s.name?.trim()).length || 0} soft`
                      : null
                  }
                >
                  <Box sx={{ '& > * + *': { mt: 2.5 } }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'var(--font-family)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Technical Skills
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                          onClick={() => setProfile((p) => ({ ...p, techSkills: [...(p.techSkills || []), { ...EMPTY_TECH_SKILL }] }))}
                          sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', fontSize: '0.75rem', color: 'var(--primary)', minWidth: 0, py: 0.25 }}
                        >
                          Add
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {(profile.techSkills || []).map((skill, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr auto auto',
                              gap: 1,
                              alignItems: 'flex-start',
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: 'var(--bg-light)',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            <CustomInput label="Skill" placeholder="e.g. React, Python" value={skill.name || ''} onChange={(e) => { const next = [...(profile.techSkills || [])]; next[idx] = { ...next[idx], name: e.target.value }; setProfile((p) => ({ ...p, techSkills: next })); scheduleProfilePatch(); }} />
                            <CustomInput label="Level" placeholder="Expert" value={skill.level || ''} onChange={(e) => { const next = [...(profile.techSkills || [])]; next[idx] = { ...next[idx], level: e.target.value }; setProfile((p) => ({ ...p, techSkills: next })); scheduleProfilePatch(); }} sx={{ minWidth: 90 }} />
                            <IconButton size="small" onClick={() => { setProfile((p) => ({ ...p, techSkills: p.techSkills.filter((_, i) => i !== idx).length ? p.techSkills.filter((_, i) => i !== idx) : [{ ...EMPTY_TECH_SKILL }] })); scheduleProfilePatch(); }} disabled={(profile.techSkills || []).length <= 1} sx={{ color: 'var(--text-muted)', mt: 0.5 }}>
                              <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ pt: 1.5, borderTop: '1px solid var(--border-color)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'var(--font-family)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Soft Skills
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                          onClick={() => setProfile((p) => ({ ...p, softSkills: [...(p.softSkills || []), { ...EMPTY_SOFT_SKILL }] }))}
                          sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', fontSize: '0.75rem', color: 'var(--primary)', minWidth: 0, py: 0.25 }}
                        >
                          Add
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(profile.softSkills || []).map((skill, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              flex: '1 1 100%',
                              minWidth: 0,
                            }}
                          >
                            <CustomInput label="Skill" placeholder="e.g. Leadership, Communication" value={skill.name || ''} onChange={(e) => { const next = [...(profile.softSkills || [])]; next[idx] = { ...next[idx], name: e.target.value }; setProfile((p) => ({ ...p, softSkills: next })); scheduleProfilePatch(); }} sx={{ flex: 1, minWidth: 0 }} />
                            <IconButton size="small" onClick={() => { setProfile((p) => ({ ...p, softSkills: p.softSkills.filter((_, i) => i !== idx).length ? p.softSkills.filter((_, i) => i !== idx) : [{ ...EMPTY_SOFT_SKILL }] })); scheduleProfilePatch(); }} disabled={(profile.softSkills || []).length <= 1} sx={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                              <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </ResumeSectionCard>
                <ResumeSectionCard title="Projects" badge={profile.projects?.length ? `${profile.projects.length} projects` : null}>
                  {(profile.projects || []).map((proj, idx) => (
                    <Box key={idx} sx={{ mb: 2.5, p: 2, bgcolor: 'var(--bg-light)', borderRadius: 1, border: '1px solid var(--border-color)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'var(--font-family)', color: 'var(--text-secondary)' }}>Project #{idx + 1}</Typography>
                        <IconButton size="small" onClick={() => { setProfile((p) => ({ ...p, projects: p.projects.filter((_, i) => i !== idx).length ? p.projects.filter((_, i) => i !== idx) : [{ ...EMPTY_PROJECT }] })); scheduleProfilePatch(); }} disabled={(profile.projects || []).length <= 1} sx={{ color: 'var(--text-muted)' }}>
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <CustomInput label="Project Name" fullWidth sx={{ gridColumn: '1 / -1' }} value={proj.name || ''} onChange={(e) => { const next = [...(profile.projects || [])]; next[idx] = { ...next[idx], name: e.target.value }; setProfile((p) => ({ ...p, projects: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="Tech Stack" fullWidth sx={{ gridColumn: '1 / -1' }} placeholder="React.js, Node.js, PostgreSQL..." value={proj.techStack || ''} onChange={(e) => { const next = [...(profile.projects || [])]; next[idx] = { ...next[idx], techStack: e.target.value }; setProfile((p) => ({ ...p, projects: next })); scheduleProfilePatch(); }} />
                        <CustomInput label="Your Role" placeholder="e.g. Full Stack Developer" value={proj.role || ''} onChange={(e) => { const next = [...(profile.projects || [])]; next[idx] = { ...next[idx], role: e.target.value }; setProfile((p) => ({ ...p, projects: next })); scheduleProfilePatch(); }} />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                          <Typography variant="caption" sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-muted)', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Description — shown exactly like this on your resume
                          </Typography>
                          <BulletEditor
                            bulletChar={getBulletChar(bulletIcon)}
                            value={proj.description || ''}
                            onChange={(val) => { const next = [...(profile.projects || [])]; next[idx] = { ...next[idx], description: val }; setProfile((p) => ({ ...p, projects: next })); scheduleProfilePatch(); }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))}
                  <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setProfile((p) => ({ ...p, projects: [...(p.projects || []), { ...EMPTY_PROJECT }] }))} sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}>Add Project</Button>
                </ResumeSectionCard>
                <Button fullWidth variant="outlined" startIcon={<AutoAwesomeRoundedIcon />} onClick={goToInput} sx={{ mt: 2, fontFamily: 'var(--font-family)', textTransform: 'none' }}>
                  Generate New
                </Button>
              </Box>
            )}
            {activeTab === 'design' && (
              <Box
                sx={{
                  px: 2,
                  py: 2,
                  width: '100%',
                  boxSizing: 'border-box',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    minHeight: 36,
                    '& fieldset': { borderColor: '#D1D5DB' },
                    '&:hover fieldset': { borderColor: '#9CA3AF' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)' },
                  },
                }}
              >
                <SectionCard title="Layout & Design" sx={{ mb: 2, '& .MuiTypography-root:first-of-type': { fontSize: '0.875rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #F3F4F6', pb: 1.5, mb: 2 } }}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, fontFamily: 'var(--font-family)' }}>Template</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-muted)', display: 'block', mb: 1.5 }}>Choose a layout. Preview updates shortly after you select.</Typography>
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {TEMPLATES.map((t) => (
                      <Grid item xs={4} key={t.id}>
                        <TemplateThumbnail id={t.id} label={t.label} img={t.img} ats={t.ats} selected={templateId === t.id} onSelect={() => setTemplateId(t.id)} />
                      </Grid>
                    ))}
                  </Grid>
                  <CustomSelect label="Header Alignment" value={headerAlign} onChange={(e) => setHeaderAlign(e.target.value)} sx={{ mb: 1.5 }}>
                    <MenuItem value="Center">Center</MenuItem>
                    <MenuItem value="Left">Left</MenuItem>
                  </CustomSelect>
                  <CustomSelect label="Margin Size" value={marginSize} onChange={(e) => setMarginSize(e.target.value)} sx={{ mb: 1.5 }}>
                    <MenuItem value="Small">Small</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Large">Large</MenuItem>
                  </CustomSelect>
                  <CustomSelect label="Page Size" value={pageSize} onChange={(e) => setPageSize(e.target.value)} sx={{ mb: 1.5 }}>
                    <MenuItem value="Letter (21.59 cm x 27.94 cm)">Letter (21.59 cm x 27.94 cm)</MenuItem>
                    <MenuItem value="A4">A4</MenuItem>
                  </CustomSelect>
                  {templateId === 'minimalist' && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', mb: 0.5 }}>Title Width: {titleWidth}%</Typography>
                      <input type="range" min={15} max={40} value={titleWidth} onChange={(e) => setTitleWidth(Number(e.target.value))} style={{ width: '100%' }} />
                    </Box>
                  )}
                  <FormControlLabel control={<Switch checked={sectionSeparator} onChange={(e) => setSectionSeparator(e.target.checked)} color="primary" />} label="Section Separator" sx={{ display: 'block' }} />
                </SectionCard>
                <SectionCard title="Font & Text Formatting" sx={{ mb: 2, '& .MuiTypography-root:first-of-type': { fontSize: '0.875rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #F3F4F6', pb: 1.5, mb: 2 } }}>
                  <CustomSelect label="Font Family" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} sx={{ mb: 1.5 }}>
                    <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                    <MenuItem value="Arial">Arial</MenuItem>
                    <MenuItem value="Georgia">Georgia</MenuItem>
                    <MenuItem value="Calibri">Calibri</MenuItem>
                    <MenuItem value="Garamond">Garamond</MenuItem>
                    <MenuItem value="Helvetica">Helvetica</MenuItem>
                    <MenuItem value="Verdana">Verdana</MenuItem>
                    <MenuItem value="Lato">Lato</MenuItem>
                    <MenuItem value="Segoe UI">Segoe UI</MenuItem>
                  </CustomSelect>
                  <CustomSelect label="Font Size" value={fontSize} onChange={(e) => setFontSize(e.target.value)} sx={{ mb: 1.5 }}>
                    <MenuItem value="9pt">9pt</MenuItem>
                    <MenuItem value="10pt">10pt</MenuItem>
                    <MenuItem value="10.5pt">10.5pt</MenuItem>
                    <MenuItem value="11pt">11pt</MenuItem>
                    <MenuItem value="12pt">12pt</MenuItem>
                  </CustomSelect>
                  <CustomSelect label="Line Height" value={lineHeight} onChange={(e) => setLineHeight(e.target.value)} sx={{ mb: 1.5 }}>
                    <MenuItem value="1.0">1.0</MenuItem>
                    <MenuItem value="1.1">1.1</MenuItem>
                    <MenuItem value="1.2">1.2</MenuItem>
                    <MenuItem value="1.3">1.3</MenuItem>
                    <MenuItem value="1.5">1.5</MenuItem>
                  </CustomSelect>
                  <FormControlLabel control={<Switch checked={nameCapitalize} onChange={(e) => setNameCapitalize(e.target.checked)} color="primary" />} label="Full Name Capitalization (Uppercase)" sx={{ display: 'block' }} />
                </SectionCard>
                <SectionCard title="Content Format" sx={{ '& .MuiTypography-root:first-of-type': { fontSize: '0.875rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #F3F4F6', pb: 1.5, mb: 2 } }}>
                  <CustomSelect label="Format Dates" value={formatDates} onChange={(e) => setFormatDates(e.target.value)} sx={{ mb: 1.5 }}>
                    <MenuItem value="Long Name (January YYYY)">Long Name (January YYYY)</MenuItem>
                    <MenuItem value="Short (Jan YYYY)">Short (Jan YYYY)</MenuItem>
                    <MenuItem value="Numeric (01/YYYY)">Numeric (01/YYYY)</MenuItem>
                  </CustomSelect>
                  <CustomSelect label="Bullet Icon" value={bulletIcon} onChange={(e) => setBulletIcon(e.target.value)}>
                    <MenuItem value="• Bullet">• Bullet</MenuItem>
                    <MenuItem value="– Dash">– Dash</MenuItem>
                    <MenuItem value="▸ Arrow">▸ Arrow</MenuItem>
                  </CustomSelect>
                </SectionCard>
              </Box>
            )}
            {!extensionBannerDismissed && (
              <Box sx={{ px: 2, py: 2, borderTop: '1px solid #E5E7EB', mt: 'auto' }}>
                <Button
                  size="small"
                  onClick={() => setExtensionBannerDismissedAndStore(true)}
                  sx={{ fontSize: '0.875rem', color: '#9CA3AF', textTransform: 'none', fontFamily: 'var(--font-family)', minWidth: 0, '&:hover': { color: '#4B5563', bgcolor: 'transparent' } }}
                >
                  Install Chrome Extension
                </Button>
              </Box>
            )}
          </Box>
          </Box>
          <Box
            onMouseDown={handlePanelResizeStart}
            sx={{
              display: { xs: 'none', md: 'block' },
              width: 8,
              minWidth: 8,
              cursor: 'col-resize',
              flexShrink: 0,
              position: 'relative',
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'rgba(51, 94, 222, 0.08)' },
            }}
            aria-label="Resize panels"
          />
          {/* Resume viewer panel — instant HTML preview, updates on every keystroke */}
          <Box sx={{ flex: 1, minWidth: 200, height: { md: '100vh' }, minHeight: { xs: 500 }, display: 'flex', flexDirection: 'column', bgcolor: '#F3F4F6', overflow: 'hidden' }}>
            {/* Viewer toolbar */}
            <Box
              sx={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                bgcolor: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB',
                minHeight: TOOLBAR_HEIGHT,
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', fontFamily: 'var(--font-family)' }}>
                Live preview — updates instantly as you edit
              </Typography>
              <KeywordMatchCompact keywordCount={keywordMatch?.matched_count ?? 0} totalKeywords={keywordMatch?.total_keywords ?? 0} matchPct={keywordMatch?.percent ?? 0} />
            </Box>
            {/* Tailoring progress banner */}
            {tailoring && (
              <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, bgcolor: '#EFF6FF', borderBottom: '1px solid #BFDBFE' }}>
                <CircularProgress size={16} thickness={5} sx={{ color: '#2563EB' }} />
                <Typography sx={{ fontSize: '0.8rem', fontFamily: 'var(--font-family)', color: '#1D4ED8', fontWeight: 500 }}>
                  Re-tailoring resume to match job description…
                </Typography>
              </Box>
            )}
            {/* Instant HTML preview — zero-latency reflection of left-panel edits */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: '#F3F4F6', display: 'flex', justifyContent: 'center', py: 3, px: 2, opacity: tailoring ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 820,
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <ResumeHtmlPreview
                  profile={profile}
                  templateId={templateId}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  jobTitle={jobRole}
                  jobDescription={jobDescription}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Full-screen download overlay */}
      <Backdrop open={downloading} sx={{ zIndex: 2000, flexDirection: 'column', gap: 2, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
        <CircularProgress size={52} thickness={4} sx={{ color: 'white' }} />
        <Typography sx={{ color: 'white', fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '1rem' }}>
          Generating your PDF…
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-family)', fontSize: '0.8rem' }}>
          This usually takes a few seconds
        </Typography>
      </Backdrop>
    </>
  );

  return (
    <>
      {view === 'generating' && generatingView}
      {view === 'preview' && previewView}
      <Dialog
        open={showJdUploadDialog}
        onClose={handleJdUploadClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, color: 'var(--text-primary)' }}>
          Job Description Not Found
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'var(--font-family)', mb: 2 }}>
            We couldn&apos;t extract the job description from the page. Please paste or upload the job description below to tailor your resume.
          </Typography>
          <JobDescriptionInput
            role={jobRole}
            jobDescription={jobDescription}
            onRoleChange={setJobRole}
            onJobDescriptionChange={setJobDescription}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleJdUploadClose} sx={{ fontFamily: 'var(--font-family)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleJdUploadSubmit}
            disabled={!jobDescription?.trim()}
            startIcon={<AutoAwesomeRoundedIcon />}
            sx={{ fontFamily: 'var(--font-family)', bgcolor: 'var(--primary)' }}
          >
            Use this JD & Generate Resume
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editOpen}
        onClose={closeEdit}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
          Review & Edit Your Resume
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'var(--font-family)', mb: 2 }}>
            Your resume has been tailored to the job description. Edit any content below and save to update your PDF.
          </Typography>
          <TextField
            fullWidth
            label="Resume Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            size="small"
            sx={{ mb: 2, '& .MuiInputBase-root': { fontFamily: 'var(--font-family)' } }}
          />
          {editResume?.resume_url && (
            <Box sx={{ mb: 2 }}>
              <Button
                size="small"
                startIcon={<OpenInNewRoundedIcon />}
                component="a"
                href={getResumeFullUrl(editResume.resume_url)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}
              >
                Preview PDF in new tab
              </Button>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            minRows={12}
            maxRows={20}
            label="Resume Content"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Edit resume content. Changes will update the stored text and regenerate the PDF."
            helperText="Your edits will be saved and the PDF will be regenerated automatically."
            sx={{
              '& .MuiInputBase-root': { fontFamily: 'var(--font-family)', fontSize: '0.9rem' },
            }}
            InputProps={{
              sx: {
                bgcolor: 'var(--bg-light)',
                borderRadius: 1,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={closeEdit} sx={{ fontFamily: 'var(--font-family)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveEdit}
            disabled={saving || !(editName || '').trim() || !editResume}
            sx={{ fontFamily: 'var(--font-family)', fontWeight: 600 }}
          >
            {saving ? 'Saving...' : 'Save & Update PDF'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteId != null} onClose={cancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: 'var(--font-family)' }}>Delete Resume</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'var(--font-family)' }}>Are you sure you want to delete this resume? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelDelete} sx={{ fontFamily: 'var(--font-family)' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={doDelete} sx={{ fontFamily: 'var(--font-family)' }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
