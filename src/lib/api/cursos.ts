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
    select: {
      id: true,
      nome: true,
      descricao: true,
      cargaHoraria: true,
      instrutor: true,
      instrutorId: true,
      status: true,
      matriculas: {
        select: {
          id: true,
          alunoId: true,
          dataInicio: true,
          aluno: { select: { nome: true } },
          notas: { select: { valor: true } },
        },
      },
    },
  })
}

export async function listarCursosParaFiltro(status?: Status) {
  return prisma.curso.findMany({
    where: status ? { status } : undefined,
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' },
  })
}

export async function criarCurso(data: CursoFormData) {
  return prisma.curso.create({ data })
}

export async function buscarCursoParaEdicao(id: string) {
  return prisma.curso.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      descricao: true,
      cargaHoraria: true,
      instrutor: true,
      status: true,
    },
  })
}

export async function editarCurso(id: string, data: CursoFormData) {
  return prisma.curso.update({ where: { id }, data })
}
