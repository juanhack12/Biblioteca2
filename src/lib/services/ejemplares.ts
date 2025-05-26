// src/lib/services/ejemplares.ts
import axios from 'axios';
import type { EjemplaresModel, EjemplaresApiResponseDTO, LibrosModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Ejemplares`;

const transformEjemplarData = (dto: EjemplaresApiResponseDTO): EjemplaresModel => {
  let libroMapped: LibrosModel | undefined = undefined;
  if (dto.libros) { // El DTO usa 'libros' (plural)
    libroMapped = {
      idLibro: Number(dto.libros.idLibro),
      titulo: dto.libros.titulo,
      anioPublicacion: String(dto.libros.anioPublicacion), // Asegurar string
      idEditorial: Number(dto.libros.idEditorial),
      // isbn y summary no vienen del LibrosModel del DTO
    };
  }
  return {
    idEjemplar: Number(dto.idEjemplar),
    idLibro: dto.idLibro ? Number(dto.idLibro) : undefined,
    ubicacion: dto.ubicacion,
    tituloLibro: dto.titulo || libroMapped?.titulo,
    libro: libroMapped,
  };
};

export const getAllEjemplares = async (): Promise<EjemplaresModel[]> => {
  const response = await axios.get<EjemplaresApiResponseDTO[]>(API_URL);
  return response.data.map(transformEjemplarData);
};

export const getEjemplarById = async (id: number): Promise<EjemplaresModel> => {
  const response = await axios.get<EjemplaresApiResponseDTO>(`${API_URL}/${id}`);
  return transformEjemplarData(response.data);
};

export const createEjemplar = async (
  idLibro: number,
  ubicacion: string
): Promise<EjemplaresModel> => {
  // El backend devuelve EjemplaresModel, no DTO, para Create/Update/Delete
  const response = await axios.post<any>(
    `${API_URL}/${idLibro}/${encodeURIComponent(ubicacion)}`
  );
  // Asumimos que la respuesta de Create es un EjemplaresModel que podría necesitar ser enriquecido
  // o transformado si queremos la misma estructura que el DTO para la UI inmediatamente.
  return transformEjemplarData(response.data as EjemplaresApiResponseDTO);
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
  return transformEjemplarData(response.data as EjemplaresApiResponseDTO);
};

export const deleteEjemplar = async (id: number): Promise<void> => {
  await axios.delete<any>(`${API_URL}/${id}`);
};
