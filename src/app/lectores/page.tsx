
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { LectoresModel, LectoresFormValues, PersonasModel } from '@/lib/types';
import { getAllLectores, createLector, updateLector, deleteLector } from '@/lib/services/lectores';
import { getAllPersonas } from '@/lib/services/personas'; // Importar servicio de personas
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Users, Edit, Trash2, CalendarIcon, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lectorSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { z } from 'zod';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api-config';

// LectorForm Component
interface LectorFormProps {
  currentData?: LectoresModel | null;
  onSubmit: (data: LectoresFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  personas: PersonasModel[]; // Lista de personas para el selector
}

function LectorForm({ currentData, onSubmit, onCancel, isSubmitting, personas }: LectorFormProps) {
  const form = useForm<LectoresFormValues>({
    resolver: zodResolver(lectorSchema),
    defaultValues: {
      idPersona: currentData?.idPersona?.toString() ?? '',
      fechaRegistro: currentData?.fechaRegistro || undefined,
      ocupacion: currentData?.ocupacion || '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset({
        idPersona: currentData.idPersona?.toString() ?? '',
        fechaRegistro: currentData.fechaRegistro || undefined,
        ocupacion: currentData.ocupacion,
      });
    } else {
      form.reset({
        idPersona: '',
        fechaRegistro: undefined,
        ocupacion: '',
      });
    }
  }, [currentData, form]);

  const handleSubmit = async (data: LectoresFormValues) => {
    await onSubmit(data, currentData?.idLector);
  };

  const safeParseDate = (dateString?: string) => {
    if (!dateString) return undefined;
    try {
      if (dateString.includes('T')) return parseISO(dateString);
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month -1, day);
    } catch (e) { return undefined; }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{currentData ? 'Editar Lector' : 'Crear Nuevo Lector'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="idPersona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value?.toString() ?? ''} defaultValue={field.value?.toString() ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una persona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem key={persona.idPersona} value={persona.idPersona.toString()}>
                          {persona.nombre} {persona.apellido} (ID: {persona.idPersona})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fechaRegistro"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Registro (Opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                        >
                          {field.value ? (format(safeParseDate(field.value) || new Date(), "PPP", { locale: es })) : (<span>Seleccione una fecha</span>)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? safeParseDate(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ocupacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ocupación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Estudiante" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (currentData ? 'Actualizando...' : 'Creando...') : (currentData ? 'Actualizar' : 'Crear')}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// LectorList Component
interface LectorListProps {
  items: LectoresModel[];
  onEdit: (item: LectoresModel) => void;
  onDelete: (id: number) => void;
}

function LectorList({ items, onEdit, onDelete }: LectorListProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
    return format(date, 'PPP', { locale: es });
  };
  return (
    <Card>
      <CardHeader><CardTitle>Lista de Lectores</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay lectores registrados o que coincidan con la búsqueda.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>ID Lector</TableHead><TableHead>Nombre Completo</TableHead><TableHead>Documento</TableHead><TableHead>Fecha Registro</TableHead><TableHead>Ocupación</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idLector}><TableCell>{item.idLector}</TableCell><TableCell>{item.nombre && item.apellido ? `${item.nombre} ${item.apellido}` : (item.idPersona || 'N/A')}</TableCell><TableCell>{item.documentoIdentidad || 'N/A'}</TableCell><TableCell>{formatDate(item.fechaRegistro)}</TableCell><TableCell>{item.ocupacion}</TableCell><TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idLector)} aria-label="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// LectoresPage Component
export default function LectoresPage() {
  const [data, setData] = useState<LectoresModel[]>([]);
  const [filteredData, setFilteredData] = useState<LectoresModel[]>([]);
  const [personas, setPersonas] = useState<PersonasModel[]>([]); // Estado para personas
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<LectoresModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [lectoresResult, personasResult] = await Promise.all([
        getAllLectores(),
        getAllPersonas() // Cargar personas
      ]);
      setData(lectoresResult);
      setFilteredData(lectoresResult);
      setPersonas(personasResult);
    } catch (err: any) {
      console.error("Error al cargar datos (LectoresPage):", err);
      let description = "Error al cargar datos iniciales.";
      if (axios.isAxiosError(err)) {
        description = err.response?.data?.message || err.message || "Error de red o servidor.";
      } else if (err instanceof Error) {
        description = err.message;
      }
      toast({ title: "Error", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      const nombreCompleto = item.nombre && item.apellido ? `${item.nombre} ${item.apellido}`.toLowerCase() : '';
      return (
        item.idLector.toString().includes(searchTerm) ||
        (item.idPersona && item.idPersona.toString().includes(searchTerm)) ||
        nombreCompleto.includes(lowercasedFilter) ||
        (item.documentoIdentidad && item.documentoIdentidad.toLowerCase().includes(lowercasedFilter)) ||
        (item.fechaRegistro && item.fechaRegistro.toLowerCase().includes(lowercasedFilter)) ||
        (item.ocupacion && item.ocupacion.toLowerCase().includes(lowercasedFilter))
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleSubmit = async (formData: LectoresFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      const coercedData = lectorSchema.parse(formData);
      const idPersonaNum = Number(coercedData.idPersona); // Ya es string del select
      const fechaRegistroToSubmit = coercedData.fechaRegistro || undefined;

      if (id) {
        await updateLector(id, idPersonaNum, fechaRegistroToSubmit, coercedData.ocupacion);
        toast({ title: "Éxito", description: "Lector actualizado." });
      } else {
        await createLector(idPersonaNum, fechaRegistroToSubmit, coercedData.ocupacion);
        toast({ title: "Éxito", description: "Lector creado." });
      }
      setShowForm(false); setCurrentItem(null); loadData();
    } catch (err: any) {
      console.error("Error al guardar lector (handleSubmit):", err);
      let description = "Error al guardar el lector.";
      if (err instanceof z.ZodError) {
        description = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        toast({ title: "Error de Validación", description, variant: "destructive"});
      } else if (axios.isAxiosError(err)) {
        description = err.response?.data?.message || err.response?.data?.error?.message || err.message || "Error de red o servidor.";
        toast({ title: "Error", description, variant: "destructive" });
      } else if (err instanceof Error) {
        description = err.message;
        toast({ title: "Error", description, variant: "destructive" });
      } else {
         toast({ title: "Error Desconocido", description: "Ocurrió un error inesperado.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deleteLector(itemToDelete);
      toast({ title: "Éxito", description: "Lector eliminado." });
      loadData();
    } catch (err: any) {
      console.error("Error al eliminar lector (handleDelete):", err);
      let description = "Error al eliminar lector.";
      if (axios.isAxiosError(err)) {
        description = err.response?.data?.message || err.response?.data?.error?.message || err.message || "Error de red o servidor.";
      } else if (err instanceof Error) {
        description = err.message;
      }
      toast({ title: "Error", description, variant: "destructive" });
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: LectoresModel) => { setCurrentItem(item); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setShowForm(true); };
  const confirmDelete = (id: number) => { setItemToDelete(id); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setShowForm(false); };

  if (loading && !showForm && data.length === 0 && !searchTerm) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando lectores y personas...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><Users className="mr-3 h-8 w-8" />Gestión de Lectores</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"><PlusCircle className="mr-2 h-5 w-5" />Agregar Nuevo</Button> )}
      </div>
      {showForm ? ( <LectorForm currentData={currentItem} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} personas={personas} /> ) 
      : ( 
        <>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, Nombre, Documento, fecha u ocupación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <LectorList items={filteredData} onEdit={handleEdit} onDelete={confirmDelete} />
        </>
      )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este lector?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
