import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useResumeGeneratorParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Functional updates + stable callbacks so consumers can safely list this hook in useEffect deps.
  const setResumeId = useCallback((id) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id != null && id !== '') next.set('resume_id', String(id));
      else next.delete('resume_id');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setView = useCallback((v) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', v);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearTailorParams = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('tailor');
      next.delete('job_id');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return useMemo(
    () => ({
      tailor: searchParams.get('tailor') === '1',
      jobId: searchParams.get('job_id') || null,
      resumeId: searchParams.get('resume_id') || null,
      view: searchParams.get('view') || 'inputs',
      source: searchParams.get('source') || 'app',
      setResumeId,
      setView,
      clearTailorParams,
    }),
    [searchParams, setResumeId, setView, clearTailorParams]
  );
}
