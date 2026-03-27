import { useState, useEffect, useRef, useCallback } from 'react';
import { saveResumeSnapshotAPI } from '../services';

/**
 * Manages resume editor state with 300ms debounced auto-save.
 * Call flush() before download or Tailor More to persist immediately.
 */
export function useResumeEditor(resumeId, initialSnapshot) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef(null);
  const pendingSnapshotRef = useRef(snapshot);

  // Keep ref in sync for flush()
  useEffect(() => {
    pendingSnapshotRef.current = snapshot;
  }, [snapshot]);

  // Auto-save with 300ms debounce
  useEffect(() => {
    if (!snapshot || !resumeId) return;

    clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      saveResumeSnapshotAPI(resumeId, pendingSnapshotRef.current)
        .then(() => setSaving(false))
        .catch(() => setSaving(false));
    }, 300);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [snapshot, resumeId]);

  // Flush immediately — call before Tailor More or Download
  const flush = useCallback(async () => {
    if (!resumeId || !pendingSnapshotRef.current) return;
    clearTimeout(saveTimeoutRef.current);
    setSaving(true);
    try {
      await saveResumeSnapshotAPI(resumeId, pendingSnapshotRef.current);
    } finally {
      setSaving(false);
    }
  }, [resumeId]);

  const updateSection = useCallback((section, value) => {
    setSnapshot((prev) => (prev ? { ...prev, [section]: value } : prev));
  }, []);

  return { snapshot, updateSection, saving, flush, setSnapshot };
}
