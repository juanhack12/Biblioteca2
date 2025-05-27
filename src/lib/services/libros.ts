// src/lib/services/libros.ts
import axios from 'axios';
import type { LibrosModel, LibrosApiResponseDTO, EditorialesModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config'; // Asegúrate de que esta línea esté presente

const API_URL = `${API_BASE_URL}/Libros`; // Define API_URL usando API_BASE_URL

// Helper function to transform API DTO response to LibrosModel
const transformLibroData = (dto: LibrosApiResponseDTO): LibrosModel => {
  // El DTO del backend tiene 'Nombre' (nombre de la editorial) y 'Editoriales' (el objeto editorial)
  // y 'AnioPublicacion' como int?
  return {
    idLibro: Number(dto.idLibro),
    titulo: dto.titulo,
    anioPublicacion: dto.anioPublicacion?.toString() ?? '', // Frontend lo maneja como string
    idEditorial: Number(dto.idEditorial),
    nombreEditorial: dto.nombre || dto.editoriales?.nombre, // Usar el campo 'Nombre' si está, o el del objeto anidado
    editorial: dto.editoriales ? {
        idEditorial: Number(dto.editoriales.idEditorial),
        nombre: dto.editoriales.nombre,
        pais: dto.editoriales.pais,
        ciudad: dto.editoriales.ciudad,
        sitioWeb: dto.editoriales.sitioWeb || '',
    } : undefined,
  };
};

// Para cuando el backend devuelve LibrosModel directamente (ej. en Create/Update)
const transformBasicLibroData = (model: any): LibrosModel => {
  return {
    idLibro: Number(model.idLibro),
    titulo: model.titulo,
    anioPublicacion: model.anioPublicacion?.toString() ?? '',
    idEditorial: Number(model.idEditorial),
    // nombreEditorial y editorial serán undefined aquí si no vienen del backend en este contexto
  };
};


export const getAllLibros = async (): Promise<LibrosModel[]> => {
  const response = await axios.get<LibrosApiResponseDTO[]>(API_URL);
  return response.data.map(transformLibroData);
};

export const getLibroById = async (id: number): Promise<LibrosModel> => {
  const response = await axios.get<LibrosApiResponseDTO>(`${API_URL}/${id}`);
  return transformLibroData(response.data);
};

// El backend espera titulo, anioPublicacion (int), idEditorial (int)
// El controller de Libros devuelve LibrosModel, no LibrosDTO para Create/Update.
export const createLibro = async (
  titulo: string,
  anioPublicacion: string,
  idEditorial: number
): Promise<LibrosModel> => {
  const anioPublicacionNum = parseInt(anioPublicacion, 10); 
  const response = await axios.post<any>(
    `${API_URL}/${encodeURIComponent(titulo)}/${anioPublicacionNum}/${idEditorial}`
  );
  // La respuesta es LibrosModel básico del backend, lo transformamos
  return transformBasicLibroData(response.data);
};

export const updateLibro = async (
  id: number,
  titulo?: string | null,
  anioPublicacion?: string | null, 
  idEditorial?: number | null
): Promise<LibrosModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (titulo !== undefined && titulo !== null) params.append('titulo', titulo);
  if (anioPublicacion !== undefined && anioPublicacion !== null) {
    params.append('anioPublicacion', String(parseInt(anioPublicacion, 10))); 
  }
  if (idEditorial !== undefined && idEditorial !== null) params.append('idEditorial', String(idEditorial));

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<any>(url);
  // La respuesta es LibrosModel básico del backend
  return transformBasicLibroData(response.data);
};

export const deleteLibro = async (id: number): Promise<void> => {
  await axios.delete<any>(`${API_URL}/${id}`);
};
