import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { BookMarked, Facebook, Twitter, Instagram } from 'lucide-react';

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
            <div className="container mx-auto flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
              <div className="space-y-3 text-center md:text-left">
                <Link href="/" className="inline-flex items-center gap-2 text-xl font-semibold text-primary hover:text-primary/90 transition-colors">
                  <BookMarked className="h-7 w-7" />
                  <span>BiblioTech</span>
                </Link>
                <p className="text-sm">
                  &copy; {new Date().getFullYear()} BiblioTech. Todos los derechos reservados.
                </p>
                <div className="text-sm space-y-1">
                  <p>
                    <a href="mailto:info@bibliotech.com" className="hover:text-primary hover:underline transition-colors">
                      info@bibliotech.com
                    </a>
                  </p>
                  <p>Teléfono: +123 456 7890</p>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-4">
                <p className="text-sm font-medium text-foreground">Síguenos en redes</p>
                <div className="flex items-center gap-x-5">
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Facebook de BiblioTech"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Twitter de BiblioTech"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Twitter className="h-6 w-6" />
                  </a>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Instagram de BiblioTech"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
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
