/**
 * Servicio para gestión de tareas del reponedor
 * POE-63: Visualización de tareas asignadas
 */

import { HttpClient } from './http.client';
import { API_ENDPOINTS } from '@/config/api';
import type {
  Task,
  StartTaskResponse,
  CompleteTaskResponse,
  OptimizedRoute,
} from '@/types/task.types';

export class TaskService {
  /**
   * Obtener todas las tareas asignadas al reponedor autenticado
   */
  static async getMyTasks(): Promise<Task[]> {
    try {
      const response = await HttpClient.get<Task[]>(API_ENDPOINTS.tareas.reponedor);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      throw new Error(error.message || 'No se pudieron cargar las tareas');
    }
  }

  /**
   * Iniciar una tarea (cambiar estado a en_progreso)
   */
  static async startTask(taskId: number): Promise<StartTaskResponse> {
    try {
      const endpoint = API_ENDPOINTS.tareas.iniciar.replace(':id', taskId.toString());
      const response = await HttpClient.put<StartTaskResponse>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('Error starting task:', error);
      throw new Error(error.message || 'No se pudo iniciar la tarea');
    }
  }

  /**
   * Completar una tarea
   */
  static async completeTask(taskId: number): Promise<CompleteTaskResponse> {
    try {
      const endpoint = API_ENDPOINTS.tareas.completar.replace(':id', taskId.toString());
      const response = await HttpClient.put<CompleteTaskResponse>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('Error completing task:', error);
      throw new Error(error.message || 'No se pudo completar la tarea');
    }
  }

  /**
   * Reiniciar una tarea completada
   */
  static async restartTask(taskId: number): Promise<void> {
    try {
      const endpoint = API_ENDPOINTS.tareas.reiniciar.replace(':id', taskId.toString());
      await HttpClient.put(endpoint);
    } catch (error: any) {
      console.error('Error restarting task:', error);
      throw new Error(error.message || 'No se pudo reiniciar la tarea');
    }
  }

  /**
   * Obtener ruta optimizada para una tarea
   */
  static async getOptimizedRoute(
    taskId: number,
    algorithm: string = 'vecino_mas_cercano'
  ): Promise<OptimizedRoute> {
    try {
      const endpoint = `${API_ENDPOINTS.tareas.base}/${taskId}/ruta-optimizada?algoritmo=${algorithm}`;
      const response = await HttpClient.get<OptimizedRoute>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching optimized route:', error);
      throw new Error(error.message || 'No se pudo obtener la ruta optimizada');
    }
  }

  /**
   * Resetear todas las tareas a estado pendiente (solo para testing)
   */
  static async resetAllTasks(): Promise<{ mensaje: string; tareas_reseteadas: number }> {
    try {
      const endpoint = `${API_ENDPOINTS.tareas.base}/resetear-todas`;
      const response = await HttpClient.put<{ mensaje: string; tareas_reseteadas: number }>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('Error resetting tasks:', error);
      throw new Error(error.message || 'No se pudieron resetear las tareas');
    }
  }
}
