import apiClient from './client';
import { MapaResponse, RutaOptimizada } from '../types';

export const mapaService = {
  // Obtener vista gráfica del mapa (compatible con el backend actual)
  async obtenerVistaGrafica(idMapa?: number): Promise<MapaResponse> {
    const url = idMapa ? `/mapa/vista-grafica?id_mapa=${idMapa}` : '/mapa/vista-grafica';
    const response = await apiClient.getInstance().get<MapaResponse>(url);
    return response.data;
  },

  // Obtener vista de reposición con muebles y puntos (para reponedores y supervisores)
  async obtenerVistaReposicion(idMapa?: number): Promise<any> {
    const url = idMapa ? `/mapa/reposicion?id_mapa=${idMapa}` : '/mapa/reposicion';
    const response = await apiClient.getInstance().get(url);
    return response.data;
  },

  // Obtener el mapa completo para reponedor (usando vista de reposición)
  async obtenerMapa(): Promise<MapaResponse> {
    const response = await apiClient.getInstance().get('/mapa/reponedor/vista');
    
    // Debug: Ver data cruda del backend
    console.log('🔍 Data RAW del backend - primeras 3 ubicaciones con tipo mueble:',
      response.data.ubicaciones
        .filter((u: any) => u.objeto?.tipo === 'mueble')
        .slice(0, 3)
        .map((u: any) => ({
          x: u.x,
          y: u.y,
          objeto_nombre: u.objeto?.nombre,
          mueble_existe: !!u.mueble,
          mueble_data: u.mueble
        }))
    );
    
    return mapaService.transformarVistaReposicion(response.data);
  },

  // Obtener mapa para supervisor (usando vista de reposición)
  async obtenerMapaSupervisor(): Promise<MapaResponse> {
    const response = await apiClient.getInstance().get('/mapa/supervisor/vista');
    
    // Debug: Ver estructura completa de la respuesta
    console.log('🔍 Response data keys:', Object.keys(response.data));
    console.log('🔍 Mapa info:', response.data.mapa);
    console.log('🔍 Primeras 3 ubicaciones:', response.data.ubicaciones?.slice(0, 3));
    console.log('🔍 Ubicaciones con objeto tipo mueble:', 
      response.data.ubicaciones?.filter((u: any) => u.objeto?.tipo === 'mueble').slice(0, 3)
    );
    
    // Debug: Ver cuántos muebles y puntos con productos hay
    const muebles = response.data.ubicaciones.filter((u: any) => u.mueble);
    const puntosConProducto = muebles.reduce((acc: number, u: any) => {
      return acc + (u.mueble.puntos_reposicion?.filter((p: any) => p.producto).length || 0);
    }, 0);
    
    console.log('📊 Mapa Supervisor cargado:', {
      totalUbicaciones: response.data.ubicaciones.length,
      totalMuebles: muebles.length,
      puntosConProducto,
      primerMuebleConPuntos: muebles.find((m: any) => m.mueble.puntos_reposicion?.some((p: any) => p.producto))
    });
    
    return mapaService.transformarVistaReposicion(response.data);
  },

  // Transformar respuesta del backend al formato esperado por el frontend móvil
  transformarVistaReposicion(data: any): MapaResponse {
    return {
      mapa: data.mapa,
      ubicaciones: data.ubicaciones.map((ub: any) => ({
        x: ub.x,
        y: ub.y,
        objeto: ub.objeto ? {
          nombre: ub.objeto.nombre,
          tipo_objeto: ub.objeto.tipo || ub.objeto.tipo_objeto, // Soportar ambos formatos
          caminable: ub.objeto.caminable
        } : undefined,
        mueble: ub.mueble ? {
          id_mueble: ub.mueble.id_mueble,
          tipo_mueble: ub.mueble.tipo_mueble || 'estanteria',
          filas: ub.mueble.filas,
          columnas: ub.mueble.columnas,
          puntos_reposicion: ub.mueble.puntos_reposicion || []
        } : undefined
      })),
      mensaje: data.mensaje
    };
  },

  // Obtener ruta optimizada para una tarea
  async obtenerRutaOptimizada(tareaId: number): Promise<RutaOptimizada> {
    const response = await apiClient.getInstance().get<RutaOptimizada>(
      `/tareas/${tareaId}/ruta-visual`
    );
    return response.data;
  },
};

export const { 
  obtenerVistaGrafica, 
  obtenerVistaReposicion, 
  obtenerMapa, 
  obtenerMapaSupervisor, 
  obtenerRutaOptimizada 
} = mapaService;
