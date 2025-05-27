
import { Suspense } from 'react';
import LibrosClientContent from './libros-client-content';
import { Loader2 } from 'lucide-react';

export default function LibrosPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Cargando libros...</p>
      </div>
    }>
      <LibrosClientContent />
    </Suspense>
  );
}
