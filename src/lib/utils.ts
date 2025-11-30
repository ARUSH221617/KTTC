import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges and condenses class names, resolving conflicts with Tailwind CSS.
 *
 * @param {...ClassValue[]} inputs - A list of class names or class value objects.
 * @returns {string} The merged and optimized class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
