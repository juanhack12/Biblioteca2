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

// Para reflejar el BibliotecariosDTO del backend
export interface BibliotecariosApiResponseDTO {
  idBibliotecario: number;
  idPersona?: number;
  personas?: PersonasModel; // El objeto PersonasModel como viene del DTO (PascalCase Personas)
  fechaContratacion?: DateOnlyString;
  turno: string;
  nombre?: string; // Nombre aplanado desde Personas
  apellido?: string; // Apellido aplanado desde Personas
  documentoIdentidad?: string; // Documento aplanado desde Personas
}

// Modelo del frontend para Bibliotecarios
export interface BibliotecariosModel {
  idBibliotecario: number;
  idPersona?: number;
  fechaContratacion?: DateOnlyString;
  turno: string;
  nombre?: string; // Campo para UI, llenado desde DTO.Nombre o DTO.Personas.Nombre
  apellido?: string; // Campo para UI
  documentoIdentidad?: string; // Campo para UI
  persona?: PersonasModel; // Opcional, si se quiere acceder al objeto completo
}

export interface EditorialesModel {
  idEditorial: number;
  nombre: string;
  pais: string;
  ciudad: string;
  sitioWeb: string;
}

// LibrosModel del backend NO anida Editorial, solo tiene IdEditorial
export interface LibrosModel {
  idLibro: number;
  titulo: string;
  anioPublicacion: string; 
  idEditorial: number; 
  // No hay 'editorial?: EditorialesModel;' aquí porque el backend no lo envía así para las listas/gets.
  // El formulario de creación/edición de libros cargará las editoriales por separado para un dropdown.
  isbn?: string; // Estos pueden ser añadidos por el flujo de IA si se implementa completamente
  summary?: string; // Estos pueden ser añadidos por el flujo de IA
}

// Para reflejar el EjemplaresDTO del backend
export interface EjemplaresApiResponseDTO {
  idEjemplar: number;
  idLibro?: number;
  libros?: LibrosModel; // El objeto LibrosModel como viene del DTO (PascalCase Libros)
  ubicacion: string;
  titulo?: string; // Titulo aplanado desde Libros.Titulo
}

// Modelo del frontend para Ejemplares
export interface EjemplaresModel {
  idEjemplar: number;
  idLibro?: number;
  ubicacion: string;
  tituloLibro?: string; // Campo para UI, llenado desde DTO.Titulo o DTO.Libros.Titulo
  libro?: LibrosModel; // Opcional
}

// Para reflejar el LectoresDTO del backend
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

// Modelo del frontend para Lectores
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
  rol: string; // El backend usa 'rol' en minúscula
}

// Para reflejar el PrestamosDTO del backend
export interface PrestamosApiResponseDTO {
  idPrestamo: number;
  idLector: number;
  lectores?: LectoresApiResponseDTO; // DTO anidado
  idBibliotecario: number;
  bibliotecarios?: BibliotecariosApiResponseDTO; // DTO anidado
  idEjemplar: number;
  ejemplares?: EjemplaresModel; // El backend usa EjemplaresModel aquí, que a su vez tiene LibrosModel
  fechaPrestamo: DateOnlyString;
  fechaDevolucion: DateOnlyString;
  nombreLector?: string;
  nombreBibliotecario?: string;
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
  tituloLibroEjemplar?: string;
  // Opcionalmente, podríamos tener los objetos completos si decidimos mapearlos a fondo
  lector?: LectoresModel;
  bibliotecario?: BibliotecariosModel;
  ejemplar?: EjemplaresModel;
}

export interface TarifasModel {
  idTarifa: number;
  idPrestamo: number;
  diasRetraso: number;
  montoTarifa: number; // Backend usa int, frontend lo tratará como number
}

// Form Values
export type AutoresFormValues = Omit<AutoresModel, 'idAutor'>;
export type BibliotecariosFormValues = Omit<BibliotecariosModel, 'idBibliotecario' | 'persona' | 'nombre' | 'apellido' | 'documentoIdentidad'>;
export type EditorialesFormValues = Omit<EditorialesModel, 'idEditorial'>;
export type EjemplaresFormValues = Omit<EjemplaresModel, 'idEjemplar' | 'libro' | 'tituloLibro'>;
export type LectoresFormValues = Omit<LectoresModel, 'idLector' | 'persona' | 'nombre' | 'apellido' | 'documentoIdentidad'>;
export type LibroAutoresFormValues = LibroAutoresModel;
export type LibrosFormValues = Omit<LibrosModel, 'idLibro' | 'isbn' | 'summary'>;
export type PersonasFormValues = Omit<PersonasModel, 'idPersona'>;
export type PrestamosFormValues = Omit<PrestamosModel, 'idPrestamo' | 'lector' | 'bibliotecario' | 'ejemplar' | 'nombreLector' | 'nombreBibliotecario' | 'tituloLibroEjemplar'>;
export type TarifasFormValues = Omit<TarifasModel, 'idTarifa'>;
