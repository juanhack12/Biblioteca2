// src/lib/services/libros.ts
import axios from 'axios';
import type { LibrosModel, LibrosApiResponseDTO, EditorialesModel } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

// Helper function to transform API DTO response to LibrosModel
const transformLibroData = (dto: LibrosApiResponseDTO): LibrosModel => {
  return {
    idLibro: Number(dto.idLibro),
    titulo: dto.titulo,
    // Backend anioPublicacion es int?, frontend lo maneja como string para el form
    anioPublicacion: dto.anioPublicacion?.toString() || '', 
    idEditorial: Number(dto.idEditorial),
    // El DTO ahora tiene 'Nombre' (nombre de la editorial) y 'Editoriales' (el objeto editorial)
    nombreEditorial: dto.nombre || dto.editoriales?.nombre, 
    editorial: dto.editoriales ? {
        idEditorial: Number(dto.editoriales.idEditorial),
        nombre: dto.editoriales.nombre,
        pais: dto.editoriales.pais,
        ciudad: dto.editoriales.ciudad,
        sitioWeb: dto.editoriales.sitioWeb || '',
    } : undefined,
    // isbn y summary no vienen de los endpoints estándar de Get, podrían venir de otros flujos.
    // isbn: dto.isbn, 
    // summary: dto.summary,
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
export const createLibro = async (
  titulo: string,
  anioPublicacion: string, // Frontend maneja como string, backend espera int
  idEditorial: number
): Promise<LibrosModel> => {
  const anioPublicacionNum = parseInt(anioPublicacion, 10); 
  // La respuesta de create es LibrosModel según el controller, no LibrosDTO.
  // Asumimos que el backend no devuelve la editorial anidada al crear.
  // Si la devolviera como DTO, necesitaríamos ajustar.
  const response = await axios.post<any>( // Usamos 'any' y luego transformamos selectivamente
    `${API_URL}/${encodeURIComponent(titulo)}/${anioPublicacionNum}/${idEditorial}`
  );
  // Para consistencia, si create devuelve solo LibrosModel básico, lo mapeamos
  // y los campos de editorial (nombreEditorial, editorial) serían undefined.
  // Si create devuelve LibrosDTO, este transformador funcionará.
  // El controller dice: Task<ActionResult<LibrosModel>> CreateLibro
  // por lo que NO vendrá el DTO completo al crear.
  // Lo más seguro es mapear solo los campos que sabemos que vienen.
  const createdLibroData = response.data;
  return {
    idLibro: Number(createdLibroData.idLibro),
    titulo: createdLibroData.titulo,
    anioPublicacion: createdLibroData.anioPublicacion?.toString() || '',
    idEditorial: Number(createdLibroData.idEditorial),
    // nombreEditorial y editorial serán undefined aquí, a menos que el backend cambie.
  };
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
  // Similar a create, el controller devuelve LibrosModel, no DTO.
  const response = await axios.put<any>(url);
  const updatedLibroData = response.data;
   return {
    idLibro: Number(updatedLibroData.idLibro),
    titulo: updatedLibroData.titulo,
    anioPublicacion: updatedLibroData.anioPublicacion?.toString() || '',
    idEditorial: Number(updatedLibroData.idEditorial),
  };
};

export const deleteLibro = async (id: number): Promise<void> => {
  // El controller devuelve LibrosModel, no necesitamos transformar la respuesta de delete si no la usamos.
  await axios.delete<any>(`${API_URL}/${id}`);
};
