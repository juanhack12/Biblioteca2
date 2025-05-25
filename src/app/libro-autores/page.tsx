
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { LibroAutoresModel, LibroAutoresFormValues } from '@/lib/types';
import { getAllLibroAutores, createLibroAutor, updateLibroAutor, deleteLibroAutor } from '@/lib/services/libro-autores';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Combine, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { libroAutorSchema } from '@/lib/schemas';
import { z } from 'zod';

// LibroAutorForm Component
interface LibroAutorFormProps {
  currentData?: LibroAutoresModel | null;
  onSubmit: (data: LibroAutoresFormValues) => Promise<void>; // PK is composite, all fields needed for create/update
  onCancel: () => void;
  isSubmitting: boolean;
}

function LibroAutorForm({ currentData, onSubmit, onCancel, isSubmitting }: LibroAutorFormProps) {
  const form = useForm<LibroAutoresFormValues>({
    resolver: zodResolver(libroAutorSchema),
    defaultValues: {
      idLibro: currentData?.idLibro?.toString() ?? '',
      idAutor: currentData?.idAutor?.toString() ?? '',
      rol: currentData?.rol || '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset({
        idLibro: currentData.idLibro.toString(),
        idAutor: currentData.idAutor.toString(),
        rol: currentData.rol,
      });
    } else {
      form.reset({ idLibro: '', idAutor: '', rol: '' });
    }
  }, [currentData, form]);

  const handleSubmit = async (data: LibroAutoresFormValues) => {
    // Zod coerce.number will handle conversion
    await onSubmit(data);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>{currentData ? 'Editar Relación Libro-Autor' : 'Crear Nueva Relación'}</CardTitle></CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="idLibro"
              render={({ field }) => (<FormItem><FormLabel>ID Libro</FormLabel><FormControl><Input type="number" placeholder="Ej: 1" {...field} readOnly={!!currentData} className={currentData ? 'bg-muted' : ''} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)}
            />
            <FormField
              control={form.control}
              name="idAutor"
              render={({ field }) => (<FormItem><FormLabel>ID Autor</FormLabel><FormControl><Input type="number" placeholder="Ej: 1" {...field} readOnly={!!currentData} className={currentData ? 'bg-muted' : ''} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)}
            />
            <FormField control={form.control} name="rol" render={({ field }) => (<FormItem><FormLabel>Rol</FormLabel><FormControl><Input placeholder="Ej: Autor Principal" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)} />
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

// LibroAutorList Component
interface LibroAutorListProps {
  items: LibroAutoresModel[];
  onEdit: (item: LibroAutoresModel) => void;
  onDelete: (idLibro: number, idAutor: number) => void;
}

function LibroAutorList({ items, onEdit, onDelete }: LibroAutorListProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Lista de Relaciones Libro-Autor</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay relaciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>ID Libro</TableHead><TableHead>ID Autor</TableHead><TableHead>Rol</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.idLibro}-${item.idAutor}`}><TableCell>{item.idLibro}</TableCell><TableCell>{item.idAutor}</TableCell><TableCell>{item.rol}</TableCell><TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idLibro, item.idAutor)} aria-label="Eliminar"><Trash2 className="h-4 w-4" /></Button>
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

// LibroAutoresPage Component
export default function LibroAutoresPage() {
  const [data, setData] = useState<LibroAutoresModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<LibroAutoresModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{idLibro: number, idAutor: number} | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllLibroAutores();
      setData(result);
    } catch (err) {
      toast({ title: "Error", description: "Error al cargar relaciones.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (formData: LibroAutoresFormValues) => {
    setIsSubmitting(true);
    try {
      const coercedData = libroAutorSchema.parse(formData);
      if (currentItem) { // Editing existing relation
        await updateLibroAutor(coercedData.idLibro, coercedData.idAutor, coercedData.rol);
        toast({ title: "Éxito", description: "Relación actualizada." });
      } else { // Creating new relation
        await createLibroAutor(coercedData.idLibro, coercedData.idAutor, coercedData.rol);
        toast({ title: "Éxito", description: "Relación creada." });
      }
      setShowForm(false); setCurrentItem(null); loadData();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast({ title: "Error de Validación", description: err.errors.map(e => e.message).join(', '), variant: "destructive"});
      } else {
        toast({ title: "Error", description: err.message || "Error al guardar la relación.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteLibroAutor(itemToDelete.idLibro, itemToDelete.idAutor);
      toast({ title: "Éxito", description: "Relación eliminada." });
      loadData();
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar relación.", variant: "destructive" });
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: LibroAutoresModel) => { setCurrentItem(item); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setShowForm(true); };
  const confirmDelete = (idLibro: number, idAutor: number) => { setItemToDelete({idLibro, idAutor}); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setShowForm(false); };

  if (loading && !showForm) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando relaciones...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><Combine className="mr-3 h-8 w-8" />Gestión de Relaciones Libro-Autor</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"><PlusCircle className="mr-2 h-5 w-5" />Agregar Nueva</Button> )}
      </div>
      {showForm ? ( <LibroAutorForm currentData={currentItem} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} /> ) 
      : ( <LibroAutorList items={data} onEdit={handleEdit} onDelete={confirmDelete} /> )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. ¿Seguro que quieres eliminar esta relación?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
