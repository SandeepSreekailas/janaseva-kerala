import api from './axios';

export const getDashboard = async () => {
  const { data } = await api.get('/officer/dashboard/');
  return data;
};

export const getGrievances = async (params = {}) => {
  const { data } = await api.get('/officer/grievances/', { params });
  return data;
};

export const getGrievanceDetail = async (id) => {
  const { data } = await api.get(`/officer/grievances/${id}/`);
  return data;
};

export const updateStatus = async (id, statusData) => {
  const { data } = await api.patch(`/officer/grievances/${id}/status/`, statusData);
  return data;
};

export const submitReport = async (id, reportData) => {
  const config =
    reportData instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
  const { data } = await api.post(`/officer/grievances/${id}/report/`, reportData, config);
  return data;
};
