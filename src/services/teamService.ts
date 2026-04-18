import { request } from '../lib/api';
import type { TeamOut, MessageResponse } from '../types/api';

export const createTeam = async (name: string): Promise<TeamOut> => {
  return request<TeamOut>('/teams', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const getMyTeam = async (): Promise<TeamOut> => {
  return request<TeamOut>('/teams/me', {
    method: 'GET',
  });
};

export const updateTeam = async (name: string): Promise<TeamOut> => {
  return request<TeamOut>('/teams/me', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
};

export const invite = async (email: string, role: string): Promise<MessageResponse> => {
  return request<MessageResponse>('/teams/me/invite', {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
};

export const removeMember = async (user_id: number): Promise<MessageResponse> => {
  return request<MessageResponse>(`/teams/me/members/${user_id}`, {
    method: 'DELETE',
  });
};

export const updateMemberRole = async (user_id: number, role: string): Promise<MessageResponse> => {
  return request<MessageResponse>(`/teams/me/members/${user_id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
};

export const leaveTeam = async (): Promise<MessageResponse> => {
  return request<MessageResponse>('/teams/me/leave', {
    method: 'DELETE',
  });
};
