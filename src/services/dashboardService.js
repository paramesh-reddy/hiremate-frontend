import { dedupGet } from './axiosClient';

export const getDashboardSummaryAPI = (options = {}) => {
  const { limit = 5, days = 7, from_date, to_date } = options;
  const params = { limit };
  if (from_date && to_date) {
    params.from_date = from_date;
    params.to_date = to_date;
  } else {
    params.days = days;
  }
  return dedupGet('/dashboard/summary', { params });
};
