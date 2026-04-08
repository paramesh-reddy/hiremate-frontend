import React, { useEffect, useState, useRef, useCallback, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress,
  Backdrop,
  Avatar,
  InputAdornment,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import JobDescriptionInput from './JobDescriptionInput';
import { getResumeWorkspaceAPI, generateResumeAPI, previewResumeAPI, updateResumeAPI, renameResumeAPI, deleteResumeAPI, getProfileDataAPI, saveResumeSnapshotAPI, analyzeKeywordsAPI, getJobAPI, getResumeTemplatesAPI, updateResumeDesignAPI } from '../../services';
import { BASE_URL } from '../../utilities/const';
import { buildScreenReducer } from './stateMachine';
import { useResumeGeneratorParams } from '../../hooks/useResumeGeneratorParams';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { RESUME_STUDIO_THEME as THEME } from '../../utilities/resumeStudioTheme';

const BACKEND_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

const computeTotalExpYears = (experiences) => {
  if (!Array.isArray(experiences) || experiences.length === 0) return 0;
  let totalMonths = 0;
  experiences.forEach((exp) => {
    if (!exp.startDate) return;
    const start = new Date(exp.startDate);
    if (isNaN(start)) return;
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    if (isNaN(end) || end < start) return;
    totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  });
  return Math.max(0, Math.round(totalMonths / 12));
};

const computeDefaultResumeName = (profile) => {
  const firstName = (profile.firstName || '').trim() || 'Resume';
  const years = computeTotalExpYears(profile.experiences || []);
  return years > 0 ? `${firstName}_${years}Years` : firstName;
};
const AVATAR_COLORS = [
  ['#dbeafe', '#2563eb'],
  ['#ede9fe', '#7c3aed'],
  ['#dcfce7', '#16a34a'],
  ['#fef3c7', '#d97706'],
  ['#fce7f3', '#be185d'],
];

const getResumeInitials = (name = '') =>
  (name || '').split(/[_\s]+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || 'R';
const RESUME_GEN_PANEL_WIDTH_KEY = 'resumeGeneratorLeftPanelWidth';

const getResumeFullUrl = (url) =>
  url && (url.startsWith('http://') || url.startsWith('https://')) ? url : `${BACKEND_ORIGIN}${url || ''}`;

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

const fetchResumes = (setResumes) => {
  getResumeWorkspaceAPI()
    .then(({ data }) => setResumes(Array.isArray(data?.resumes) ? data.resumes : []))
    .catch(() => setResumes([]));
};

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

export default function ResumeGenerator() {
  const navigate = useNavigate();

  // URL-first state — source of truth for resume selection and view
  const params = useResumeGeneratorParams();

  // State machine (runs in parallel with existing state for now; use for debugging/analytics)
  // eslint-disable-next-line no-unused-vars
  const [buildState, dispatch] = useReducer(buildScreenReducer, { phase: 'INIT' });

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
  const [selectedResumeId, setSelectedResumeId] = useState(() =>
    params.resumeId ? parseInt(params.resumeId, 10) : null
  );
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'design'
  const [extensionBannerDismissed, setExtensionBannerDismissed] = useState(() => {
    try { return localStorage.getItem('resumeGenExtensionDismissed') === '1'; } catch { return false; }
  });
  const setExtensionBannerDismissedAndStore = (v) => {
    setExtensionBannerDismissed(v);
    try { if (v) localStorage.setItem('resumeGenExtensionDismissed', '1'); } catch { /* noop */ }
  };
  const [designConfig, setDesignConfig] = useState({
    template_id: 'classic',
    font_family: 'Times New Roman',
    font_size: '11pt',
    line_height: '1.2',
    color_scheme_id: 'default',
    header_align: 'Center',
    margin_size: 'Medium',
    page_size: 'Letter',
    title_width: 20,
    section_separator: true,
    name_capitalize: false,
    format_dates: 'Long Name (January YYYY)',
    bullet_icon: '• Bullet',
    section_spacing: 'normal',
    sections_visible: [],
    sections_order: [],
  });
  const designConfigRef = useRef(null);
  const designSaveTimeoutRef = useRef(null);
  const [templates, setTemplates] = useState([]);
  const [profile, setProfile] = useState(() => ({ ...DEFAULT_PROFILE }));
  const [keywordMatch, setKeywordMatch] = useState(null);
  const [keywordDetails, setKeywordDetails] = useState(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(getStoredPanelWidth);
  const [showJdUploadDialog, setShowJdUploadDialog] = useState(false);
  const [jdDialogMode, setJdDialogMode] = useState('add'); // 'add' = user-initiated, 'error' = tailor flow missing JD
  const [_jobIdFromUrl, setJobIdFromUrl] = useState(() => {
    if (typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search);
    const id = p.get('job_id');
    return id && /^\d+$/.test(id) ? parseInt(id, 10) : null;
  });
  const [downloading, setDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [resumeTitleValue, setResumeTitleValue] = useState('');
  const [tailoring, setTailoring] = useState(false);
  const [keywordRefreshTick, setKeywordRefreshTick] = useState(0);
  const profilePatchTimeoutRef = useRef(null);
  const profileRef = useRef(profile);
  const selectedResumeIdRef = useRef(selectedResumeId);
  const tailorContextRef = useRef(null);
  const tailorJobIdRef = useRef(null);
  const tailorBaseResumeIdRef = useRef(null);
  const workspaceFetchedRef = useRef(false);
  const [tailorSelectSearch, setTailorSelectSearch] = useState('');

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  useEffect(() => {
    if (workspaceFetchedRef.current) return;
    workspaceFetchedRef.current = true;
    getResumeWorkspaceAPI()
      .then(({ data }) => {
        const list = Array.isArray(data?.resumes) ? data.resumes : [];
        setResumes(list);
        const tc = data?.tailor_context;
        tailorContextRef.current = tc ?? null;
        const urlSearchParams = new URLSearchParams(window.location.search);
        const urlJobId = urlSearchParams.get('job_id');
        if (urlJobId && /^\d+$/.test(urlJobId)) setJobIdFromUrl(parseInt(urlJobId, 10));
        else if (tc?.job_id != null) setJobIdFromUrl(tc.job_id);
        if (urlSearchParams.get('tailor') === '1') {
          const currentJobId = (urlJobId && /^\d+$/.test(urlJobId) ? parseInt(urlJobId, 10) : null) ?? tc?.job_id ?? null;
          // De-dupe: if job_id matches an existing resume, just open preview
          const existingForJob = currentJobId != null && list.find((r) => r.job_id === currentJobId);
          if (tc?.job_description) {
            setJobDescription(tc.job_description);
            setJobRole(tc.job_title || '');
            if (existingForJob) {
              setView('preview');
            } else {
              tailorJobIdRef.current = currentJobId;
              setView('tailor-select');
            }
          } else if (urlJobId && /^\d+$/.test(urlJobId)) {
            const jobId = parseInt(urlJobId, 10);
            getJobAPI(jobId)
              .then(({ data: job }) => {
                const jd = job?.job_description?.trim();
                if (jd && jd.length >= 50) {
                  setJobDescription(jd);
                  setJobRole(job?.position_title || '');
                  const sameJob = list.find((r) => r.job_id === jobId);
                  if (sameJob) {
                    setView('preview');
                  } else {
                    tailorJobIdRef.current = jobId;
                    tailorContextRef.current = { job_description: jd, job_title: job?.position_title || '' };
                    setView('tailor-select');
                  }
                } else {
                  setJdDialogMode('error');
                  setShowJdUploadDialog(true);
                }
              })
              .catch(() => { setJdDialogMode('error'); setShowJdUploadDialog(true); });
          } else {
            setJdDialogMode('error');
            setShowJdUploadDialog(true);
          }
        } else if (list.length > 0) {
          setView('preview');
        }
        // No else — new users (no resumes, no tailor) stay in 'preview' and see the "Tailor to a Job" card
        // Handle ?resume_id= URL param (from ResumeGeneratorStart "Select" button)
        const urlResumeId = urlSearchParams.get('resume_id');
        if (urlResumeId && /^\d+$/.test(urlResumeId) && urlSearchParams.get('tailor') !== '1') {
          const id = parseInt(urlResumeId, 10);
          if (list.some((r) => r.id === id)) {
            setSelectedResumeId(id);
            params.setResumeId(id);
            setView('preview');
          }
        }
        dispatch({ type: 'WORKSPACE_LOADED', workspace: { resumes: list, tailor_context: tc } });
      })
      .catch(() => setResumes([]))
      .finally(() => setWorkspaceLoaded(true));
  }, [dispatch, params.setResumeId]);

  useEffect(() => {
    if (resumes.length === 0) return;
    // Prefer URL param resume_id, then current selectedResumeId, then first resume.
    // Skip URL-based sync when in tailor-select or generating — user selection takes priority.
    if (params.resumeId && view !== 'tailor-select' && view !== 'generating') {
      const id = parseInt(params.resumeId, 10);
      if (resumes.some((r) => r.id === id)) {
        setSelectedResumeId(id);
        return;
      }
    }
    const validId = (selectedResumeId && resumes.some((r) => r.id === selectedResumeId))
      ? selectedResumeId
      : resumes[0].id;
    setSelectedResumeId(validId);
  }, [resumes, params.resumeId, selectedResumeId, view]);

  useEffect(() => {
    const tc = tailorContextRef.current;
    if (view !== 'generating' || !tc?.job_description?.trim()) return;
    tailorContextRef.current = null;
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.random() * 6 + 3));
    }, 400);
    const jobTitle = (tc.job_title || '').trim() || 'Resume';
    const baseResumeId = tailorBaseResumeIdRef.current;
    tailorBaseResumeIdRef.current = null;
    generateResumeAPI({
      job_title: jobTitle,
      job_description: tc.job_description.trim(),
      template_id: designConfigRef.current?.template_id || 'classic',
      font_family: designConfigRef.current?.font_family,
      font_size: designConfigRef.current?.font_size,
      line_height: designConfigRef.current?.line_height,
      ...(baseResumeId != null ? { resume_id: baseResumeId } : {}),
    })
      .then(({ data }) => {
        setProgress(100);
        fetchResumes(setResumes);
        setSelectedResumeId(data?.resume_id ?? null);
        setView('preview');
      })
      .catch(() => {
        setView('preview');
      })
      .finally(() => clearInterval(progressInterval));
  }, [view]);

  useEffect(() => {
    if (selectedResumeId == null) return;
    selectedResumeIdRef.current = selectedResumeId;
    const raw = params.resumeId;
    const urlNum = raw && /^\d+$/.test(String(raw)) ? parseInt(raw, 10) : null;
    if (urlNum === selectedResumeId) return;
    params.setResumeId(selectedResumeId);
  }, [selectedResumeId, params.resumeId, params.setResumeId]);

  // Sync URL resume_id changes back into local state (e.g. browser back/forward)
  useEffect(() => {
    if (params.resumeId) {
      const id = parseInt(params.resumeId, 10);
      if (id !== selectedResumeId && resumes.some((r) => r.id === id)) {
        setSelectedResumeId(id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.resumeId]);

  useEffect(() => {
    // Only redirect when a specific resume_id URL param was requested but not found (stale link).
    // Do NOT redirect new users who intentionally navigated here to create their first resume.
    if (workspaceLoaded && resumes.length === 0 && view === 'preview' && params.resumeId) {
      navigate('/resume-generator', { replace: true });
    }
  }, [workspaceLoaded, resumes.length, view, params.resumeId, navigate]);

  useEffect(() => () => {
    if (profilePatchTimeoutRef.current) clearTimeout(profilePatchTimeoutRef.current);
    if (designSaveTimeoutRef.current) clearTimeout(designSaveTimeoutRef.current);
  }, []);

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
    const resumeText = (selectedResume?.resume_text || '').trim();
    analyzeKeywordsAPI({
      job_description: jobDescription.trim(),
      resume_id: selectedResume.id,
      ...(resumeText.length > 0 ? { resume_text: resumeText } : {}),
    })
      .then(({ data }) => setKeywordMatch({ matched_count: data?.matched_count ?? 0, total_keywords: data?.total_keywords ?? 0, percent: data?.percent ?? 0 }))
      .catch(() => setKeywordMatch(null));
  }, [view, jobDescription, selectedResume?.id, selectedResume?.resume_text, keywordRefreshTick]);

  // Load detailed keyword scoring from the selected resume record (set by backend at generation time).
  useEffect(() => {
    setKeywordDetails(selectedResume?.keyword_details ?? null);
  }, [selectedResume?.id, selectedResume?.keyword_details]);

  profileRef.current = profile;
  designConfigRef.current = designConfig;

  useEffect(() => {
    getResumeTemplatesAPI()
      .then(({ data }) => setTemplates(Array.isArray(data?.templates) ? data.templates : []))
      .catch(() => setTemplates([]));
  }, []);

  // Sync editable title when selected resume changes
  useEffect(() => {
    if (selectedResume?.resume_name) {
      setResumeTitleValue(selectedResume.resume_name);
    } else {
      setResumeTitleValue(computeDefaultResumeName(profile));
    }
    setIsTitleEditing(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResume?.id, selectedResume?.resume_name]);

  // For no-resume case: update default title when profile firstName or experiences load in
  useEffect(() => {
    if (!selectedResume && !isTitleEditing) {
      setResumeTitleValue(computeDefaultResumeName(profile));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.firstName, profile.experiences?.length, selectedResume]);

  useEffect(() => {
    const saved = selectedResume?.design_config;
    if (saved && typeof saved === 'object' && Object.keys(saved).length > 0) {
      setDesignConfig((prev) => ({ ...prev, ...saved }));
    }
    const savedSectionsOrder = selectedResume?.sections_order;
    if (Array.isArray(savedSectionsOrder) && savedSectionsOrder.length > 0) {
      setDesignConfig((prev) => ({ ...prev, sections_order: savedSectionsOrder }));
    }
  }, [selectedResume]);

  const handleDesignChange = useCallback((changes) => {
    setDesignConfig((prev) => {
      const updated = { ...prev, ...changes };
      designConfigRef.current = updated;
      // Debounced persist
      if (designSaveTimeoutRef.current) clearTimeout(designSaveTimeoutRef.current);
      const selId = selectedResumeIdRef.current;
      if (selId && selId > 0) {
        designSaveTimeoutRef.current = setTimeout(() => {
          designSaveTimeoutRef.current = null;
          updateResumeDesignAPI(selId, designConfigRef.current, designConfigRef.current.template_id).catch(() => {});
        }, 600);
      }
      return updated;
    });
  }, []);

  const handleSectionsOrderChange = useCallback((newOrder) => {
    handleDesignChange({ sections_order: newOrder });
  }, [handleDesignChange]);

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
      return saveResumeSnapshotAPI(selId, payload).catch(() => {});
    }
    return Promise.resolve();
  }, []);

  const scheduleProfilePatch = useCallback(() => {
    if (profilePatchTimeoutRef.current) clearTimeout(profilePatchTimeoutRef.current);
    profilePatchTimeoutRef.current = setTimeout(() => {
      profilePatchTimeoutRef.current = null;
      saveAndRefreshPreview();
    }, 700);
  }, [saveAndRefreshPreview]);

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

  const handleTailorFromProfile = useCallback(() => {
    tailorBaseResumeIdRef.current = null;
    setView('generating');
  }, []);

  const handleTailorFromExistingResume = useCallback((resume) => {
    tailorBaseResumeIdRef.current = resume.id;
    setSelectedResumeId(resume.id);
    setView('generating');
  }, []);

  const handleDownload = async () => {
    if (!workspaceLoaded) return;
    setDownloading(true);
    try {
      // Always generate a fresh PDF using the current editor profile so the download
      // matches exactly what the user sees in the live preview, even without a JD.
      const { data: blob } = await previewResumeAPI({
        job_title: jobRole?.trim() || selectedResume?.resume_name || 'Resume',
        job_description: jobDescription?.trim() || '',
        template_id: designConfig.template_id || 'classic',
        font_family: designConfig.font_family,
        font_size: designConfig.font_size,
        line_height: designConfig.line_height,
        design_config: designConfig,
        profile_override: profileRef.current,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (selectedResume?.resume_name?.replace(/\s/g, '_') || 'resume') + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveAndUse = async () => {
    if (!selectedResume) return;
    // Flush any pending debounce — persist edits to the snapshot before download/close.
    if (profilePatchTimeoutRef.current) {
      clearTimeout(profilePatchTimeoutRef.current);
      profilePatchTimeoutRef.current = null;
    }
    await saveAndRefreshPreview();
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

  const handleSave = async () => {
    if (isSaving) return;
    if (profilePatchTimeoutRef.current) {
      clearTimeout(profilePatchTimeoutRef.current);
      profilePatchTimeoutRef.current = null;
    }
    setIsSaving(true);
    try {
      if (selectedResume) {
        await saveAndRefreshPreview();
        fetchResumes(setResumes);
      } else {
        // No resume yet (coming from "Start from profile") — create one from current profile
        const title = (resumeTitleValue || '').trim() || computeDefaultResumeName(profileRef.current);
        const { data } = await generateResumeAPI({
          job_title: title,
          job_description: '',
          template_id: designConfigRef.current?.template_id || 'classic',
          font_family: designConfigRef.current?.font_family,
          font_size: designConfigRef.current?.font_size,
          line_height: designConfigRef.current?.line_height,
          profile_override: profileRef.current,
        });
        fetchResumes(setResumes);
        if (data?.resume_id) {
          setSelectedResumeId(data.resume_id);
          setView('preview');
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameResume = async (newName) => {
    const name = (newName || '').trim();
    if (!name) return;
    setResumeTitleValue(name);
    setIsTitleEditing(false);
    if (selectedResume) {
      try {
        await renameResumeAPI(selectedResume.id, name);
        setResumes((prev) => prev.map((r) => r.id === selectedResume.id ? { ...r, resume_name: name } : r));
      } catch (err) {
        console.error('Rename failed:', err);
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
    const curPt = parseFloat(designConfig.font_size) || 11;
    const curLH = parseFloat(designConfig.line_height) || 1.2;

    // Clamp to safe range and round cleanly
    const newPt = Math.min(13.5, Math.max(8, curPt * ratio));
    const newLH = Math.min(1.6, Math.max(1.0, curLH * ratio));
    handleDesignChange({
      font_size: `${Math.round(newPt * 2) / 2}pt`,
      line_height: `${Math.round(newLH * 20) / 20}`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designConfig.font_size, designConfig.line_height]);

  // Tailor More: re-run AI generation with current JD to push keyword match above 90%
  const handleTailorMore = async () => {
    if (!jobDescription?.trim() || !selectedResume) return;
    setTailoring(true);
    try {
      const { data: gen } = await generateResumeAPI({
        job_title: jobRole?.trim() || 'Resume',
        job_description: jobDescription.trim(),
        template_id: designConfig.template_id || 'classic',
        font_family: designConfig.font_family,
        font_size: designConfig.font_size,
        line_height: designConfig.line_height,
        resume_id: selectedResume.id,
        profile_override: profileRef.current,
      });
      // Reload workspace to pick up updated resume_text / snapshot (same id when updating in place)
      const { data: ws } = await getResumeWorkspaceAPI();
      const list = Array.isArray(ws?.resumes) ? ws.resumes : [];
      setResumes(list);
      const newId = gen?.resume_id ?? selectedResume.id;
      if (newId != null) setSelectedResumeId(newId);
      const updated = list.find((r) => r.id === newId);
      if (updated?.resume_profile_snapshot) {
        setProfile(updated.resume_profile_snapshot);
      }
      // Re-run keyword analysis (also covered by resume_text dependency after setResumes)
      setKeywordRefreshTick((t) => t + 1);
    } catch (err) {
      console.error('Tailor more failed:', err);
    } finally {
      setTailoring(false);
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
  const handleGenerateNew = () => navigate('/resume-generator');

  const tailorSelectView = (
    <Box sx={{ minHeight: '100vh', bgcolor: THEME.pageBg, fontFamily: 'var(--font-family)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ bgcolor: THEME.surface, borderBottom: `1px solid ${THEME.border}`, px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 1.5, flexShrink: 0 }}>
        <PageBreadcrumb
          sx={{ mb: 0 }}
          items={[
            { label: 'AI Resume Studio', to: '/ai-resume-studio', showBackIcon: true },
            { label: 'Tailor Resume' },
          ]}
        />
      </Box>

      <Box sx={{ flex: 1, maxWidth: 860, width: '100%', mx: 'auto', px: { xs: 2, sm: 3, md: 4, lg: 5 }, pt: { xs: 3, sm: 4 }, pb: 10 }}>
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            bgcolor: THEME.primarySoft,
            border: `1px solid rgba(51, 94, 222, 0.2)`,
            borderRadius: 2,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <AutoAwesomeRoundedIcon sx={{ fontSize: 17, color: THEME.primary }} />
            <Chip
              label="Job from Chrome Extension"
              size="small"
              sx={{
                height: 20,
                bgcolor: THEME.primarySoft,
                color: THEME.primary,
                fontWeight: 700,
                fontSize: '0.65rem',
                fontFamily: 'var(--font-family)',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          </Box>
          {jobRole && (
            <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '1rem', color: THEME.textPrimary, mb: 0.5 }}>
              {jobRole}
            </Typography>
          )}
          <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.8125rem', color: THEME.textSecondary, lineHeight: 1.5 }}>
            {jobDescription.length > 220 ? `${jobDescription.slice(0, 220)}…` : jobDescription}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              color: THEME.textPrimary,
              mb: 0.5,
            }}
          >
            Create a tailored resume
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.95rem', color: THEME.textSecondary }}>
            Choose how to start — we&apos;ll tailor it to the job description above.
          </Typography>
        </Box>

        <Box
          onClick={handleTailorFromProfile}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            p: 2.5,
            mb: 2.5,
            bgcolor: THEME.surface,
            border: `1px solid ${THEME.border}`,
            borderRadius: 2,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s, border-color 0.2s',
            '&:hover': {
              borderColor: 'rgba(51, 94, 222, 0.35)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              '& .ts-profile-arrow': { transform: 'translateX(4px)', color: THEME.primary },
              '& .ts-profile-icon': { bgcolor: THEME.primarySoft },
            },
          }}
        >
          <Box
            className="ts-profile-icon"
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: THEME.primarySoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <PersonOutlineRoundedIcon sx={{ fontSize: 26, color: THEME.primary }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.375, flexWrap: 'wrap' }}>
              <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '0.98rem', color: THEME.textPrimary }}>
                Start from my profile
              </Typography>
              <Chip
                label="Recommended"
                size="small"
                sx={{
                  height: 20,
                  bgcolor: THEME.primarySoft,
                  color: THEME.primary,
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-family)',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
            <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.875rem', color: THEME.textSecondary, lineHeight: 1.5 }}>
              Generate a fresh resume from your profile, tailored to this job.
            </Typography>
          </Box>
          <ChevronRightRoundedIcon className="ts-profile-arrow" sx={{ fontSize: 22, color: THEME.textSecondary, flexShrink: 0, transition: 'all 0.18s', opacity: 0.85 }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: THEME.border }} />
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: THEME.textSecondary,
              fontFamily: 'var(--font-family)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            or tailor from existing
          </Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: THEME.border }} />
        </Box>

        <Box
          sx={{
            bgcolor: THEME.surface,
            border: `1px solid ${THEME.border}`,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              pt: 2.5,
              pb: 2,
              borderBottom: `1px solid ${THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: THEME.primarySoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 17, color: THEME.primary }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '0.9375rem', color: THEME.textPrimary, lineHeight: 1.2 }}>
                  Tailor an existing resume
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.78rem', color: THEME.textSecondary, lineHeight: 1.2 }}>
                  Select a base resume to retailor for this job
                </Typography>
              </Box>
            </Box>
            {resumes.length > 0 && (
              <Chip
                label={`${resumes.length} resume${resumes.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  height: 22,
                  bgcolor: '#f1f5f9',
                  color: THEME.textSecondary,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-family)',
                }}
              />
            )}
          </Box>

          <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.25, borderBottom: `1px solid ${THEME.border}`, bgcolor: THEME.surface }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name…"
              value={tailorSelectSearch}
              onChange={(e) => setTailorSelectSearch(e.target.value)}
              hiddenLabel
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: THEME.textSecondary }} />
                  </InputAdornment>
                ),
                sx: {
                  height: 36,
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.8125rem',
                  borderRadius: 1,
                  bgcolor: THEME.surface,
                  pl: 0.5,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: THEME.mutedBorder },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(51, 94, 222, 0.35)' },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1, borderColor: THEME.primary },
              }}
            />
          </Box>

          <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
            {resumes.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 32, color: THEME.border, mb: 1 }} />
                <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.9rem', color: THEME.textSecondary, fontWeight: 500 }}>
                  No generated resumes yet
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.8rem', color: THEME.textSecondary, mt: 0.5, opacity: 0.85 }}>
                  Use &quot;Start from my profile&quot; above to create one
                </Typography>
              </Box>
            ) : (
              resumes
                .filter((r) => (r.resume_name || '').toLowerCase().includes(tailorSelectSearch.toLowerCase()))
                .map((r, idx, arr) => {
                  const [bgColor, textColor] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const initials = getResumeInitials(r.resume_name);
                  return (
                    <Box
                      key={r.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        px: { xs: 2, sm: 2.5 },
                        py: 1.75,
                        borderBottom: idx < arr.length - 1 ? `1px solid ${THEME.border}` : 'none',
                        transition: 'background-color 0.15s ease',
                        '&:hover': { bgcolor: 'rgba(248, 250, 252, 0.85)' },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '10px',
                          bgcolor: bgColor,
                          color: textColor,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-family)',
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography noWrap sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '0.8125rem', color: THEME.textPrimary, lineHeight: 1.3 }}>
                          {r.resume_name}
                        </Typography>
                        <Chip
                          label="Generated"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            bgcolor: THEME.primarySoft,
                            color: THEME.primary,
                            fontFamily: 'var(--font-family)',
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        onClick={() => handleTailorFromExistingResume(r)}
                        sx={{
                          height: 36,
                          minHeight: 36,
                          textTransform: 'none',
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          bgcolor: THEME.primary,
                          borderRadius: 1,
                          px: 1.75,
                          '&:hover': { bgcolor: THEME.primaryDark, boxShadow: 'none' },
                        }}
                      >
                        Tailor this →
                      </Button>
                    </Box>
                  );
                })
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const generatingView = (
    <Box sx={{ minHeight: '100vh', bgcolor: THEME.pageBg, overflowX: 'hidden', fontFamily: 'var(--font-family)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ bgcolor: THEME.surface, borderBottom: `1px solid ${THEME.border}`, px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 1.5, flexShrink: 0 }}>
        <PageBreadcrumb
          sx={{ mb: 0 }}
          items={[
            { label: 'AI Resume Studio', to: '/ai-resume-studio', showBackIcon: true },
            { label: 'Generating resume' },
          ]}
        />
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: 8 }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            bgcolor: THEME.surface,
            border: `1px solid ${THEME.border}`,
            borderRadius: 2,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              bgcolor: THEME.primarySoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ color: THEME.primary, fontSize: 32 }} />
          </Box>
          <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.35rem' }, color: THEME.textPrimary, mb: 0.75 }}>
            Creating your resume{jobRole ? ` for ${jobRole}` : ''}
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.9rem', color: THEME.textSecondary, mb: 3, lineHeight: 1.5 }}>
            Tailoring content and skills to match the job description.
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              width: '100%',
              height: 8,
              borderRadius: 1,
              bgcolor: 'rgba(15, 23, 42, 0.06)',
              '& .MuiLinearProgress-bar': { borderRadius: 1, bgcolor: THEME.primary },
            }}
          />
          <Typography variant="caption" sx={{ fontFamily: 'var(--font-family)', color: THEME.textSecondary, mt: 1.5, display: 'block' }}>
            {Math.round(Math.min(progress, 100))}% complete
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const previewView = (
    <>
      <Box sx={{ minHeight: '100%', bgcolor: THEME.pageBg, overflowX: 'hidden', fontFamily: 'var(--font-family)' }}>
        <Box data-resume-preview-container sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: { md: '100vh' }, overflow: 'hidden', bgcolor: THEME.pageBg }}>
          <Box sx={{ width: { xs: '100%', md: `${leftPanelWidth}%` }, minWidth: { md: 280 }, height: { md: '100vh' }, display: 'flex', flexDirection: 'column' }}>
            <EditorPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedResume={selectedResume}
              jobDescription={jobDescription}
              jobRole={jobRole}
              profile={profile}
              setProfile={setProfile}
              designConfig={designConfig}
              templates={templates}
              extensionBannerDismissed={extensionBannerDismissed}
              downloading={downloading}
              tailoring={tailoring}
              goToInput={goToInput}
              confirmDelete={confirmDelete}
              handleGenerateNew={handleGenerateNew}
              handleAutoFit={handleAutoFit}
              handleDownload={handleDownload}
              handleSaveAndUse={handleSaveAndUse}
              handleSave={handleSave}
              isSaving={isSaving}
              resumeTitleValue={resumeTitleValue}
              setResumeTitleValue={setResumeTitleValue}
              isTitleEditing={isTitleEditing}
              setIsTitleEditing={setIsTitleEditing}
              handleRenameResume={handleRenameResume}
              setJdDialogMode={setJdDialogMode}
              setShowJdUploadDialog={setShowJdUploadDialog}
              scheduleProfilePatch={scheduleProfilePatch}
              handleDesignChange={handleDesignChange}
              handleSectionsOrderChange={handleSectionsOrderChange}
              setExtensionBannerDismissedAndStore={setExtensionBannerDismissedAndStore}
              handleTailorMore={handleTailorMore}
              selectedResumeId={selectedResumeId}
            />
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
              '&:hover': { bgcolor: 'rgba(51, 94, 222, 0.1)' },
            }}
            aria-label="Resize panels"
          />
          <PreviewPanel
            profile={profile}
            designConfig={designConfig}
            jobRole={jobRole}
            jobDescription={jobDescription}
            tailoring={tailoring}
            keywordDetails={keywordDetails}
            keywordMatch={keywordMatch}
            setJdDialogMode={setJdDialogMode}
            setShowJdUploadDialog={setShowJdUploadDialog}
          />
        </Box>
      </Box>

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
      {view === 'tailor-select' && tailorSelectView}
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
        <DialogTitle sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', pb: 0.5 }}>
          {jdDialogMode === 'error' ? 'Job Description Not Found' : 'Tailor Resume to a Job'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'var(--font-family)', mb: 2 }}>
            {jdDialogMode === 'error'
              ? "We couldn't extract the job description from the page. Paste it below and we'll tailor your resume to it."
              : 'Enter the role and job description you\'re targeting. AI will rewrite and tailor your resume to maximize keyword matches.'}
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
