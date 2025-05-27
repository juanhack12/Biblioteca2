
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { BibliotecariosModel, BibliotecariosFormValues, BibliotecariosApiResponseDTO } from '@/lib/types';
import { getAllBibliotecarios, createBibliotecario, updateBibliotecario, deleteBibliotecario } from '@/lib/services/bibliotecarios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { bibliotecarioSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { z } from 'zod';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api-config';

// BibliotecarioForm Component
interface BibliotecarioFormProps {
  currentData?: BibliotecariosModel | null;
  onSubmit: (data: BibliotecariosFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function BibliotecarioForm({ currentData, onSubmit, onCancel, isSubmitting }: BibliotecarioFormProps) {
  const form = useForm<BibliotecariosFormValues>({
    resolver: zodResolver(bibliotecarioSchema),
    defaultValues: {
      idPersona: currentData?.idPersona?.toString() ?? '',
      fechaContratacion: currentData?.fechaContratacion || undefined,
      turno: currentData?.turno || '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset({
        idPersona: currentData.idPersona?.toString() ?? '',
        fechaContratacion: currentData.fechaContratacion || undefined,
        turno: currentData.turno,
      });
    } else {
      form.reset({
        idPersona: '',
        fechaContratacion: undefined,
        turno: '',
      });
    }
  }, [currentData, form]);

  const handleSubmit = async (data: BibliotecariosFormValues) => {
    await onSubmit(data, currentData?.idBibliotecario);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>{currentData ? 'Editar Bibliotecario' : 'Crear Nuevo Bibliotecario'}</CardTitle></CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="idPersona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Persona</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 1" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fechaContratacion"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Contratación</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                        >
                          {field.value ? (format(new Date(field.value.includes('T') ? field.value : field.value + 'T00:00:00'), "PPP", { locale: es })) : (<span>Seleccione una fecha</span>)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value.includes('T') ? field.value : field.value + 'T00:00:00') : undefined}
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
              name="turno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turno</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Matutino" {...field} value={field.value ?? ''} />
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

// BibliotecarioList Component
interface BibliotecarioListProps {
  items: BibliotecariosModel[];
  onEdit: (item: BibliotecariosModel) => void;
  onDelete: (id: number) => void;
}

function BibliotecarioList({ items, onEdit, onDelete }: BibliotecarioListProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) {
      return 'N/A';
    }
    // Ensure the dateString is treated as UTC if it doesn't have timezone info
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    return format(date, 'PPP', { locale: es });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Lista de Bibliotecarios</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay bibliotecarios registrados o que coincidan con la búsqueda.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead className="hidden">ID Bibliotecario</TableHead><TableHead>Nombre Completo</TableHead><TableHead>Documento</TableHead><TableHead>Fecha Contratación</TableHead><TableHead>Turno</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idBibliotecario}><TableCell className="hidden">{item.idBibliotecario}</TableCell><TableCell>{item.nombre && item.apellido ? `${item.nombre} ${item.apellido}` : (item.idPersona || 'N/A')}</TableCell><TableCell>{item.documentoIdentidad || 'N/A'}</TableCell><TableCell>{formatDate(item.fechaContratacion)}</TableCell><TableCell>{item.turno}</TableCell><TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idBibliotecario)} aria-label="Eliminar"><Trash2 className="h-4 w-4" /></Button>
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


// BibliotecariosPage Component
export default function BibliotecariosPage() {
  const [data, setData] = useState<BibliotecariosModel[]>([]);
  const [filteredData, setFilteredData] = useState<BibliotecariosModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<BibliotecariosModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllBibliotecarios();
      setData(result);
      setFilteredData(result);
    } catch (err: any) {
      console.error("Error al cargar bibliotecarios (loadData):", err);
      let description = "Error al cargar bibliotecarios.";
      if (axios.isAxiosError(err)) {
        console.error("Full Axios error object (loadData):", err);
        console.error("error.message:", err.message);
        console.error("error.code:", err.code);
        console.error("error.response?.status:", err.response?.status);
        console.error("error.response?.data:", err.response?.data);
        description = err.response?.data?.message || err.response?.data?.error || `Error de red o servidor (Code: ${err.code}, Status: ${err.response?.status}). Verifique que la API (${API_BASE_URL}) esté accesible y configurada correctamente para CORS.`;
      } else if (err instanceof Error) {
        description = err.message;
      }
      toast({ title: "Error de Carga", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      const nombreCompleto = item.nombre && item.apellido ? `${item.nombre} ${item.apellido}`.toLowerCase() : '';
      return (
        item.idBibliotecario.toString().includes(searchTerm) || 
        (item.idPersona && item.idPersona.toString().includes(lowercasedFilter)) || 
        nombreCompleto.includes(lowercasedFilter) ||
        (item.documentoIdentidad && item.documentoIdentidad.toLowerCase().includes(lowercasedFilter)) ||
        (item.fechaContratacion && item.fechaContratacion.toLowerCase().includes(lowercasedFilter)) ||
        (item.turno && item.turno.toLowerCase().includes(lowercasedFilter))
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleSubmit = async (formData: BibliotecariosFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      const coercedData = bibliotecarioSchema.parse(formData); 
      const idPersonaNum = Number(coercedData.idPersona); 
      const fechaContratacionToSubmit = coercedData.fechaContratacion || undefined;

      if (id) {
        await updateBibliotecario(id, idPersonaNum, fechaContratacionToSubmit, coercedData.turno);
        toast({ title: "Éxito", description: "Bibliotecario actualizado." });
      } else {
        await createBibliotecario(idPersonaNum, fechaContratacionToSubmit, coercedData.turno);
        toast({ title: "Éxito", description: "Bibliotecario creado." });
      }
      setShowForm(false);
      setCurrentItem(null);
      loadData();
    } catch (err: any) {
      console.error("Error al guardar bibliotecario (handleSubmit):", err);
      let description = "Error al guardar el bibliotecario.";
      if (err instanceof z.ZodError) {
        description = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
        toast({ title: "Error de Validación", description, variant: "destructive"});
      } else if (axios.isAxiosError(err)) {
        console.error("Full Axios error object (handleSubmit):", err);
        description = err.response?.data?.message || err.response?.data?.error || `Error de red o servidor (Code: ${err.code}, Status: ${err.response?.status}).`;
        toast({ title: "Error", description, variant: "destructive" });
      } else if (err instanceof Error) {
        description = err.message;
        toast({ title: "Error", description, variant: "destructive" });
      } else {
         toast({ title: "Error Desconocido", description, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deleteBibliotecario(itemToDelete);
      toast({ title: "Éxito", description: "Bibliotecario eliminado." });
      loadData();
    } catch (err: any) {
      console.error("Error al eliminar bibliotecario (handleDelete):", err);
      let description = "Error al eliminar bibliotecario.";
       if (axios.isAxiosError(err)) {
        description = err.response?.data?.message || err.response?.data?.error || `Error de red o servidor (Code: ${err.code}, Status: ${err.response?.status}).`;
      } else if (err instanceof Error) {
        description = err.message;
      }
      toast({ title: "Error", description, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: BibliotecariosModel) => {
    setCurrentItem(item);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setShowForm(true);
  };
  
  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleCancelForm = () => {
    setCurrentItem(null);
    setShowForm(false);
  };

  if (loading && !showForm && data.length === 0) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando bibliotecarios...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-8 container mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><Users className="mr-3 h-8 w-8" />Gestión de Bibliotecarios</h1>
        {!showForm && (
          <Button onClick={handleAddNew} className="shadow-md">
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Nuevo
          </Button>
        )}
      </div>

      {showForm ? (
        <BibliotecarioForm
          currentData={currentItem}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
        />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, Nombre, Documento, fecha o turno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          {loading && data.length === 0 ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Cargando...</p>
              </div>
          ) : (
            <BibliotecarioList
              items={filteredData}
              onEdit={handleEdit}
              onDelete={confirmDelete}
            />
          )}
        </>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este bibliotecario?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
