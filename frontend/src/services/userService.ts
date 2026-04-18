import { request } from '../lib/api';
import type { UserOut, MessageResponse } from '../types/api';

export const getMe = async (): Promise<UserOut> => {
  return request<UserOut>('/users/me', {
    method: 'GET',
  });
};

export const updateMe = async (data: { name?: string }): Promise<UserOut> => {
  return request<UserOut>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const changePassword = async (old_password: string, new_password: string): Promise<MessageResponse> => {
  return request<MessageResponse>('/users/me/password', {
    method: 'PUT',
    body: JSON.stringify({ old_password, new_password }),
  });
};
