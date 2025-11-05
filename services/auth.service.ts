/**
 * Servicio de autenticación para la aplicación móvil POE
 * Maneja login, logout y gestión de tokens
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '@/config/api';
import type {
  LoginCredentials,
  LoginResponse,
  SessionData,
  AuthError,
  AuthErrorType,
  UserInfo,
} from '@/types/auth.types';

/**
 * Claves para almacenamiento local
 */
const STORAGE_KEYS = {
  SESSION: '@poe_session',
  TOKEN: '@poe_token',
  USER: '@poe_user',
} as const;

/**
 * Servicio de autenticación
 */
export class AuthService {
  /**
   * Realizar login con credenciales
   */
  static async login(credentials: LoginCredentials): Promise<SessionData> {
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      // Si la respuesta no es OK, manejar el error
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw this.parseAuthError(errorData, response.status);
      }

      const data: LoginResponse = await response.json();

      // Validar que recibimos el token
      if (!data.access_token) {
        throw this.createAuthError('unknown', 'No se recibió el token de acceso');
      }

      // Crear sesión
      const session: SessionData = {
        token: data.access_token,
        tokenType: data.token_type,
        user: data.user_info,
        // Por defecto, el token expira en 24 horas (configurable)
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      // Guardar sesión en AsyncStorage
      await this.saveSession(session);

      return session;
    } catch (error) {
      console.error('Error en login:', error);
      
      // Si ya es un AuthError, lanzarlo directamente
      if (this.isAuthError(error)) {
        throw error;
      }

      // Si es un error de red
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw this.createAuthError(
          'network_error',
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
        );
      }

      // Error desconocido
      throw this.createAuthError('unknown', 'Error desconocido al iniciar sesión');
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSION,
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
      ]);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  /**
   * Obtener sesión guardada
   */
  static async getSession(): Promise<SessionData | null> {
    try {
      const sessionJson = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
      if (!sessionJson) {
        return null;
      }

      const session: SessionData = JSON.parse(sessionJson);

      // Verificar si la sesión ha expirado
      if (session.expiresAt && Date.now() > session.expiresAt) {
        await this.logout();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  }

  /**
   * Obtener token actual
   */
  static async getToken(): Promise<string | null> {
    const session = await this.getSession();
    return session?.token ?? null;
  }

  /**
   * Obtener información del usuario actual
   */
  static async getCurrentUser(): Promise<UserInfo | null> {
    const session = await this.getSession();
    return session?.user ?? null;
  }

  /**
   * Verificar si hay una sesión activa
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  /**
   * Guardar sesión en AsyncStorage
   */
  private static async saveSession(session: SessionData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, session.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session.user));
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      throw error;
    }
  }

  /**
   * Parsear error de autenticación desde la respuesta del backend
   */
  private static parseAuthError(errorData: any, status: number): AuthError {
    // Si el backend devuelve un objeto detail estructurado
    if (errorData?.detail) {
      const detail = errorData.detail;

      // Si es un objeto con error_type
      if (typeof detail === 'object' && detail.error_type) {
        return {
          type: this.mapErrorType(detail.error_type),
          message: detail.message || 'Error de autenticación',
          detail: detail.detail,
        };
      }

      // Si es un string simple
      if (typeof detail === 'string') {
        return {
          type: this.inferErrorType(detail, status),
          message: detail,
        };
      }
    }

    // Error genérico según el código de estado
    return this.createAuthError(
      this.inferErrorType('', status),
      this.getDefaultErrorMessage(status)
    );
  }

  /**
   * Mapear tipo de error del backend al tipo local
   */
  private static mapErrorType(backendType: string): AuthErrorType {
    const typeMap: Record<string, AuthErrorType> = {
      'not_found': 'not_found',
      'invalid_password': 'invalid_password',
      'inactive': 'inactive',
      'expired_session': 'expired_session',
    };

    return typeMap[backendType] || 'unknown';
  }

  /**
   * Inferir tipo de error desde mensaje y código de estado
   */
  private static inferErrorType(message: string, status: number): AuthErrorType {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('not found') || lowerMessage.includes('no está registrado')) {
      return 'not_found';
    }

    if (lowerMessage.includes('password') || lowerMessage.includes('contraseña')) {
      return 'invalid_password';
    }

    if (lowerMessage.includes('inactive') || lowerMessage.includes('inactiv')) {
      return 'inactive';
    }

    if (status === 401) {
      return 'invalid_password';
    }

    return 'unknown';
  }

  /**
   * Obtener mensaje de error por defecto según el código de estado
   */
  private static getDefaultErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      401: 'Credenciales incorrectas',
      403: 'Acceso denegado',
      404: 'Usuario no encontrado',
      500: 'Error del servidor',
      503: 'Servicio no disponible',
    };

    return messages[status] || 'Error de autenticación';
  }

  /**
   * Crear un objeto AuthError
   */
  private static createAuthError(
    type: AuthErrorType | string,
    message: string,
    detail?: string
  ): AuthError {
    return {
      type: type as AuthErrorType,
      message,
      detail,
    };
  }

  /**
   * Verificar si un error es de tipo AuthError
   */
  private static isAuthError(error: any): error is AuthError {
    return error && typeof error === 'object' && 'type' in error && 'message' in error;
  }
}
