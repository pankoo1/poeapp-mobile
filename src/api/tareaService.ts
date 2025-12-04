import apiClient from './client';
import { Tarea, CrearTareaData, Reponedor } from '../types';

export const tareaService = {
  // Obtener todas las tareas del usuario autenticado (reponedor o supervisor)
  async getTareas(): Promise<Tarea[]> {
    const response = await apiClient.getInstance().get<Tarea[]>('/tareas/reponedor');
    return response.data;
  },

  // Obtener todas las tareas (para supervisor)
  async obtenerTareas(): Promise<Tarea[]> {
    const response = await apiClient.getInstance().get<Tarea[]>('/tareas/supervisor');
    return response.data;
  },

  // Obtener tareas asignadas a un reponedor específico
  async obtenerTareasPorReponedor(reponedorId: number): Promise<Tarea[]> {
    const response = await apiClient.getInstance().get<Tarea[]>(
      `/tareas/reponedor/${reponedorId}`
    );
    return response.data;
  },

  // Crear una nueva tarea (supervisor)
  async crearTarea(data: CrearTareaData): Promise<Tarea> {
    const response = await apiClient.getInstance().post<Tarea>('/tareas/', data);
    return response.data;
  },

  // Iniciar una tarea (reponedor)
  async iniciarTarea(tareaId: number): Promise<Tarea> {
    const response = await apiClient.getInstance().put<Tarea>(
      `/tareas/${tareaId}/iniciar`
    );
    return response.data;
  },

  // Marcar tarea como completada (reponedor)
  async completarTarea(tareaId: number): Promise<Tarea> {
    const response = await apiClient.getInstance().put<Tarea>(
      `/tareas/${tareaId}/completar`,
      { confirmado: true }
    );
    return response.data;
  },

  // Obtener detalles de una tarea específica
  async obtenerTarea(tareaId: number): Promise<Tarea> {
    const response = await apiClient.getInstance().get<Tarea>(`/tareas/${tareaId}`);
    return response.data;
  },

  // Obtener todos los reponedores disponibles (para asignar tareas)
  async obtenerReponedores(): Promise<Reponedor[]> {
    const response = await apiClient.getInstance().get<Reponedor[]>('/usuarios/reponedores');
    return response.data;
  },

  // Generar ruta optimizada para una tarea
  async generarRutaOptimizada(tareaId: number, algoritmo: string = 'vecino_mas_cercano'): Promise<any> {
    const response = await apiClient.getInstance().post(
      `/tareas/${tareaId}/ruta-optimizada`,
      { algoritmo }
    );
    return response.data;
  },

  // Obtener tareas disponibles (sin asignar o pendientes sin reponedor)
  async obtenerTareasDisponibles(): Promise<Tarea[]> {
    const response = await apiClient.getInstance().get<Tarea[]>('/tareas/disponibles');
    return response.data;
  },

  // Auto-asignar una tarea al reponedor actual
  async autoAsignarTarea(tareaId: number): Promise<{
    mensaje: string;
    tarea: {
      id: number;
      estado: string;
      reponedor: string;
    };
  }> {
    const response = await apiClient.getInstance().put(
      `/tareas/${tareaId}/asignar-reponedor`,
      { id_reponedor: null } // El backend usará el usuario actual (reponedor autenticado)
    );
    return response.data;
  },
};

export const { 
  getTareas, 
  obtenerTareas, 
  crearTarea, 
  iniciarTarea, 
  completarTarea, 
  obtenerTarea, 
  obtenerTareasPorReponedor, 
  obtenerReponedores, 
  generarRutaOptimizada,
  obtenerTareasDisponibles,
  autoAsignarTarea
} = tareaService;

export default tareaService;
