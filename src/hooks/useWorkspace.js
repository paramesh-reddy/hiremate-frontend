import { useState, useEffect } from 'react';
import { getResumeWorkspaceAPI } from '../services';

export function useWorkspace() {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    getResumeWorkspaceAPI()
      .then(({ data }) => {
        setWorkspace({
          resumes: Array.isArray(data?.resumes) ? data.resumes : [],
          tailor_context: data?.tailor_context ?? null,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { workspace, loading, error, refresh: load };
}
