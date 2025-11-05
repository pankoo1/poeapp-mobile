/**
 * Tipos y interfaces para el módulo de tareas
 * POE-63: Visualización de tareas asignadas en la app móvil
 */

export interface TaskProduct {
  id_producto: number;
  nombre: string;
  cantidad: number;
  ubicacion: {
    id_punto: number;
    estanteria: string;
    nivel: number;
  };
}

export interface Task {
  id_tarea: number;
  fecha_creacion: string;
  estado: TaskStatus;
  color_estado: string;
  reponedor: string | null;
  productos: TaskProduct[];
}

export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';

export interface TaskFilters {
  status: TaskStatus | 'todos';
  sortOrder: 'asc' | 'desc';
}

export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export interface StartTaskResponse {
  mensaje: string;
  id_tarea: number;
  estado: string;
}

export interface CompleteTaskResponse {
  mensaje: string;
  fecha_completada: string;
}

export interface OptimizedRoute {
  id_tarea: number;
  reponedor: string;
  fecha_creacion: string;
  puntos_reposicion: RoutePoint[];
  coordenadas_ruta: Coordinate[];
  algoritmo_utilizado: Algorithm;
  distancia_total: number;
  tiempo_estimado_minutos: number;
  estado_tarea: string;
}

export interface RoutePoint {
  id_punto: number;
  mueble: RouteFurniture;
  producto: RouteProduct;
  orden_visita: number;
}

export interface RouteFurniture {
  id_mueble: number;
  nombre_objeto: string;
  coordenadas: Coordinate;
  nivel: number;
  estanteria: number;
}

export interface RouteProduct {
  id_producto: number;
  nombre: string;
  categoria: string;
  cantidad: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Algorithm {
  nombre: string;
  descripcion: string;
}
