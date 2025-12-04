import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la URL base del API
// IMPORTANTE: Cambiar esta URL según tu configuración
// Para emulador Android: usar 10.0.2.2
// Para dispositivo físico: usar tu IP local (192.168.1.92)
const API_URL = 'http://10.0.2.2:8000'; // Para emulador Android

class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token a cada petición
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        console.log(`📡 Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas y errores
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ Response: ${response.config.url} - ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        console.error('❌ Response Error:', error.response?.status, error.message);
        
        // Si el token expiró (401), limpiar sesión
        if (error.response?.status === 401) {
          await this.clearToken();
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Establecer el token de autenticación
  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('auth_token', token);
  }

  // Obtener el token guardado
  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('auth_token');
    }
    return this.token;
  }

  // Limpiar el token
  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_info');
  }

  // Verificar si hay sesión activa
  async hasActiveSession(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  // Obtener la instancia de axios
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Exportar una instancia única del cliente
export const apiClient = new ApiClient();
export default apiClient;
