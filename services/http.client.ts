/**
 * Cliente HTTP con interceptores para la aplicación móvil POE
 * Maneja autenticación automática y errores 401
 */

import { AuthService } from './auth.service';
import { router } from 'expo-router';

/**
 * Opciones para peticiones HTTP
 */
interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Respuesta con información adicional
 */
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Cliente HTTP con soporte para autenticación
 */
export class HttpClient {
  private static isHandlingUnauthorized = false;

  /**
   * Realizar petición HTTP con manejo automático de autenticación
   */
  static async fetch<T = any>(
    url: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = true, headers = {}, ...fetchOptions } = options;

    // Preparar headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Copiar headers adicionales
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          requestHeaders[key] = value;
        }
      });
    }

    // Agregar token si la petición requiere autenticación
    if (requiresAuth) {
      const token = await AuthService.getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      });

      // Manejar error 401 (no autorizado / sesión expirada)
      if (response.status === 401) {
        if (!this.isHandlingUnauthorized) {
          await this.handleUnauthorized();
        }
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      // Manejar otros errores HTTP
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Parsear respuesta
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error('Error en petición HTTP:', error);
      throw error;
    }
  }

  /**
   * Manejar error de sesión no autorizada
   */
  private static async handleUnauthorized() {
    if (this.isHandlingUnauthorized) return;
    
    this.isHandlingUnauthorized = true;
    
    try {
      // Limpiar sesión local
      await AuthService.logout();
      
      // Redirigir a login
      router.replace('/login');
    } catch (error) {
      console.error('Error al manejar sesión no autorizada:', error);
    } finally {
      // Reset flag después de un pequeño delay
      setTimeout(() => {
        this.isHandlingUnauthorized = false;
      }, 1000);
    }
  }

  /**
   * Métodos de conveniencia
   */

  static async get<T = any>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'GET' });
  }

  static async post<T = any>(
    url: string,
    body?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async put<T = any>(
    url: string,
    body?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async delete<T = any>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'DELETE' });
  }

  static async patch<T = any>(
    url: string,
    body?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}
