/**
 * Constantes de diseño para la aplicación móvil POE
 * Colores, tipografía, espaciado y otros valores reutilizables
 */

/**
 * Paleta de colores
 */
export const colors = {
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
  backgroundGradient1: '#f0f4ff',
  backgroundGradient2: '#e8f0fe',
  backgroundGradient3: '#f5f8ff',
  
  // Colores de texto
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textWhite: '#ffffff',
  
  // Colores de borde
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  
  // Colores de estado
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Transparencias
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardBackground: 'rgba(255, 255, 255, 0.95)',
  inputBackground: 'rgba(255, 255, 255, 0.9)',
} as const;

/**
 * Gradientes comunes
 */
export const gradients = {
  primary: ['#4f46e5', '#7c3aed', '#2563eb'],
  primaryButton: ['#4f46e5', '#7c3aed', '#4f46e5'],
  background: ['#f0f4ff', '#e8f0fe', '#f5f8ff'],
  logo: ['#4f46e5', '#7c3aed', '#2563eb'],
} as const;

/**
 * Tipografía
 */
export const typography = {
  // Tamaños de fuente
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 48,
  },
  
  // Pesos de fuente
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

/**
 * Espaciado
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

/**
 * Bordes y radios
 */
export const borders = {
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 30,
    full: 9999,
  },
  width: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
} as const;

/**
 * Sombras
 */
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  large: {
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

/**
 * Tamaños comunes
 */
export const sizes = {
  logo: {
    small: 80,
    medium: 120,
    large: 160,
  },
  button: {
    height: 48,
  },
  input: {
    height: 56,
  },
} as const;
