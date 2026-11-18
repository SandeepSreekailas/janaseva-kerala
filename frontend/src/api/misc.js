import api from './axios';

export const getDepartments = async () => {
  const { data } = await api.get('/departments/');
  return data;
};

export const submitEnquiry = async (enquiryData) => {
  const { data } = await api.post('/contact/', enquiryData);
  return data;
};

export const getNotifications = async (params = {}) => {
  const { data } = await api.get('/notifications/', { params });
  return data;
};

export const markNotificationRead = async (notificationIds) => {
  const payload = Array.isArray(notificationIds)
    ? { notification_ids: notificationIds, ids: notificationIds }
    : notificationIds
    ? { notification_ids: [notificationIds], ids: [notificationIds] }
    : {};
  const { data } = await api.post('/notifications/mark-read/', payload);
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get('/notifications/unread-count/');
  return data;
};

export const analyzeGrievance = async (grievanceData) => {
  const { data } = await api.post('/ai/analyze/', grievanceData);
  return data;
};

export const getAnalytics = async (params = {}) => {
  const { data } = await api.get('/analytics/dashboard/', { params });
  return data;
};
