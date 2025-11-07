/**
 * Tipos para el módulo de mapa
 * POE-64: Visualización de mapa para reponedor
 */

export interface ObjetoMapa {
  nombre: string;
  tipo: string;
  caminable: boolean | null;
}

export interface ProductoAsociado {
  nombre: string;
  categoria: string;
  unidad_tipo: string;
  unidad_cantidad: number;
}

export interface PuntoReposicion {
  id_punto: number;
  id_mueble: number;
  nivel: number;
  estanteria: number;
  producto: ProductoAsociado | null;
  cantidad?: number; // Cantidad de la tarea (viene de DetalleTarea)
}

export interface MuebleReposicion {
  filas: number;
  columnas: number;
  puntos_reposicion: PuntoReposicion[];
}

export interface UbicacionFisica {
  x: number;
  y: number;
  objeto: ObjetoMapa | null;
  mueble: MuebleReposicion | null;
}

export interface Mapa {
  id: number;
  nombre: string;
  ancho: number;
  alto: number;
}

export interface MapaResponse {
  mensaje?: string;
  mapa: Mapa | null;
  ubicaciones: UbicacionFisica[];
}
