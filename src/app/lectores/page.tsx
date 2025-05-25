
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { LectoresModel, LectoresFormValues } from '@/lib/types';
import { getAllLectores, createLector, updateLector, deleteLector } from '@/lib/services/lectores';
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
import { lectorSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { z } from 'zod';

// LectorForm Component
interface LectorFormProps {
  currentData?: LectoresModel | null;
  onSubmit: (data: LectoresFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function LectorForm({ currentData, onSubmit, onCancel, isSubmitting }: LectorFormProps) {
  const form = useForm<LectoresFormValues>({
    resolver: zodResolver(lectorSchema),
    defaultValues: {
      idPersona: currentData?.idPersona ?? undefined,
      fechaRegistro: currentData?.fechaRegistro || undefined,
      ocupacion: currentData?.ocupacion || '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset({
        idPersona: currentData.idPersona,
        fechaRegistro: currentData.fechaRegistro || undefined,
        ocupacion: currentData.ocupacion,
      });
    } else {
      form.reset({
        idPersona: undefined,
        fechaRegistro: undefined,
        ocupacion: '',
      });
    }
  }, [currentData, form]);

  const handleSubmit = async (data: LectoresFormValues) => {
    await onSubmit(data, currentData?.idLector);
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
                  <FormLabel>ID Persona</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 1" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} />
                  </FormControl>
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
                          {field.value ? (format(new Date(field.value), "PPP", { locale: es })) : (<span>Seleccione una fecha</span>)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
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
                    <Input placeholder="Ej: Estudiante" {...field} />
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
    const date = new Date(dateString + 'T00:00:00');
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
            <Table><TableHeader><TableRow><TableHead>ID Lector</TableHead><TableHead>ID Persona</TableHead><TableHead>Fecha Registro</TableHead><TableHead>Ocupación</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idLector}><TableCell>{item.idLector}</TableCell><TableCell>{item.idPersona || 'N/A'}</TableCell><TableCell>{formatDate(item.fechaRegistro)}</TableCell><TableCell>{item.ocupacion}</TableCell><TableCell className="text-right space-x-2">
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
      const result = await getAllLectores();
      setData(result);
      setFilteredData(result);
    } catch (err) {
      toast({ title: "Error", description: "Error al cargar lectores.", variant: "destructive" });
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
      return (
        item.ocupacion.toLowerCase().includes(lowercasedFilter) ||
        (item.idPersona && item.idPersona.toString().includes(searchTerm))
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleSubmit = async (formData: LectoresFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      const coercedData = lectorSchema.parse(formData);
      const fechaRegistroToSubmit = coercedData.fechaRegistro || undefined;

      if (id) {
        await updateLector(id, coercedData.idPersona, fechaRegistroToSubmit, coercedData.ocupacion);
        toast({ title: "Éxito", description: "Lector actualizado." });
      } else {
        await createLector(coercedData.idPersona, fechaRegistroToSubmit, coercedData.ocupacion);
        toast({ title: "Éxito", description: "Lector creado." });
      }
      setShowForm(false); setCurrentItem(null); loadData();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast({ title: "Error de Validación", description: err.errors.map(e => e.message).join(', '), variant: "destructive"});
      } else {
        toast({ title: "Error", description: err.message || "Error al guardar el lector.", variant: "destructive" });
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
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar lector.", variant: "destructive" });
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: LectoresModel) => { setCurrentItem(item); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setShowForm(true); };
  const confirmDelete = (id: number) => { setItemToDelete(id); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setShowForm(false); };

  if (loading && !showForm && data.length === 0) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando lectores...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><Users className="mr-3 h-8 w-8" />Gestión de Lectores</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"><PlusCircle className="mr-2 h-5 w-5" />Agregar Nuevo</Button> )}
      </div>
      {showForm ? ( <LectorForm currentData={currentItem} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} /> ) 
      : ( 
        <>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por ocupación o ID Persona..."
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
