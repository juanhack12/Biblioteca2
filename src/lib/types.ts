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
  idPersona: number;
  persona?: PersonasModel; // Para mostrar nombre, apellido de la persona
  fechaContratacion?: DateOnlyString;
  turno: string;
}

export interface EditorialesModel {
  idEditorial: number;
  nombre: string;
  pais: string;
  ciudad: string;
  sitioWeb: string;
}

export interface EjemplaresModel {
  idEjemplar: number;
  idLibro: number;
  libro?: LibrosModel; // Para mostrar título del libro
  ubicacion: string;
}

export interface LectoresModel {
  idLector: number;
  idPersona: number;
  persona?: PersonasModel; // Para mostrar nombre, apellido de la persona
  fechaRegistro?: DateOnlyString;
  ocupacion: string;
}

export interface LibroAutoresModel {
  idLibro: number;
  libro?: Pick<LibrosModel, 'idLibro' | 'titulo'>; // Para mostrar título del libro
  idAutor: number;
  autor?: Pick<AutoresModel, 'idAutor' | 'nombre' | 'apellido'>; // Para mostrar nombre del autor
  rol: string;
}

export interface LibrosModel {
  idLibro: number;
  titulo: string;
  anioPublicacion: string;
  idEditorial: number;
  editorial?: EditorialesModel; // Para mostrar nombre de la editorial
  isbn?: string;
  summary?: string;
}

export interface PrestamosModel {
  idPrestamo: number;
  idLector: number;
  lector?: LectoresModel & { persona?: PersonasModel }; // Para info del lector
  idBibliotecario: number;
  bibliotecario?: BibliotecariosModel & { persona?: PersonasModel }; // Para info del bibliotecario
  idEjemplar: number;
  ejemplar?: EjemplaresModel & { libro?: LibrosModel }; // Para info del ejemplar y libro
  fechaPrestamo: DateOnlyString;
  fechaDevolucion: DateOnlyString;
}

export interface TarifasModel {
  idTarifa: number;
  idPrestamo: number;
  prestamo?: PrestamosModel; // Para info del préstamo
  diasRetraso: number;
  montoTarifa: number;
}

// For react-hook-form, Omit 'id' for creation forms
export type AutoresFormValues = Omit<AutoresModel, 'idAutor' | 'persona'>;
export type BibliotecariosFormValues = Omit<BibliotecariosModel, 'idBibliotecario' | 'persona'>;
export type EditorialesFormValues = Omit<EditorialesModel, 'idEditorial'>;
export type EjemplaresFormValues = Omit<EjemplaresModel, 'idEjemplar' | 'libro'>;
export type LectoresFormValues = Omit<LectoresModel, 'idLector' | 'persona'>;
export type LibroAutoresFormValues = Omit<LibroAutoresModel, 'libro' | 'autor'>; // PK is composite, all fields needed for create/update
export type LibrosFormValues = Omit<LibrosModel, 'idLibro' | 'editorial'>;
export type PersonasFormValues = Omit<PersonasModel, 'idPersona'>;
export type PrestamosFormValues = Omit<PrestamosModel, 'idPrestamo' | 'lector' | 'bibliotecario' | 'ejemplar'>;
export type TarifasFormValues = Omit<TarifasModel, 'idTarifa' | 'prestamo'>;
