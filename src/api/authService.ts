import apiClient from './client';
import { LoginCredentials, LoginResponse, User } from '../types';

export const authService = {
  // Login de usuario
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.getInstance().post<LoginResponse>(
      '/usuarios/token',
      credentials
    );

    // Guardar el token
    await apiClient.setToken(response.data.access_token);

    return response.data;
  },

  // Obtener perfil del usuario autenticado
  async getProfile(): Promise<User> {
    const response = await apiClient.getInstance().get<User>('/usuarios/me');
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    await apiClient.clearToken();
  },
};
