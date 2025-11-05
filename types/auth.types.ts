/**
 * Tipos de datos relacionados con autenticación
 */

/**
 * Roles disponibles en el sistema
 */
export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  REPONEDOR = 'reponedor',
}

/**
 * Estados de usuario
 */
export enum UserStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  correo: string;
  contraseña: string;
}

/**
 * Información del usuario autenticado
 */
export interface UserInfo {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

/**
 * Respuesta del endpoint de login
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_info: UserInfo;
}

/**
 * Datos de sesión almacenados localmente
 */
export interface SessionData {
  token: string;
  tokenType: string;
  user: UserInfo;
  expiresAt?: number; // Timestamp de expiración
}

/**
 * Tipos de error de autenticación
 */
export type AuthErrorType = 
  | 'not_found'
  | 'invalid_password'
  | 'inactive'
  | 'expired_session'
  | 'network_error'
  | 'unknown';

/**
 * Error de autenticación con detalles
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  detail?: string;
}
