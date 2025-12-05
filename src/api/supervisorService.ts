import apiClient from './client';

export interface ReponedorAsignado {
  id_usuario: number;
  nombre: string;
  correo: string;
  estado: string;
}

export interface ReponedorCreate {
  nombre: string;
  correo: string;
  contraseña: string;
}

export const supervisorService = {
  // Obtener lista de reponedores asignados al supervisor
  async obtenerReponedoresAsignados(): Promise<ReponedorAsignado[]> {
    const response = await apiClient.getInstance().get('/supervisor/reponedores');
    return response.data.reponedores || [];
  },

  // Obtener reponedores disponibles (sin asignar)
  async obtenerReponedoresDisponibles(): Promise<ReponedorAsignado[]> {
    const response = await apiClient.getInstance().get('/supervisor/reponedores/disponibles');
    return response.data.reponedores || [];
  },

  // Asignar un reponedor al supervisor
  async asignarReponedor(reponedorId: number): Promise<any> {
    const response = await apiClient.getInstance().post(
      `/supervisor/reponedores/${reponedorId}/asignar`
    );
    return response.data;
  },

  // Registrar un nuevo reponedor
  async registrarReponedor(data: ReponedorCreate): Promise<ReponedorAsignado> {
    const response = await apiClient.getInstance().post(
      '/supervisor/reponedores',
      data
    );
    return response.data.usuario;
  },
};

export const {
  obtenerReponedoresAsignados,
  obtenerReponedoresDisponibles,
  asignarReponedor,
  registrarReponedor,
} = supervisorService;

export default supervisorService;
