import apiClient from './client';

export interface ReponedorAsignado {
  id_usuario: number;
  nombre: string;
  correo: string;
  estado: string;
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
};

export const {
  obtenerReponedoresAsignados,
  obtenerReponedoresDisponibles,
  asignarReponedor,
} = supervisorService;

export default supervisorService;
