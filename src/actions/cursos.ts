'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { cursoSchema } from '@/schemas/curso'
import { criarCurso, editarCurso } from '@/lib/api/cursos'
import { requireAuth } from '@/lib/auth-guard'

export async function criarCursoAction(formData: unknown) {
  await requireAuth()

  const parsed = cursoSchema.safeParse(formData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await criarCurso(parsed.data)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { errors: { nome: ['Já existe um curso com este nome.'] } }
    }
    return { errors: { _form: ['Erro inesperado. Tente novamente.'] } }
  }

  revalidatePath('/cursos')
  redirect('/cursos')
}

export async function editarCursoAction(id: string, formData: unknown) {
  await requireAuth()

  const parsed = cursoSchema.safeParse(formData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await editarCurso(id, parsed.data)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { errors: { nome: ['Já existe um curso com este nome.'] } }
    }
    return { errors: { _form: ['Erro inesperado. Tente novamente.'] } }
  }

  revalidatePath('/cursos')
  revalidatePath(`/cursos/${id}`)
  redirect('/cursos')
}