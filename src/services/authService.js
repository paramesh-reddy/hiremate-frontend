import axiosClient from './axiosClient';
import { BASE_URL } from '../utilities/const';

// login API
export const loginAPI = (data) =>
  axiosClient.post('/auth/login', data);

// register API
export const registerAPI = (data) =>
  axiosClient.post('/auth/register', data);

// get profile
export const getProfileAPI = () =>
  axiosClient.get('/auth/profile');

// Redirect to Google OAuth
export const startGoogleLogin = () => {
  window.location.href = `${BASE_URL}/auth/google`;
};
