"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { PersonasModel, PersonasFormValues } from '@/lib/types';
import { getAllPersonas, createPersona, updatePersona, deletePersona } from '@/lib/services/personas';
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
import { personaSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// PersonaForm Component
interface PersonaFormProps {
  currentData?: PersonasModel | null;
  onSubmit: (data: PersonasFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function PersonaForm({ currentData, onSubmit, onCancel, isSubmitting }: PersonaFormProps) {
  const form = useForm<PersonasFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      nombre: currentData?.nombre || '',
      apellido: currentData?.apellido || '',
      documentoIdentidad: currentData?.documentoIdentidad || '',
      fechaNacimiento: currentData?.fechaNacimiento || '',
      correo: currentData?.correo || '',
      telefono: currentData?.telefono || '',
      direccion: currentData?.direccion || '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset(currentData);
    } else {
      form.reset({ nombre: '', apellido: '', documentoIdentidad: '', fechaNacimiento: '', correo: '', telefono: '', direccion: '' });
    }
  }, [currentData, form]);

  const handleSubmit = async (data: PersonasFormValues) => {
    await onSubmit(data, currentData?.idPersona);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{currentData ? 'Editar Persona' : 'Crear Nueva Persona'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="nombre" render={({ field }) => ( <FormItem> <FormLabel>Nombre</FormLabel> <FormControl><Input placeholder="Ej: Ana" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="apellido" render={({ field }) => ( <FormItem> <FormLabel>Apellido</FormLabel> <FormControl><Input placeholder="Ej: Pérez" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="documentoIdentidad" render={({ field }) => ( <FormItem> <FormLabel>Documento Identidad</FormLabel> <FormControl><Input placeholder="Ej: 12345678X" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField
              control={form.control}
              name="fechaNacimiento"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Nacimiento</FormLabel>
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
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="correo" render={({ field }) => ( <FormItem> <FormLabel>Correo</FormLabel> <FormControl><Input type="email" placeholder="Ej: ana.perez@example.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="telefono" render={({ field }) => ( <FormItem> <FormLabel>Teléfono</FormLabel> <FormControl><Input type="tel" placeholder="Ej: 600123456" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="direccion" render={({ field }) => ( <FormItem> <FormLabel>Dirección</FormLabel> <FormControl><Input placeholder="Ej: Calle Falsa 123" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
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

// PersonaList Component
interface PersonaListProps {
  items: PersonasModel[];
  onEdit: (item: PersonasModel) => void;
  onDelete: (id: number) => void;
}

function PersonaList({ items, onEdit, onDelete }: PersonaListProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'PPP', { locale: es });
  };
  return (
    <Card>
      <CardHeader> <CardTitle>Lista de Personas</CardTitle> </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay personas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader> <TableRow> <TableHead>ID</TableHead> <TableHead>Nombre</TableHead> <TableHead>Apellido</TableHead> <TableHead>Documento</TableHead> <TableHead>F. Nacimiento</TableHead> <TableHead>Correo</TableHead> <TableHead>Teléfono</TableHead> <TableHead>Dirección</TableHead> <TableHead className="text-right">Acciones</TableHead> </TableRow> </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idPersona}>
                    <TableCell>{item.idPersona}</TableCell> <TableCell>{item.nombre}</TableCell> <TableCell>{item.apellido}</TableCell> <TableCell>{item.documentoIdentidad}</TableCell> <TableCell>{formatDate(item.fechaNacimiento)}</TableCell> <TableCell>{item.correo}</TableCell> <TableCell>{item.telefono}</TableCell> <TableCell>{item.direccion}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"> <Edit className="h-4 w-4" /> </Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idPersona)} aria-label="Eliminar"> <Trash2 className="h-4 w-4" /> </Button>
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

// PersonasPage Component
export default function PersonasPage() {
  const [data, setData] = useState<PersonasModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<PersonasModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllPersonas();
      setData(result);
    } catch (err) {
      toast({ title: "Error", description: "Error al cargar personas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (formData: PersonasFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await updatePersona(id, formData.nombre, formData.apellido, formData.documentoIdentidad, formData.fechaNacimiento, formData.correo, formData.telefono, formData.direccion);
        toast({ title: "Éxito", description: "Persona actualizada." });
      } else {
        await createPersona(formData.nombre, formData.apellido, formData.documentoIdentidad, formData.fechaNacimiento, formData.correo, formData.telefono, formData.direccion);
        toast({ title: "Éxito", description: "Persona creada." });
      }
      setShowForm(false); setCurrentItem(null); loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al guardar la persona.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deletePersona(itemToDelete);
      toast({ title: "Éxito", description: "Persona eliminada." });
      loadData();
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar persona.", variant: "destructive" });
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: PersonasModel) => { setCurrentItem(item); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setShowForm(true); };
  const confirmDelete = (id: number) => { setItemToDelete(id); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setShowForm(false); };

  if (loading && !showForm) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando personas...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><Users className="mr-3 h-8 w-8" />Gestión de Personas</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"> <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nueva </Button> )}
      </div>
      {showForm ? ( <PersonaForm currentData={currentItem} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} /> ) 
      : ( <PersonaList items={data} onEdit={handleEdit} onDelete={confirmDelete} /> )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader> <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle> <AlertDialogDescription> Esta acción no se puede deshacer. ¿Seguro que quieres eliminar esta persona? </AlertDialogDescription> </AlertDialogHeader>
          <AlertDialogFooter> <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel> <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90"> {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Eliminar </AlertDialogAction> </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

