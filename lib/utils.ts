import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Función de utilidad para combinar clases de Tailwind de manera segura
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
