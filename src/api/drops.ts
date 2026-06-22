import type { Drop, Reservation, Purchase, ApiResponse } from '@/types'
import axiosInstance from './axiosInstance'

export interface CreateDropPayload {
  title: string
  totalStock: number
  startsAt: string
}

export async function getActiveDrops(): Promise<Drop[]> {
  const response = await axiosInstance.get<ApiResponse<Drop[]>>('/drops')
  return response.data.data
}

export async function createDrop(payload: CreateDropPayload): Promise<Drop> {
  const response = await axiosInstance.post<ApiResponse<Drop>>('/drops', payload)
  return response.data.data
}

export async function reserveDrop(dropId: string, userId: string): Promise<Reservation> {
  const response = await axiosInstance.post<ApiResponse<Reservation>>(`/drops/${dropId}/reserve`, { userId })
  return response.data.data
}

export async function purchaseDrop(userId: string, dropId: string): Promise<Purchase> {
  const response = await axiosInstance.post<ApiResponse<Purchase>>('/purchases', { userId, dropId })
  return response.data.data
}

export async function getMyActiveReservations(userId: string): Promise<Reservation[]> {
  const response = await axiosInstance.get<ApiResponse<Reservation[]>>(`/users/${userId}/reservations`)
  return response.data.data
}
