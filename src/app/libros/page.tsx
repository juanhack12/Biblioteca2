
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LibrosModel, LibrosFormValues } from '@/lib/types';
import { getAllLibros, createLibro, updateLibro, deleteLibro } from '@/lib/services/libros';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, BookOpen, Edit, Trash2, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { libroSchema } from '@/lib/schemas';
import { z } from 'zod';

// LibroForm Component
interface LibroFormProps {
  currentData?: LibrosModel | null;
  initialValues?: Partial<LibrosFormValues>;
  onSubmit: (data: LibrosFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function LibroForm({ currentData, initialValues, onSubmit, onCancel, isSubmitting }: LibroFormProps) {
  const form = useForm<LibrosFormValues>({
    resolver: zodResolver(libroSchema),
    defaultValues: {
      titulo: initialValues?.titulo || currentData?.titulo || '',
      anioPublicacion: initialValues?.anioPublicacion || currentData?.anioPublicacion || '',
      idEditorial: initialValues?.idEditorial?.toString() || currentData?.idEditorial?.toString() || '',
    },
  });

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
       form.reset({
        titulo: initialValues.titulo || '',
        anioPublicacion: initialValues.anioPublicacion || '',
        idEditorial: initialValues.idEditorial?.toString() || '',
      });
    } else if (currentData) {
      form.reset({
        titulo: currentData.titulo,
        anioPublicacion: currentData.anioPublicacion,
        idEditorial: currentData.idEditorial.toString(),
      });
    } else {
      form.reset({ titulo: '', anioPublicacion: '', idEditorial: '' });
    }
  }, [currentData, initialValues, form]);

  const handleSubmitForm = async (data: LibrosFormValues) => {
    await onSubmit(data, currentData?.idLibro);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>{currentData ? 'Editar Libro' : (initialValues?.titulo ? 'Crear Libro (Sugerencias IA)' : 'Crear Nuevo Libro')}</CardTitle></CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitForm)}>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="titulo" render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input placeholder="Ej: Cien Años de Soledad" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="anioPublicacion" render={({ field }) => (<FormItem><FormLabel>Año de Publicación</FormLabel><FormControl><Input type="text" maxLength={4} placeholder="Ej: 1967" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="idEditorial"
              render={({ field }) => (<FormItem><FormLabel>ID Editorial</FormLabel><FormControl><Input type="number" placeholder="Ej: 1" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)}
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

// LibroList Component
interface LibroListProps {
  items: LibrosModel[];
  onEdit: (item: LibrosModel) => void;
  onDelete: (id: number) => void;
}

function LibroList({ items, onEdit, onDelete }: LibroListProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Lista de Libros</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay libros registrados o que coincidan con la búsqueda.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>ID Libro</TableHead><TableHead>Título</TableHead><TableHead>Año Publicación</TableHead><TableHead>ID Editorial</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idLibro}><TableCell>{item.idLibro}</TableCell><TableCell>{item.titulo}</TableCell><TableCell>{item.anioPublicacion}</TableCell><TableCell>{item.idEditorial}</TableCell><TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idLibro)} aria-label="Eliminar"><Trash2 className="h-4 w-4" /></Button>
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

// LibrosPage Component
export default function LibrosPage() {
  const [data, setData] = useState<LibrosModel[]>([]);
  const [filteredData, setFilteredData] = useState<LibrosModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<LibrosModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [initialFormValues, setInitialFormValues] = useState<Partial<LibrosFormValues> | undefined>(undefined);

  useEffect(() => {
    const prefillTitle = searchParams.get('title');
    const prefillYear = searchParams.get('year');
    if (prefillTitle) {
      setInitialFormValues({
        titulo: prefillTitle,
        anioPublicacion: prefillYear || '',
      });
      setShowForm(true); 
      router.replace('/libros', { scroll: false }); 
    }
  }, [searchParams, router]);


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllLibros();
      setData(result);
      setFilteredData(result);
    } catch (err) {
      toast({ title: "Error", description: "Error al cargar libros.", variant: "destructive" });
      console.error("Error en loadData (Libros):", err);
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
        item.titulo.toLowerCase().includes(lowercasedFilter) ||
        item.anioPublicacion.toString().includes(lowercasedFilter) || // anioPublicacion es string
        item.idEditorial.toString().includes(searchTerm)
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleSubmit = async (formData: LibrosFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      const coercedData = libroSchema.parse(formData);
      if (id) {
        await updateLibro(id, coercedData.titulo, coercedData.anioPublicacion, coercedData.idEditorial);
        toast({ title: "Éxito", description: "Libro actualizado." });
      } else {
        await createLibro(coercedData.titulo, coercedData.anioPublicacion, coercedData.idEditorial);
        toast({ title: "Éxito", description: "Libro creado." });
      }
      setShowForm(false); setCurrentItem(null); setInitialFormValues(undefined); loadData();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast({ title: "Error de Validación", description: err.errors.map(e => e.message).join(', '), variant: "destructive"});
      } else {
        toast({ title: "Error", description: err.message || "Error al guardar el libro.", variant: "destructive" });
      }
      console.error("Error en handleSubmit (Libros):", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deleteLibro(itemToDelete);
      toast({ title: "Éxito", description: "Libro eliminado." });
      loadData();
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar libro.", variant: "destructive" });
      console.error("Error en handleDelete (Libros):", err);
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: LibrosModel) => { setCurrentItem(item); setInitialFormValues(undefined); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setInitialFormValues(undefined); setShowForm(true); };
  const confirmDelete = (id: number) => { setItemToDelete(id); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setInitialFormValues(undefined); setShowForm(false); };

  if (loading && !showForm && data.length === 0) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando libros...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><BookOpen className="mr-3 h-8 w-8" />Gestión de Libros</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"><PlusCircle className="mr-2 h-5 w-5" />Agregar Nuevo</Button> )}
      </div>
      {showForm ? ( <LibroForm currentData={currentItem} initialValues={initialFormValues} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} /> ) 
      : ( 
        <>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, año o ID Editorial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <LibroList items={filteredData} onEdit={handleEdit} onDelete={confirmDelete} />
        </>
      )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este libro?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
