import { apiClient } from './client';

export interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string };
}

export function registerRequest(email: string, password: string) {
  return apiClient.post<AuthResponse>('/auth/register', { email, password }).then((r) => r.data);
}

export function loginRequest(email: string, password: string) {
  return apiClient.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data);
}
