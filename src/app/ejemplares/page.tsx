
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { EjemplaresModel, EjemplaresFormValues } from '@/lib/types';
import { getAllEjemplares, createEjemplar, updateEjemplar, deleteEjemplar } from '@/lib/services/ejemplares';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Book, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ejemplarSchema } from '@/lib/schemas';
import { z } from 'zod'; // Added Zod import

// EjemplarForm Component
interface EjemplarFormProps {
  currentData?: EjemplaresModel | null;
  onSubmit: (data: EjemplaresFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function EjemplarForm({ currentData, onSubmit, onCancel, isSubmitting }: EjemplarFormProps) {
  const form = useForm<EjemplaresFormValues>({
    resolver: zodResolver(ejemplarSchema),
    defaultValues: {
      idLibro: currentData?.idLibro?.toString() ?? '',
      ubicacion: currentData?.ubicacion || '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset({
        idLibro: currentData.idLibro.toString(),
        ubicacion: currentData.ubicacion,
      });
    } else {
      form.reset({
        idLibro: '',
        ubicacion: '',
      });
    }
  }, [currentData, form]);

  const handleSubmitForm = async (data: EjemplaresFormValues) => {
    await onSubmit(data, currentData?.idEjemplar);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{currentData ? 'Editar Ejemplar' : 'Crear Nuevo Ejemplar'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitForm)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="idLibro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Libro</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 101" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Estante A-3, Fila 2" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />
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

// EjemplarList Component
interface EjemplarListProps {
  items: EjemplaresModel[];
  onEdit: (item: EjemplaresModel) => void;
  onDelete: (id: number) => void;
}

function EjemplarList({ items, onEdit, onDelete }: EjemplarListProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Lista de Ejemplares</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay ejemplares registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>ID Ejemplar</TableHead><TableHead>ID Libro</TableHead><TableHead>Ubicación</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idEjemplar}><TableCell>{item.idEjemplar}</TableCell><TableCell>{item.idLibro || 'N/A'}</TableCell><TableCell>{item.ubicacion}</TableCell><TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idEjemplar)} aria-label="Eliminar"><Trash2 className="h-4 w-4" /></Button>
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

// EjemplaresPage Component
export default function EjemplaresPage() {
  const [data, setData] = useState<EjemplaresModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<EjemplaresModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllEjemplares();
      setData(result);
    } catch (err) {
      toast({ title: "Error", description: "Error al cargar ejemplares.", variant: "destructive" });
      console.error("Error en loadData (Ejemplares):", err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (formData: EjemplaresFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      const coercedData = ejemplarSchema.parse(formData);
      if (id) {
        await updateEjemplar(id, coercedData.idLibro, coercedData.ubicacion);
        toast({ title: "Éxito", description: "Ejemplar actualizado." });
      } else {
        await createEjemplar(coercedData.idLibro, coercedData.ubicacion);
        toast({ title: "Éxito", description: "Ejemplar creado." });
      }
      setShowForm(false); setCurrentItem(null); loadData();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast({ title: "Error de Validación", description: err.errors.map(e => e.message).join(', '), variant: "destructive"});
      } else {
        toast({ title: "Error", description: err.message || "Error al guardar el ejemplar.", variant: "destructive" });
      }
      console.error("Error en handleSubmit (Ejemplares):", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deleteEjemplar(itemToDelete);
      toast({ title: "Éxito", description: "Ejemplar eliminado." });
      loadData();
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar ejemplar.", variant: "destructive" });
      console.error("Error en handleDelete (Ejemplares):", err);
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: EjemplaresModel) => { setCurrentItem(item); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setShowForm(true); };
  const confirmDelete = (id: number) => { setItemToDelete(id); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setShowForm(false); };

  if (loading && !showForm) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando ejemplares...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><Book className="mr-3 h-8 w-8" />Gestión de Ejemplares</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"><PlusCircle className="mr-2 h-5 w-5" />Agregar Nuevo</Button> )}
      </div>
      {showForm ? ( <EjemplarForm currentData={currentItem} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} /> ) 
      : ( <EjemplarList items={data} onEdit={handleEdit} onDelete={confirmDelete} /> )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este ejemplar?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    