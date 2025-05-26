// src/lib/services/lectores.ts
import axios from 'axios';
import type { LectoresModel, LectoresApiResponseDTO, DateOnlyString, PersonasModel } from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Lectores`;

const transformLectorData = (dto: LectoresApiResponseDTO): LectoresModel => {
  let personaMapped: PersonasModel | undefined = undefined;
  if (dto.personas) { // DTO usa 'personas'
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
    idLector: Number(dto.idLector),
    idPersona: dto.idPersona ? Number(dto.idPersona) : undefined,
    fechaRegistro: dto.fechaRegistro ? formatDateForApi(dto.fechaRegistro) : undefined,
    ocupacion: dto.ocupacion,
    nombre: dto.nombre || personaMapped?.nombre,
    apellido: dto.apellido || personaMapped?.apellido,
    documentoIdentidad: dto.documentoIdentidad || personaMapped?.documentoIdentidad,
    persona: personaMapped,
  };
};

export const getAllLectores = async (): Promise<LectoresModel[]> => {
  const response = await axios.get<LectoresApiResponseDTO[]>(API_URL);
  return response.data.map(transformLectorData);
};

export const getLectorById = async (id: number): Promise<LectoresModel> => {
  const response = await axios.get<LectoresApiResponseDTO>(`${API_URL}/${id}`);
  return transformLectorData(response.data);
};

export const createLector = async (
  idPersona: number,
  fechaRegistro: DateOnlyString | undefined,
  ocupacion: string
): Promise<LectoresModel> => {
  const fechaRegistroParam = fechaRegistro || 'null';
  // El backend devuelve LectoresModel
  const response = await axios.post<any>(
    `${API_URL}/${idPersona}/${encodeURIComponent(fechaRegistroParam)}/${encodeURIComponent(ocupacion)}`
  );
  return transformLectorData(response.data as LectoresApiResponseDTO);
};

export const updateLector = async (
  id: number,
  idPersona?: number | null,
  fechaRegistro?: DateOnlyString | null,
  ocupacion?: string | null
): Promise<LectoresModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (idPersona !== undefined && idPersona !== null) params.append('idPersona', String(idPersona));
  if (fechaRegistro !== undefined) {
     params.append('fechaRegistro', fechaRegistro === null ? 'null' : fechaRegistro);
  }
  if (ocupacion !== undefined && ocupacion !== null) params.append('ocupacion', ocupacion);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<any>(url);
  return transformLectorData(response.data as LectoresApiResponseDTO);
};

export const deleteLector = async (id: number): Promise<void> => {
  await axios.delete<any>(`${API_URL}/${id}`);
};
