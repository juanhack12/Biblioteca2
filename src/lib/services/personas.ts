// src/lib/services/personas.ts
import axios from 'axios';
import type { PersonasModel, DateOnlyString } from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Personas`;

export const getAllPersonas = async (): Promise<PersonasModel[]> => {
  const response = await axios.get<any[]>(API_URL);
  return response.data.map(persona => ({
    ...persona,
    idPersona: Number(persona.idPersona),
    fechaNacimiento: formatDateForApi(persona.fechaNacimiento) || ''
  }));
};

export const getPersonaById = async (id: number): Promise<PersonasModel> => {
  const response = await axios.get<any>(`${API_URL}/${id}`);
  const persona = response.data;
  return {
    ...persona,
    idPersona: Number(persona.idPersona),
    fechaNacimiento: formatDateForApi(persona.fechaNacimiento) || ''
  };
};

export const createPersona = async (
  nombre: string,
  apellido: string,
  documentoIdentidad: string,
  fechaNacimiento: DateOnlyString,
  correo: string,
  telefono: string,
  direccion: string
): Promise<PersonasModel> => {
  const response = await axios.post<any>(
    `${API_URL}/${encodeURIComponent(nombre)}/${encodeURIComponent(apellido)}/${encodeURIComponent(documentoIdentidad)}/${encodeURIComponent(fechaNacimiento)}/${encodeURIComponent(correo)}/${encodeURIComponent(telefono)}/${encodeURIComponent(direccion)}`
  );
  const persona = response.data;
  return {
    ...persona,
    idPersona: Number(persona.idPersona),
    fechaNacimiento: formatDateForApi(persona.fechaNacimiento) || ''
  };
};

export const updatePersona = async (
  id: number,
  nombre?: string | null,
  apellido?: string | null,
  documentoIdentidad?: string | null,
  fechaNacimiento?: DateOnlyString | null,
  correo?: string | null,
  telefono?: string | null,
  direccion?: string | null
): Promise<PersonasModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (nombre !== undefined && nombre !== null) params.append('nombre', nombre);
  if (apellido !== undefined && apellido !== null) params.append('apellido', apellido);
  if (documentoIdentidad !== undefined && documentoIdentidad !== null) params.append('documentoIdentidad', documentoIdentidad);
  if (fechaNacimiento !== undefined && fechaNacimiento !== null) params.append('fechaNacimiento', fechaNacimiento);
  if (correo !== undefined && correo !== null) params.append('correo', correo);
  if (telefono !== undefined && telefono !== null) params.append('telefono', telefono);
  if (direccion !== undefined && direccion !== null) params.append('direccion', direccion);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<any>(url);
  const persona = response.data;
  return {
    ...persona,
    idPersona: Number(persona.idPersona),
    fechaNacimiento: formatDateForApi(persona.fechaNacimiento) || ''
  };
};

export const deletePersona = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};