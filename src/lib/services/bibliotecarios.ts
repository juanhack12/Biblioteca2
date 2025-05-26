// src/lib/services/bibliotecarios.ts
import axios from 'axios';
import type { BibliotecariosModel, PersonasModel, DateOnlyString, BibliotecariosApiResponseDTO } from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Bibliotecarios`;

// Helper function to transform API DTO to Frontend Model
const transformBibliotecarioData = (dto: BibliotecariosApiResponseDTO): BibliotecariosModel => {
  const personaData = dto.personas; // El backend DTO usa 'personas' (plural) para el objeto anidado
  return {
    idBibliotecario: Number(dto.idBibliotecario),
    idPersona: dto.idPersona ? Number(dto.idPersona) : undefined,
    fechaContratacion: dto.fechaContratacion ? formatDateForApi(dto.fechaContratacion) : undefined,
    turno: dto.turno,
    // Usar los campos aplanados directamente si existen en el DTO, como fallback el objeto anidado
    nombre: dto.nombre || personaData?.nombre,
    apellido: dto.apellido || personaData?.apellido,
    documentoIdentidad: dto.documentoIdentidad || personaData?.documentoIdentidad,
    // Mapear el objeto persona si se quiere tener toda la info de la persona
    persona: personaData ? {
      idPersona: Number(personaData.idPersona),
      nombre: personaData.nombre,
      apellido: personaData.apellido,
      documentoIdentidad: personaData.documentoIdentidad,
      fechaNacimiento: formatDateForApi(personaData.fechaNacimiento) || '', // Asegurar string
      correo: personaData.correo,
      telefono: personaData.telefono,
      direccion: personaData.direccion,
    } : undefined,
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
  const fechaContratacionParam = fechaContratacion || 'null'; // API espera 'null' si es opcional y no se provee
  const response = await axios.post<BibliotecariosApiResponseDTO>(
    `${API_URL}/${idPersona}/${encodeURIComponent(fechaContratacionParam)}/${encodeURIComponent(turno)}`
  );
  return transformBibliotecarioData(response.data);
};

export const updateBibliotecario = async (
  id: number,
  idPersona?: number | null,
  fechaContratacion?: DateOnlyString | null,
  turno?: string | null
): Promise<BibliotecariosModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  // La API espera los parámetros en el query para PUT si son opcionales
  if (idPersona !== undefined && idPersona !== null) params.append('idPersona', String(idPersona));
  if (fechaContratacion !== undefined && fechaContratacion !== null) params.append('fechaContratacion', fechaContratacion);
  else if (fechaContratacion === null) params.append('fechaContratacion', 'null'); // Enviar 'null' explícito si se quiere borrar
  
  if (turno !== undefined && turno !== null) params.append('turno', turno);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<BibliotecariosApiResponseDTO>(url);
  return transformBibliotecarioData(response.data);
};

export const deleteBibliotecario = async (id: number): Promise<void> => {
  // El backend devuelve el objeto eliminado, pero el frontend solo necesita saber que fue exitoso
  await axios.delete<BibliotecariosApiResponseDTO>(`${API_URL}/${id}`);
};
