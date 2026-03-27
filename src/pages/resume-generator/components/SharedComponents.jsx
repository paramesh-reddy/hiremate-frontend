import React, { useState } from 'react';
import { Box, Card, Typography, TextField, IconButton, Chip } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export const EMPTY_EDUCATION = { degree: '', fieldOfStudy: '', institution: '', startYear: '', endYear: '', grade: '', location: '' };
export const EMPTY_EXPERIENCE = { jobTitle: '', companyName: '', employmentType: '', startDate: '', endDate: '', location: '', workMode: '', description: '', techStack: '' };
export const EMPTY_TECH_SKILL = { name: '', level: '', years: '' };
export const EMPTY_SOFT_SKILL = { name: '' };
export const EMPTY_PROJECT = { name: '', description: '', role: '', techStack: '', githubUrl: '', liveUrl: '', projectType: '' };

export function ResumeSectionCard({ title, defaultOpen = false, badge, children }) {
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

export function TemplateThumbnail({ id, label, img, selected, onSelect, ats }) {
  const [imgErr, setImgErr] = React.useState(false);
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

export function getBulletChar(bulletIcon) {
  if (!bulletIcon) return '•';
  const ch = bulletIcon.trim().charAt(0);
  return ch || '•';
}

export function BulletEditor({ value, onChange, bulletChar = '•' }) {
  const toLines = (v) => {
    if (!v) return [''];
    const raw = v.split('\n').map((l) => l.trim()).filter(Boolean);
    if (raw.length >= 2) return raw;
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

  React.useEffect(() => {
    setLines(toLines(value));
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

export function KeywordMatchCompact({ keywordCount = 0, totalKeywords = 0, matchPct = 0 }) {
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
