import { dedupGet } from './axiosClient';
import axiosClient from './axiosClient';

/**
 * Upload resume file to parse. Uses baseURL from const (http://127.0.0.1:8000/api).
 * Token is attached from localStorage via axiosClient interceptor.
 */
export const uploadResumeAPI = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosClient.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getResumeWorkspaceAPI = () => dedupGet('/resume/workspace');

export const listResumesAPI = () => axiosClient.get('/resume/list');

export const generateResumeAPI = ({
  job_title,
  job_description,
  template_id,
  font_family,
  font_size,
  line_height,
  profile_override,
  resume_id,
}) =>
  axiosClient.post('/resume/generate', {
    job_title,
    job_description,
    template_id: template_id || 'classic',
    font_family: font_family || undefined,
    font_size: font_size || undefined,
    line_height: line_height || undefined,
    profile_override: profile_override || undefined,
    resume_id: resume_id && resume_id > 0 ? resume_id : undefined,
  });

/**
 * Live HTML preview — same Jinja2 templates as PDF, no WeasyPrint (~50ms).
 * profile_override: current editor state passed directly so preview reflects unsaved edits instantly.
 * Returns the rendered HTML string.
 */
export const previewResumeHtmlAPI = ({ job_title, job_description, template_id, font_family, font_size, line_height, profile_override }, config = {}) =>
  axiosClient.post(
    '/resume/preview-html',
    {
      job_title,
      job_description,
      template_id: template_id || 'classic',
      font_family: font_family || undefined,
      font_size: font_size || undefined,
      line_height: line_height || undefined,
      profile_override: profile_override || undefined,
    },
    config
  );

/**
 * Download PDF — uses profile_override so the PDF matches the live preview exactly.
 */
export const previewResumeAPI = ({ job_title, job_description, template_id, font_family, font_size, line_height, profile_override }, config = {}) =>
  axiosClient.post(
    '/resume/preview',
    {
      job_title,
      job_description,
      template_id: template_id || 'classic',
      font_family: font_family || undefined,
      font_size: font_size || undefined,
      line_height: line_height || undefined,
      profile_override: profile_override || undefined,
    },
    { responseType: 'blob', ...config }
  );

export const analyzeKeywordsAPI = ({ job_description, resume_id, resume_text, url, page_html }) =>
  axiosClient.post('/chrome-extension/keywords/analyze', {
    job_description,
    resume_id,
    resume_text: resume_text || undefined,
    url: url || undefined,
    page_html: page_html || undefined,
  });

export const updateResumeAPI = (id, { resume_name, resume_text }) =>
  axiosClient.patch(`/resume/${id}`, { resume_name, resume_text });

/**
 * Save per-JD profile snapshot for a specific generated resume.
 * This stores a copy of the profile data customized for that resume's job description,
 * keeping it separate from the global Profile so each JD has its own editable profile.
 */
export const saveResumeSnapshotAPI = (resumeId, profileSnapshot) =>
  axiosClient.patch(`/resume/${resumeId}`, { resume_profile_snapshot: profileSnapshot });

export const deleteResumeAPI = (id) => {
  if (id === 0 || id === '0') {
    return axiosClient.delete('/resume/profile');
  }
  return axiosClient.delete(`/resume/${id}`);
};

/**
 * ATS Scan: upload resume (PDF) + job description, get ATS score and report.
 * Returns { score, file_name, score_categories, searchability_rows, hard_skills_rows, ... }.
 */
export const atsScanResumeAPI = (file, jobDescription) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('job_description', jobDescription || '');
  return axiosClient.post('/resume/ats-scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Resume Analyze: upload resume (PDF), get deep insights (score, top_fixes, issues, did_well).
 */
export const analyzeResumeAPI = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosClient.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
