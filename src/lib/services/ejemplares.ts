// src/lib/services/ejemplares.ts
import axios from 'axios';
import type { EjemplaresModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Ejemplares`;

export const getAllEjemplares = async (): Promise<EjemplaresModel[]> => {
  const response = await axios.get<EjemplaresModel[]>(API_URL);
  return response.data;
};

export const getEjemplarById = async (id: number): Promise<EjemplaresModel> => {
  const response = await axios.get<EjemplaresModel>(`${API_URL}/${id}`);
  return response.data;
};

export const createEjemplar = async (
  idLibro: number,
  ubicacion: string
): Promise<EjemplaresModel> => {
  const response = await axios.post<EjemplaresModel>(
    `${API_URL}/${idLibro}/${encodeURIComponent(ubicacion)}`
  );
  return response.data;
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
  const response = await axios.put<EjemplaresModel>(url);
  return response.data;
};

export const deleteEjemplar = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};
