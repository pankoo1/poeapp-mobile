/**
 * Contexto de autenticación para la aplicación móvil POE
 * Proporciona estado global de autenticación y funciones para login/logout
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/auth.service';
import type { LoginCredentials, SessionData, UserInfo, AuthError } from '@/types/auth.types';

/**
 * Tipo del contexto de autenticación
 */
interface AuthContextType {
  // Estado
  isAuthenticated: boolean;
  user: UserInfo | null;
  session: SessionData | null;
  loading: boolean;
  error: AuthError | null;

  // Acciones
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

/**
 * Contexto de autenticación
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props del provider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticación
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  /**
   * Cargar sesión al iniciar la app
   */
  useEffect(() => {
    loadSession();
  }, []);

  /**
   * Cargar sesión desde AsyncStorage
   */
  const loadSession = async () => {
    try {
      setLoading(true);
      const savedSession = await AuthService.getSession();
      setSession(savedSession);
    } catch (err) {
      console.error('Error al cargar sesión:', err);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Realizar login
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const newSession = await AuthService.login(credentials);
      setSession(newSession);
    } catch (err) {
      console.error('Error en login:', err);
      
      // Si es un AuthError, guardarlo en el estado
      if (isAuthError(err)) {
        setError(err);
      } else {
        // Error desconocido
        setError({
          type: 'unknown',
          message: err instanceof Error ? err.message : 'Error desconocido al iniciar sesión',
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      setSession(null);
      setError(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Refrescar sesión (verificar si sigue siendo válida)
   */
  const refreshSession = async () => {
    await loadSession();
  };

  /**
   * Verificar si un error es de tipo AuthError
   */
  const isAuthError = (err: any): err is AuthError => {
    return err && typeof err === 'object' && 'type' in err && 'message' in err;
  };

  const value: AuthContextType = {
    isAuthenticated: session !== null,
    user: session?.user ?? null,
    session,
    loading,
    error,
    login,
    logout,
    clearError,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}
