
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BookOpen, Users, ArrowRight, ArrowRightLeft, Library, UserCheck, BookCopy, Loader2, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Import services
import { getAllLibros } from '@/lib/services/libros';
import { getAllLectores } from '@/lib/services/lectores';
import { getAllAutores } from '@/lib/services/autores';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkLabel: string;
}

function FeatureCard({ icon, title, description, link, linkLabel }: FeatureCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="items-center text-center">
        <div className="p-4 rounded-full bg-primary/10 mb-4 inline-block">
          {icon}
        </div>
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center flex-grow">
        <p className="text-muted-foreground mb-6">{description}</p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground border-accent hover:border-accent/90">
          <Link href={link}>
            {linkLabel} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading: boolean;
  description?: string;
}

function StatCard({ title, value, icon, loading, description }: StatCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <div className="text-3xl font-bold text-primary">{value}</div>
        )}
        {description && !loading && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

const recentBooksPlaceholder = [
  { id: 1, title: "El Jardín de las Mariposas", author: "Dot Hutchison", imageUrl: "https://placehold.co/300x450/3F51B5/FFFFFF.png", dataAiHint: "thriller book" },
  { id: 2, title: "Fuego y Sangre", author: "George R.R. Martin", imageUrl: "https://placehold.co/300x450/FFAB40/000000.png", dataAiHint: "fantasy saga" },
  { id: 3, title: "La Sombra del Viento", author: "Carlos Ruiz Zafón", imageUrl: "https://placehold.co/300x450/4A90E2/FFFFFF.png", dataAiHint: "mystery novel" },
  { id: 4, title: "Educated", author: "Tara Westover", imageUrl: "https://placehold.co/300x450/7ED321/000000.png", dataAiHint: "memoir book" },
];

export default function HomePage() {
  const [totalLibros, setTotalLibros] = useState<number | string>("...");
  const [totalLectores, setTotalLectores] = useState<number | string>("...");
  const [totalAutores, setTotalAutores] = useState<number | string>("...");
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Fetch all data in parallel
        const [librosResult, lectoresResult, autoresResult] = await Promise.allSettled([
          getAllLibros(),
          getAllLectores(),
          getAllAutores()
        ]);

        // Process results
        if (librosResult.status === 'fulfilled') {
          setTotalLibros(librosResult.value.length);
        } else {
          console.error("Error fetching libros for stats:", librosResult.reason);
          setTotalLibros("N/A");
        }

        if (lectoresResult.status === 'fulfilled') {
          setTotalLectores(lectoresResult.value.length);
        } else {
          console.error("Error fetching lectores for stats:", lectoresResult.reason);
          setTotalLectores("N/A");
        }

        if (autoresResult.status === 'fulfilled') {
          setTotalAutores(autoresResult.value.length);
        } else {
          console.error("Error fetching autores for stats:", autoresResult.reason);
          setTotalAutores("N/A");
        }

      } catch (error) {
        console.error("Error general al obtener estadísticas:", error);
        setTotalLibros("Error");
        setTotalLectores("Error");
        setTotalAutores("Error");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-16 py-8">
      <section className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl md:text-7xl mb-6">
          Bienvenido a BiblioTech
        </h1>
        <p className="max-w-3xl mx-auto text-xl text-muted-foreground mb-10">
          Su solución moderna e integral para la gestión de bibliotecas. Explore, administre y descubra con facilidad y eficiencia.
        </p>
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="overflow-hidden shadow-2xl rounded-lg">
            <CardContent className="p-0">
              <Image
                src="/images/btca.jpg"
                alt="Biblioteca moderna y acogedora"
                data-ai-hint="modern library interior"
                width={1200}
                height={500}
                className="w-full h-auto object-cover"
                priority
              />
            </CardContent>
          </Card>
        </div>
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
          <Link href="/libros">
            Comenzar a Explorar <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>

      <section className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-primary">Funcionalidades Principales</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <FeatureCard
            icon={<BookOpen className="h-12 w-12 text-accent" />}
            title="Gestión de Libros"
            description="Administre su catálogo de libros, ejemplares y editoriales de forma eficiente e intuitiva."
            link="/libros"
            linkLabel="Explorar Libros"
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-accent" />}
            title="Gestión de Usuarios"
            description="Maneje perfiles detallados de autores, lectores y personal bibliotecario con facilidad."
            link="/personas"
            linkLabel="Ver Personas"
          />
          <FeatureCard
            icon={<ArrowRightLeft className="h-12 w-12 text-accent" />}
            title="Préstamos y Devoluciones"
            description="Registre y administre el flujo de préstamos y devoluciones de libros de manera organizada."
            link="/prestamos"
            linkLabel="Gestionar Préstamos"
          />
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-primary">Estadísticas Clave</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          <StatCard
            title="Total de Libros"
            value={totalLibros}
            icon={<Library className="h-6 w-6 text-muted-foreground" />}
            loading={loadingStats}
            description="Libros únicos en el catálogo"
          />
          <StatCard
            title="Total de Lectores"
            value={totalLectores}
            icon={<UserCheck className="h-6 w-6 text-muted-foreground" />}
            loading={loadingStats}
            description="Usuarios registrados activos"
          />
          <StatCard
            title="Total de Autores"
            value={totalAutores}
            icon={<BookCopy className="h-6 w-6 text-muted-foreground" />}
            loading={loadingStats}
            description="Autores con obras en la biblioteca"
          />
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">Novedades en la Biblioteca</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {recentBooksPlaceholder.map((book) => (
            <div key={book.id} className="group relative bg-card p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="aspect-w-2 aspect-h-3 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75">
                <Image
                  src={book.imageUrl}
                  alt={`Portada de ${book.title}`}
                  width={300}
                  height={450}
                  className="h-full w-full object-cover object-center"
                  data-ai-hint={book.dataAiHint}
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-md font-semibold text-card-foreground">
                    <Link href={`/libros`}> {/* Placeholder link, ideally to book details */}
                       <span aria-hidden="true" className="absolute inset-0" />
                       {book.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button variant="secondary" size="lg" asChild>
            <Link href="/libros">
              Ver Catálogo Completo <TrendingUp className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
