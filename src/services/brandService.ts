import { request } from '../lib/api';
import type { BrandOut, MessageResponse } from '../types/api';

export const createBrand = async (data: Record<string, unknown>): Promise<BrandOut> => {
  return request<BrandOut>('/brands', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getBrands = async (): Promise<BrandOut[]> => {
  return request<BrandOut[]>('/brands', {
    method: 'GET',
  });
};

export const getBrand = async (id: number): Promise<BrandOut> => {
  return request<BrandOut>(`/brands/${id}`, {
    method: 'GET',
  });
};

export const updateBrand = async (id: number, data: Record<string, unknown>): Promise<BrandOut> => {
  return request<BrandOut>(`/brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteBrand = async (id: number): Promise<MessageResponse> => {
  return request<MessageResponse>(`/brands/${id}`, {
    method: 'DELETE',
  });
};
