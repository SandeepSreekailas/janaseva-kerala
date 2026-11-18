import api from './axios';

export const getMyGrievances = async (params = {}) => {
  const { data } = await api.get('/grievances/', { params });
  return data;
};

export const createGrievance = async (grievanceData) => {
  const { data } = await api.post('/grievances/', grievanceData);
  return data;
};

export const getGrievance = async (id) => {
  const { data } = await api.get(`/grievances/${id}/`);
  return data;
};

export const trackGrievance = async (referenceNumber) => {
  const { data } = await api.get('/grievances/track/', {
    params: { ref: referenceNumber },
  });
  return data;
};

export const getGrievanceHistory = async (id) => {
  const { data } = await api.get(`/grievances/${id}/history/`);
  return data;
};

export const uploadAttachment = async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/grievances/${id}/attachments/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const submitFeedback = async (id, feedbackData) => {
  const { data } = await api.post(`/grievances/${id}/feedback/`, feedbackData);
  return data;
};
