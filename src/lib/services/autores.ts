// src/lib/services/autores.ts
import axios from 'axios';
import type { AutoresModel, DateOnlyString } from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Autores`;

export const getAllAutores = async (): Promise<AutoresModel[]> => {
  const response = await axios.get<any[]>(API_URL); // Get as any[] first for parsing
  return response.data.map(autor => ({
    ...autor,
    idAutor: Number(autor.idAutor), // Ensure number
    fechaNacimiento: autor.fechaNacimiento ? formatDateForApi(autor.fechaNacimiento) : undefined
  }));
};

export const getAutorById = async (id: number): Promise<AutoresModel> => {
  const response = await axios.get<any>(`${API_URL}/${id}`);
  const autor = response.data;
  return {
    ...autor,
    idAutor: Number(autor.idAutor),
    fechaNacimiento: autor.fechaNacimiento ? formatDateForApi(autor.fechaNacimiento) : undefined
  };
};

export const createAutor = async (
  nombre: string,
  apellido: string,
  fechaNacimiento: DateOnlyString | undefined,
  nacionalidad: string
): Promise<AutoresModel> => {
  const fechaNacimientoParam = fechaNacimiento || 'null';
  const response = await axios.post<any>(
    `${API_URL}/${encodeURIComponent(nombre)}/${encodeURIComponent(apellido)}/${encodeURIComponent(fechaNacimientoParam)}/${encodeURIComponent(nacionalidad)}`
  );
  const autor = response.data;
  return {
    ...autor,
    idAutor: Number(autor.idAutor),
    fechaNacimiento: autor.fechaNacimiento ? formatDateForApi(autor.fechaNacimiento) : undefined
  };
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

  const response = await axios.put<any>(url);
  const autor = response.data;
  return {
    ...autor,
    idAutor: Number(autor.idAutor),
    fechaNacimiento: autor.fechaNacimiento ? formatDateForApi(autor.fechaNacimiento) : undefined
  };
};

export const deleteAutor = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};