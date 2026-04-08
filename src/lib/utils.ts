import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { calcularMedia, calcularSituacao, situacaoStyle } from '@/lib/utils/notas'
export type { Situacao } from '@/lib/utils/notas'