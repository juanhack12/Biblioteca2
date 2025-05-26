// src/lib/services/libros.ts
import axios from 'axios';
import type { LibrosModel } from '@/lib/types'; // EditorialesModel no se necesita aquí para la lista
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Libros`;

// Helper function to transform API response to LibrosModel
const transformLibroData = (libroData: any): LibrosModel => {
  // El backend LibrosController devuelve LibrosModel directamente.
  // Este modelo NO tiene la Editorial anidada, solo IdEditorial.
  return {
    idLibro: Number(libroData.idLibro),
    titulo: libroData.titulo,
    anioPublicacion: String(libroData.anioPublicacion), // Backend envía int?, frontend usa string.
    idEditorial: Number(libroData.idEditorial),
    // No hay 'editorial' anidada aquí.
    // isbn y summary no vienen de los endpoints estándar de Get, podrían venir de otros flujos.
    isbn: libroData.isbn, 
    summary: libroData.summary,
  };
};

export const getAllLibros = async (): Promise<LibrosModel[]> => {
  const response = await axios.get<any[]>(API_URL);
  return response.data.map(transformLibroData);
};

export const getLibroById = async (id: number): Promise<LibrosModel> => {
  const response = await axios.get<any>(`${API_URL}/${id}`);
  return transformLibroData(response.data);
};

export const createLibro = async (
  titulo: string,
  anioPublicacion: string, // Frontend maneja como string, backend espera int
  idEditorial: number
): Promise<LibrosModel> => {
  const anioPublicacionNum = parseInt(anioPublicacion, 10); // Convertir a número para el backend
  const response = await axios.post<any>(
    `${API_URL}/${encodeURIComponent(titulo)}/${anioPublicacionNum}/${idEditorial}`
  );
  return transformLibroData(response.data);
};

export const updateLibro = async (
  id: number,
  titulo?: string | null,
  anioPublicacion?: string | null, // Frontend maneja como string
  idEditorial?: number | null
): Promise<LibrosModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (titulo !== undefined && titulo !== null) params.append('titulo', titulo);
  if (anioPublicacion !== undefined && anioPublicacion !== null) {
    params.append('anioPublicacion', String(parseInt(anioPublicacion, 10))); // Convertir a número
  }
  if (idEditorial !== undefined && idEditorial !== null) params.append('idEditorial', String(idEditorial));

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<any>(url);
  return transformLibroData(response.data);
};

export const deleteLibro = async (id: number): Promise<void> => {
  await axios.delete<any>(`${API_URL}/${id}`);
};
