// src/lib/services/libros.ts
import axios from 'axios';
import type { LibrosModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Libros`;

export const getAllLibros = async (): Promise<LibrosModel[]> => {
  const response = await axios.get<any[]>(API_URL);
  return response.data.map(libro => ({
    ...libro,
    idLibro: Number(libro.idLibro),
    idEditorial: Number(libro.idEditorial),
    // anioPublicacion is already a string in the model, so no change needed unless API sends it as number
  }));
};

export const getLibroById = async (id: number): Promise<LibrosModel> => {
  const response = await axios.get<any>(`${API_URL}/${id}`);
  const libro = response.data;
  return {
    ...libro,
    idLibro: Number(libro.idLibro),
    idEditorial: Number(libro.idEditorial),
  };
};

export const createLibro = async (
  titulo: string,
  anioPublicacion: string,
  idEditorial: number
): Promise<LibrosModel> => {
  const response = await axios.post<any>(
    `${API_URL}/${encodeURIComponent(titulo)}/${encodeURIComponent(anioPublicacion)}/${idEditorial}`
  );
  const libro = response.data;
  return {
    ...libro,
    idLibro: Number(libro.idLibro),
    idEditorial: Number(libro.idEditorial),
  };
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
  const response = await axios.put<any>(url);
  const libro = response.data;
  return {
    ...libro,
    idLibro: Number(libro.idLibro),
    idEditorial: Number(libro.idEditorial),
  };
};

export const deleteLibro = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};