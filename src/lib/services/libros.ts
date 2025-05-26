// src/lib/services/libros.ts
import axios from 'axios';
import type { LibrosModel, EditorialesModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Libros`;

// Helper function to transform API response to LibrosModel
const transformLibroData = (libroData: any): LibrosModel => {
  const editorial = libroData.editorial ? {
    idEditorial: Number(libroData.editorial.idEditorial),
    nombre: libroData.editorial.nombre,
    pais: libroData.editorial.pais,
    ciudad: libroData.editorial.ciudad,
    sitioWeb: libroData.editorial.sitioWeb,
  } as EditorialesModel : undefined;

  return {
    idLibro: Number(libroData.idLibro),
    titulo: libroData.titulo,
    anioPublicacion: libroData.anioPublicacion, // Assuming API returns as string
    idEditorial: Number(libroData.idEditorial), // Keep idEditorial for forms
    editorial: editorial, // Mapped nested editorial object
    isbn: libroData.isbn,
    summary: libroData.summary,
  };
};

export const getAllLibros = async (): Promise<LibrosModel[]> => {
  const response = await axios.get<any[]>(API_URL);
  // Assuming your API for GET /Libros now returns the nested editorial object
  // e.g., each libro item has an 'editorial' property which is an EditorialesModel
  return response.data.map(transformLibroData);
};

export const getLibroById = async (id: number): Promise<LibrosModel> => {
  const response = await axios.get<any>(`${API_URL}/${id}`);
  // Assuming API for GET /Libros/{id} returns nested editorial object
  return transformLibroData(response.data);
};

export const createLibro = async (
  titulo: string,
  anioPublicacion: string,
  idEditorial: number // API still expects idEditorial for creation
): Promise<LibrosModel> => {
  const response = await axios.post<any>(
    `${API_URL}/${encodeURIComponent(titulo)}/${encodeURIComponent(anioPublicacion)}/${idEditorial}`
  );
  // API response after creation might or might not include nested editorial.
  // transformLibroData will handle it if present.
  return transformLibroData(response.data);
};

export const updateLibro = async (
  id: number,
  titulo?: string | null,
  anioPublicacion?: string | null,
  idEditorial?: number | null // API still expects idEditorial for update
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
  // API response after update might or might not include nested editorial.
  return transformLibroData(response.data);
};

export const deleteLibro = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};
