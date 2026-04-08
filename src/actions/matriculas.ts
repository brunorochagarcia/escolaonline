'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { criarMatricula, excluirMatricula, MatriculaDuplicadaError } from '@/lib/api/matriculas'

const matriculaSchema = z.object({
  alunoId: z.string().min(1, 'Selecione um aluno'),
  cursoId: z.string().min(1, 'Selecione um curso'),
  dataInicio: z.coerce.date({ errorMap: () => ({ message: 'Data inválida' }) }),
})

export type MatriculaActionState = {
  errors?: { alunoId?: string[]; cursoId?: string[]; dataInicio?: string[]; _form?: string[] }
}

export async function criarMatriculaAction(
  _prev: MatriculaActionState,
  formData: FormData,
): Promise<MatriculaActionState> {
  const parsed = matriculaSchema.safeParse({
    alunoId: formData.get('alunoId'),
    cursoId: formData.get('cursoId'),
    dataInicio: formData.get('dataInicio'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await criarMatricula(parsed.data.alunoId, parsed.data.cursoId)
  } catch (err) {
    if (err instanceof MatriculaDuplicadaError) {
      return { errors: { _form: [err.message] } }
    }
    return { errors: { _form: ['Erro inesperado. Tente novamente.'] } }
  }

  revalidatePath('/matriculas')
  redirect('/matriculas')
}

export async function excluirMatriculaAction(id: string) {
  await excluirMatricula(id)
  revalidatePath('/matriculas')
}
