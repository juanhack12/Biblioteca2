"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Wand2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { aiAssistedBookEntry, type AiAssistedBookEntryOutput } from '@/ai/flows/ai-assisted-book-entry';
import { aiBookEntrySchema } from '@/lib/schemas';

type AiBookEntryFormValues = z.infer<typeof aiBookEntrySchema>;

export default function AiBookEntryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiAssistedBookEntryOutput | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<AiBookEntryFormValues>({
    resolver: zodResolver(aiBookEntrySchema),
    defaultValues: {
      partialBookInfo: '',
    },
  });

  const onSubmit = async (data: AiBookEntryFormValues) => {
    setIsLoading(true);
    setAiResult(null);
    try {
      const result = await aiAssistedBookEntry({ partialBookInfo: data.partialBookInfo });
      setAiResult(result);
      toast({ title: "Sugerencias generadas", description: "La IA ha completado los detalles del libro." });
    } catch (error) {
      console.error("Error calling AI flow:", error);
      toast({ title: "Error de IA", description: "No se pudieron generar las sugerencias.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSuggestions = () => {
    if (aiResult) {
      const queryParams = new URLSearchParams();
      queryParams.append('title', aiResult.title);
      if (aiResult.publicationDate) {
         // Assuming publicationDate might be a full date, extract year.
         // Or if it's just a year string, use it directly.
        const yearMatch = aiResult.publicationDate.match(/\d{4}/);
        if (yearMatch) {
          queryParams.append('year', yearMatch[0]);
        }
      }
      // Note: author, isbn, summary are not directly part of LibrosModel creation via the simple form.
      // They can be passed if the LibrosForm is extended or used for display.
      // For now, we only pass title and year.
      router.push(`/libros?${queryParams.toString()}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Wand2 className="mr-2 h-7 w-7 text-primary" />
            Entrada de Libros Asistida por IA
          </CardTitle>
          <CardDescription>
            Proporciona información parcial sobre un libro (título, tema) y la IA intentará completar los detalles.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="partialBookInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="partialBookInfo" className="text-lg">Información Parcial del Libro</FormLabel>
                    <FormControl>
                      <Textarea
                        id="partialBookInfo"
                        placeholder="Ej: 'novela sobre viajes en el tiempo' o 'El Principito'"
                        rows={3}
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Obtener Sugerencias
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {aiResult && (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-xl">Sugerencias de la IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-semibold">Título:</Label>
              <p className="text-muted-foreground p-2 border rounded-md bg-muted/50">{aiResult.title}</p>
            </div>
            <div>
              <Label className="font-semibold">Autor:</Label>
              <p className="text-muted-foreground p-2 border rounded-md bg-muted/50">{aiResult.author}</p>
            </div>
            <div>
              <Label className="font-semibold">ISBN:</Label>
              <p className="text-muted-foreground p-2 border rounded-md bg-muted/50">{aiResult.isbn}</p>
            </div>
            <div>
              <Label className="font-semibold">Fecha de Publicación:</Label>
              <p className="text-muted-foreground p-2 border rounded-md bg-muted/50">{aiResult.publicationDate}</p>
            </div>
            <div>
              <Label className="font-semibold">Resumen:</Label>
              <p className="text-muted-foreground p-2 border rounded-md bg-muted/50 whitespace-pre-wrap">{aiResult.summary}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUseSuggestions} className="w-full text-md py-5">
              Usar estas sugerencias para crear un libro
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
