'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cursoSchema } from '@/schemas/curso'
import { criarCurso, editarCurso } from '@/lib/api/cursos'

export async function criarCursoAction(formData: unknown) {
  const parsed = cursoSchema.safeParse(formData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await criarCurso(parsed.data)
  revalidatePath('/cursos')
  redirect('/cursos')
}

export async function editarCursoAction(id: string, formData: unknown) {
  const parsed = cursoSchema.safeParse(formData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await editarCurso(id, parsed.data)
  revalidatePath('/cursos')
  revalidatePath(`/cursos/${id}`)
  redirect('/cursos')
}
