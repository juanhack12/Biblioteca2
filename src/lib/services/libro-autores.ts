// src/lib/services/libro-autores.ts
import axios from 'axios';
import type { LibroAutoresModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/LibroAutores`;

export const getAllLibroAutores = async (): Promise<LibroAutoresModel[]> => {
  const response = await axios.get<any[]>(API_URL);
  return response.data.map(item => ({
    ...item,
    idLibro: Number(item.idLibro),
    idAutor: Number(item.idAutor),
  }));
};

export const getLibroAutorByIds = async (idLibro: number, idAutor: number): Promise<LibroAutoresModel> => {
  const response = await axios.get<any>(`${API_URL}/${idLibro}/${idAutor}`);
  const item = response.data;
  return {
    ...item,
    idLibro: Number(item.idLibro),
    idAutor: Number(item.idAutor),
  };
};

export const createLibroAutor = async (
  idLibro: number,
  idAutor: number,
  rol: string
): Promise<LibroAutoresModel> => {
  const response = await axios.post<any>(
    `${API_URL}/${idLibro}/${idAutor}/${encodeURIComponent(rol)}`
  );
  const item = response.data;
  return {
    ...item,
    idLibro: Number(item.idLibro),
    idAutor: Number(item.idAutor),
  };
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
  const response = await axios.put<any>(url);
  const item = response.data;
  return {
    ...item,
    idLibro: Number(item.idLibro),
    idAutor: Number(item.idAutor),
  };
};

export const deleteLibroAutor = async (idLibro: number, idAutor: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${idLibro}/${idAutor}`);
};