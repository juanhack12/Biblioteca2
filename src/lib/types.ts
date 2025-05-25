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
  idPersona?: number; // Opcional, pero se espera un int en el POST/PUT
  fechaContratacion?: DateOnlyString; // Puede ser opcional en el backend
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
  idLibro?: number; // Opcional, pero se espera un int en el POST/PUT
  ubicacion: string;
}

export interface LectoresModel {
  idLector: number;
  idPersona?: number; // Opcional, pero se espera un int en el POST/PUT
  fechaRegistro?: DateOnlyString; // Puede ser opcional en el backend
  ocupacion: string;
}

export interface LibroAutoresModel {
  idLibro: number; // Es parte de la clave compuesta
  idAutor: number; // Es parte de la clave compuesta
  rol: string;
}

export interface LibrosModel {
  idLibro: number;
  titulo: string;
  anioPublicacion: string; // Asumiendo que el año de publicación es un string (puede ser solo el año)
  idEditorial: number;
  // Consider adding ISBN and summary if they are important for the application
  isbn?: string;
  summary?: string;
}

export interface PrestamosModel {
  idPrestamo: number;
  idLector: number;
  idBibliotecario: number;
  idEjemplar: number;
  fechaPrestamo: DateOnlyString;
  fechaDevolucion: DateOnlyString;
}

export interface TarifasModel {
  idTarifa: number;
  idPrestamo: number;
  diasRetraso: number;
  montoTarifa: number;
}

// For react-hook-form, Omit 'id' for creation forms
export type AutoresFormValues = Omit<AutoresModel, 'idAutor'>;
export type BibliotecariosFormValues = Omit<BibliotecariosModel, 'idBibliotecario'>;
export type EditorialesFormValues = Omit<EditorialesModel, 'idEditorial'>;
export type EjemplaresFormValues = Omit<EjemplaresModel, 'idEjemplar'>;
export type LectoresFormValues = Omit<LectoresModel, 'idLector'>;
export type LibroAutoresFormValues = LibroAutoresModel; // PK is composite, all fields needed for create/update
export type LibrosFormValues = Omit<LibrosModel, 'idLibro'>;
export type PersonasFormValues = Omit<PersonasModel, 'idPersona'>;
export type PrestamosFormValues = Omit<PrestamosModel, 'idPrestamo'>;
export type TarifasFormValues = Omit<TarifasModel, 'idTarifa'>;
