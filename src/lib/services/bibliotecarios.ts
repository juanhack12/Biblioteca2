// src/lib/services/bibliotecarios.ts
import axios from 'axios';
import type { BibliotecariosModel, DateOnlyString } from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Bibliotecarios`;

export const getAllBibliotecarios = async (): Promise<BibliotecariosModel[]> => {
  const response = await axios.get<BibliotecariosModel[]>(API_URL);
  return response.data.map(bibliotecario => ({
    ...bibliotecario,
    fechaContratacion: bibliotecario.fechaContratacion ? formatDateForApi(bibliotecario.fechaContratacion) : undefined
  }));
};

export const getBibliotecarioById = async (id: number): Promise<BibliotecariosModel> => {
  const response = await axios.get<BibliotecariosModel>(`${API_URL}/${id}`);
  if (response.data.fechaContratacion) {
    response.data.fechaContratacion = formatDateForApi(response.data.fechaContratacion);
  }
  return response.data;
};

export const createBibliotecario = async (
  idPersona: number,
  fechaContratacion: DateOnlyString | undefined,
  turno: string
): Promise<BibliotecariosModel> => {
  const fechaContratacionParam = fechaContratacion || 'null';
  const response = await axios.post<BibliotecariosModel>(
    `${API_URL}/${idPersona}/${encodeURIComponent(fechaContratacionParam)}/${encodeURIComponent(turno)}`
  );
  if (response.data.fechaContratacion) {
    response.data.fechaContratacion = formatDateForApi(response.data.fechaContratacion);
  }
  return response.data;
};

export const updateBibliotecario = async (
  id: number,
  idPersona?: number | null,
  fechaContratacion?: DateOnlyString | null,
  turno?: string | null
): Promise<BibliotecariosModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (idPersona !== undefined && idPersona !== null) params.append('idPersona', String(idPersona));
  if (fechaContratacion !== undefined && fechaContratacion !== null) params.append('fechaContratacion', fechaContratacion);
  if (turno !== undefined && turno !== null) params.append('turno', turno);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<BibliotecariosModel>(url);
  if (response.data.fechaContratacion) {
    response.data.fechaContratacion = formatDateForApi(response.data.fechaContratacion);
  }
  return response.data;
};

export const deleteBibliotecario = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};
