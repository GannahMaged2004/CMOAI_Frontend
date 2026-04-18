import { request } from '../lib/api';
import type { StrategyOut, MessageResponse } from '../types/api';

export const createStrategy = async (data: Record<string, any>): Promise<StrategyOut> => {
  return request<StrategyOut>('/strategies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getStrategies = async (brand_id: number): Promise<StrategyOut[]> => {
  return request<StrategyOut[]>(`/strategies?brand_id=${brand_id}`, {
    method: 'GET',
  });
};

export const getStrategy = async (id: number): Promise<StrategyOut> => {
  return request<StrategyOut>(`/strategies/${id}`, {
    method: 'GET',
  });
};

export const updateStrategy = async (id: number, data: Record<string, any>): Promise<StrategyOut> => {
  return request<StrategyOut>(`/strategies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteStrategy = async (id: number): Promise<MessageResponse> => {
  return request<MessageResponse>(`/strategies/${id}`, {
    method: 'DELETE',
  });
};

export const duplicateStrategy = async (id: number): Promise<StrategyOut> => {
  return request<StrategyOut>(`/strategies/${id}/duplicate`, {
    method: 'POST',
  });
};

export const updateStatus = async (id: number, status: string): Promise<StrategyOut> => {
  return request<StrategyOut>(`/strategies/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};
