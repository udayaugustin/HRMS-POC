import apiService from './api';
import type { AdminDashboardStats, UserDashboardStats } from '../types';

export const dashboardService = {
  getAdminStats: () => apiService.get<AdminDashboardStats>('/dashboard/admin'),

  getUserStats: () => apiService.get<UserDashboardStats>('/dashboard/user'),
};
