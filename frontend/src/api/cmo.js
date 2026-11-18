import api from './axios';

export const getDashboard = async () => {
  const { data } = await api.get('/cmo/dashboard/');
  return data;
};

export const getGrievances = async (params = {}) => {
  const { data } = await api.get('/cmo/grievances/', { params });
  return data;
};

export const getGrievanceDetail = async (id) => {
  const { data } = await api.get(`/cmo/grievances/${id}/`);
  return data;
};

export const assignDepartment = async (id, assignmentData) => {
  const { data } = await api.post(`/cmo/grievances/${id}/assign/`, assignmentData);
  return data;
};

export const addInternalRemark = async (id, remarkData) => {
  const { data } = await api.post(`/cmo/grievances/${id}/remark/`, remarkData);
  return data;
};

export const updateStatus = async (id, statusData) => {
  const { data } = await api.patch(`/cmo/grievances/${id}/status/`, statusData);
  return data;
};

export const escalateGrievance = async (id, escalationData) => {
  const { data } = await api.post(`/cmo/grievances/${id}/escalate/`, escalationData);
  return data;
};

export const reviewReport = async (id, reviewData) => {
  const { data } = await api.patch(`/cmo/reports/${id}/review/`, reviewData);
  return data;
};

// Officer Management API
export const getOfficers = async (params = {}) => {
  const { data } = await api.get('/cmo/officers/', { params });
  return data;
};

export const getOfficerDetail = async (id) => {
  const { data } = await api.get(`/cmo/officers/${id}/`);
  return data;
};

export const createOfficer = async (officerData) => {
  const { data } = await api.post('/cmo/officers/', officerData);
  return data;
};

export const updateOfficer = async (id, officerData) => {
  const { data } = await api.patch(`/cmo/officers/${id}/`, officerData);
  return data;
};

export const toggleOfficerStatus = async (id) => {
  const { data } = await api.post(`/cmo/officers/${id}/toggle-status/`);
  return data;
};

