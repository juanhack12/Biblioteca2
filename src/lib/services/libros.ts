// src/lib/services/libros.ts
import axios from 'axios';
import type { LibrosModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Libros`;

export const getAllLibros = async (): Promise<LibrosModel[]> => {
  const response = await axios.get<LibrosModel[]>(API_URL);
  return response.data;
};

export const getLibroById = async (id: number): Promise<LibrosModel> => {
  const response = await axios.get<LibrosModel>(`${API_URL}/${id}`);
  return response.data;
};

export const createLibro = async (
  titulo: string,
  anioPublicacion: string,
  idEditorial: number
): Promise<LibrosModel> => {
  const response = await axios.post<LibrosModel>(
    `${API_URL}/${encodeURIComponent(titulo)}/${encodeURIComponent(anioPublicacion)}/${idEditorial}`
  );
  return response.data;
};

export const updateLibro = async (
  id: number,
  titulo?: string | null,
  anioPublicacion?: string | null,
  idEditorial?: number | null
): Promise<LibrosModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (titulo !== undefined && titulo !== null) params.append('titulo', titulo);
  if (anioPublicacion !== undefined && anioPublicacion !== null) params.append('anioPublicacion', anioPublicacion);
  if (idEditorial !== undefined && idEditorial !== null) params.append('idEditorial', String(idEditorial));

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<LibrosModel>(url);
  return response.data;
};

export const deleteLibro = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};
