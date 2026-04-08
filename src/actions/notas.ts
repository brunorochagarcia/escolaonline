'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { notaSchema } from '@/schemas/nota'
import { lancarNota, excluirNota } from '@/lib/api/notas'
import { requireAuth } from '@/lib/auth-guard'

export type NotaActionState = {
  errors?: { descricao?: string[]; valor?: string[]; data?: string[]; _form?: string[] }
}

export async function lancarNotaAction(
  matriculaId: string,
  alunoId: string,
  _prev: NotaActionState,
  formData: FormData,
): Promise<NotaActionState> {
  await requireAuth()

  const parsed = notaSchema.safeParse({
    descricao: formData.get('descricao'),
    valor: formData.get('valor'),
    data: formData.get('data'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await lancarNota(matriculaId, parsed.data)
  } catch {
    return { errors: { _form: ['Erro ao salvar nota. Tente novamente.'] } }
  }

  revalidatePath(`/alunos/${alunoId}`)
  redirect(`/alunos/${alunoId}`)
}

export async function excluirNotaAction(id: string, alunoId: string) {
  await requireAuth()
  await excluirNota(id)
  revalidatePath(`/alunos/${alunoId}`)
}