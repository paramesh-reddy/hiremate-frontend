import axiosClient from './axiosClient';

export const listApplicationsAPI = () => axiosClient.get('/applications');
export const getApplicationAPI = (id) => axiosClient.get(`/applications/${id}`);
export const createApplicationAPI = (data) => axiosClient.post('/applications', data);
export const createApplicationFromJDAPI = (data) => axiosClient.post('/applications/from-jd', data);
export const updateApplicationAPI = (id, data) => axiosClient.patch(`/applications/${id}`, data);
export const deleteApplicationAPI = (id) => axiosClient.delete(`/applications/${id}`);
export const withdrawApplicationAPI = (id) => axiosClient.patch(`/applications/${id}/withdraw`);

export const triggerSyncAPI = (fromDate, toDate) => {
  const params = new URLSearchParams();
  if (fromDate) params.append('from_date', fromDate);
  if (toDate) params.append('to_date', toDate);
  return axiosClient.post(`/sync?${params.toString()}`);
};
export const getSyncStatusAPI = () => axiosClient.get('/sync/status');
export const stopSyncAPI = () => axiosClient.post('/sync/stop');
