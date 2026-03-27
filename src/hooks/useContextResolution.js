import { useEffect, useState } from 'react';
import { getJobAPI } from '../services';

/**
 * Resolves the initial action for the resume generator build screen based on URL params
 * and workspace data. Implements the decision matrix from section 5 of the spec.
 *
 * Priority order:
 * 1. Explicit resume_id in URL → OPEN_PREVIEW
 * 2. tailor=1 + job_id matches existing resume → OPEN_PREVIEW (de-dupe)
 * 3. tailor=1 + live tailor_context in workspace → CONTEXT_RESOLVED
 * 4. tailor=1 + valid job_id → fetch job → CONTEXT_RESOLVED
 * 5. tailor=1 + no JD found → NO_CONTEXT_FOUND
 * 6. No tailor, resumes exist → OPEN_PREVIEW (most recent)
 * 7. Truly fresh → PARAMS_PARSED (show inputs)
 */
export function useContextResolution(params, workspace) {
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspace) return;

    async function resolve() {
      const { resumeId, tailor, jobId } = params;
      const resumes = workspace.resumes || [];

      // Priority 1: Explicit resume_id in URL
      if (resumeId && resumes.find((r) => r.id === parseInt(resumeId, 10))) {
        setAction({ type: 'OPEN_PREVIEW', resumeId: parseInt(resumeId, 10) });
        setLoading(false);
        return;
      }

      // Priority 2: tailor=1 AND same job_id as existing resume
      if (tailor && jobId) {
        const existing = resumes.find((r) => r.job_id === parseInt(jobId, 10));
        if (existing) {
          setAction({ type: 'OPEN_PREVIEW', resumeId: existing.id });
          setLoading(false);
          return;
        }
      }

      // Priority 3: tailor=1 AND workspace has live tailor_context
      if (tailor && workspace.tailor_context?.job_description) {
        const ctx = workspace.tailor_context;
        setAction({
          type: 'CONTEXT_RESOLVED',
          jobId: ctx.job_id,
          jd: ctx.job_description,
          title: ctx.job_title,
        });
        setLoading(false);
        return;
      }

      // Priority 4: tailor=1 AND valid job_id param — fetch job
      if (tailor && jobId) {
        try {
          const { data: job } = await getJobAPI(jobId);
          const jd = job?.job_description?.trim();
          if (jd && jd.length >= 50) {
            setAction({
              type: 'CONTEXT_RESOLVED',
              jobId: job.id,
              jd,
              title: job.position_title || '',
            });
            setLoading(false);
            return;
          }
        } catch {
          // Job not found — fall through to next priority
        }
      }

      // Priority 5: tailor=1 AND no JD found anywhere
      if (tailor) {
        setAction({ type: 'NO_CONTEXT_FOUND' });
        setLoading(false);
        return;
      }

      // Priority 6: No tailor, resumes exist — open most recent
      if (resumes.length > 0) {
        setAction({ type: 'OPEN_PREVIEW', resumeId: resumes[0].id });
        setLoading(false);
        return;
      }

      // Priority 7: Truly fresh — show inputs
      setAction({ type: 'PARAMS_PARSED', params });
      setLoading(false);
    }

    resolve();
  // Only re-run when workspace or tailor-related params change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, params.tailor, params.jobId, params.resumeId]);

  return { action, loading };
}
