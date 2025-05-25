// src/lib/services/autores.ts
import axios from 'axios';
import type { AutoresModel, DateOnlyString } from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Autores`;

export const getAllAutores = async (): Promise<AutoresModel[]> => {
  const response = await axios.get<AutoresModel[]>(API_URL);
  return response.data.map(autor => ({
    ...autor,
    fechaNacimiento: autor.fechaNacimiento ? formatDateForApi(autor.fechaNacimiento) : undefined
  }));
};

export const getAutorById = async (id: number): Promise<AutoresModel> => {
  const response = await axios.get<AutoresModel>(`${API_URL}/${id}`);
  if (response.data.fechaNacimiento) {
    response.data.fechaNacimiento = formatDateForApi(response.data.fechaNacimiento);
  }
  return response.data;
};

export const createAutor = async (
  nombre: string,
  apellido: string,
  fechaNacimiento: DateOnlyString | undefined, // Allow undefined for optional dates
  nacionalidad: string
): Promise<AutoresModel> => {
  // Filter out undefined values before constructing URL, or handle them as per backend expectation
  const fechaNacimientoParam = fechaNacimiento || 'null'; // Or however backend expects optional date
  const response = await axios.post<AutoresModel>(
    `${API_URL}/${encodeURIComponent(nombre)}/${encodeURIComponent(apellido)}/${encodeURIComponent(fechaNacimientoParam)}/${encodeURIComponent(nacionalidad)}`
  );
  if (response.data.fechaNacimiento) {
    response.data.fechaNacimiento = formatDateForApi(response.data.fechaNacimiento);
  }
  return response.data;
};

export const updateAutor = async (
  id: number,
  nombre?: string | null,
  apellido?: string | null,
  fechaNacimiento?: DateOnlyString | null,
  nacionalidad?: string | null
): Promise<AutoresModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (nombre !== undefined && nombre !== null) params.append('nombre', nombre);
  if (apellido !== undefined && apellido !== null) params.append('apellido', apellido);
  if (fechaNacimiento !== undefined && fechaNacimiento !== null) params.append('fechaNacimiento', fechaNacimiento);
  if (nacionalidad !== undefined && nacionalidad !== null) params.append('nacionalidad', nacionalidad);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await axios.put<AutoresModel>(url);
  if (response.data.fechaNacimiento) {
    response.data.fechaNacimiento = formatDateForApi(response.data.fechaNacimiento);
  }
  return response.data;
};

export const deleteAutor = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};
