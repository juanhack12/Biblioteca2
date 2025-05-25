// src/lib/services/prestamos.ts
import axios from 'axios';
import type { PrestamosModel, DateOnlyString } from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Prestamos`;

export const getAllPrestamos = async (): Promise<PrestamosModel[]> => {
  const response = await axios.get<PrestamosModel[]>(API_URL);
  return response.data.map(prestamo => ({
    ...prestamo,
    fechaPrestamo: formatDateForApi(prestamo.fechaPrestamo) || '',
    fechaDevolucion: formatDateForApi(prestamo.fechaDevolucion) || ''
  }));
};

export const getPrestamoById = async (id: number): Promise<PrestamosModel> => {
  const response = await axios.get<PrestamosModel>(`${API_URL}/${id}`);
  if (response.data.fechaPrestamo) {
    response.data.fechaPrestamo = formatDateForApi(response.data.fechaPrestamo) || '';
  }
  if (response.data.fechaDevolucion) {
    response.data.fechaDevolucion = formatDateForApi(response.data.fechaDevolucion) || '';
  }
  return response.data;
};

export const createPrestamo = async (
  idLector: number,
  idBibliotecario: number,
  idEjemplar: number,
  fechaPrestamo: DateOnlyString,
  fechaDevolucion: DateOnlyString
): Promise<PrestamosModel> => {
  const response = await axios.post<PrestamosModel>(
    `${API_URL}/${idLector}/${idBibliotecario}/${idEjemplar}/${encodeURIComponent(fechaPrestamo)}/${encodeURIComponent(fechaDevolucion)}`
  );
  if (response.data.fechaPrestamo) {
    response.data.fechaPrestamo = formatDateForApi(response.data.fechaPrestamo) || '';
  }
  if (response.data.fechaDevolucion) {
    response.data.fechaDevolucion = formatDateForApi(response.data.fechaDevolucion) || '';
  }
  return response.data;
};

export const updatePrestamo = async (
  id: number,
  idLector?: number | null,
  idBibliotecario?: number | null,
  idEjemplar?: number | null,
  fechaPrestamo?: DateOnlyString | null,
  fechaDevolucion?: DateOnlyString | null
): Promise<PrestamosModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (idLector !== undefined && idLector !== null) params.append('idLector', String(idLector));
  if (idBibliotecario !== undefined && idBibliotecario !== null) params.append('idBibliotecario', String(idBibliotecario));
  if (idEjemplar !== undefined && idEjemplar !== null) params.append('idEjemplar', String(idEjemplar));
  if (fechaPrestamo !== undefined && fechaPrestamo !== null) params.append('fechaPrestamo', fechaPrestamo);
  if (fechaDevolucion !== undefined && fechaDevolucion !== null) params.append('fechaDevolucion', fechaDevolucion);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<PrestamosModel>(url);
  if (response.data.fechaPrestamo) {
    response.data.fechaPrestamo = formatDateForApi(response.data.fechaPrestamo) || '';
  }
  if (response.data.fechaDevolucion) {
    response.data.fechaDevolucion = formatDateForApi(response.data.fechaDevolucion) || '';
  }
  return response.data;
};

export const deletePrestamo = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};
