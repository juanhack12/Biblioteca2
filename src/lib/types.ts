// src/lib/types.ts

// Tipo auxiliar para manejar DateOnly de C# como string (YYYY-MM-DD)
export type DateOnlyString = string;

export interface AutoresModel {
  idAutor: number;
  nombre: string;
  apellido: string;
  fechaNacimiento?: DateOnlyString;
  nacionalidad: string;
}

export interface PersonasModel {
  idPersona: number;
  nombre: string;
  apellido: string;
  documentoIdentidad: string;
  fechaNacimiento: DateOnlyString;
  correo: string;
  telefono: string;
  direccion: string;
}

// Para reflejar el DTO del backend
export interface EditorialesApiResponseDTO {
  idEditorial: number;
  nombre: string;
  pais: string;
  ciudad: string;
  sitioWeb?: string; // Asumiendo que puede ser opcional o nulo desde la API
}


// Modelo del frontend para Editoriales (puede ser igual al DTO si no hay transformaciones)
export type EditorialesModel = EditorialesApiResponseDTO;


// Para reflejar el LibrosDTO del backend
export interface LibrosApiResponseDTO {
  idLibro: number;
  titulo: string;
  anioPublicacion?: number; // Backend lo tiene como int?
  idEditorial: number;
  editoriales?: EditorialesApiResponseDTO; // Objeto anidado
  nombre?: string; // Nombre de la editorial aplanado
}

// Modelo del frontend para Libros
export interface LibrosModel {
  idLibro: number;
  titulo: string;
  anioPublicacion: string; // Frontend lo maneja como string para el input
  idEditorial: number;
  nombreEditorial?: string; // Para mostrar el nombre de la editorial
  editorial?: EditorialesModel; // Opcional, si se quiere el objeto completo
  isbn?: string;
  summary?: string;
}


export interface BibliotecariosApiResponseDTO {
  idBibliotecario: number;
  idPersona?: number;
  personas?: PersonasModel; 
  fechaContratacion?: DateOnlyString;
  turno: string;
  nombre?: string; 
  apellido?: string; 
  documentoIdentidad?: string; 
}

export interface BibliotecariosModel {
  idBibliotecario: number;
  idPersona?: number;
  fechaContratacion?: DateOnlyString;
  turno: string;
  nombre?: string; 
  apellido?: string; 
  documentoIdentidad?: string; 
  persona?: PersonasModel; 
}

export interface EjemplaresApiResponseDTO {
  idEjemplar: number;
  idLibro?: number;
  libros?: LibrosApiResponseDTO; // Usar el DTO de Libros si es lo que anida
  ubicacion: string;
  titulo?: string; // Titulo aplanado desde Libros.Titulo
}

export interface EjemplaresModel {
  idEjemplar: number;
  idLibro?: number;
  ubicacion: string;
  tituloLibro?: string; 
  libro?: LibrosModel; 
}

export interface LectoresApiResponseDTO {
  idLector: number;
  idPersona?: number;
  personas?: PersonasModel;
  fechaRegistro?: DateOnlyString;
  ocupacion: string;
  nombre?: string;
  apellido?: string;
  documentoIdentidad?: string;
}

export interface LectoresModel {
  idLector: number;
  idPersona?: number;
  fechaRegistro?: DateOnlyString;
  ocupacion: string;
  nombre?: string;
  apellido?: string;
  documentoIdentidad?: string;
  persona?: PersonasModel;
}

export interface LibroAutoresModel {
  idLibro: number;
  idAutor: number;
  rol: string; 
}

// Para reflejar el PrestamosDTO del backend
export interface PrestamosApiResponseDTO {
  idPrestamo: number;
  idLector: number;
  lectores?: LectoresApiResponseDTO; 
  idBibliotecario: number;
  bibliotecarios?: BibliotecariosApiResponseDTO; 
  idEjemplar: number;
  ejemplares?: EjemplaresModel; // El backend usa EjemplaresModel (que tiene LibrosModel)
  fechaPrestamo: DateOnlyString;
  fechaDevolucion: DateOnlyString;
  nombreLector?: string;
  nombreBibliotecario?: string;
  titulo?: string; // Título del libro del ejemplar
}

// Modelo del frontend para Prestamos
export interface PrestamosModel {
  idPrestamo: number;
  idLector: number;
  idBibliotecario: number;
  idEjemplar: number;
  fechaPrestamo: DateOnlyString;
  fechaDevolucion: DateOnlyString;
  nombreLector?: string;
  nombreBibliotecario?: string;
  tituloLibroEjemplar?: string; // Campo para mostrar el título del libro
  lector?: LectoresModel;
  bibliotecario?: BibliotecariosModel;
  ejemplar?: EjemplaresModel;
}

export interface TarifasModel {
  idTarifa: number;
  idPrestamo: number;
  diasRetraso: number;
  montoTarifa: number; 
}

// Form Values
export type AutoresFormValues = Omit<AutoresModel, 'idAutor'>;
export type BibliotecariosFormValues = Omit<BibliotecariosModel, 'idBibliotecario' | 'persona' | 'nombre' | 'apellido' | 'documentoIdentidad'>;
export type EditorialesFormValues = Omit<EditorialesModel, 'idEditorial'>;
export type EjemplaresFormValues = Omit<EjemplaresModel, 'idEjemplar' | 'libro' | 'tituloLibro'>;
export type LectoresFormValues = Omit<LectoresModel, 'idLector' | 'persona' | 'nombre' | 'apellido' | 'documentoIdentidad'>;
export type LibroAutoresFormValues = LibroAutoresModel; // Asumiendo que todos los campos son necesarios en el form
export type LibrosFormValues = Omit<LibrosModel, 'idLibro' | 'nombreEditorial' | 'editorial' | 'isbn' | 'summary'>;
export type PersonasFormValues = Omit<PersonasModel, 'idPersona'>;
export type PrestamosFormValues = Omit<PrestamosModel, 'idPrestamo' | 'lector' | 'bibliotecario' | 'ejemplar' | 'nombreLector' | 'nombreBibliotecario' | 'tituloLibroEjemplar'>;
export type TarifasFormValues = Omit<TarifasModel, 'idTarifa'>;
