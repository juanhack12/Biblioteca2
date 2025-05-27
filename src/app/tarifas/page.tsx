
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { TarifasModel, TarifasFormValues, PrestamosModel } from '@/lib/types';
import { getAllTarifas, createTarifa, updateTarifa, deleteTarifa } from '@/lib/services/tarifas';
import { getAllPrestamos } from '@/lib/services/prestamos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, CircleDollarSign, Edit, Trash2, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tarifaSchema } from '@/lib/schemas';
import { z } from 'zod';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api-config';

// TarifaForm Component
interface TarifaFormProps {
  currentData?: TarifasModel | null;
  onSubmit: (data: TarifasFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  prestamos: PrestamosModel[];
}

function TarifaForm({ currentData, onSubmit, onCancel, isSubmitting, prestamos }: TarifaFormProps) {
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

  const handleSubmitForm = async (data: TarifasFormValues) => {
    await onSubmit(data, currentData?.idTarifa);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>{currentData ? 'Editar Tarifa' : 'Crear Nueva Tarifa'}</CardTitle></CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitForm)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="idPrestamo"
              render={({ field }) => (<FormItem><FormLabel>Préstamo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value?.toString() ?? ''} defaultValue={field.value?.toString() ?? ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un préstamo" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {prestamos.map((prestamo) => (
                      <SelectItem key={prestamo.idPrestamo} value={prestamo.idPrestamo.toString()}>
                        {`Lector: ${prestamo.nombreLector || prestamo.idLector} - Libro: ${prestamo.tituloLibroEjemplar || prestamo.idEjemplar}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="diasRetraso" render={({ field }) => (<FormItem><FormLabel>Días de Retraso</FormLabel><FormControl><Input type="number" placeholder="Ej: 5" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="montoTarifa" render={({ field }) => (<FormItem><FormLabel>Monto Tarifa</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ej: 2.50" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
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
  prestamos: PrestamosModel[];
}

function TarifaList({ items, onEdit, onDelete, prestamos }: TarifaListProps) {
  const getPrestamoInfo = (idPrestamo: number) => {
    const prestamo = prestamos.find(p => p.idPrestamo === idPrestamo);
    if (!prestamo) return `ID Préstamo: ${idPrestamo}`;
    return `Lector: ${prestamo.nombreLector || prestamo.idLector}, Libro: ${prestamo.tituloLibroEjemplar || `Ejemplar ID: ${prestamo.idEjemplar}`}`;
  };

  return (
    <Card><CardHeader><CardTitle>Lista de Tarifas</CardTitle></CardHeader><CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay tarifas registradas o que coincidan con la búsqueda.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>ID Tarifa</TableHead><TableHead>Info Préstamo</TableHead><TableHead>Días Retraso</TableHead><TableHead>Monto Tarifa</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idTarifa}><TableCell>{item.idTarifa}</TableCell><TableCell>{getPrestamoInfo(item.idPrestamo)}</TableCell><TableCell>{item.diasRetraso}</TableCell><TableCell>{item.montoTarifa.toFixed(2)}</TableCell><TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idTarifa)} aria-label="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}</CardContent></Card>
  );
}

// TarifasPage Component
export default function TarifasPage() {
  const [data, setData] = useState<TarifasModel[]>([]);
  const [filteredData, setFilteredData] = useState<TarifasModel[]>([]);
  const [prestamos, setPrestamos] = useState<PrestamosModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<TarifasModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tarifasResult, prestamosResult] = await Promise.all([
        getAllTarifas(),
        getAllPrestamos()
      ]);
      setData(tarifasResult);
      setFilteredData(tarifasResult);
      setPrestamos(prestamosResult);
    } catch (err: any) {
      console.error("Error al cargar datos (TarifasPage):", err);
      let description = "Error al cargar datos iniciales.";
      if (axios.isAxiosError(err)) {
        description = err.response?.data?.message || err.response?.data?.error?.message || err.message || "Error de red o servidor.";
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
      const prestamoAsociado = prestamos.find(p => p.idPrestamo === item.idPrestamo);
      const infoPrestamo = prestamoAsociado ? 
        `Lector: ${prestamoAsociado.nombreLector || prestamoAsociado.idLector} Libro: ${prestamoAsociado.tituloLibroEjemplar || `Ejemplar ID: ${prestamoAsociado.idEjemplar}`}`.toLowerCase()
        : `ID Préstamo: ${item.idPrestamo}`.toLowerCase();

      return (
        item.idTarifa.toString().includes(searchTerm) ||
        item.idPrestamo.toString().includes(searchTerm) ||
        item.diasRetraso.toString().includes(searchTerm) ||
        item.montoTarifa.toString().toLowerCase().includes(lowercasedFilter) ||
        infoPrestamo.includes(lowercasedFilter)
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, data, prestamos]);


  const handleSubmit = async (formData: TarifasFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
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
      console.error("Error en handleSubmit (Tarifas):", err);
      if (err instanceof z.ZodError) {
        toast({ title: "Error de Validación", description: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '), variant: "destructive"});
      } else if (axios.isAxiosError(err)) {
        const errData = err.response?.data;
        toast({ title: "Error", description: errData?.message || errData?.error?.message || err.message || "Error de red o servidor.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: (err as Error).message || "Error al guardar la tarifa.", variant: "destructive" });
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
    } catch (err: any) {
      let description = "Error al eliminar tarifa.";
      if (axios.isAxiosError(err)) {
        const errData = err.response?.data;
        description = errData?.message || errData?.error?.message || err.message || "Error de red o servidor.";
      } else if (err instanceof Error) {
        description = err.message;
      }
      toast({ title: "Error", description, variant: "destructive" });
      console.error("Error en handleDelete (Tarifas):", err);
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: TarifasModel) => { setCurrentItem(item); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setShowForm(true); };
  const confirmDelete = (id: number) => { setItemToDelete(id); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setShowForm(false); };

  if (loading && !showForm && data.length === 0 && !searchTerm) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando datos para tarifas...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><CircleDollarSign className="mr-3 h-8 w-8" />Gestión de Tarifas</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"><PlusCircle className="mr-2 h-5 w-5" />Agregar Nueva</Button> )}
      </div>
      {showForm ? ( <TarifaForm currentData={currentItem} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} prestamos={prestamos} /> ) 
      : ( 
        <>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID Tarifa, Info Préstamo, días o monto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <TarifaList items={filteredData} onEdit={handleEdit} onDelete={confirmDelete} prestamos={prestamos} />
        </>
      )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. ¿Seguro que quieres eliminar esta tarifa?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
