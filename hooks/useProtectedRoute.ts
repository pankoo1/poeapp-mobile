/**
 * Hook para proteger rutas que requieren autenticación
 */

import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook que redirige al login si el usuario no está autenticado
 */
export function useProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading]);

  return { isAuthenticated, loading };
}

/**
 * Hook que redirige a la pantalla principal si el usuario ya está autenticado
 * Útil para la pantalla de login
 */
export function usePublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading]);

  return { isAuthenticated, loading };
}
