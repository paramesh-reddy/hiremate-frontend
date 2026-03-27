/**
 * Issue Report API — submit and manage bug reports / feature requests.
 */
import axiosClient from './axiosClient';

/**
 * Submit a new issue (works for both logged-in and anonymous users).
 * @param {{ title, description, category, source, metadata }} payload
 */
export const createIssueAPI = (payload) =>
  axiosClient.post('/issues', payload);

/**
 * Upload a screenshot for an existing issue.
 * @param {number} issueId
 * @param {File} file
 */
export const uploadIssueScreenshotAPI = (issueId, file) => {
  const form = new FormData();
  form.append('file', file);
  return axiosClient.post(`/issues/${issueId}/screenshot`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ---------- Admin endpoints ----------

export const listIssuesAPI = (params = {}) =>
  axiosClient.get('/issues', { params });

export const getIssueAPI = (issueId) =>
  axiosClient.get(`/issues/${issueId}`);

export const updateIssueStatusAPI = (issueId, status) =>
  axiosClient.patch(`/issues/${issueId}/status`, { status });
