
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { TarifasModel, TarifasFormValues } from '@/lib/types';
import { getAllTarifas, createTarifa, updateTarifa, deleteTarifa } from '@/lib/services/tarifas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, CircleDollarSign, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tarifaSchema } from '@/lib/schemas';

// TarifaForm Component
interface TarifaFormProps {
  currentData?: TarifasModel | null;
  onSubmit: (data: TarifasFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function TarifaForm({ currentData, onSubmit, onCancel, isSubmitting }: TarifaFormProps) {
  const form = useForm<TarifasFormValues>({
    resolver: zodResolver(tarifaSchema),
    defaultValues: {
      idPrestamo: currentData?.idPrestamo?.toString() ?? '',
      diasRetraso: currentData?.diasRetraso?.toString() ?? '',
      montoTarifa: currentData?.montoTarifa?.toString() ?? '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset({
        idPrestamo: currentData.idPrestamo.toString(),
        diasRetraso: currentData.diasRetraso.toString(),
        montoTarifa: currentData.montoTarifa.toString(),
      });
    } else {
      form.reset({ idPrestamo: '', diasRetraso: '', montoTarifa: '' });
    }
  }, [currentData, form]);

  const handleSubmit = async (data: TarifasFormValues) => {
    // Zod coerce.number will handle conversion
    await onSubmit(data, currentData?.idTarifa);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>{currentData ? 'Editar Tarifa' : 'Crear Nueva Tarifa'}</CardTitle></CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="idPrestamo" render={({ field }) => (<FormItem><FormLabel>ID Préstamo</FormLabel><FormControl><Input type="number" placeholder="Ej: 1" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="diasRetraso" render={({ field }) => (<FormItem><FormLabel>Días de Retraso</FormLabel><FormControl><Input type="number" placeholder="Ej: 5" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="montoTarifa" render={({ field }) => (<FormItem><FormLabel>Monto Tarifa</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ej: 2.50" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
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

// TarifaList Component
interface TarifaListProps {
  items: TarifasModel[];
  onEdit: (item: TarifasModel) => void;
  onDelete: (id: number) => void;
}

function TarifaList({ items, onEdit, onDelete }: TarifaListProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Lista de Tarifas</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay tarifas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>ID Tarifa</TableHead><TableHead>ID Préstamo</TableHead><TableHead>Días Retraso</TableHead><TableHead>Monto Tarifa</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idTarifa}><TableCell>{item.idTarifa}</TableCell><TableCell>{item.idPrestamo}</TableCell><TableCell>{item.diasRetraso}</TableCell><TableCell>{item.montoTarifa.toFixed(2)}</TableCell><TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idTarifa)} aria-label="Eliminar"><Trash2 className="h-4 w-4" /></Button>
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

// TarifasPage Component
export default function TarifasPage() {
  const [data, setData] = useState<TarifasModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<TarifasModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllTarifas();
      setData(result);
    } catch (err) {
      toast({ title: "Error", description: "Error al cargar tarifas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (formData: TarifasFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      // formData values are already strings from the form, Zod will coerce them
      const coercedData = tarifaSchema.parse(formData);

      if (id) {
        await updateTarifa(id, coercedData.idPrestamo, coercedData.diasRetraso, coercedData.montoTarifa);
        toast({ title: "Éxito", description: "Tarifa actualizada." });
      } else {
        await createTarifa(coercedData.idPrestamo, coercedData.diasRetraso, coercedData.montoTarifa);
        toast({ title: "Éxito", description: "Tarifa creada." });
      }
      setShowForm(false); setCurrentItem(null); loadData();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast({ title: "Error de Validación", description: err.errors.map(e => e.message).join(', '), variant: "destructive"});
      } else {
        toast({ title: "Error", description: err.message || "Error al guardar la tarifa.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deleteTarifa(itemToDelete);
      toast({ title: "Éxito", description: "Tarifa eliminada." });
      loadData();
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar tarifa.", variant: "destructive" });
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: TarifasModel) => { setCurrentItem(item); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setShowForm(true); };
  const confirmDelete = (id: number) => { setItemToDelete(id); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setShowForm(false); };

  if (loading && !showForm) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando tarifas...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><CircleDollarSign className="mr-3 h-8 w-8" />Gestión de Tarifas</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"><PlusCircle className="mr-2 h-5 w-5" />Agregar Nueva</Button> )}
      </div>
      {showForm ? ( <TarifaForm currentData={currentItem} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} /> ) 
      : ( <TarifaList items={data} onEdit={handleEdit} onDelete={confirmDelete} /> )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. ¿Seguro que quieres eliminar esta tarifa?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
