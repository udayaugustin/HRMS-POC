import apiService from './api';
import type { Department, Designation, Location, PaginatedResponse } from '../types';

export const masterDataService = {
  // Departments
  getDepartments: () => apiService.get<PaginatedResponse<Department>>('/master-data/departments'),

  getDepartmentById: (id: string) =>
    apiService.get<Department>(`/master-data/departments/${id}`),

  createDepartment: (data: Partial<Department>) =>
    apiService.post<Department>('/master-data/departments', data),

  updateDepartment: (id: string, data: Partial<Department>) =>
    apiService.patch<Department>(`/master-data/departments/${id}`, data),

  deleteDepartment: (id: string) =>
    apiService.delete(`/master-data/departments/${id}`),

  // Designations
  getDesignations: () =>
    apiService.get<PaginatedResponse<Designation>>('/master-data/designations'),

  getDesignationById: (id: string) =>
    apiService.get<Designation>(`/master-data/designations/${id}`),

  createDesignation: (data: Partial<Designation>) =>
    apiService.post<Designation>('/master-data/designations', data),

  updateDesignation: (id: string, data: Partial<Designation>) =>
    apiService.patch<Designation>(`/master-data/designations/${id}`, data),

  deleteDesignation: (id: string) =>
    apiService.delete(`/master-data/designations/${id}`),

  // Locations
  getLocations: () => apiService.get<PaginatedResponse<Location>>('/master-data/locations'),

  getLocationById: (id: string) => apiService.get<Location>(`/master-data/locations/${id}`),

  createLocation: (data: Partial<Location>) =>
    apiService.post<Location>('/master-data/locations', data),

  updateLocation: (id: string, data: Partial<Location>) =>
    apiService.patch<Location>(`/master-data/locations/${id}`, data),

  deleteLocation: (id: string) => apiService.delete(`/master-data/locations/${id}`),
};
