import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, apiClient } from '../api';
import { User, LoginCredentials } from '../types';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar la app
  useEffect(() => {
    loadStoredUser();
  }, []);

  // Cargar usuario guardado en AsyncStorage
  const loadStoredUser = async () => {
    try {
      const [storedUser, hasSession] = await Promise.all([
        AsyncStorage.getItem('user_info'),
        apiClient.hasActiveSession(),
      ]);

      if (storedUser && hasSession) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Validar sesión con el backend
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          await AsyncStorage.setItem('user_info', JSON.stringify(profile));
        } catch (error) {
          // Si falla, limpiar sesión
          console.error('Sesión inválida:', error);
          await signOut();
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión
  const signIn = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      // Obtener perfil completo del usuario
      const profile = await authService.getProfile();
      
      // Log para debug
      console.log('📋 Perfil recibido:', JSON.stringify(profile, null, 2));
      console.log('🔍 Rol del usuario:', profile.rol);
      
      // Normalizar el rol a minúsculas para comparación
      const rolNormalizado = typeof profile.rol === 'string' 
        ? profile.rol.toLowerCase() 
        : String(profile.rol).toLowerCase();
      
      // Validar que el usuario sea Supervisor o Reponedor
      if (rolNormalizado !== 'supervisor' && rolNormalizado !== 'reponedor') {
        await signOut();
        throw new Error(`Acceso denegado. Solo supervisores y reponedores pueden usar esta aplicación. Rol recibido: ${profile.rol}`);
      }
      
      setUser(profile);
      await AsyncStorage.setItem('user_info', JSON.stringify(profile));
      
      console.log('✅ Login exitoso:', profile.nombre, '-', profile.rol);
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      await AsyncStorage.removeItem('user_info');
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refrescar perfil del usuario
  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      await AsyncStorage.setItem('user_info', JSON.stringify(profile));
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
