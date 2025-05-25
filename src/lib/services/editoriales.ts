// src/lib/services/editoriales.ts
import axios from 'axios';
import type { EditorialesModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Editoriales`;

export const getAllEditoriales = async (): Promise<EditorialesModel[]> => {
  const response = await axios.get<EditorialesModel[]>(API_URL);
  return response.data;
};

export const getEditorialById = async (id: number): Promise<EditorialesModel> => {
  const response = await axios.get<EditorialesModel>(`${API_URL}/${id}`);
  return response.data;
};

export const createEditorial = async (
  nombre: string,
  pais: string,
  ciudad: string,
  sitioWeb: string
): Promise<EditorialesModel> => {
  const response = await axios.post<EditorialesModel>(
    `${API_URL}/${encodeURIComponent(nombre)}/${encodeURIComponent(pais)}/${encodeURIComponent(ciudad)}/${encodeURIComponent(sitioWeb)}`
  );
  return response.data;
};

export const updateEditorial = async (
  id: number,
  nombre?: string | null,
  pais?: string | null,
  ciudad?: string | null,
  sitioWeb?: string | null
): Promise<EditorialesModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (nombre !== undefined && nombre !== null) params.append('nombre', nombre);
  if (pais !== undefined && pais !== null) params.append('pais', pais);
  if (ciudad !== undefined && ciudad !== null) params.append('ciudad', ciudad);
  if (sitioWeb !== undefined && sitioWeb !== null) params.append('sitioWeb', sitioWeb);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<EditorialesModel>(url);
  return response.data;
};

export const deleteEditorial = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};
