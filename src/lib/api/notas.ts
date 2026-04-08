import { prisma } from '@/lib/prisma'
import { NotaFormData } from '@/schemas/nota'

export async function listarNotasPorMatricula(matriculaId: string) {
  return prisma.nota.findMany({
    where: { matriculaId },
    orderBy: { data: 'asc' },
  })
}

export async function lancarNota(matriculaId: string, data: NotaFormData) {
  return prisma.nota.create({
    data: {
      matriculaId,
      descricao: data.descricao,
      valor: data.valor,
      data: data.data,
    },
  })
}

export async function excluirNota(id: string) {
  return prisma.nota.delete({ where: { id } })
}
