import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await api.post('/api/admin/auth/login', credentials);
  const { token, user } = response.data;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return { token, user };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
