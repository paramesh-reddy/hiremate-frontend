import axiosClient from './axiosClient';

/** @param {string|{status?: string, from_date?: string, to_date?: string}} [options] */
export const listJobsAPI = (options) => {
  const params = {};
  if (typeof options === 'string') {
    if (options) params.status = options;
  } else if (options && typeof options === 'object') {
    if (options.status) params.status = options.status;
    if (options.from_date) params.from_date = options.from_date;
    if (options.to_date) params.to_date = options.to_date;
  }
  return axiosClient.get('/chrome-extension/jobs', Object.keys(params).length ? { params } : {});
};

export const getJobAPI = (jobId) =>
  axiosClient.get(`/chrome-extension/jobs/${jobId}`);

export const updateJobStatusAPI = (jobId, applicationStatus) =>
  axiosClient.patch(`/chrome-extension/jobs/${jobId}`, { application_status: applicationStatus });

/** @param {Object} payload - { company, position_title, location, job_posting_url, notes, application_status } */
export const createJobAPI = (payload) =>
  axiosClient.post('/chrome-extension/jobs', payload);
