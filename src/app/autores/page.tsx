
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { AutoresModel, AutoresFormValues } from '@/lib/types';
import { getAllAutores, createAutor, updateAutor, deleteAutor } from '@/lib/services/autores';
import { AutorList } from '@/components/lists/autor-list';
import { AutorForm } from '@/components/forms/autor-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Search, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api-config';

export default function AutoresPage() {
  const [autores, setAutores] = useState<AutoresModel[]>([]);
  const [filteredAutores, setFilteredAutores] = useState<AutoresModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentAutor, setCurrentAutor] = useState<AutoresModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [autorToDelete, setAutorToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();

  const loadAutores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllAutores();
      setAutores(data);
      setFilteredAutores(data); // Initialize filteredAutores with all data
    } catch (error: any) {
      let description = "Error al cargar autores. Por favor, inténtalo de nuevo más tarde.";
      if (axios.isAxiosError(error)) {
        console.error("Full Axios error object (loadAutores):", error);
        console.error("error.message:", error.message);
        console.error("error.code:", error.code);
        console.error("error.response?.status:", error.response?.status);
        console.error("error.response?.data:", error.response?.data);
        console.error("error.config?.url:", error.config?.url);
        console.error("Is Axios error flag:", error.isAxiosError);
        console.error("Request object present:", !!error.request);
        console.error("Response object present:", !!error.response);
        if(error.request) {
          console.error("Request details (if available):", error.request);
        }
        if(error.response) {
          console.error("Response details (if available):", error.response);
        }

        const errorCode = error.code; // e.g., 'ECONNREFUSED', 'ERR_NETWORK', 'ERR_BAD_REQUEST', 'ERR_CERT_AUTHORITY_INVALID'
        
        if (errorCode === 'ERR_NETWORK' || !error.response) {
          description = `Error de red al cargar autores. Verifica tu conexión y que el servidor API (${API_BASE_URL}) esté accesible. Código: ${errorCode || 'N/A'}`;
        } else {
          description = `Error del servidor (${error.response.status}). No se pudieron cargar los autores. Código: ${errorCode || 'N/A'}`;
        }
      } else {
        console.error("Non-Axios error in loadAutores:", error);
        description = "Ocurrió un error inesperado al cargar los autores.";
      }
      toast({ title: "Error de Carga", description, variant: "destructive" });
      console.error("Full error details (loadAutores):", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAutores();
  }, [loadAutores]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredAutores(autores);
      return;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = autores.filter(autor => {
      return (
        autor.idAutor.toString().includes(searchTerm) || // Search by ID
        autor.nombre.toLowerCase().includes(lowercasedFilter) ||
        autor.apellido.toLowerCase().includes(lowercasedFilter) ||
        (autor.fechaNacimiento && autor.fechaNacimiento.toLowerCase().includes(lowercasedFilter)) ||
        (autor.nacionalidad && autor.nacionalidad.toLowerCase().includes(lowercasedFilter))
      );
    });
    setFilteredAutores(filtered);
  }, [searchTerm, autores]);

  const handleSubmitAutor = async (data: AutoresFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      const fechaNacimiento = data.fechaNacimiento || undefined; 
      if (id) {
        await updateAutor(id, data.nombre, data.apellido, fechaNacimiento, data.nacionalidad);
        toast({ title: "Éxito", description: "Autor actualizado con éxito." });
      } else {
        await createAutor(data.nombre, data.apellido, fechaNacimiento, data.nacionalidad);
        toast({ title: "Éxito", description: "Autor creado con éxito." });
      }
      setShowForm(false);
      setCurrentAutor(null);
      loadAutores(); 
    } catch (err) {
      toast({ title: "Error", description: "Error al guardar el autor.", variant: "destructive" });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAutor = async () => {
    if (autorToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deleteAutor(autorToDelete);
      toast({ title: "Éxito", description: "Autor eliminado con éxito." });
      loadAutores(); 
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar el autor.", variant: "destructive" });
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setAutorToDelete(null);
    }
  };

  const handleEditAutor = (autor: AutoresModel) => {
    setCurrentAutor(autor);
    setShowForm(true);
  };

  const handleAddNewAutor = () => {
    setCurrentAutor(null);
    setShowForm(true);
  };
  
  const confirmDelete = (id: number) => {
    setAutorToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleCancelForm = () => {
    setCurrentAutor(null);
    setShowForm(false);
  };

  if (loading && !showForm && autores.length === 0) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando autores...</p>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-primary">Gestión de Autores</h1>
        {!showForm && (
          <Button onClick={handleAddNewAutor} className="shadow-md">
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Nuevo Autor
          </Button>
        )}
      </div>

      {showForm ? (
        <AutorForm
          currentAutor={currentAutor}
          onSubmit={handleSubmitAutor}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
        />
      ) : (
        <>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar autores por nombre, apellido, fecha o nacionalidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow max-w-sm"
              />
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <AutorList
                autores={filteredAutores}
                onEdit={handleEditAutor}
                onDelete={confirmDelete}
              />
            )}
          </div>
        </>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este autor?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAutor} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
