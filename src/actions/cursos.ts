'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { cursoSchema, CursoFormData } from '@/schemas/curso'
import { criarCurso as criarCursoDAL, editarCurso as editarCursoDAL } from '@/lib/api/cursos'
import { requireAuth } from '@/lib/auth-guard'

export type CursoActionResult =
  | { success: true }
  | { error: Partial<Record<keyof CursoFormData | '_form', string[]>> }

export async function criarCurso(formData: unknown): Promise<CursoActionResult> {
  await requireAuth()

  const parsed = cursoSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await criarCursoDAL(parsed.data)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: { nome: ['Já existe um curso com este nome.'] } }
    }
    return { error: { _form: ['Erro inesperado. Tente novamente.'] } }
  }

  revalidatePath('/cursos')
  return { success: true }
}

export async function editarCurso(id: string, formData: unknown): Promise<CursoActionResult> {
  await requireAuth()

  const parsed = cursoSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await editarCursoDAL(id, parsed.data)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: { nome: ['Já existe um curso com este nome.'] } }
    }
    return { error: { _form: ['Erro inesperado. Tente novamente.'] } }
  }

  revalidatePath('/cursos')
  revalidatePath(`/cursos/${id}`)
  return { success: true }
}
