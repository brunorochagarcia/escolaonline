'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import {
  criarMatricula as criarMatriculaDAL,
  excluirMatricula as excluirMatriculaDAL,
  MatriculaDuplicadaError,
} from '@/lib/api/matriculas'
import { requireAuth } from '@/lib/auth-guard'

const matriculaSchema = z.object({
  alunoId: z.string().cuid('Selecione um aluno'),
  cursoId: z.string().cuid('Selecione um curso'),
  dataInicio: z.coerce.date({ errorMap: () => ({ message: 'Data inválida' }) }),
})

export type MatriculaActionResult =
  | { success: true }
  | { error: { alunoId?: string[]; cursoId?: string[]; dataInicio?: string[]; _form?: string[] } }

export async function criarMatricula(formData: unknown): Promise<MatriculaActionResult> {
  await requireAuth()

  const parsed = matriculaSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    await criarMatriculaDAL(parsed.data.alunoId, parsed.data.cursoId, parsed.data.dataInicio)
  } catch (err) {
    if (err instanceof MatriculaDuplicadaError) {
      return { error: { _form: [err.message] } }
    }
    return { error: { _form: ['Erro inesperado. Tente novamente.'] } }
  }

  revalidatePath('/matriculas')
  return { success: true }
}

export async function excluirMatricula(id: string) {
  await requireAuth()
  await excluirMatriculaDAL(id)
  revalidatePath('/matriculas')
}
