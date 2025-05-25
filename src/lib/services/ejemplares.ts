// src/lib/services/ejemplares.ts
import axios from 'axios';
import type { EjemplaresModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Ejemplares`;

export const getAllEjemplares = async (): Promise<EjemplaresModel[]> => {
  const response = await axios.get<any[]>(API_URL);
  return response.data.map(ejemplar => ({
    ...ejemplar,
    idEjemplar: Number(ejemplar.idEjemplar),
    idLibro: ejemplar.idLibro ? Number(ejemplar.idLibro) : undefined,
  }));
};

export const getEjemplarById = async (id: number): Promise<EjemplaresModel> => {
  const response = await axios.get<any>(`${API_URL}/${id}`);
  const ejemplar = response.data;
  return {
    ...ejemplar,
    idEjemplar: Number(ejemplar.idEjemplar),
    idLibro: ejemplar.idLibro ? Number(ejemplar.idLibro) : undefined,
  };
};

export const createEjemplar = async (
  idLibro: number,
  ubicacion: string
): Promise<EjemplaresModel> => {
  const response = await axios.post<any>(
    `${API_URL}/${idLibro}/${encodeURIComponent(ubicacion)}`
  );
  const ejemplar = response.data;
  return {
    ...ejemplar,
    idEjemplar: Number(ejemplar.idEjemplar),
    idLibro: ejemplar.idLibro ? Number(ejemplar.idLibro) : undefined,
  };
};

export const updateEjemplar = async (
  id: number,
  idLibro?: number | null,
  ubicacion?: string | null
): Promise<EjemplaresModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (idLibro !== undefined && idLibro !== null) params.append('idLibro', String(idLibro));
  if (ubicacion !== undefined && ubicacion !== null) params.append('ubicacion', ubicacion);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<any>(url);
  const ejemplar = response.data;
  return {
    ...ejemplar,
    idEjemplar: Number(ejemplar.idEjemplar),
    idLibro: ejemplar.idLibro ? Number(ejemplar.idLibro) : undefined,
  };
};

export const deleteEjemplar = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};