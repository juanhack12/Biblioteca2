"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { AutoresModel, AutoresFormValues, DateOnlyString } from '@/lib/types';
import { autorSchema } from '@/lib/schemas';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AutorFormProps {
  currentAutor?: AutoresModel | null;
  onSubmit: (data: AutoresFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function AutorForm({ currentAutor, onSubmit, onCancel, isSubmitting }: AutorFormProps) {
  const form = useForm<AutoresFormValues>({
    resolver: zodResolver(autorSchema),
    defaultValues: {
      nombre: currentAutor?.nombre || '',
      apellido: currentAutor?.apellido || '',
      fechaNacimiento: currentAutor?.fechaNacimiento || undefined,
      nacionalidad: currentAutor?.nacionalidad || '',
    },
  });

  useEffect(() => {
    if (currentAutor) {
      form.reset({
        nombre: currentAutor.nombre,
        apellido: currentAutor.apellido,
        fechaNacimiento: currentAutor.fechaNacimiento || undefined,
        nacionalidad: currentAutor.nacionalidad,
      });
    } else {
      form.reset({
        nombre: '',
        apellido: '',
        fechaNacimiento: undefined,
        nacionalidad: '',
      });
    }
  }, [currentAutor, form]);

  const handleSubmit = async (data: AutoresFormValues) => {
    await onSubmit(data, currentAutor?.idAutor);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{currentAutor ? 'Editar Autor' : 'Crear Nuevo Autor'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Gabriel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apellido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: García Márquez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP") // Adjust date string to Date object for formatting
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined} // Ensure Date object for Calendar
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") as DateOnlyString : undefined)}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
              name="nacionalidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nacionalidad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Colombiana" {...field} />
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
              {isSubmitting ? (currentAutor ? 'Actualizando...' : 'Creando...') : (currentAutor ? 'Actualizar Autor' : 'Crear Autor')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
