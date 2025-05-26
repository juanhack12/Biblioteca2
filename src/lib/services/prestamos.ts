// src/lib/services/prestamos.ts
import axios from 'axios';
import type { 
  PrestamosModel, 
  PrestamosApiResponseDTO, 
  DateOnlyString,
  LectoresApiResponseDTO,
  BibliotecariosApiResponseDTO,
  EjemplaresApiResponseDTO, // Usamos el DTO de Ejemplares si es lo que anida PrestamosDTO
  LectoresModel,
  BibliotecariosModel,
  EjemplaresModel,
  PersonasModel,
  LibrosModel
} from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Prestamos`;

// Funciones de transformación individuales para mantener la claridad
const transformLectorSubData = (dto?: LectoresApiResponseDTO): LectoresModel | undefined => {
  if (!dto) return undefined;
  let personaMapped: PersonasModel | undefined = undefined;
  if (dto.personas) {
    personaMapped = { ...dto.personas, idPersona: Number(dto.personas.idPersona), fechaNacimiento: formatDateForApi(dto.personas.fechaNacimiento) || '' };
  }
  return {
    idLector: Number(dto.idLector),
    idPersona: dto.idPersona ? Number(dto.idPersona) : undefined,
    fechaRegistro: formatDateForApi(dto.fechaRegistro),
    ocupacion: dto.ocupacion,
    nombre: dto.nombre || personaMapped?.nombre,
    apellido: dto.apellido || personaMapped?.apellido,
    documentoIdentidad: dto.documentoIdentidad || personaMapped?.documentoIdentidad,
    persona: personaMapped,
  };
};

const transformBibliotecarioSubData = (dto?: BibliotecariosApiResponseDTO): BibliotecariosModel | undefined => {
  if (!dto) return undefined;
  let personaMapped: PersonasModel | undefined = undefined;
  if (dto.personas) {
     personaMapped = { ...dto.personas, idPersona: Number(dto.personas.idPersona), fechaNacimiento: formatDateForApi(dto.personas.fechaNacimiento) || '' };
  }
  return {
    idBibliotecario: Number(dto.idBibliotecario),
    idPersona: dto.idPersona ? Number(dto.idPersona) : undefined,
    fechaContratacion: formatDateForApi(dto.fechaContratacion),
    turno: dto.turno,
    nombre: dto.nombre || personaMapped?.nombre,
    apellido: dto.apellido || personaMapped?.apellido,
    documentoIdentidad: dto.documentoIdentidad || personaMapped?.documentoIdentidad,
    persona: personaMapped,
  };
};

const transformEjemplarSubData = (dto?: EjemplaresModel): EjemplaresModel | undefined => {
  // El backend DTO de Prestamos anida EjemplaresModel, no EjemplaresDTO
  // EjemplaresModel a su vez anida LibrosModel
  if (!dto) return undefined;
  let libroMapped: LibrosModel | undefined = undefined;
  if (dto.libro) { // Asumiendo que EjemplaresModel en frontend tiene 'libro'
    libroMapped = {
        ...dto.libro,
        idLibro: Number(dto.libro.idLibro),
        anioPublicacion: String(dto.libro.anioPublicacion),
        idEditorial: Number(dto.libro.idEditorial),
    }
  }
  return {
    idEjemplar: Number(dto.idEjemplar),
    idLibro: dto.idLibro ? Number(dto.idLibro) : undefined,
    ubicacion: dto.ubicacion,
    tituloLibro: libroMapped?.titulo || (dto as any).libros?.titulo, // 'libros' si viene del DTO Ejemplar
    libro: libroMapped || ((dto as any).libros ? transformLibroSubData((dto as any).libros) : undefined)
  };
};

const transformLibroSubData = (librosModel?: any): LibrosModel | undefined => {
    if (!librosModel) return undefined;
    return {
        idLibro: Number(librosModel.idLibro),
        titulo: librosModel.titulo,
        anioPublicacion: String(librosModel.anioPublicacion),
        idEditorial: Number(librosModel.idEditorial),
    };
};


const transformPrestamoData = (dto: PrestamosApiResponseDTO): PrestamosModel => {
  const lectorTransformed = transformLectorSubData(dto.lectores);
  const bibliotecarioTransformed = transformBibliotecarioSubData(dto.bibliotecarios);
  // DTO de Prestamos anida EjemplaresModel (que a su vez tiene LibrosModel)
  const ejemplarTransformed = dto.ejemplares ? {
    ...dto.ejemplares,
    idEjemplar: Number(dto.ejemplares.idEjemplar),
    idLibro: dto.ejemplares.idLibro ? Number(dto.ejemplares.idLibro) : undefined,
    libro: dto.ejemplares.libro ? transformLibroSubData(dto.ejemplares.libro) : undefined,
    // Añadimos tituloLibro al ejemplar anidado también
    tituloLibro: dto.ejemplares.libro?.titulo 
  } as EjemplaresModel : undefined;


  return {
    idPrestamo: Number(dto.idPrestamo),
    idLector: Number(dto.idLector),
    idBibliotecario: Number(dto.idBibliotecario),
    idEjemplar: Number(dto.idEjemplar),
    fechaPrestamo: formatDateForApi(dto.fechaPrestamo) || '',
    fechaDevolucion: formatDateForApi(dto.fechaDevolucion) || '',
    nombreLector: dto.nombreLector || (lectorTransformed?.nombre ? `${lectorTransformed.nombre} ${lectorTransformed.apellido}` : undefined),
    nombreBibliotecario: dto.nombreBibliotecario || (bibliotecarioTransformed?.nombre ? `${bibliotecarioTransformed.nombre} ${bibliotecarioTransformed.apellido}` : undefined),
    tituloLibroEjemplar: ejemplarTransformed?.libro?.titulo,
    lector: lectorTransformed,
    bibliotecario: bibliotecarioTransformed,
    ejemplar: ejemplarTransformed
  };
};


export const getAllPrestamos = async (): Promise<PrestamosModel[]> => {
  const response = await axios.get<PrestamosApiResponseDTO[]>(API_URL);
  return response.data.map(transformPrestamoData);
};

export const getPrestamoById = async (id: number): Promise<PrestamosModel> => {
  const response = await axios.get<PrestamosApiResponseDTO>(`${API_URL}/${id}`);
  return transformPrestamoData(response.data);
};

export const createPrestamo = async (
  idLector: number,
  idBibliotecario: number,
  idEjemplar: number,
  fechaPrestamo: DateOnlyString,
  fechaDevolucion: DateOnlyString
): Promise<PrestamosModel> => {
  // Backend devuelve PrestamosModel
  const response = await axios.post<any>(
    `${API_URL}/${idLector}/${idBibliotecario}/${idEjemplar}/${encodeURIComponent(fechaPrestamo)}/${encodeURIComponent(fechaDevolucion)}`
  );
  // Es posible que la respuesta de create no sea el DTO completo.
  // Para tener consistencia, podríamos necesitar volver a buscar el préstamo por ID para obtener el DTO completo.
  // O, si el backend devuelve el DTO enriquecido en create, usamos eso.
  // Por ahora, asumimos que devuelve un DTO-like o un modelo que necesita transformación.
  return transformPrestamoData(response.data as PrestamosApiResponseDTO);
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
  
  if (fechaPrestamo !== undefined) {
    params.append('fechaPrestamo', fechaPrestamo === null ? 'null' : fechaPrestamo);
  }
  if (fechaDevolucion !== undefined) {
    params.append('fechaDevolucion', fechaDevolucion === null ? 'null' : fechaDevolucion);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<any>(url);
  return transformPrestamoData(response.data as PrestamosApiResponseDTO);
};

export const deletePrestamo = async (id: number): Promise<void> => {
  await axios.delete<any>(`${API_URL}/${id}`);
};
