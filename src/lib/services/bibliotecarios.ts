// src/lib/services/bibliotecarios.ts
import axios from 'axios';
import type { BibliotecariosModel, DateOnlyString } from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Bibliotecarios`;

export const getAllBibliotecarios = async (): Promise<BibliotecariosModel[]> => {
  const response = await axios.get<any[]>(API_URL);
  return response.data.map(bibliotecario => ({
    ...bibliotecario,
    idBibliotecario: Number(bibliotecario.idBibliotecario),
    idPersona: bibliotecario.idPersona ? Number(bibliotecario.idPersona) : undefined,
    fechaContratacion: bibliotecario.fechaContratacion ? formatDateForApi(bibliotecario.fechaContratacion) : undefined
  }));
};

export const getBibliotecarioById = async (id: number): Promise<BibliotecariosModel> => {
  const response = await axios.get<any>(`${API_URL}/${id}`);
  const bibliotecario = response.data;
  return {
    ...bibliotecario,
    idBibliotecario: Number(bibliotecario.idBibliotecario),
    idPersona: bibliotecario.idPersona ? Number(bibliotecario.idPersona) : undefined,
    fechaContratacion: bibliotecario.fechaContratacion ? formatDateForApi(bibliotecario.fechaContratacion) : undefined,
  };
};

export const createBibliotecario = async (
  idPersona: number,
  fechaContratacion: DateOnlyString | undefined,
  turno: string
): Promise<BibliotecariosModel> => {
  const fechaContratacionParam = fechaContratacion || 'null';
  const response = await axios.post<any>(
    `${API_URL}/${idPersona}/${encodeURIComponent(fechaContratacionParam)}/${encodeURIComponent(turno)}`
  );
  const bibliotecario = response.data;
  return {
    ...bibliotecario,
    idBibliotecario: Number(bibliotecario.idBibliotecario),
    idPersona: bibliotecario.idPersona ? Number(bibliotecario.idPersona) : undefined,
    fechaContratacion: bibliotecario.fechaContratacion ? formatDateForApi(bibliotecario.fechaContratacion) : undefined,
  };
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
  const response = await axios.put<any>(url);
  const bibliotecario = response.data;
  return {
    ...bibliotecario,
    idBibliotecario: Number(bibliotecario.idBibliotecario),
    idPersona: bibliotecario.idPersona ? Number(bibliotecario.idPersona) : undefined,
    fechaContratacion: bibliotecario.fechaContratacion ? formatDateForApi(bibliotecario.fechaContratacion) : undefined,
  };
};

export const deleteBibliotecario = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};