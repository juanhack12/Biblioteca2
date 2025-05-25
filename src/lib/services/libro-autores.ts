// src/lib/services/libro-autores.ts
import axios from 'axios';
import type { LibroAutoresModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/LibroAutores`;

export const getAllLibroAutores = async (): Promise<LibroAutoresModel[]> => {
  const response = await axios.get<LibroAutoresModel[]>(API_URL);
  return response.data;
};

export const getLibroAutorByIds = async (idLibro: number, idAutor: number): Promise<LibroAutoresModel> => {
  const response = await axios.get<LibroAutoresModel>(`${API_URL}/${idLibro}/${idAutor}`);
  return response.data;
};

export const createLibroAutor = async (
  idLibro: number,
  idAutor: number,
  rol: string
): Promise<LibroAutoresModel> => {
  const response = await axios.post<LibroAutoresModel>(
    `${API_URL}/${idLibro}/${idAutor}/${encodeURIComponent(rol)}`
  );
  return response.data;
};

export const updateLibroAutor = async (
  idLibro: number,
  idAutor: number,
  rol?: string | null
): Promise<LibroAutoresModel> => {
  let url = `${API_URL}/${idLibro}/${idAutor}`;
  const params = new URLSearchParams();

  if (rol !== undefined && rol !== null) params.append('rol', rol);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<LibroAutoresModel>(url);
  return response.data;
};

export const deleteLibroAutor = async (idLibro: number, idAutor: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${idLibro}/${idAutor}`);
};
