"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { EditorialesModel, EditorialesFormValues } from '@/lib/types';
import { getAllEditoriales, createEditorial, updateEditorial, deleteEditorial } from '@/lib/services/editoriales';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Library, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editorialSchema } from '@/lib/schemas';

// EditorialForm Component
interface EditorialFormProps {
  currentData?: EditorialesModel | null;
  onSubmit: (data: EditorialesFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function EditorialForm({ currentData, onSubmit, onCancel, isSubmitting }: EditorialFormProps) {
  const form = useForm<EditorialesFormValues>({
    resolver: zodResolver(editorialSchema),
    defaultValues: {
      nombre: currentData?.nombre || '',
      pais: currentData?.pais || '',
      ciudad: currentData?.ciudad || '',
      sitioWeb: currentData?.sitioWeb || '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset(currentData);
    } else {
      form.reset({ nombre: '', pais: '', ciudad: '', sitioWeb: '' });
    }
  }, [currentData, form]);

  const handleSubmit = async (data: EditorialesFormValues) => {
    await onSubmit(data, currentData?.idEditorial);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{currentData ? 'Editar Editorial' : 'Crear Nueva Editorial'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="nombre" render={({ field }) => ( <FormItem> <FormLabel>Nombre</FormLabel> <FormControl><Input placeholder="Ej: Penguin Random House" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="pais" render={({ field }) => ( <FormItem> <FormLabel>País</FormLabel> <FormControl><Input placeholder="Ej: España" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="ciudad" render={({ field }) => ( <FormItem> <FormLabel>Ciudad</FormLabel> <FormControl><Input placeholder="Ej: Barcelona" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="sitioWeb" render={({ field }) => ( <FormItem> <FormLabel>Sitio Web (Opcional)</FormLabel> <FormControl><Input type="url" placeholder="Ej: https://www.penguinrandomhouse.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}> Cancelar </Button>
            <Button type="submit" disabled={isSubmitting}> {isSubmitting ? (currentData ? 'Actualizando...' : 'Creando...') : (currentData ? 'Actualizar' : 'Crear')} </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// EditorialList Component
interface EditorialListProps {
  items: EditorialesModel[];
  onEdit: (item: EditorialesModel) => void;
  onDelete: (id: number) => void;
}

function EditorialList({ items, onEdit, onDelete }: EditorialListProps) {
  return (
    <Card>
      <CardHeader> <CardTitle>Lista de Editoriales</CardTitle> </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay editoriales registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader> <TableRow> <TableHead>ID</TableHead> <TableHead>Nombre</TableHead> <TableHead>País</TableHead> <TableHead>Ciudad</TableHead> <TableHead>Sitio Web</TableHead> <TableHead className="text-right">Acciones</TableHead> </TableRow> </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idEditorial}>
                    <TableCell>{item.idEditorial}</TableCell> <TableCell>{item.nombre}</TableCell> <TableCell>{item.pais}</TableCell> <TableCell>{item.ciudad}</TableCell> <TableCell><a href={item.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{item.sitioWeb}</a></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"> <Edit className="h-4 w-4" /> </Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idEditorial)} aria-label="Eliminar"> <Trash2 className="h-4 w-4" /> </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// EditorialesPage Component
export default function EditorialesPage() {
  const [data, setData] = useState<EditorialesModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<EditorialesModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllEditoriales();
      setData(result);
    } catch (err) {
      toast({ title: "Error", description: "Error al cargar editoriales.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (formData: EditorialesFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await updateEditorial(id, formData.nombre, formData.pais, formData.ciudad, formData.sitioWeb || null);
        toast({ title: "Éxito", description: "Editorial actualizada." });
      } else {
        await createEditorial(formData.nombre, formData.pais, formData.ciudad, formData.sitioWeb || '');
        toast({ title: "Éxito", description: "Editorial creada." });
      }
      setShowForm(false); setCurrentItem(null); loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al guardar la editorial.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deleteEditorial(itemToDelete);
      toast({ title: "Éxito", description: "Editorial eliminada." });
      loadData();
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar editorial.", variant: "destructive" });
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: EditorialesModel) => { setCurrentItem(item); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setShowForm(true); };
  const confirmDelete = (id: number) => { setItemToDelete(id); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setShowForm(false); };

  if (loading && !showForm) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando editoriales...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><Library className="mr-3 h-8 w-8" />Gestión de Editoriales</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"> <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nueva </Button> )}
      </div>
      {showForm ? ( <EditorialForm currentData={currentItem} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} /> ) 
      : ( <EditorialList items={data} onEdit={handleEdit} onDelete={confirmDelete} /> )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader> <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle> <AlertDialogDescription> Esta acción no se puede deshacer. ¿Seguro que quieres eliminar esta editorial? </AlertDialogDescription> </AlertDialogHeader>
          <AlertDialogFooter> <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel> <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90"> {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Eliminar </AlertDialogAction> </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

