import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  logout: () => AsyncStorage.removeItem('token'),
};

// Pet endpoints
export const pets = {
  getAll: () => api.get('/pets'),
  getOne: (id: string) => api.get(`/pets/${id}`),
  create: (petData: any) => api.post('/pets', petData),
  update: (id: string, petData: any) => api.put(`/pets/${id}`, petData),
  delete: (id: string) => api.delete(`/pets/${id}`),
};

// Appointment endpoints
export const appointments = {
  getAll: () => api.get('/appointments'),
  getOne: (id: string) => api.get(`/appointments/${id}`),
  create: (appointmentData: any) => api.post('/appointments', appointmentData),
  update: (id: string, appointmentData: any) =>
    api.put(`/appointments/${id}`, appointmentData),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// Medical records endpoints
export const medicalRecords = {
  getAll: (petId: string) => api.get(`/pets/${petId}/medical-records`),
  create: (petId: string, recordData: any) =>
    api.post(`/pets/${petId}/medical-records`, recordData),
  update: (petId: string, recordId: string, recordData: any) =>
    api.put(`/pets/${petId}/medical-records/${recordId}`, recordData),
};

export default api; 