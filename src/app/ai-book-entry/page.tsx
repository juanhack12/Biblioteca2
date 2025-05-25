
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

export default function AiBookEntryPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Wand2 className="mr-2 h-7 w-7 text-primary" />
            Entrada de Libros Asistida por IA
          </CardTitle>
          <CardDescription>
            Esta funcionalidad está actualmente en desarrollo o no disponible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            La capacidad de autocompletar detalles de libros usando IA no está activa en este momento. 
            Por favor, ingrese los libros manualmente a través de la sección de "Gestión de Libros".
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
