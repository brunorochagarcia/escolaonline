'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { alunoSchema, AlunoFormData } from '@/schemas/aluno'
import { criarAluno as criarAlunoDAL, editarAluno as editarAlunoDAL } from '@/lib/api/alunos'
import { requireAuth } from '@/lib/auth-guard'
import { uploadImagem, deletarImagemCloudinary } from '@/lib/cloudinary'

export type AlunoActionResult =
  | { success: true }
  | { error: Partial<Record<keyof AlunoFormData | '_form', string[]>> }

export async function criarAluno(
  formData: unknown,
  fotoBase64?: string,
): Promise<AlunoActionResult> {
  await requireAuth()

  const parsed = alunoSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  let fotoUrl: string | undefined = parsed.data.fotoUrl || undefined
  let fotoPublicId: string | undefined = parsed.data.fotoPublicId || undefined

  if (fotoBase64) {
    try {
      const uploaded = await uploadImagem(fotoBase64)
      fotoUrl = uploaded.url
      fotoPublicId = uploaded.publicId
    } catch {
      return { error: { _form: ['Erro ao fazer upload da foto. Tente novamente.'] } }
    }
  }

  try {
    await criarAlunoDAL({ ...parsed.data, fotoUrl, fotoPublicId })
  } catch (err) {
    // Rollback: se o DB falhar após o upload, deletar imagem para evitar órfão
    if (fotoPublicId && fotoBase64) {
      await deletarImagemCloudinary(fotoPublicId).catch(() => {})
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: { email: ['E-mail já cadastrado.'] } }
    }
    return { error: { _form: ['Erro inesperado. Tente novamente.'] } }
  }

  revalidatePath('/alunos')
  return { success: true }
}

export async function editarAluno(
  id: string,
  formData: unknown,
  fotoBase64?: string,
): Promise<AlunoActionResult> {
  await requireAuth()

  const parsed = alunoSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  let fotoUrl: string | undefined = parsed.data.fotoUrl || undefined
  let fotoPublicId: string | undefined = parsed.data.fotoPublicId || undefined

  if (fotoBase64) {
    try {
      const uploaded = await uploadImagem(fotoBase64)
      fotoUrl = uploaded.url
      fotoPublicId = uploaded.publicId
    } catch {
      return { error: { _form: ['Erro ao fazer upload da foto. Tente novamente.'] } }
    }
  }

  try {
    await editarAlunoDAL(id, { ...parsed.data, fotoUrl, fotoPublicId })
  } catch (err) {
    if (fotoPublicId && fotoBase64) {
      await deletarImagemCloudinary(fotoPublicId).catch(() => {})
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: { email: ['E-mail já cadastrado.'] } }
    }
    return { error: { _form: ['Erro inesperado. Tente novamente.'] } }
  }

  revalidatePath('/alunos')
  revalidatePath(`/alunos/${id}`)
  return { success: true }
}
