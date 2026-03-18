/**
 * Service layer barrel - re-exports all API services for consistent imports.
 */
export {
  loginAPI,
  registerAPI,
  getProfileAPI,
} from './authService';

export {
  getDashboardSummaryAPI,
  getSavedJobsAPI,
} from './dashboardService';

export {
  listJobsAPI,
  getJobAPI,
  updateJobStatusAPI,
  createJobAPI,
} from './jobsService';

export {
  createOrderAPI,
  verifyPaymentAPI,
} from './paymentService';

export {
  getProfileDataAPI,
  patchProfileAPI,
  invalidateFieldAnswersAPI,
} from './profileService';

export {
  getAdminOverviewAPI,
  getAdminUsersAPI,
  getAdminUserUsageAPI,
  getAdminCompaniesViewedAPI,
  getAdminCareerPageLinksAPI,
  getAdminLearningFormStructuresAPI,
  getAdminLearningUserAnswersAPI,
  getAdminLearningSubmissionsAPI,
  getAdminExtensionErrorsAPI,
  getAdminSubmissionLogsAPI,
  getAdminSubmissionLogDetailAPI,
} from './adminService';

export {
  getResumeWorkspaceAPI,
  listResumesAPI,
  generateResumeAPI,
  previewResumeAPI,
  previewResumeHtmlAPI,
  updateResumeAPI,
  deleteResumeAPI,
  uploadResumeAPI,
  atsScanResumeAPI,
  analyzeResumeAPI,
  analyzeKeywordsAPI,
  saveResumeSnapshotAPI,
} from './resumeService';

export { default as axiosClient } from './axiosClient';
