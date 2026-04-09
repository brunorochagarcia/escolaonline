'use server'

import { revalidatePath } from 'next/cache'
import { notaSchema, NotaFormData } from '@/schemas/nota'
import { lancarNota as lancarNotaDAL, excluirNota as excluirNotaDAL } from '@/lib/api/notas'
import { buscarMatriculaParaLancarNota } from '@/lib/api/matriculas'
import { requireAuth } from '@/lib/auth-guard'
import { enviarAlertaNota } from '@/lib/email'

export type NotaActionResult =
  | { success: true }
  | { error: Partial<Record<keyof NotaFormData | '_form', string[]>> }

export async function lancarNota(
  matriculaId: string,
  alunoId: string,
  formData: unknown,
): Promise<NotaActionResult> {
  await requireAuth()

  const parsed = notaSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  let notaCriada: Awaited<ReturnType<typeof lancarNotaDAL>>
  try {
    notaCriada = await lancarNotaDAL(matriculaId, parsed.data)
  } catch {
    return { error: { _form: ['Erro ao salvar nota. Tente novamente.'] } }
  }

  revalidatePath(`/alunos/${alunoId}`)

  // Alerta por e-mail — falha silenciosa para não bloquear o fluxo
  buscarMatriculaParaLancarNota(matriculaId)
    .then((matricula) => {
      if (!matricula) return
      return enviarAlertaNota({
        nomeAluno: matricula.aluno.nome,
        emailAluno: matricula.aluno.email,
        nomeCurso: matricula.curso.nome,
        descricaoNota: notaCriada.descricao,
        valorNota: notaCriada.valor,
        dataNota: notaCriada.data,
      })
    })
    .catch(() => {
      // Email não crítico — falha registrada mas não exposta ao usuário
    })

  return { success: true }
}

export async function excluirNota(id: string, alunoId: string) {
  await requireAuth()
  await excluirNotaDAL(id)
  revalidatePath(`/alunos/${alunoId}`)
}
