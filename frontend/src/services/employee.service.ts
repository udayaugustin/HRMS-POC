import apiService from './api';
import type { Employee, PaginatedResponse, PaginationParams } from '../types';

export const employeeService = {
  getAll: (params?: PaginationParams) =>
    apiService.get<PaginatedResponse<Employee>>('/employees', { params }),

  getById: (id: string) => apiService.get<Employee>(`/employees/${id}`),

  create: (data: Partial<Employee>) => apiService.post<Employee>('/employees', data),

  update: (id: string, data: Partial<Employee>) =>
    apiService.patch<Employee>(`/employees/${id}`, data),

  delete: (id: string) => apiService.delete(`/employees/${id}`),
};
