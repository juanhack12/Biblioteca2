import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Library, ArrowRight, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl md:text-7xl">
          Bienvenido a BiblioTech
        </h1>
        <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
          Su solución moderna para la gestión integral de bibliotecas. Explore, administre y descubra con facilidad.
        </p>
      </div>

      <div className="mb-12 w-full max-w-4xl">
        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <Image
              src="https://placehold.co/1200x500.png"
              alt="Biblioteca moderna"
              data-ai-hint="library study"
              width={1200}
              height={500}
              className="w-full h-auto object-cover"
              priority
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
        <FeatureCard
          icon={<BookOpen className="h-10 w-10 text-accent" />}
          title="Gestión de Libros"
          description="Administre su catálogo de libros, ejemplares y editoriales de forma eficiente."
          link="/libros"
          linkLabel="Explorar Libros"
        />
        <FeatureCard
          icon={<Users className="h-10 w-10 text-accent" />}
          title="Gestión de Usuarios"
          description="Maneje autores, lectores y bibliotecarios con perfiles detallados."
          link="/personas"
          linkLabel="Ver Personas"
        />
        <FeatureCard
          icon={<Wand2 className="h-10 w-10 text-accent" />}
          title="Entrada Asistida por IA"
          description="Acelere el ingreso de libros con sugerencias inteligentes de nuestra IA."
          link="/ai-book-entry"
          linkLabel="Probar IA"
        />
      </div>

      <div className="mt-16 text-center">
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/libros">
            Comenzar a Explorar <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkLabel: string;
}

function FeatureCard({ icon, title, description, link, linkLabel }: FeatureCardProps) {
  return (
    <Card className="hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="items-center text-center">
        <div className="p-3 rounded-full bg-accent/10 mb-3">
          {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-4">{description}</p>
        <Button variant="outline" asChild>
          <Link href={link}>
            {linkLabel} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
