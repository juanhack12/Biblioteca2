
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { PrestamosModel, PrestamosFormValues, LectoresModel, BibliotecariosModel, EjemplaresModel } from '@/lib/types';
import { getAllPrestamos, createPrestamo, updatePrestamo, deletePrestamo } from '@/lib/services/prestamos';
import { getAllLectores } from '@/lib/services/lectores';
import { getAllBibliotecarios } from '@/lib/services/bibliotecarios';
import { getAllEjemplares } from '@/lib/services/ejemplares';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, ArrowRightLeft, Edit, Trash2, CalendarIcon, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { prestamoSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { z } from 'zod';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api-config';

// PrestamoForm Component
interface PrestamoFormProps {
  currentData?: PrestamosModel | null;
  onSubmit: (data: PrestamosFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  lectores: LectoresModel[];
  bibliotecarios: BibliotecariosModel[];
  ejemplares: EjemplaresModel[];
}

function PrestamoForm({ currentData, onSubmit, onCancel, isSubmitting, lectores, bibliotecarios, ejemplares }: PrestamoFormProps) {
  const form = useForm<PrestamosFormValues>({
    resolver: zodResolver(prestamoSchema),
    defaultValues: {
      idLector: currentData?.idLector?.toString() ?? '',
      idBibliotecario: currentData?.idBibliotecario?.toString() ?? '',
      idEjemplar: currentData?.idEjemplar?.toString() ?? '',
      fechaPrestamo: currentData?.fechaPrestamo || '',
      fechaDevolucion: currentData?.fechaDevolucion || '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset({
        idLector: currentData.idLector.toString(),
        idBibliotecario: currentData.idBibliotecario.toString(),
        idEjemplar: currentData.idEjemplar.toString(),
        fechaPrestamo: currentData.fechaPrestamo, 
        fechaDevolucion: currentData.fechaDevolucion,
      });
    } else {
      form.reset({ idLector: '', idBibliotecario: '', idEjemplar: '', fechaPrestamo: '', fechaDevolucion: '' });
    }
  }, [currentData, form]);

  const handleSubmitForm = async (data: PrestamosFormValues) => {
    await onSubmit(data, currentData?.idPrestamo);
  };
  
  const safeParseDate = (dateString?: string) => {
    if (!dateString) return undefined;
    try {
      if (dateString.includes('T')) return parseISO(dateString);
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month -1, day);
    } catch (e) { return undefined; }
  };


  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>{currentData ? 'Editar Préstamo' : 'Crear Nuevo Préstamo'}</CardTitle></CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitForm)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="idLector"
              render={({ field }) => (<FormItem><FormLabel>Lector</FormLabel>
                <Select onValueChange={field.onChange} value={field.value?.toString() ?? ''} defaultValue={field.value?.toString() ?? ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un lector" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {lectores.map((lector) => (
                      <SelectItem key={lector.idLector} value={lector.idLector.toString()}>
                        {`${lector.nombre || ''} ${lector.apellido || ''}`.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="idBibliotecario"
              render={({ field }) => (<FormItem><FormLabel>Bibliotecario</FormLabel>
                <Select onValueChange={field.onChange} value={field.value?.toString() ?? ''} defaultValue={field.value?.toString() ?? ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un bibliotecario" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {bibliotecarios.map((bibliotecario) => (
                      <SelectItem key={bibliotecario.idBibliotecario} value={bibliotecario.idBibliotecario.toString()}>
                        {`${bibliotecario.nombre || ''} ${bibliotecario.apellido || ''}`.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="idEjemplar"
              render={({ field }) => (<FormItem><FormLabel>Ejemplar (Libro)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value?.toString() ?? ''} defaultValue={field.value?.toString() ?? ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un ejemplar" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {ejemplares.map((ejemplar) => (
                      <SelectItem key={ejemplar.idEjemplar} value={ejemplar.idEjemplar.toString()}>
                        {ejemplar.tituloLibro || `Ejemplar ID: ${ejemplar.idEjemplar}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="fechaPrestamo"
              render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha de Préstamo</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(safeParseDate(field.value) || new Date(), "PPP", { locale: es })) : (<span>Seleccione una fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={safeParseDate(field.value)} onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}
            />
            <FormField
              control={form.control}
              name="fechaDevolucion"
              render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha de Devolución</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(safeParseDate(field.value) || new Date(), "PPP", { locale: es })) : (<span>Seleccione una fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={safeParseDate(field.value)} onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}
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

// PrestamoList Component
interface PrestamoListProps {
  items: PrestamosModel[];
  onEdit: (item: PrestamosModel) => void;
  onDelete: (id: number) => void;
}

function PrestamoList({ items, onEdit, onDelete }: PrestamoListProps) {
  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      // Ensure date is treated as UTC if no timezone info is present
      const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
      return format(date, 'PPP', { locale: es });
    } catch (e) {
      return dateString; 
    }
  };
  return (
    <Card><CardHeader><CardTitle>Lista de Préstamos</CardTitle></CardHeader><CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay préstamos registrados o que coincidan con la búsqueda.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Lector</TableHead><TableHead>Bibliotecario</TableHead><TableHead>Título Libro</TableHead><TableHead>F. Préstamo</TableHead><TableHead>F. Devolución</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idPrestamo}><TableCell>{item.idPrestamo}</TableCell><TableCell>{item.nombreLector || `ID Lector: ${item.idLector}`}</TableCell><TableCell>{item.nombreBibliotecario || `ID Bibliotecario: ${item.idBibliotecario}`}</TableCell><TableCell>{item.tituloLibroEjemplar || `ID Ejemplar: ${item.idEjemplar}`}</TableCell><TableCell>{formatDateForDisplay(item.fechaPrestamo)}</TableCell><TableCell>{formatDateForDisplay(item.fechaDevolucion)}</TableCell><TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idPrestamo)} aria-label="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}</CardContent></Card>
  );
}

// PrestamosPage Component
export default function PrestamosPage() {
  const [data, setData] = useState<PrestamosModel[]>([]);
  const [filteredData, setFilteredData] = useState<PrestamosModel[]>([]);
  const [lectores, setLectores] = useState<LectoresModel[]>([]);
  const [bibliotecarios, setBibliotecarios] = useState<BibliotecariosModel[]>([]);
  const [ejemplares, setEjemplares] = useState<EjemplaresModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<PrestamosModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prestamosResult, lectoresResult, bibliotecariosResult, ejemplaresResult] = await Promise.all([
        getAllPrestamos(),
        getAllLectores(),
        getAllBibliotecarios(),
        getAllEjemplares(),
      ]);
      setData(prestamosResult);
      setFilteredData(prestamosResult);
      setLectores(lectoresResult);
      setBibliotecarios(bibliotecariosResult);
      setEjemplares(ejemplaresResult);
    } catch (err: any) {
      console.error("Error al cargar datos (PrestamosPage):", err);
      let description = "Error al cargar datos iniciales.";
      if (axios.isAxiosError(err)) {
        description = err.response?.data?.message || err.response?.data?.error?.message || err.message || "Error de red o servidor.";
      } else if (err instanceof Error) {
        description = err.message;
      }
      toast({ title: "Error de Carga", description, variant: "destructive" });
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
        item.idPrestamo.toString().includes(lowercasedFilter) ||
        (item.nombreLector && item.nombreLector.toLowerCase().includes(lowercasedFilter)) ||
        item.idLector.toString().includes(lowercasedFilter) ||
        (item.nombreBibliotecario && item.nombreBibliotecario.toLowerCase().includes(lowercasedFilter)) ||
        item.idBibliotecario.toString().includes(lowercasedFilter) ||
        (item.tituloLibroEjemplar && item.tituloLibroEjemplar.toLowerCase().includes(lowercasedFilter)) ||
        item.idEjemplar.toString().includes(lowercasedFilter) ||
        (item.fechaPrestamo && item.fechaPrestamo.toLowerCase().includes(lowercasedFilter)) ||
        (item.fechaDevolucion && item.fechaDevolucion.toLowerCase().includes(lowercasedFilter))
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleSubmit = async (formData: PrestamosFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      const coercedData = prestamoSchema.parse(formData);
      
      if (id) {
        await updatePrestamo(id, coercedData.idLector, coercedData.idBibliotecario, coercedData.idEjemplar, coercedData.fechaPrestamo, coercedData.fechaDevolucion);
        toast({ title: "Éxito", description: "Préstamo actualizado." });
      } else {
        await createPrestamo(coercedData.idLector, coercedData.idBibliotecario, coercedData.idEjemplar, coercedData.fechaPrestamo, coercedData.fechaDevolucion);
        toast({ title: "Éxito", description: "Préstamo creado." });
      }
      setShowForm(false); setCurrentItem(null); loadData();
    } catch (err: any) {
      console.error("Error al guardar préstamo (handleSubmit):", err);
      let description = "Error al guardar el préstamo.";
      if (err instanceof z.ZodError) {
        description = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        toast({ title: "Error de Validación", description, variant: "destructive"});
      } else if (axios.isAxiosError(err)) {
        const errData = err.response?.data;
        description = errData?.message || errData?.error?.message || err.message || "Error de red o servidor.";
        toast({ title: "Error", description, variant: "destructive" });
      } else if (err instanceof Error) {
        description = err.message;
        toast({ title: "Error", description, variant: "destructive" });
      } else {
         toast({ title: "Error Desconocido", description: "Ocurrió un error inesperado.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deletePrestamo(itemToDelete);
      toast({ title: "Éxito", description: "Préstamo eliminado." });
      loadData();
    } catch (err: any) {
      console.error("Error al eliminar préstamo (handleDelete):", err);
      let description = "Error al eliminar préstamo.";
      if (axios.isAxiosError(err)) {
        const errData = err.response?.data;
        description = errData?.message || errData?.error?.message || err.message || "Error de red o servidor.";
      } else if (err instanceof Error) {
        description = err.message;
      }
      toast({ title: "Error", description, variant: "destructive" });
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: PrestamosModel) => { setCurrentItem(item); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setShowForm(true); };
  const confirmDelete = (id: number) => { setItemToDelete(id); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setShowForm(false); };

  if (loading && !showForm && data.length === 0 && !searchTerm ) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando datos para préstamos...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><ArrowRightLeft className="mr-3 h-8 w-8" />Gestión de Préstamos</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"><PlusCircle className="mr-2 h-5 w-5" />Agregar Nuevo</Button> )}
      </div>
      {showForm ? ( <PrestamoForm currentData={currentItem} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} lectores={lectores} bibliotecarios={bibliotecarios} ejemplares={ejemplares} /> ) 
      : ( 
        <>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, Lector, Bibliotecario, Título Libro, o fechas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <PrestamoList items={filteredData} onEdit={handleEdit} onDelete={confirmDelete} />
        </>
      )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este préstamo?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
