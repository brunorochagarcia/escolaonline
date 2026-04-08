import { Status } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CursoFormData } from '@/schemas/curso'

export async function listarCursos(status?: Status) {
  return prisma.curso.findMany({
    where: status ? { status } : undefined,
    orderBy: { nome: 'asc' },
    include: {
      _count: { select: { matriculas: true } },
    },
  })
}

export async function buscarCursoPorId(id: string) {
  return prisma.curso.findUnique({
    where: { id },
    include: {
      matriculas: {
        include: {
          aluno: true,
          notas: true,
        },
      },
    },
  })
}

export async function criarCurso(data: CursoFormData) {
  return prisma.curso.create({ data })
}

export async function editarCurso(id: string, data: CursoFormData) {
  return prisma.curso.update({ where: { id }, data })
}
