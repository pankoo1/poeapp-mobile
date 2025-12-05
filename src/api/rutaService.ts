import apiClient from './client';
import { RutaVisualResponse } from '../types';

/**
 * Utilidad para esperar un tiempo determinado
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const rutaService = {
  /**
   * Genera una ruta optimizada para una tarea específica
   * @param tareaId - ID de la tarea
   * @param algoritmo - Algoritmo a utilizar (default: vecino_mas_cercano)
   * @returns Respuesta con la ruta generada
   */
  async generarRuta(tareaId: number, algoritmo: string = 'vecino_mas_cercano'): Promise<any> {
    const response = await apiClient.getInstance().post(
      `/tareas/${tareaId}/ruta-optimizada`,
      null,
      { params: { algoritmo } }
    );
    
    // Esperar un momento para que la BD persista los cambios
    await delay(500);
    
    return response.data;
  },

  /**
   * Obtiene la ruta visual en formato moderno para una tarea
   * @param tareaId - ID de la tarea
   * @returns Datos completos de la ruta con coordenadas y puntos de visita
   */
  async obtenerRutaVisual(tareaId: number): Promise<RutaVisualResponse> {
    try {
      const response = await apiClient.getInstance().get<RutaVisualResponse>(
        `/${tareaId}/ruta-visual`
      );
      return response.data;
    } catch (error: any) {
      // Si es 404, intentar con el endpoint alternativo
      if (error.response?.status === 404) {
        console.warn('Endpoint ruta-visual no encontrado, intentando con ruta-optimizada-visual');
        const response = await apiClient.getInstance().get<any>(
          `/${tareaId}/ruta-optimizada-visual`
        );
        
        // Transformar respuesta del formato legacy al moderno
        return {
          id_ruta: response.data.id_ruta || 0,
          reponedor: response.data.reponedor || 'Desconocido',
          fecha_creacion: new Date().toISOString(),
          algoritmo_usado: response.data.algoritmo || 'vecino_mas_cercano',
          distancia_total: response.data.distancia_total || 0,
          tiempo_estimado_minutos: response.data.tiempo_estimado || 0,
          coordenadas_ruta: (response.data.coordenadas_ruta || []).map((coord: any, index: number) => ({
            x: coord.x,
            y: coord.y,
            secuencia: index + 1
          })),
          puntos_visita: (response.data.puntos_reposicion || []).map((punto: any, index: number) => ({
            orden: index + 1,
            id_punto: punto.id_punto,
            producto: punto.nombre_producto,
            cantidad: punto.cantidad,
            mueble: punto.mueble || 'Mueble',
            coordenada_llegada: {
              x: punto.ubicacion?.x || 0,
              y: punto.ubicacion?.y || 0
            }
          }))
        };
      }
      throw error;
    }
  },

  /**
   * Obtiene la ruta en formato legacy (compatibilidad)
   * @param tareaId - ID de la tarea
   * @returns Ruta en formato antiguo
   */
  async obtenerRutaLegacy(tareaId: number): Promise<any> {
    const response = await apiClient.getInstance().get(
      `/tareas/${tareaId}/ruta-optimizada-visual`
    );
    return response.data;
  },
};

export const { generarRuta, obtenerRutaVisual, obtenerRutaLegacy } = rutaService;

export default rutaService;
