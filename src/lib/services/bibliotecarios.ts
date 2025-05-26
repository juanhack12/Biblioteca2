// src/lib/services/bibliotecarios.ts
import axios from 'axios';
import type { BibliotecariosModel, BibliotecariosApiResponseDTO, DateOnlyString, PersonasModel } from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Bibliotecarios`;

// Helper function to transform API DTO to Frontend Model
const transformBibliotecarioData = (dto: BibliotecariosApiResponseDTO): BibliotecariosModel => {
  let personaMapped: PersonasModel | undefined = undefined;
  if (dto.personas) { // El DTO usa 'personas' (plural)
    personaMapped = {
      idPersona: Number(dto.personas.idPersona),
      nombre: dto.personas.nombre,
      apellido: dto.personas.apellido,
      documentoIdentidad: dto.personas.documentoIdentidad,
      fechaNacimiento: formatDateForApi(dto.personas.fechaNacimiento) || '',
      correo: dto.personas.correo,
      telefono: dto.personas.telefono,
      direccion: dto.personas.direccion,
    };
  }

  return {
    idBibliotecario: Number(dto.idBibliotecario),
    idPersona: dto.idPersona ? Number(dto.idPersona) : undefined,
    fechaContratacion: dto.fechaContratacion ? formatDateForApi(dto.fechaContratacion) : undefined,
    turno: dto.turno,
    // Usar los campos aplanados del DTO, o los del objeto persona anidado como fallback
    nombre: dto.nombre || personaMapped?.nombre,
    apellido: dto.apellido || personaMapped?.apellido,
    documentoIdentidad: dto.documentoIdentidad || personaMapped?.documentoIdentidad,
    persona: personaMapped,
  };
};

export const getAllBibliotecarios = async (): Promise<BibliotecariosModel[]> => {
  const response = await axios.get<BibliotecariosApiResponseDTO[]>(API_URL);
  return response.data.map(transformBibliotecarioData);
};

export const getBibliotecarioById = async (id: number): Promise<BibliotecariosModel> => {
  const response = await axios.get<BibliotecariosApiResponseDTO>(`${API_URL}/${id}`);
  return transformBibliotecarioData(response.data);
};

export const createBibliotecario = async (
  idPersona: number,
  fechaContratacion: DateOnlyString | undefined,
  turno: string
): Promise<BibliotecariosModel> => {
  const fechaContratacionParam = fechaContratacion || 'null'; 
  // El backend devuelve BibliotecariosModel, no DTO, para Create/Update/Delete
  const response = await axios.post<any>( // Recibir como 'any' y transformar
    `${API_URL}/${idPersona}/${encodeURIComponent(fechaContratacionParam)}/${encodeURIComponent(turno)}`
  );
  // Asumimos que la respuesta de Create es un BibliotecariosModel que podría necesitar ser enriquecido
  // o transformado si queremos la misma estructura que el DTO para la UI inmediatamente.
  // Por simplicidad, si el backend devuelve el modelo base, podríamos necesitar otra llamada para obtener el DTO completo.
  // O, si el backend devuelve datos aplanados en el create/update, ajustamos aquí.
  // Por ahora, asumimos que el backend devuelve algo similar al DTO o que se re-obtendrá.
  // Para este ejemplo, vamos a simular que nos devuelve un DTO y lo transformamos:
  return transformBibliotecarioData(response.data as BibliotecariosApiResponseDTO);
};

export const updateBibliotecario = async (
  id: number,
  idPersona?: number | null,
  fechaContratacion?: DateOnlyString | null,
  turno?: string | null
): Promise<BibliotecariosModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (idPersona !== undefined && idPersona !== null) params.append('idPersona', String(idPersona));
  if (fechaContratacion !== undefined) { // Permite enviar null o un valor
    params.append('fechaContratacion', fechaContratacion === null ? 'null' : fechaContratacion);
  }
  if (turno !== undefined && turno !== null) params.append('turno', turno);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<any>(url); // Recibir como 'any'
  return transformBibliotecarioData(response.data as BibliotecariosApiResponseDTO);
};

export const deleteBibliotecario = async (id: number): Promise<void> => {
  await axios.delete<any>(`${API_URL}/${id}`);
  // No se devuelve nada, o se devuelve el objeto eliminado que podríamos transformar si fuera necesario.
  // En este caso, el page.tsx se encarga de recargar la lista.
};
