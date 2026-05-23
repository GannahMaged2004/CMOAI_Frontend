import { request } from '../lib/api';
import type { TokenResponse, MessageResponse } from '../types/api';

export const login = async (email: string, password: string): Promise<TokenResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    requireAuth: false,
  });
};

export const register = async (name: string, email: string, password: string): Promise<TokenResponse> => {
  return request<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
    requireAuth: false,
  });
};

export const logout = async (): Promise<MessageResponse> => {
  return request<MessageResponse>('/auth/logout', {
    method: 'POST',
  });
};

export const refreshToken = async (refresh_token: string): Promise<TokenResponse> => {
  return request<TokenResponse>('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token }),
    requireAuth: false,
  });
};
export const forgotPassword = async (email: string): Promise<MessageResponse> => {
  return request<MessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    requireAuth: false,
  });
};

export const verifyResetOtp = async (
  email: string,
  otp: string
): Promise<{ message: string; reset_token: string }> => {
  return request<{ message: string; reset_token: string }>(
    "/auth/verify-reset-otp",
    {
      method: "POST",
      body: JSON.stringify({ email, otp }),
      requireAuth: false,
    }
  );
};

export const resetPassword = async (
  data: {
    email: string;
    token: string;
    new_password: string;
  }
): Promise<MessageResponse> => {
  return request<MessageResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
    requireAuth: false,
  });
};