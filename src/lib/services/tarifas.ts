// src/lib/services/tarifas.ts
import axios from 'axios';
import type { TarifasModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Tarifas`;

export const getAllTarifas = async (): Promise<TarifasModel[]> => {
  const response = await axios.get<TarifasModel[]>(API_URL);
  return response.data;
};

export const getTarifaById = async (id: number): Promise<TarifasModel> => {
  const response = await axios.get<TarifasModel>(`${API_URL}/${id}`);
  return response.data;
};

export const createTarifa = async (
  idPrestamo: number,
  diasRetraso: number,
  montoTarifa: number
): Promise<TarifasModel> => {
  const response = await axios.post<TarifasModel>(
    `${API_URL}/${idPrestamo}/${diasRetraso}/${montoTarifa}`
  );
  return response.data;
};

export const updateTarifa = async (
  id: number,
  idPrestamo?: number | null,
  diasRetraso?: number | null,
  montoTarifa?: number | null
): Promise<TarifasModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (idPrestamo !== undefined && idPrestamo !== null) params.append('idPrestamo', String(idPrestamo));
  if (diasRetraso !== undefined && diasRetraso !== null) params.append('diasRetraso', String(diasRetraso));
  if (montoTarifa !== undefined && montoTarifa !== null) params.append('montoTarifa', String(montoTarifa));

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<TarifasModel>(url);
  return response.data;
};

export const deleteTarifa = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};
