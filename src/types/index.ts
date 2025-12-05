// Tipos principales de la aplicación

export interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: string | number; // Acepta tanto string ('Supervisor', 'Reponedor') como number (2, 3)
  estado: string;
  id_empresa?: number;
}

export interface LoginCredentials {
  correo: string;
  contraseña: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string; // Opcional porque el backend lo envía
  token_type: string;
  user_info: User;
  expires_in?: number; // Opcional
}

export interface Tarea {
  id_tarea: number;
  fecha_creacion: string;
  estado: string;
  color_estado: string;
  reponedor: string | null;
  productos: ProductoTarea[];
}

export interface ProductoTarea {
  id_producto: number;
  nombre: string;
  cantidad: number;
  ubicacion: {
    id_punto: number;
    estanteria: string;
    nivel: number;
  };
}

export interface Reponedor {
  id_usuario: number;
  nombre: string;
  correo: string;
  estado: string;
}

export interface Mapa {
  id: number;     // Cambiado de id_mapa a id para coincidir con el backend
  nombre: string; // Cambiado de nombre_mapa a nombre para coincidir con el backend
  ancho: number;
  alto: number;
  activo?: boolean; // Agregado opcional
}

export interface UbicacionFisica {
  x: number;
  y: number;
  objeto?: {
    nombre?: string;
    tipo: string;  // Cambiado de tipo_objeto a tipo para coincidir con el backend
    caminable?: boolean;
  };
  mueble?: {
    id_mueble: number;
    tipo_mueble: string;
    filas?: number;
    columnas?: number;
    puntos_reposicion: PuntoReposicion[];
  };
  punto?: {
    id_punto: number;
    estanteria: string;
    nivel: number;
  };
}

export interface PuntoReposicion {
  id_punto: number;
  estanteria: number; // Backend envía número
  nivel: number;
  producto?: {
    id_producto?: number;
    nombre: string;
    descripcion?: string;
    categoria?: string;
    unidad_tipo?: string;
    unidad_cantidad?: number;
  };
}

export interface MapaResponse {
  mapa: Mapa;
  ubicaciones: UbicacionFisica[];
  mensaje?: string;
}

export interface RutaOptimizada {
  id_ruta: number;
  tiempo_estimado_min: number;
  distancia_total: number;
  coordenadas_ruta: CoordenadasRuta[];
  puntos_visita: PuntoVisita[];
}

export interface CoordenadasRuta {
  secuencia: number;
  x: number;
  y: number;
}

export interface PuntoVisita {
  orden: number;
  x_acceso: number;
  y_acceso: number;
  nombre_producto: string;
  nombre_mueble: string;
  estanteria: number;
  nivel: number;
}

export interface PuntoRuta {
  orden: number;
  id_punto: number;
  id_mueble: number;
  tipo_mueble: string;
  estanteria: string;
  nivel: number;
  coordenadas: {
    x: number;
    y: number;
  };
  id_producto: number;
  nombre_producto: string;
  cantidad: number;
}

export interface CrearTareaData {
  id_reponedor: number;
  estado_id: number;
  puntos: {
    id_punto: number;
    cantidad: number;
  }[];
}

// Tipos para la respuesta de ruta visual moderna
export interface CoordenadaRuta {
  x: number;
  y: number;
  secuencia: number;
}

export interface PuntoVisitaDetalle {
  orden: number;
  id_punto?: number;
  producto?: string;
  nombre_producto?: string;
  cantidad?: number;
  mueble?: string;
  nombre_mueble?: string;
  estanteria: number;
  nivel: number;
  x_acceso?: number;
  y_acceso?: number;
  coordenada_llegada?: {
    x: number;
    y: number;
  };
}

export interface RutaVisualResponse {
  id_ruta: number;
  reponedor?: string;
  fecha_creacion?: string;
  algoritmo_usado?: string;
  distancia_total: number;
  tiempo_estimado_min?: number;
  tiempo_estimado_minutos?: number;
  coordenadas_ruta: CoordenadaRuta[];
  puntos_visita: PuntoVisitaDetalle[];
}

