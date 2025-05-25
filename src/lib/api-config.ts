// src/lib/api-config.ts
import type { DateOnlyString } from '@/lib/types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7245'; // Use environment variable

// Función auxiliar para formatear DateOnlyString para input[type="date"] o API calls
// Ensures that if a date string is provided, it's used, otherwise returns undefined.
// Handles null or empty strings by converting them to undefined, which is useful for optional date fields in API calls.
export const formatDateForApi = (dateString?: DateOnlyString | null): string | undefined => {
  if (!dateString || dateString.trim() === '') {
    return undefined;
  }
  // Assuming dateString is already in 'YYYY-MM-DD' format if provided.
  // Additional validation could be added here if needed.
  return dateString;
};
