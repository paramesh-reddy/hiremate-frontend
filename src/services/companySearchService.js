import axiosClient from './axiosClient';
import { BASE_URL } from '../utilities/const';

export const parseFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosClient.post('/company-search/parse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const resolveLinks = (payload) =>
  axiosClient.post('/company-search/links', payload);

export const streamJobs = async (payload, onEvent, onComplete, onError) => {
  const token = localStorage.getItem('token');
  let response;
  try {
    response = await fetch(`${BASE_URL}/company-search/jobs/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    onError(err);
    return;
  }

  if (response.status === 401) {
    onError('Session expired. Please log in again.');
    return;
  }

  if (!response.ok) {
    try {
      const body = await response.json();
      onError(new Error(body?.detail || `HTTP ${response.status}`));
    } catch {
      onError(new Error(`HTTP ${response.status}`));
    }
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;
        try {
          const event = JSON.parse(raw);
          if (event.status === 'complete') {
            onComplete();
            return;
          }
          onEvent(event);
        } catch {
          // skip malformed lines
        }
      }
    }
    onComplete();
  } catch (err) {
    reader.cancel().catch(() => {});
    onError(err);
  }
};
