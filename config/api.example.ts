/**
 * Configuración de API para la aplicación móvil POE
 * Endpoints y configuración base para comunicación con el backend
 * 
 * IMPORTANTE PARA DESARROLLO:
 * - En emulador Android: usar 10.0.2.2 en lugar de localhost
 * - En dispositivo físico: usar la IP local de tu computadora
 * - En iOS simulator: usar localhost está bien
 */

// URL base del API - CAMBIAR SEGÚN EL ENTORNO
// Para emulador Android, usar: 'http://10.0.2.2:8000'
// Para dispositivo físico, usar: 'http://192.168.X.X:8000' (tu IP local)
// Para iOS simulator, usar: 'http://localhost:8000'
export const API_URL = 'http://10.0.2.2:8000';

/**
 * Endpoints disponibles en la API
 */
export const API_ENDPOINTS = {
  // Autenticación
  login: `${API_URL}/usuarios/token`,
  
  // Usuarios
  usuarios: `${API_URL}/usuarios`,
  profile: `${API_URL}/usuarios/me`,
  
  // Supervisor
  supervisor: `${API_URL}/supervisor`,
  supervisor_reponedores: `${API_URL}/supervisor/reponedores`,
  
  // Productos y mapa
  productos: `${API_URL}/productos`,
  mapa: `${API_URL}/mapa`,
  mapa_reposicion: `${API_URL}/mapa/reponedor/vista`,
  muebles_reposicion: `${API_URL}/muebles/reposicion`,
  
  // Tareas
  tareas: `${API_URL}/tareas`,
  
  // Reportes y dashboard
  reportes: `${API_URL}/reportes`,
  dashboard: `${API_URL}/dashboard`,
} as const;

/**
 * Configuración de timeout para peticiones
 */
export const API_CONFIG = {
  timeout: 30000, // 30 segundos
  retries: 3,
} as const;
