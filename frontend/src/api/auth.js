import api from './axios';

export const register = async (userData) => {
  const { data } = await api.post('/auth/register/', userData);
  return data;
};

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login/', credentials);
  return data; // { access, refresh, user }
};

export const logout = async () => {
  const refresh = localStorage.getItem('refresh_token');
  const { data } = await api.post('/auth/logout/', { refresh });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me/');
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.patch('/auth/me/', profileData);
  return data;
};

export const changePassword = async (passwords) => {
  const { data } = await api.post('/auth/change-password/', passwords);
  return data;
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  const { data } = await api.post('/auth/token/refresh/', { refresh });
  return data;
};
