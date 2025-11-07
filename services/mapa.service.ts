/**
 * Servicio para gestión del mapa de reposición
 * POE-64: Visualización de mapa para reponedor
 */

import { HttpClient } from './http.client';
import { API_ENDPOINTS } from '@/config/api';
import type { MapaResponse } from '@/types/mapa.types';

export class MapaService {
  /**
   * Obtener el mapa del reponedor con sus puntos de reposición
   */
  static async getMapaReponedorVista(): Promise<MapaResponse> {
    try {
      const response = await HttpClient.get<MapaResponse>(
        `${API_ENDPOINTS.mapa_reposicion}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching mapa reponedor:', error);
      throw new Error(error.message || 'No se pudo cargar el mapa');
    }
  }
}
