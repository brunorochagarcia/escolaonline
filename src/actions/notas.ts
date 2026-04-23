'use server'

import { revalidatePath } from 'next/cache'
import { notaSchema, NotaFormData } from '@/schemas/nota'
import {
  lancarNota as lancarNotaDAL,
  excluirNota as excluirNotaDAL,
  buscarNotaParaExclusao,
} from '@/lib/api/notas'
import { buscarMatriculaParaLancarNota } from '@/lib/api/matriculas'
import { requireRole } from '@/lib/auth-guard'
import { enviarAlertaNota } from '@/lib/email'

export type NotaActionResult =
  | { success: true }
  | { error: Partial<Record<keyof NotaFormData | '_form', string[]>> }

export async function lancarNota(
  matriculaId: string,
  alunoId: string,
  formData: unknown,
): Promise<NotaActionResult> {
  const session = await requireRole('ADMIN', 'PROFESSOR')

  const parsed = notaSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const matricula = await buscarMatriculaParaLancarNota(matriculaId)
  if (!matricula) {
    return { error: { _form: ['Matrícula não encontrada.'] } }
  }
  if (session.user.role === 'PROFESSOR' && matricula.curso.instrutorId !== session.user.id) {
    return { error: { _form: ['Não autorizado.'] } }
  }

  let notaCriada: Awaited<ReturnType<typeof lancarNotaDAL>>
  try {
    notaCriada = await lancarNotaDAL(matriculaId, parsed.data)
  } catch {
    return { error: { _form: ['Erro ao salvar nota. Tente novamente.'] } }
  }

  revalidatePath(`/alunos/${alunoId}`)

  // Alerta por e-mail — falha silenciosa para não bloquear o fluxo
  enviarAlertaNota({
    nomeAluno: matricula.aluno.nome,
    emailAluno: matricula.aluno.email,
    nomeCurso: matricula.curso.nome,
    descricaoNota: notaCriada.descricao,
    valorNota: Number(notaCriada.valor),
    dataNota: notaCriada.data,
  }).catch(() => {
    // Email não crítico — falha registrada mas não exposta ao usuário
  })

  return { success: true }
}

export async function excluirNota(id: string, alunoId: string) {
  const session = await requireRole('ADMIN', 'PROFESSOR')

  if (session.user.role === 'PROFESSOR') {
    const nota = await buscarNotaParaExclusao(id)
    if (!nota || nota.matricula.curso.instrutorId !== session.user.id) {
      throw new Error('Não autorizado')
    }
  }

  await excluirNotaDAL(id)
  revalidatePath(`/alunos/${alunoId}`)
}
