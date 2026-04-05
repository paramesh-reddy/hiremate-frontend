import axiosClient from './axiosClient';

/**
 * Fetches an AI-generated company briefing for a specific application.
 * Returns Overview, Culture, Timeline, and Prep Topics.
 */
export const getCompanyBriefingAPI = (applicationId) => {
  return axiosClient.get('/mock-interview/briefing', {
    params: { application_id: applicationId }
  });
};

const briefingService = {
  getCompanyBriefing: getCompanyBriefingAPI,
};

export default briefingService;
