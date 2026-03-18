import axios from 'axios';
import { BASE_URL } from '../utilities/const';

const _inflight = new Map();

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every outgoing request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Refresh-token logic ----------
let _isRefreshing = false;
let _refreshSubscribers = []; // queued requests waiting for a new token

function _onRefreshed(newToken) {
  _refreshSubscribers.forEach((cb) => cb(newToken));
  _refreshSubscribers = [];
}

function _waitForRefresh() {
  return new Promise((resolve) => {
    _refreshSubscribers.push(resolve);
  });
}

async function _doRefresh() {
  const currentToken = localStorage.getItem('token');
  // POST /auth/refresh — the backend accepts the current (even expired) token
  const res = await axios.post(
    `${BASE_URL}/auth/refresh`,
    {},
    { headers: { Authorization: `Bearer ${currentToken}` } }
  );
  const newToken = res.data?.access_token ?? res.data?.token;
  if (!newToken) throw new Error('No token in refresh response');
  localStorage.setItem('token', newToken);
  // Also update access_token key used by the extension
  localStorage.setItem('access_token', newToken);
  return newToken;
}

// Response interceptor: 401 → refresh → retry once
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true; // prevent infinite retry loops

      if (_isRefreshing) {
        // Another request already triggered a refresh — queue and wait
        try {
          const newToken = await _waitForRefresh();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        } catch {
          return Promise.reject(error);
        }
      }

      _isRefreshing = true;

      try {
        const newToken = await _doRefresh();
        _onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear auth and let the app handle logout
        _refreshSubscribers = [];
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export async function dedupGet(url, config = {}) {
  const key = url + JSON.stringify(config.params || {});
  if (_inflight.has(key)) return _inflight.get(key);
  const promise = axiosClient.get(url, config).finally(() => _inflight.delete(key));
  _inflight.set(key, promise);
  return promise;
}

export default axiosClient;
