import axiosClient from './axiosClient';

/**
 * GET profile - fetches full profile data from backend.
 */
export const getProfileDataAPI = () =>
  axiosClient.get('/profile');

/**
 * PATCH profile - sends full profile data to backend.
 */
export const patchProfileAPI = (data) =>
  axiosClient.patch('/profile', data);

/**
 * POST chrome-extension/profile/invalidate-field-answers - invalidates cached field mappings
 * when profile changes so autofill uses fresh profile values. Call after profile save.
 * @param {string[]} [profileKeysChanged] - specific keys changed, or omit for full refresh
 */
export const invalidateFieldAnswersAPI = (profileKeysChanged = null) =>
  axiosClient.post('/chrome-extension/profile/invalidate-field-answers', {
    profile_keys_changed: profileKeysChanged || undefined,
  });
