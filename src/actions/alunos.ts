'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { alunoSchema, AlunoFormData } from '@/schemas/aluno'
import { criarAluno, editarAluno } from '@/lib/api/alunos'
import { requireAuth } from '@/lib/auth-guard'

export type AlunoActionResult = {
  errors?: Partial<Record<keyof AlunoFormData | '_form', string[]>>
}

export async function criarAlunoAction(formData: unknown): Promise<AlunoActionResult | void> {
  await requireAuth()

  const parsed = alunoSchema.safeParse(formData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await criarAluno(parsed.data)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { errors: { email: ['E-mail já cadastrado.'] } }
    }
    return { errors: { _form: ['Erro inesperado. Tente novamente.'] } }
  }

  revalidatePath('/alunos')
  redirect('/alunos')
}

export async function editarAlunoAction(
  id: string,
  formData: unknown,
): Promise<AlunoActionResult | void> {
  await requireAuth()

  const parsed = alunoSchema.safeParse(formData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await editarAluno(id, parsed.data)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { errors: { email: ['E-mail já cadastrado.'] } }
    }
    return { errors: { _form: ['Erro inesperado. Tente novamente.'] } }
  }

  revalidatePath('/alunos')
  revalidatePath(`/alunos/${id}`)
  redirect('/alunos')
}