import React from 'react';
import { Box, Typography, Button, IconButton, InputBase, TextField, Chip, Tabs, Tab, Tooltip, FormControlLabel, Switch } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FitScreenRoundedIcon from '@mui/icons-material/FitScreenRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CircularProgress from '@mui/material/CircularProgress';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomizationPanel from './CustomizationPanel';
import SectionEditor from './SectionEditor';
import { 
  ResumeSectionCard, 
  BulletEditor, 
  getBulletChar,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  EMPTY_TECH_SKILL,
  EMPTY_SOFT_SKILL,
  EMPTY_PROJECT
} from './SharedComponents';

export default function EditorPanel({
  activeTab,
  setActiveTab,
  selectedResume,
  jobDescription,
  jobRole,
  profile,
  setProfile,
  designConfig,
  templates,
  extensionBannerDismissed,
  downloading,
  tailoring,
  goToInput,
  confirmDelete,
  handleGenerateNew,
  handleAutoFit,
  handleDownload,
  handleSaveAndUse,
  handleSave,
  isSaving,
  resumeTitleValue,
  setResumeTitleValue,
  isTitleEditing,
  setIsTitleEditing,
  handleRenameResume,
  setJdDialogMode,
  setShowJdUploadDialog,
  scheduleProfilePatch,
  handleDesignChange,
  handleSectionsOrderChange,
  setExtensionBannerDismissedAndStore,
  handleTailorMore,
  selectedResumeId,
}) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
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
      <Box
        sx={{
          px: 2,
          pt: 1.25,
          pb: 1,
          borderBottom: '1px solid #E5E7EB',
          bgcolor: '#FFFFFF',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button
              startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 15 }} />}
              onClick={goToInput}
              size="small"
              sx={{ textTransform: 'none', fontFamily: 'var(--font-family)', color: '#6B7280', fontWeight: 500, px: 0.75, minWidth: 0, fontSize: '0.8125rem' }}
            >
              Documents
            </Button>
            <ChevronRightRoundedIcon sx={{ fontSize: 14, color: '#D1D5DB' }} />
            <Typography sx={{ fontSize: '0.8125rem', color: '#374151', fontFamily: 'var(--font-family)', fontWeight: 500 }}>
              Resume Editor
            </Typography>
          </Box>
          {selectedResume && (
            <Tooltip title="Delete this resume">
              <IconButton
                size="small"
                onClick={() => confirmDelete(selectedResume)}
                sx={{ color: '#9CA3AF', borderRadius: '8px', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.06)' } }}
              >
                <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Tooltip title="Create a new resume">
            <Button
              size="small"
              startIcon={<AddRoundedIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleGenerateNew}
              sx={{ textTransform: 'none', fontFamily: 'var(--font-family)', color: '#374151', borderColor: '#E5E7EB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.78rem', px: 1.25, py: 0.5, fontWeight: 500, bgcolor: '#FAFAFA', '&:hover': { bgcolor: '#F3F4F6', borderColor: '#D1D5DB' } }}
            >
              New
            </Button>
          </Tooltip>
          <Tooltip title={selectedResume ? 'Save changes' : 'Save as new resume'}>
            <Button
              size="small"
              startIcon={isSaving ? <CircularProgress size={13} sx={{ color: '#374151' }} /> : <SaveRoundedIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleSave}
              disabled={isSaving}
              sx={{ textTransform: 'none', fontFamily: 'var(--font-family)', color: '#374151', borderColor: '#E5E7EB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.78rem', px: 1.25, py: 0.5, fontWeight: 500, bgcolor: '#FAFAFA', '&:hover': { bgcolor: '#F3F4F6', borderColor: '#D1D5DB' } }}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </Tooltip>
          <Tooltip title="Auto-fit content to one page">
            <Button
              size="small"
              startIcon={<FitScreenRoundedIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleAutoFit}
              sx={{ textTransform: 'none', fontFamily: 'var(--font-family)', color: '#374151', borderColor: '#E5E7EB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.78rem', px: 1.25, py: 0.5, fontWeight: 500, bgcolor: '#FAFAFA', '&:hover': { bgcolor: '#F3F4F6', borderColor: '#D1D5DB' } }}
            >
              Fit Page
            </Button>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Download PDF">
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{ textTransform: 'none', fontFamily: 'var(--font-family)', borderColor: '#D1D5DB', color: '#374151', borderRadius: '8px', fontSize: '0.78rem', px: 1.25, py: 0.5 }}
            >
              {downloading ? 'Generating…' : 'Download'}
            </Button>
          </Tooltip>
          {selectedResume ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<GetAppRoundedIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleSaveAndUse}
              disabled={downloading}
              sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, fontFamily: 'var(--font-family)', borderRadius: '8px', fontSize: '0.78rem', px: 1.5, py: 0.5, whiteSpace: 'nowrap', boxShadow: 'none', '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' } }}
            >
              Save & Use
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: '15px !important' }} />}
              onClick={() => { setJdDialogMode('add'); setShowJdUploadDialog(true); }}
              sx={{ background: 'linear-gradient(135deg, #2563EB 0%, #7c3aed 100%)', textTransform: 'none', fontWeight: 600, fontFamily: 'var(--font-family)', borderRadius: '8px', fontSize: '0.78rem', px: 1.5, py: 0.5, whiteSpace: 'nowrap', boxShadow: 'none' }}
            >
              Tailor to Job
            </Button>
          )}
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          borderBottom: '1px solid #E5E7EB',
          bgcolor: '#FFFFFF',
          px: 2,
          minHeight: 44,
          flexShrink: 0,
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

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          bgcolor: '#FFFFFF',
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: '#F9FAFB',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#D1D5DB',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: '#9CA3AF',
            },
          },
        }}
      >
        {activeTab === 'content' && (
          <Box sx={{ px: 4, py: 2, width: '100%', boxSizing: 'border-box' }}>
            {!selectedResume && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label="Profile Preview"
                  size="small"
                  sx={{ bgcolor: 'rgba(37,99,235,0.08)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.7rem', height: 22, '& .MuiChip-label': { px: 1 } }}
                />
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-family)' }}>
                  Live preview from your profile
                </Typography>
              </Box>
            )}
            {/* Resume title row — editable inline */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, minWidth: 0 }}>
              {isTitleEditing ? (
                <>
                  <InputBase
                    autoFocus
                    value={resumeTitleValue}
                    onChange={(e) => setResumeTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameResume(resumeTitleValue);
                      if (e.key === 'Escape') setIsTitleEditing(false);
                    }}
                    sx={{
                      flex: 1,
                      fontFamily: 'var(--font-family)',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      color: 'var(--text-primary)',
                      border: '1.5px solid #2563EB',
                      borderRadius: '6px',
                      px: 1,
                      py: 0.25,
                      bgcolor: '#F0F6FF',
                      minWidth: 0,
                    }}
                  />
                  <Tooltip title="Save name">
                    <IconButton size="small" onClick={() => handleRenameResume(resumeTitleValue)} sx={{ color: '#16a34a', p: 0.5 }}>
                      <CheckRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton size="small" onClick={() => setIsTitleEditing(false)} sx={{ color: '#9ca3af', p: 0.5 }}>
                      <CloseRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title={resumeTitleValue || ''} placement="bottom-start">
                    <Typography
                      noWrap
                      sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {resumeTitleValue}
                    </Typography>
                  </Tooltip>
                  <Tooltip title="Rename resume">
                    <IconButton size="small" onClick={() => setIsTitleEditing(true)} sx={{ color: '#9ca3af', p: 0.375, flexShrink: 0, '&:hover': { color: '#2563EB', bgcolor: 'rgba(37,99,235,0.06)' } }}>
                      <DriveFileRenameOutlineRoundedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>

            {jobDescription?.trim() ? (
              <Box sx={{ p: 1.5, bgcolor: 'var(--light-blue-bg)', borderRadius: 1.5, mb: 3, border: '1px solid rgba(51, 94, 222, 0.12)' }}>
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => { setJdDialogMode('add'); setShowJdUploadDialog(true); }}
                    sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', flex: 1, fontSize: '0.75rem', py: 0.5 }}
                  >
                    Edit JD
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={tailoring ? <CircularProgress size={12} sx={{ color: 'white' }} /> : <AutoFixHighRoundedIcon sx={{ fontSize: '14px !important' }} />}
                    onClick={handleTailorMore}
                    disabled={tailoring || !jobDescription?.trim()}
                    sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', bgcolor: 'var(--primary)', flex: 2, fontSize: '0.75rem', py: 0.5 }}
                  >
                    {tailoring ? 'Tailoring…' : 'Tailor More ✨'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                onClick={() => { setJdDialogMode('add'); setShowJdUploadDialog(true); }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.75,
                  mb: 3,
                  borderRadius: 2,
                  border: '1.5px dashed rgba(37,99,235,0.35)',
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.03) 0%, rgba(124,58,237,0.03) 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    borderColor: 'rgba(37,99,235,0.65)',
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.07) 0%, rgba(124,58,237,0.05) 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.1)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <AutoAwesomeRoundedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', lineHeight: 1.3 }}>
                    Tailor to a Job
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.775rem', color: '#64748b', lineHeight: 1.4 }}>
                    Add a JD — AI rewrites your resume to maximize keyword match
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.625, borderRadius: '8px', background: 'var(--primary)', flexShrink: 0 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-family)', whiteSpace: 'nowrap' }}>Add JD</Typography>
                  <ChevronRightRoundedIcon sx={{ color: 'white', fontSize: 14 }} />
                </Box>
              </Box>
            )}
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
              <SectionEditor
                section="summary"
                resumeId={selectedResumeId}
                onChange={(content) => {
                  setProfile((p) => ({ ...p, professionalSummary: content }));
                  scheduleProfilePatch();
                }}
              />
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
                        bulletChar={getBulletChar(designConfig.bullet_icon)}
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
              <SectionEditor
                section="skills"
                resumeId={selectedResumeId}
                onChange={(content) => {
                  const lines = content.split('\n').filter(Boolean);
                  const newSkills = [];
                  for (const line of lines) {
                    const colonIdx = line.indexOf(':');
                    if (colonIdx === -1) continue;
                    const items = line.slice(colonIdx + 1).split(',').map((s) => s.trim()).filter(Boolean);
                    items.forEach((name) => newSkills.push({ name, level: '', years: '' }));
                  }
                  if (newSkills.length > 0) {
                    setProfile((p) => ({ ...p, techSkills: newSkills }));
                    scheduleProfilePatch();
                  }
                }}
              />
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
                        bulletChar={getBulletChar(designConfig.bullet_icon)}
                        value={proj.description || ''}
                        onChange={(val) => { const next = [...(profile.projects || [])]; next[idx] = { ...next[idx], description: val }; setProfile((p) => ({ ...p, projects: next })); scheduleProfilePatch(); }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
              <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setProfile((p) => ({ ...p, projects: [...(p.projects || []), { ...EMPTY_PROJECT }] }))} sx={{ fontFamily: 'var(--font-family)', textTransform: 'none' }}>Add Project</Button>
            </ResumeSectionCard>
          </Box>
        )}
        {activeTab === 'design' && (
          <CustomizationPanel
            designConfig={designConfig}
            onDesignChange={handleDesignChange}
            templates={templates}
            onSectionsOrderChange={handleSectionsOrderChange}
          />
        )}
      </Box>
      {!extensionBannerDismissed && (
        <Box sx={{ px: 2, py: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#FFFFFF', flexShrink: 0 }}>
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
  );
}
