// src/lib/services/prestamos.ts
import axios from 'axios';
import type { 
  PrestamosModel, 
  PrestamosApiResponseDTO, 
  DateOnlyString,
  LectoresApiResponseDTO,
  BibliotecariosApiResponseDTO,
  EjemplaresApiResponseDTO,
  LectoresModel,
  BibliotecariosModel,
  EjemplaresModel,
  PersonasModel,
  LibrosModel // Necesitamos LibrosModel para el ejemplar anidado
} from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Prestamos`;

const transformLectorSubData = (dto?: LectoresApiResponseDTO): LectoresModel | undefined => {
  if (!dto) return undefined;
  let personaMapped: PersonasModel | undefined = undefined;
  if (dto.personas) { // API envía 'Personas' (PascalCase)
    personaMapped = { 
        idPersona: Number(dto.personas.idPersona),
        nombre: dto.personas.nombre,
        apellido: dto.personas.apellido,
        documentoIdentidad: dto.personas.documentoIdentidad,
        fechaNacimiento: formatDateForApi(dto.personas.fechaNacimiento) || '',
        correo: dto.personas.correo,
        telefono: dto.personas.telefono,
        direccion: dto.personas.direccion,
     };
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
  if (dto.personas) { // API envía 'Personas'
     personaMapped = { 
        idPersona: Number(dto.personas.idPersona),
        nombre: dto.personas.nombre,
        apellido: dto.personas.apellido,
        documentoIdentidad: dto.personas.documentoIdentidad,
        fechaNacimiento: formatDateForApi(dto.personas.fechaNacimiento) || '',
        correo: dto.personas.correo,
        telefono: dto.personas.telefono,
        direccion: dto.personas.direccion,
      };
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

// El DTO de Préstamos anida EjemplaresModel, que a su vez anida LibrosModel
const transformEjemplarSubData = (ejemplarModel?: EjemplaresModel): EjemplaresModel | undefined => {
  if (!ejemplarModel) return undefined;
  
  let libroTransformed: LibrosModel | undefined = undefined;
  if (ejemplarModel.libro) { // Asumiendo que el EjemplaresModel del frontend tiene 'libro'
    libroTransformed = {
        idLibro: Number(ejemplarModel.libro.idLibro),
        titulo: ejemplarModel.libro.titulo,
        anioPublicacion: String(ejemplarModel.libro.anioPublicacion), // asegurar string
        idEditorial: Number(ejemplarModel.libro.idEditorial),
        // nombreEditorial y editorial no vendrían anidados aquí desde el LibrosModel básico
    };
  } else if ((ejemplarModel as any).libros) { // Fallback si viniera como 'libros' (del DTO de Ejemplar)
      const librosData = (ejemplarModel as any).libros;
      libroTransformed = {
        idLibro: Number(librosData.idLibro),
        titulo: librosData.titulo,
        anioPublicacion: String(librosData.anioPublicacion),
        idEditorial: Number(librosData.idEditorial),
      };
  }

  return {
    idEjemplar: Number(ejemplarModel.idEjemplar),
    idLibro: ejemplarModel.idLibro ? Number(ejemplarModel.idLibro) : undefined,
    ubicacion: ejemplarModel.ubicacion,
    // El título del libro ahora vendrá de la propiedad 'Titulo' en el PrestamosDTO
    // o podemos intentar obtenerlo del libro anidado si está presente.
    tituloLibro: (ejemplarModel as any).titulo || libroTransformed?.titulo,
    libro: libroTransformed
  };
};


const transformPrestamoData = (dto: PrestamosApiResponseDTO): PrestamosModel => {
  const lectorTransformed = transformLectorSubData(dto.lectores);
  const bibliotecarioTransformed = transformBibliotecarioSubData(dto.bibliotecarios);
  // El DTO de Préstamos anida EjemplaresModel (del backend, que tiene LibrosModel anidado)
  const ejemplarTransformed = dto.ejemplares ? transformEjemplarSubData(dto.ejemplares) : undefined;

  return {
    idPrestamo: Number(dto.idPrestamo),
    idLector: Number(dto.idLector),
    idBibliotecario: Number(dto.idBibliotecario),
    idEjemplar: Number(dto.idEjemplar),
    fechaPrestamo: formatDateForApi(dto.fechaPrestamo) || '',
    fechaDevolucion: formatDateForApi(dto.fechaDevolucion) || '',
    nombreLector: dto.nombreLector || (lectorTransformed?.nombre ? `${lectorTransformed.nombre} ${lectorTransformed.apellido || ''}`.trim() : undefined),
    nombreBibliotecario: dto.nombreBibliotecario || (bibliotecarioTransformed?.nombre ? `${bibliotecarioTransformed.nombre} ${bibliotecarioTransformed.apellido || ''}`.trim() : undefined),
    // Usar la propiedad Titulo directamente del PrestamosDTO
    tituloLibroEjemplar: dto.titulo, 
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

// El controller devuelve PrestamosModel, no DTO
export const createPrestamo = async (
  idLector: number,
  idBibliotecario: number,
  idEjemplar: number,
  fechaPrestamo: DateOnlyString,
  fechaDevolucion: DateOnlyString
): Promise<PrestamosModel> => {
  const response = await axios.post<any>( // Respuesta es PrestamosModel según controller
    `${API_URL}/${idLector}/${idBibliotecario}/${idEjemplar}/${encodeURIComponent(fechaPrestamo)}/${encodeURIComponent(fechaDevolucion)}`
  );
  // Mapeamos la respuesta del backend (que es PrestamosModel)
  // Los campos descriptivos (nombreLector, nombreBibliotecario, tituloLibroEjemplar) no estarán en esta respuesta
  // y serán undefined. Se poblarán al recargar la lista.
  const createdData = response.data;
  return {
    idPrestamo: Number(createdData.idPrestamo),
    idLector: Number(createdData.idLector),
    idBibliotecario: Number(createdData.idBibliotecario),
    idEjemplar: Number(createdData.idEjemplar),
    fechaPrestamo: formatDateForApi(createdData.fechaPrestamo) || '',
    fechaDevolucion: formatDateForApi(createdData.fechaDevolucion) || '',
  };
};

// El controller devuelve PrestamosModel, no DTO
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
  const response = await axios.put<any>(url); // Respuesta es PrestamosModel
  const updatedData = response.data;
  return {
    idPrestamo: Number(updatedData.idPrestamo),
    idLector: Number(updatedData.idLector),
    idBibliotecario: Number(updatedData.idBibliotecario),
    idEjemplar: Number(updatedData.idEjemplar),
    fechaPrestamo: formatDateForApi(updatedData.fechaPrestamo) || '',
    fechaDevolucion: formatDateForApi(updatedData.fechaDevolucion) || '',
  };
};

// El controller devuelve PrestamosModel
export const deletePrestamo = async (id: number): Promise<void> => {
  await axios.delete<any>(`${API_URL}/${id}`);
};
