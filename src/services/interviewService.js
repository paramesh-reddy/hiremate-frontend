import axiosClient from './axiosClient';

/**
 * Fetches applications from the tracker using official backend enum values.
 * Only pulls applications currently in an interview-related state.
 */
export const getInterviewApplicationsAPI = (statuses = ['interview_scheduled', 'interview_completed']) => {
  return axiosClient.get('/applications', { 
    params: { status: statuses.join(',') } 
  });
};

/**
 * Fetches tailored interview questions for a specific application.
 */
export const getInterviewQuestionsAPI = (applicationId) => {
  return axiosClient.get(`/mock-interview/questions`, {
    params: { application_id: applicationId }
  });
};

/**
 * Triggers the generation of 5 additional unique questions for the given application.
 */
export const loadMoreInterviewQuestionsAPI = (applicationId, category = null) => {
  return axiosClient.post(`/mock-interview/load-more`, null, {
    params: { 
      application_id: applicationId,
      category: category
    }
  });
};

/**
 * Sends a single interview answer to the AI for STAR evaluation.
 */
export const evaluateInterviewAnswerAPI = (applicationId, question, answer) => {
  return axiosClient.post(`/mock-interview/session/evaluate`, {
    application_id: applicationId,
    question,
    answer
  });
};

/**
 * Saves a completed interview session to the database.
 */
export const saveInterviewSessionAPI = (applicationId, sessionData) => {
  return axiosClient.post(`/mock-interview/session/save`, {
    application_id: applicationId,
    ...sessionData
  });
};

/**
 * Fetches the full details of a specific interview session.
 */
export const getInterviewSessionDetailAPI = (sessionId) => {
  return axiosClient.get(`/mock-interview/session/${sessionId}`);
};

/**
 * Fetches the user's past interview session history.
 */
export const getInterviewHistoryAPI = () => {
  return axiosClient.get(`/mock-interview/history`);
};

const interviewService = {
  getInterviewApplications: getInterviewApplicationsAPI,
  getInterviewQuestions: getInterviewQuestionsAPI,
  loadMoreQuestions: loadMoreInterviewQuestionsAPI,
  evaluateAnswer: evaluateInterviewAnswerAPI,
  saveSession: saveInterviewSessionAPI,
  getHistory: getInterviewHistoryAPI,
  getSessionDetail: getInterviewSessionDetailAPI,
};

export default interviewService;
