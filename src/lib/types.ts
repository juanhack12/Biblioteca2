// src/lib/types.ts

// Tipo auxiliar para manejar DateOnly de C# como string (YYYY-MM-DD)
export type DateOnlyString = string;

export interface AutoresModel {
  idAutor: number;
  nombre: string;
  apellido: string;
  fechaNacimiento?: DateOnlyString; // Puede ser opcional en el backend
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

export interface BibliotecariosModel {
  idBibliotecario: number;
  idPersona?: number;
  persona?: PersonasModel; // Para el objeto Personas anidado
  fechaContratacion?: DateOnlyString;
  turno: string;
  // Propiedades aplanadas del DTO para facilitar el acceso
  nombre?: string;
  apellido?: string;
  documentoIdentidad?: string;
}

export interface EditorialesModel {
  idEditorial: number;
  nombre: string;
  pais: string;
  ciudad: string;
  sitioWeb: string;
}

export interface LibrosModel {
  idLibro: number;
  titulo: string;
  anioPublicacion: string; // Mantenido como string según el backend
  idEditorial: number; // El backend para LibrosModel solo envía IdEditorial
  // editorial?: EditorialesModel; // Removido porque el backend LibrosModel no lo anida
  isbn?: string;
  summary?: string;
}

export interface EjemplaresModel {
  idEjemplar: number;
  idLibro?: number;
  libro?: LibrosModel; // Para el objeto Libros anidado
  ubicacion: string;
  // Propiedad aplanada del DTO
  titulo?: string; 
}


export interface LectoresModel {
  idLector: number;
  idPersona?: number;
  persona?: PersonasModel; // Para el objeto Personas anidado
  fechaRegistro?: DateOnlyString;
  ocupacion: string;
  // Propiedades aplanadas del DTO
  nombre?: string;
  apellido?: string;
  documentoIdentidad?: string;
}

export interface LibroAutoresModel {
  idLibro: number;
  // libro?: Pick<LibrosModel, 'idLibro' | 'titulo'>; // Backend no anida esto
  idAutor: number;
  // autor?: Pick<AutoresModel, 'idAutor' | 'nombre' | 'apellido'>; // Backend no anida esto
  rol: string;
}

export interface PrestamosModel {
  idPrestamo: number;
  idLector: number;
  lector?: LectoresModel; 
  idBibliotecario: number;
  bibliotecario?: BibliotecariosModel;
  idEjemplar: number;
  ejemplar?: EjemplaresModel; 
  fechaPrestamo: DateOnlyString;
  fechaDevolucion: DateOnlyString;
  // Propiedades aplanadas del DTO
  nombreLector?: string;
  nombreBibliotecario?: string;
  // Para mostrar el título del libro indirectamente
  tituloLibroEjemplar?: string; 
}

export interface TarifasModel {
  idTarifa: number;
  idPrestamo: number;
  // prestamo?: PrestamosModel; // Backend no anida esto
  diasRetraso: number;
  montoTarifa: number;
}

// For react-hook-form, Omit 'id' for creation forms
// y también los objetos anidados que son solo para visualización.
export type AutoresFormValues = Omit<AutoresModel, 'idAutor'>;
export type BibliotecariosFormValues = Omit<BibliotecariosModel, 'idBibliotecario' | 'persona' | 'nombre' | 'apellido' | 'documentoIdentidad'>;
export type EditorialesFormValues = Omit<EditorialesModel, 'idEditorial'>;
export type EjemplaresFormValues = Omit<EjemplaresModel, 'idEjemplar' | 'libro' | 'titulo'>;
export type LectoresFormValues = Omit<LectoresModel, 'idLector' | 'persona' | 'nombre' | 'apellido' | 'documentoIdentidad'>;
export type LibroAutoresFormValues = LibroAutoresModel; // PK es composite, todos los campos son para el form
export type LibrosFormValues = Omit<LibrosModel, 'idLibro' | 'isbn' | 'summary'>;
export type PersonasFormValues = Omit<PersonasModel, 'idPersona'>;
export type PrestamosFormValues = Omit<PrestamosModel, 'idPrestamo' | 'lector' | 'bibliotecario' | 'ejemplar' | 'nombreLector' | 'nombreBibliotecario' | 'tituloLibroEjemplar'>;
export type TarifasFormValues = Omit<TarifasModel, 'idTarifa'>;

// Tipos para los DTOs que vienen del backend, para usar en los servicios antes de mapear
// Esto ayuda a ser explícitos sobre la estructura de la respuesta de la API.
export interface BibliotecariosApiResponseDTO {
  idBibliotecario: number;
  idPersona?: number;
  personas?: PersonasModel; // El objeto PersonasModel tal como viene del DTO (PascalCase Personas)
  fechaContratacion?: DateOnlyString;
  turno: string;
  nombre?: string; // Nombre aplanado
  apellido?: string; // Apellido aplanado
  documentoIdentidad?: string; // Documento aplanado
}
