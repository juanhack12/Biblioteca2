// src/lib/services/editoriales.ts
import axios from 'axios';
import type { EditorialesModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Editoriales`;

export const getAllEditoriales = async (): Promise<EditorialesModel[]> => {
  const response = await axios.get<any[]>(API_URL);
  return response.data.map(editorial => ({
    ...editorial,
    idEditorial: Number(editorial.idEditorial),
  }));
};

export const getEditorialById = async (id: number): Promise<EditorialesModel> => {
  const response = await axios.get<any>(`${API_URL}/${id}`);
  const editorial = response.data;
  return {
    ...editorial,
    idEditorial: Number(editorial.idEditorial),
  };
};

export const createEditorial = async (
  nombre: string,
  pais: string,
  ciudad: string,
  sitioWeb: string
): Promise<EditorialesModel> => {
  const response = await axios.post<any>(
    `${API_URL}/${encodeURIComponent(nombre)}/${encodeURIComponent(pais)}/${encodeURIComponent(ciudad)}/${encodeURIComponent(sitioWeb || 'null')}` // handle empty string for sitioWeb
  );
  const editorial = response.data;
  return {
    ...editorial,
    idEditorial: Number(editorial.idEditorial),
  };
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
  if (sitioWeb !== undefined && sitioWeb !== null) params.append('sitioWeb', sitioWeb || 'null');

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<any>(url);
  const editorial = response.data;
  return {
    ...editorial,
    idEditorial: Number(editorial.idEditorial),
  };
};

export const deleteEditorial = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};