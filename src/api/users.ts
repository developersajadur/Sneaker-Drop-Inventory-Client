import type { ApiResponse } from '@/types';
import axiosInstance from './axiosInstance';

export interface User {
  id: string;
  username: string;
  createdAt: string;
  _count: { purchases: number; reservations: number };
}

export async function createUser(username: string): Promise<User> {
  const response = await axiosInstance.post<ApiResponse<User>>('/users', { username });
  return response.data.data;
}

export async function getUsers(): Promise<User[]> {
  const response = await axiosInstance.get<ApiResponse<User[]>>('/users');
  return response.data.data;
}
