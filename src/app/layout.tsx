import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BiblioTech - Sistema de Gestión Bibliotecario',
  description: 'Frontend para el sistema bibliotecario BiblioTech',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable, 
          geistMono.variable
        )}
      >
        <div className="relative flex min-h-dvh flex-col bg-background">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 md:px-6 lg:px-8">
            {children}
          </main>

 <footer className="bg-muted py-6 px-4 md:px-6">
 <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
 <div className="text-center md:text-left">
 <p className="text-sm text-muted-foreground">
 &copy; {new Date().getFullYear()} BiblioTech. Todos los derechos reservados.
 </p>
 <p className="text-sm text-muted-foreground">
 Contacto:{" "}
 <a href="mailto:info@bibliotech.com" className="hover:underline">
 info@bibliotech.com
 </a>{" "}
 | Teléfono: +123 456 7890
 </p>
 </div>
 <div className="flex gap-4">
 {/* Aquí puedes agregar iconos o enlaces a redes sociales */}
 <a href="#" className="text-muted-foreground hover:text-foreground">
 Facebook
 </a>
 <a href="#" className="text-muted-foreground hover:text-foreground">
 Twitter
 </a>
 <a href="#" className="text-muted-foreground hover:text-foreground">
 Instagram
 </a>
 </div>
 </div>
 </footer>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
