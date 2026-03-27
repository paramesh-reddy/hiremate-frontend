import { useSearchParams } from 'react-router-dom';

export function useResumeGeneratorParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    // Getters - read from URL
    tailor:   searchParams.get('tailor') === '1',
    jobId:    searchParams.get('job_id') || null,
    resumeId: searchParams.get('resume_id') || null,
    view:     searchParams.get('view') || 'inputs',
    source:   searchParams.get('source') || 'app',

    // Setters - update URL (source of truth for resume selection and view)
    setResumeId: (id) => {
      const newParams = new URLSearchParams(searchParams);
      if (id) newParams.set('resume_id', String(id));
      else newParams.delete('resume_id');
      setSearchParams(newParams, { replace: true });
    },

    setView: (v) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('view', v);
      setSearchParams(newParams, { replace: true });
    },

    clearTailorParams: () => {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tailor');
      newParams.delete('job_id');
      setSearchParams(newParams, { replace: true });
    },
  };
}
