// src/lib/schemas.ts
import { z } from 'zod';

const stringToNumber = z.string().refine(val => !isNaN(Number(val)), { message: "Must be a number" }).transform(Number);
const optionalStringToNumber = z.union([z.string().refine(val => !isNaN(Number(val)), { message: "Must be a number" }).transform(Number), z.literal("").transform(() => undefined), z.undefined()]);

export const autorSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido."),
  apellido: z.string().min(1, "Apellido es requerido."),
  fechaNacimiento: z.string().optional().nullable().transform(val => val || undefined), // YYYY-MM-DD format
  nacionalidad: z.string().min(1, "Nacionalidad es requerida."),
});

export const bibliotecarioSchema = z.object({
  idPersona: optionalStringToNumber.refine(val => val === undefined || val > 0, { message: "ID Persona debe ser un número positivo."}),
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
  idLibro: optionalStringToNumber.refine(val => val === undefined || val > 0, { message: "ID Libro debe ser un número positivo."}),
  ubicacion: z.string().min(1, "Ubicación es requerida."),
});

export const lectorSchema = z.object({
  idPersona: optionalStringToNumber.refine(val => val === undefined || val > 0, { message: "ID Persona debe ser un número positivo."}),
  fechaRegistro: z.string().optional().nullable().transform(val => val || undefined), // YYYY-MM-DD format
  ocupacion: z.string().min(1, "Ocupación es requerida."),
});

export const libroAutorSchema = z.object({
  idLibro: stringToNumber.refine(val => val > 0, { message: "ID Libro debe ser un número positivo."}),
  idAutor: stringToNumber.refine(val => val > 0, { message: "ID Autor debe ser un número positivo."}),
  rol: z.string().min(1, "Rol es requerido."),
});

export const libroSchema = z.object({
  titulo: z.string().min(1, "Título es requerido."),
  anioPublicacion: z.string().min(4, "Año debe tener 4 dígitos.").max(4, "Año debe tener 4 dígitos.").regex(/^\d{4}$/, "Año inválido."),
  idEditorial: stringToNumber.refine(val => val > 0, { message: "ID Editorial debe ser un número positivo."}),
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
  idLector: stringToNumber.refine(val => val > 0, { message: "ID Lector debe ser un número positivo."}),
  idBibliotecario: stringToNumber.refine(val => val > 0, { message: "ID Bibliotecario debe ser un número positivo."}),
  idEjemplar: stringToNumber.refine(val => val > 0, { message: "ID Ejemplar debe ser un número positivo."}),
  fechaPrestamo: z.string().min(1, "Fecha de Préstamo es requerida."), // YYYY-MM-DD format
  fechaDevolucion: z.string().min(1, "Fecha de Devolución es requerida."), // YYYY-MM-DD format
});

export const tarifaSchema = z.object({
  idPrestamo: stringToNumber.refine(val => val > 0, { message: "ID Préstamo debe ser un número positivo."}),
  diasRetraso: stringToNumber.refine(val => val >= 0, { message: "Días de Retraso no pueden ser negativos."}),
  montoTarifa: stringToNumber.refine(val => val >= 0, { message: "Monto de Tarifa no puede ser negativo."}),
});

export const aiBookEntrySchema = z.object({
  partialBookInfo: z.string().min(3, "Por favor ingrese al menos 3 caracteres."),
});
