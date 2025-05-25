// src/lib/schemas.ts
import { z } from 'zod';

// Ya no se necesitan estos helpers porque los inputs type="number" y los onChange ya manejan la conversión.
// const stringToNumber = z.string().refine(val => !isNaN(Number(val)), { message: "Must be a number" }).transform(Number);
// const optionalStringToNumber = z.union([z.string().refine(val => !isNaN(Number(val)), { message: "Must be a number" }).transform(Number), z.literal("").transform(() => undefined), z.undefined()]);

export const autorSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido."),
  apellido: z.string().min(1, "Apellido es requerido."),
  fechaNacimiento: z.string().optional().nullable().transform(val => val || undefined), // YYYY-MM-DD format
  nacionalidad: z.string().min(1, "Nacionalidad es requerida."),
});

export const bibliotecarioSchema = z.object({
  idPersona: z.number({ invalid_type_error: "ID Persona debe ser un número." })
    .positive("ID Persona debe ser un número positivo.")
    .optional()
    .nullable()
    .transform(val => val ?? undefined), // Transforma null a undefined para Zod optional
  fechaContratacion: z.string().optional().nullable().transform(val => val || undefined), // YYYY-MM-DD format
  turno: z.string().min(1, "Turno es requerido."),
});

export const editorialSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido."),
  pais: z.string().min(1, "País es requerido."),
  ciudad: z.string().min(1, "Ciudad es requerida."),
  sitioWeb: z.string().url("Debe ser una URL válida.").or(z.literal("")).transform(val => val || undefined),
});

export const ejemplarSchema = z.object({
  idLibro: z.number({ invalid_type_error: "ID Libro debe ser un número." })
    .positive("ID Libro debe ser un número positivo.")
    .optional()
    .nullable()
    .transform(val => val ?? undefined),
  ubicacion: z.string().min(1, "Ubicación es requerida."),
});

export const lectorSchema = z.object({
  idPersona: z.number({ invalid_type_error: "ID Persona debe ser un número." })
    .positive("ID Persona debe ser un número positivo.")
    .optional()
    .nullable()
    .transform(val => val ?? undefined),
  fechaRegistro: z.string().optional().nullable().transform(val => val || undefined), // YYYY-MM-DD format
  ocupacion: z.string().min(1, "Ocupación es requerida."),
});

export const libroAutorSchema = z.object({
  idLibro: z.number({ required_error: "ID Libro es requerido.", invalid_type_error: "ID Libro debe ser un número." })
    .positive("ID Libro debe ser un número positivo."),
  idAutor: z.number({ required_error: "ID Autor es requerido.", invalid_type_error: "ID Autor debe ser un número." })
    .positive("ID Autor debe ser un número positivo."),
  rol: z.string().min(1, "Rol es requerido."),
});

export const libroSchema = z.object({
  titulo: z.string().min(1, "Título es requerido."),
  anioPublicacion: z.string().min(4, "Año debe tener 4 dígitos.").max(4, "Año debe tener 4 dígitos.").regex(/^\d{4}$/, "Año inválido."),
  idEditorial: z.number({ required_error: "ID Editorial es requerido.", invalid_type_error: "ID Editorial debe ser un número." })
    .positive("ID Editorial debe ser un número positivo."),
});

export const personaSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido."),
  apellido: z.string().min(1, "Apellido es requerido."),
  documentoIdentidad: z.string().min(1, "Documento de Identidad es requerido."),
  fechaNacimiento: z.string().min(1, "Fecha de Nacimiento es requerida."), // YYYY-MM-DD format
  correo: z.string().email("Correo inválido."),
  telefono: z.string().min(1, "Teléfono es requerido."),
  direccion: z.string().min(1, "Dirección es requerida."),
});

export const prestamoSchema = z.object({
  idLector: z.number({ required_error: "ID Lector es requerido.", invalid_type_error: "ID Lector debe ser un número." })
    .positive("ID Lector debe ser un número positivo."),
  idBibliotecario: z.number({ required_error: "ID Bibliotecario es requerido.", invalid_type_error: "ID Bibliotecario debe ser un número." })
    .positive("ID Bibliotecario debe ser un número positivo."),
  idEjemplar: z.number({ required_error: "ID Ejemplar es requerido.", invalid_type_error: "ID Ejemplar debe ser un número." })
    .positive("ID Ejemplar debe ser un número positivo."),
  fechaPrestamo: z.string().min(1, "Fecha de Préstamo es requerida."), // YYYY-MM-DD format
  fechaDevolucion: z.string().min(1, "Fecha de Devolución es requerida."), // YYYY-MM-DD format
});

export const tarifaSchema = z.object({
  idPrestamo: z.number({ required_error: "ID Préstamo es requerido.", invalid_type_error: "ID Préstamo debe ser un número." })
    .positive("ID Préstamo debe ser un número positivo."),
  diasRetraso: z.number({ required_error: "Días de Retraso son requeridos.", invalid_type_error: "Días de Retraso debe ser un número." })
    .int("Días de Retraso debe ser un entero.")
    .min(0, "Días de Retraso no pueden ser negativos."),
  montoTarifa: z.number({ required_error: "Monto de Tarifa es requerido.", invalid_type_error: "Monto de Tarifa debe ser un número." })
    .min(0, "Monto de Tarifa no puede ser negativo."),
});

export const aiBookEntrySchema = z.object({
  partialBookInfo: z.string().min(3, "Por favor ingrese al menos 3 caracteres."),
});
