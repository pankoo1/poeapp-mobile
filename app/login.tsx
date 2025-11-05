/**
 * Pantalla de Login para la aplicación móvil POE
 * Permite a los usuarios iniciar sesión con correo y contraseña
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicRoute } from '@/hooks/useProtectedRoute';
import type { AuthError } from '@/types/auth.types';
import { loginStyles as styles } from './login.styles';
import { gradients } from '@/constants/design';

export default function LoginScreen() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError, user } = useAuth();
  
  // Redirigir si ya está autenticado
  usePublicRoute();

  /**
   * Manejar submit del formulario
   */
  const handleSubmit = async () => {
    // Validación básica
    if (!correo.trim() || !contraseña.trim()) {
      Alert.alert('Error', 'Por favor ingresa correo y contraseña');
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      setIsLoading(true);
      clearError();

      await login({ correo: correo.trim(), contraseña });

      // Login exitoso - navegar según el rol
      const userRole = await getUserRole();
      navigateByRole(userRole);
    } catch (err) {
      console.error('Error en login:', err);
      handleLoginError(err as AuthError);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtener rol del usuario desde el contexto
   */
  const getUserRole = async (): Promise<string> => {
    if (user && user.rol) {
      // Mapear rol del backend al formato del frontend
      const rolMapping: { [key: string]: string } = {
        'Administrador': 'admin',
        'Supervisor': 'supervisor',
        'Reponedor': 'reponedor',
      };
      return rolMapping[user.rol] || user.rol.toLowerCase();
    }
    return 'reponedor'; // Default
  };

  /**
   * Navegar según el rol del usuario
   */
  const navigateByRole = (role: string) => {
    switch (role) {
      case 'admin':
        router.replace('/(tabs)');
        break;
      case 'supervisor':
        router.replace('/(tabs)');
        break;
      case 'reponedor':
        router.replace('/(tabs)');
        break;
      default:
        router.replace('/(tabs)');
    }
  };

  /**
   * Manejar errores de login
   */
  const handleLoginError = (err: AuthError) => {
    let title = 'Error de autenticación';
    let message = err.message || 'Ocurrió un error al iniciar sesión';

    switch (err.type) {
      case 'not_found':
        title = 'Usuario no encontrado';
        message = 'El correo electrónico no está registrado';
        break;
      case 'invalid_password':
        title = 'Contraseña incorrecta';
        message = 'La contraseña ingresada es incorrecta';
        break;
      case 'inactive':
        title = 'Cuenta inactiva';
        message = 'Esta cuenta ha sido desactivada. Contacta al administrador.';
        break;
      case 'network_error':
        title = 'Error de conexión';
        message = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        break;
      default:
        title = 'Error';
        message = err.detail || err.message;
    }

    Alert.alert(title, message);
  };

  /**
   * Autocompletar credenciales de prueba
   */
  const fillTestCredentials = (role: 'admin' | 'supervisor' | 'reponedor') => {
    const credentials = {
      admin: { correo: 'admin@poe.com', contraseña: 'admin123' },
      supervisor: { correo: 'supervisor@poe.com', contraseña: 'supervisor123' },
      reponedor: { correo: 'reponedor@poe.com', contraseña: 'reponedor123' },
    };

    setCorreo(credentials[role].correo);
    setContraseña(credentials[role].contraseña);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={gradients.background}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo y título */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={gradients.logo}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>POE</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>Sistema POE</Text>
            <Text style={styles.subtitle}>Optimización de Rutas</Text>
            <Text style={styles.description}>para Supermercados</Text>
          </View>

          {/* Formulario de login */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            <Text style={styles.formSubtitle}>Accede a tu cuenta del sistema POE</Text>

            {/* Campo de correo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@empresa.com"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Campo de contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={contraseña}
                onChangeText={setContraseña}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Botón de login */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={gradients.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Credenciales de prueba */}
            <View style={styles.testCredentials}>
              <Text style={styles.testTitle}>Credenciales de Prueba</Text>
              
              <TouchableOpacity
                style={[styles.testButton, styles.testButtonAdmin]}
                onPress={() => fillTestCredentials('admin')}
              >
                <Text style={styles.testButtonEmoji}>👑</Text>
                <View style={styles.testButtonContent}>
                  <Text style={styles.testButtonRole}>Admin</Text>
                  <Text style={styles.testButtonEmail}>admin@poe.com</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testButton, styles.testButtonSupervisor]}
                onPress={() => fillTestCredentials('supervisor')}
              >
                <Text style={styles.testButtonEmoji}>🏗️</Text>
                <View style={styles.testButtonContent}>
                  <Text style={styles.testButtonRole}>Supervisor</Text>
                  <Text style={styles.testButtonEmail}>supervisor@poe.com</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testButton, styles.testButtonReponedor]}
                onPress={() => fillTestCredentials('reponedor')}
              >
                <Text style={styles.testButtonEmoji}>📦</Text>
                <View style={styles.testButtonContent}>
                  <Text style={styles.testButtonRole}>Reponedor</Text>
                  <Text style={styles.testButtonEmail}>reponedor@poe.com</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
