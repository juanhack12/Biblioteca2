
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { BookMarked, Facebook, Twitter, Instagram, MapPin, Clock } from 'lucide-react';

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
        <div className="relative flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 md:px-6 lg:px-8">
            {children}
          </main>

          <footer className="bg-background border-t border-border/40 py-10 text-muted-foreground">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 px-4 md:px-6">
              
              {/* Col 1: Branding & Copyright */}
              <div className="space-y-3 text-sm">
                <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/90 transition-colors mb-1">
                  <BookMarked className="h-6 w-6" />
                  <span>BiblioTech</span>
                </Link>
                <p>
                  &copy; {new Date().getFullYear()} BiblioTech. Todos los derechos reservados.
                </p>
              </div>

              {/* Col 2: Contacto & Ubicación */}
              <div className="space-y-5 text-sm">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Contacto</h3>
                  <div className="space-y-1.5">
                    <p>
                      <a href="mailto:info@bibliotech.com" className="hover:text-primary hover:underline transition-colors">
                        info@bibliotech.com
                      </a>
                    </p>
                    <p>Teléfono: +57 312 345 6789</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Ubicación</h3>
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary" />
                    <span>Autopista Chía - Cajicá, Sector "El Cuarenta"</span>
                  </p>
                </div>
              </div>

              {/* Col 3: Horarios & Enlaces Rápidos */}
              <div className="space-y-5 text-sm">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Horarios</h3>
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary" />
                    <span>
                      Lunes a Viernes: 8am - 6pm<br/>
                      Sábados: 10am - 4pm<br/>
                      Domingos: Cerrado
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Enlaces Rápidos</h3>
                  <ul className="space-y-1.5">
                    <li><Link href="/libros" className="hover:text-primary hover:underline transition-colors">Catálogo en Línea</Link></li>
                    <li><Link href="/prestamos" className="hover:text-primary hover:underline transition-colors">Mis Préstamos</Link></li>
                    <li><Link href="#" className="hover:text-primary hover:underline transition-colors">Eventos</Link></li>
                    <li><Link href="#" className="hover:text-primary hover:underline transition-colors">Ayuda / FAQ</Link></li>
                  </ul>
                </div>
              </div>

              {/* Col 4: Redes Sociales & Legal */}
              <div className="space-y-5 text-sm">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Síguenos</h3>
                  <div className="flex items-center gap-x-4">
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Facebook de BiblioTech"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Twitter de BiblioTech"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Instagram de BiblioTech"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Legal</h3>
                  <ul className="space-y-1.5">
                    <li><Link href="#" className="hover:text-primary hover:underline transition-colors">Política de Privacidad</Link></li>
                    <li><Link href="#" className="hover:text-primary hover:underline transition-colors">Términos de Servicio</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
