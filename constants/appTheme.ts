/**
 * Sistema de temas personalizado para la aplicación móvil POE
 * Incluye tema claro (light) y oscuro (dark)
 */

export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  // Colores primarios
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  // Colores secundarios
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Colores de acento
  accent: string;
  accentDark: string;
  accentLight: string;
  
  // Colores de fondo
  background: string;
  backgroundSecondary: string;
  backgroundGradient1: string;
  backgroundGradient2: string;
  backgroundGradient3: string;
  
  // Colores de texto
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Colores de borde
  border: string;
  borderLight: string;
  
  // Colores de card e input
  cardBackground: string;
  inputBackground: string;
  
  // Colores de estado
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Transparencias
  overlay: string;
}

/**
 * Tema claro
 */
export const lightTheme: AppTheme = {
  // Colores primarios
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  primaryLight: '#6366f1',
  
  // Colores secundarios
  secondary: '#7c3aed',
  secondaryDark: '#6d28d9',
  secondaryLight: '#8b5cf6',
  
  // Colores de acento
  accent: '#2563eb',
  accentDark: '#1d4ed8',
  accentLight: '#3b82f6',
  
  // Colores de fondo
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundGradient1: '#f0f4ff',
  backgroundGradient2: '#e8f0fe',
  backgroundGradient3: '#f5f8ff',
  
  // Colores de texto
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textInverse: '#ffffff',
  
  // Colores de borde
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  
  // Colores de card e input
  cardBackground: 'rgba(255, 255, 255, 0.95)',
  inputBackground: 'rgba(255, 255, 255, 0.9)',
  
  // Colores de estado
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Transparencias
  overlay: 'rgba(0, 0, 0, 0.5)',
};

/**
 * Tema oscuro
 */
export const darkTheme: AppTheme = {
  // Colores primarios
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  
  // Colores secundarios
  secondary: '#8b5cf6',
  secondaryDark: '#7c3aed',
  secondaryLight: '#a78bfa',
  
  // Colores de acento
  accent: '#3b82f6',
  accentDark: '#2563eb',
  accentLight: '#60a5fa',
  
  // Colores de fondo
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  backgroundGradient1: '#1e293b',
  backgroundGradient2: '#334155',
  backgroundGradient3: '#1e293b',
  
  // Colores de texto
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  textInverse: '#0f172a',
  
  // Colores de borde
  border: '#334155',
  borderLight: '#475569',
  
  // Colores de card e input
  cardBackground: 'rgba(30, 41, 59, 0.95)',
  inputBackground: 'rgba(30, 41, 59, 0.9)',
  
  // Colores de estado
  success: '#22c55e',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  // Transparencias
  overlay: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Gradientes para cada tema
 */
export const themeGradients = {
  light: {
    primary: ['#4f46e5', '#7c3aed', '#2563eb'],
    primaryButton: ['#4f46e5', '#7c3aed', '#4f46e5'],
    background: ['#f0f4ff', '#e8f0fe', '#f5f8ff'],
    logo: ['#4f46e5', '#7c3aed', '#2563eb'],
  },
  dark: {
    primary: ['#6366f1', '#8b5cf6', '#3b82f6'],
    primaryButton: ['#6366f1', '#8b5cf6', '#6366f1'],
    background: ['#1e293b', '#334155', '#1e293b'],
    logo: ['#6366f1', '#8b5cf6', '#3b82f6'],
  },
};

/**
 * Obtener tema según el modo
 */
export const getTheme = (mode: ThemeMode): AppTheme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Obtener gradientes según el modo
 */
export const getGradients = (mode: ThemeMode) => {
  return mode === 'dark' ? themeGradients.dark : themeGradients.light;
};
