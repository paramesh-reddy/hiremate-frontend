/**
 * State machine reducer for the Resume Generator build screen.
 * Phase documentation lives in types.js.
 *
 * Each case handles only the transitions valid for that phase;
 * unrecognised actions return the current state unchanged.
 */
export function buildScreenReducer(state, action) {
  switch (state.phase) {
    case 'INIT':
      if (action.type === 'WORKSPACE_LOADED') return { phase: 'RESOLVING_CONTEXT' };
      break;

    case 'RESOLVING_CONTEXT':
      if (action.type === 'CONTEXT_RESOLVED') {
        return {
          phase: 'AUTO_GENERATING',
          jobId: action.jobId,
          jobTitle: action.title,
        };
      }
      if (action.type === 'NO_CONTEXT_FOUND') {
        return { phase: 'JD_DIALOG' };
      }
      if (action.type === 'OPEN_PREVIEW') {
        return { phase: 'PREVIEW_MODE', resumeId: action.resumeId };
      }
      if (action.type === 'PARAMS_PARSED') {
        return { phase: 'JD_DIALOG' };
      }
      break;

    case 'JD_DIALOG':
      if (action.type === 'JD_SUBMITTED') {
        return {
          phase: 'AUTO_GENERATING',
          jobId: '',
          jobTitle: action.title,
        };
      }
      break;

    case 'AUTO_GENERATING':
      if (action.type === 'GENERATION_SUCCESS') {
        return {
          phase: 'PREVIEW_MODE',
          resumeId: action.resume.id,
          keywordScore: action.resume.keyword_score,
        };
      }
      if (action.type === 'GENERATION_FAILED') {
        return {
          phase: 'ERROR',
          code: 'GENERATION_FAILED',
          retryAction: { type: 'GENERATION_STARTED', jobId: '', jobTitle: '' },
        };
      }
      break;

    case 'PREVIEW_MODE':
      if (action.type === 'OPEN_EDITOR') {
        return {
          phase: 'EDITING',
          resumeId: state.resumeId,
          section: action.section,
        };
      }
      if (action.type === 'TAILOR_MORE_CLICKED') {
        return { phase: 'TAILORING', resumeId: state.resumeId };
      }
      if (action.type === 'EXPORT_STARTED') {
        return { phase: 'EXPORT', resumeId: state.resumeId };
      }
      break;

    case 'EDITING':
      if (action.type === 'SECTION_GENERATE_START') {
        return {
          phase: 'SECTION_GENERATING',
          resumeId: state.resumeId,
          section: action.section,
        };
      }
      if (action.type === 'OPEN_PREVIEW') {
        return { phase: 'PREVIEW_MODE', resumeId: action.resumeId };
      }
      break;

    case 'SECTION_GENERATING':
      if (action.type === 'SECTION_GENERATE_DONE') {
        return { phase: 'EDITING', resumeId: state.resumeId };
      }
      break;

    case 'TAILORING':
      if (action.type === 'GENERATION_SUCCESS') {
        return {
          phase: 'PREVIEW_MODE',
          resumeId: action.resume.id,
          keywordScore: action.resume.keyword_score,
        };
      }
      if (action.type === 'GENERATION_FAILED') {
        return {
          phase: 'ERROR',
          code: 'TAILOR_FAILED',
          retryAction: { type: 'TAILOR_MORE_CLICKED' },
        };
      }
      break;

    case 'EXPORT':
      if (action.type === 'EXPORT_COMPLETE') {
        return { phase: 'PREVIEW_MODE', resumeId: state.resumeId };
      }
      break;

    case 'ERROR':
      if (action.type === 'GENERATION_STARTED') {
        return {
          phase: 'AUTO_GENERATING',
          jobId: action.jobId,
          jobTitle: action.jobTitle,
        };
      }
      break;

    default:
      break;
  }

  return state;
}
