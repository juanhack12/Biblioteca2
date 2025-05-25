
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { BibliotecariosModel, BibliotecariosFormValues } from '@/lib/types';
import { getAllBibliotecarios, createBibliotecario, updateBibliotecario, deleteBibliotecario } from '@/lib/services/bibliotecarios';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Users, Edit, Trash2, CalendarIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bibliotecarioSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
      idPersona: currentData?.idPersona ?? undefined,
      fechaContratacion: currentData?.fechaContratacion || undefined,
      turno: currentData?.turno || '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset({
        idPersona: currentData.idPersona ?? undefined,
        fechaContratacion: currentData.fechaContratacion || undefined,
        turno: currentData.turno,
      });
    } else {
      form.reset({
        idPersona: undefined,
        fechaContratacion: undefined,
        turno: '',
      });
    }
  }, [currentData, form]);

  const handleSubmit = async (data: BibliotecariosFormValues) => {
    // Ensure numeric fields are numbers or undefined
    const payload = {
      ...data,
      idPersona: data.idPersona ? Number(data.idPersona) : undefined,
    };
    await onSubmit(payload, currentData?.idBibliotecario);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{currentData ? 'Editar Bibliotecario' : 'Crear Nuevo Bibliotecario'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="idPersona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Persona (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 1" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} />
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
                  <FormLabel>Fecha de Contratación (Opcional)</FormLabel>
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
              name="turno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turno</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Matutino" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (currentData ? 'Actualizando...' : 'Creando...') : (currentData ? 'Actualizar' : 'Crear')}
            </Button>
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
   const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00'); // Ensure UTC interpretation for YYYY-MM-DD
    return format(date, 'PPP', { locale: es });
  };
  return (
    <Card>
      <CardHeader><CardTitle>Lista de Bibliotecarios</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay bibliotecarios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>ID Persona</TableHead><TableHead>Fecha Contratación</TableHead><TableHead>Turno</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idBibliotecario}><TableCell>{item.idBibliotecario}</TableCell><TableCell>{item.idPersona || 'N/A'}</TableCell><TableCell>{formatDate(item.fechaContratacion)}</TableCell><TableCell>{item.turno}</TableCell><TableCell className="text-right space-x-2">
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
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<BibliotecariosModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllBibliotecarios();
      setData(result);
    } catch (err) {
      toast({ title: "Error", description: "Error al cargar bibliotecarios.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (formData: BibliotecariosFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      const idPersonaToSubmit = formData.idPersona ? Number(formData.idPersona) : 0; // Backend needs int, 0 if not provided
      const fechaContratacionToSubmit = formData.fechaContratacion || undefined;

      if (id) {
        await updateBibliotecario(id, idPersonaToSubmit, fechaContratacionToSubmit, formData.turno);
        toast({ title: "Éxito", description: "Bibliotecario actualizado." });
      } else {
        if(idPersonaToSubmit === 0) { // Basic validation example, ideally handled by Zod
            toast({ title: "Error", description: "ID Persona es requerido para crear.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }
        await createBibliotecario(idPersonaToSubmit, fechaContratacionToSubmit, formData.turno);
        toast({ title: "Éxito", description: "Bibliotecario creado." });
      }
      setShowForm(false);
      setCurrentItem(null);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al guardar el bibliotecario.", variant: "destructive" });
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
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar bibliotecario.", variant: "destructive" });
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

  if (loading && !showForm) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando bibliotecarios...</p>
    </div>
  );

  return (
    <div className="space-y-8">
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
        <BibliotecarioList
          items={data}
          onEdit={handleEdit}
          onDelete={confirmDelete}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este bibliotecario?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
