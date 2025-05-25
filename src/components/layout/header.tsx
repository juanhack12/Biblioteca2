"use client";
import Link from 'next/link';
import { BookMarked, Users, Library, Book, ArrowRightLeft, CircleDollarSign, Wand2, Menu, Combine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';

const navLinks = [
  { href: "/autores", label: "Autores", icon: Users },
  { href: "/bibliotecarios", label: "Bibliotecarios", icon: Users },
  { href: "/editoriales", label: "Editoriales", icon: Library },
  { href: "/ejemplares", label: "Ejemplares", icon: Book },
  { href: "/lectores", label: "Lectores", icon: Users },
  { href: "/libro-autores", label: "Libro-Autores", icon: Combine },
  { href: "/libros", label: "Libros", icon: Book },
  { href: "/personas", label: "Personas", icon: Users },
  { href: "/prestamos", label: "Préstamos", icon: ArrowRightLeft },
  { href: "/tarifas", label: "Tarifas", icon: CircleDollarSign },
  { href: "/ai-book-entry", label: "AI Book Entry", icon: Wand2 },
];

export function Header() {
  const pathname = usePathname();

  const NavLinkItem = ({ href, label, icon: Icon, isSheetClose = false }: { href: string, label: string, icon: React.ElementType, isSheetClose?: boolean }) => {
    const LinkComponent = isSheetClose ? SheetClose : 'div';
    return (
      <LinkComponent asChild={isSheetClose}>
        <Link
          href={href}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary",
            pathname === href ? "bg-primary/10 text-primary" : "text-primary-foreground hover:text-primary"
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      </LinkComponent>
    );
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <BookMarked className="h-7 w-7" />
          <span>BiblioTech</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-1 md:flex">
          {navLinks.slice(0, 5).map(link => ( // Show first 5 links directly
             <Button key={link.href} variant="ghost" size="sm" asChild className={cn(pathname === link.href ? "bg-accent text-accent-foreground" : "")}>
               <Link href={link.href} className="flex items-center gap-1.5">
                 <link.icon className="h-4 w-4" /> {link.label}
               </Link>
             </Button>
          ))}
           {navLinks.length > 5 && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Más</span>
                </Button>
              </SheetTrigger>
               <SheetTrigger asChild>
                 <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                   Más...
                 </Button>
               </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-card p-4">
                <div className="mb-4 text-lg font-semibold text-card-foreground">Todas las Secciones</div>
                <div className="flex flex-col space-y-1">
                  {navLinks.map(link => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                          pathname === link.href ? "bg-muted text-primary" : "text-card-foreground"
                        )}
                      >
                        <link.icon className="h-5 w-5 text-muted-foreground" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-card p-4">
              <div className="mb-6 text-lg font-semibold text-card-foreground">Navegación</div>
              <div className="flex flex-col space-y-1">
                {navLinks.map(link => (
                   <NavLinkItem key={link.href} href={link.href} label={link.label} icon={link.icon} isSheetClose={true}/>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
