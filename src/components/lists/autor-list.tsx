
"use client";

import React from 'react';
import type { AutoresModel } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AutorListProps {
  autores: AutoresModel[];
  onEdit: (autor: AutoresModel) => void;
  onDelete: (id: number) => void;
}

export function AutorList({ autores, onEdit, onDelete }: AutorListProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'PPP', { locale: es });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Lista de Autores</CardTitle></CardHeader>
      <CardContent>
        {autores.length === 0 ? (
          <p className="text-muted-foreground">No hay autores registrados o que coincidan con la búsqueda.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead>Apellido</TableHead><TableHead>Fecha Nacimiento</TableHead><TableHead>Nacionalidad</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {autores.map((autor) => (
                  <TableRow key={autor.idAutor}><TableCell>{autor.idAutor}</TableCell><TableCell>{autor.nombre}</TableCell><TableCell>{autor.apellido}</TableCell><TableCell>{formatDate(autor.fechaNacimiento)}</TableCell><TableCell>{autor.nacionalidad}</TableCell><TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(autor)} aria-label="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(autor.idAutor)} aria-label="Eliminar"><Trash2 className="h-4 w-4" /></Button>
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
