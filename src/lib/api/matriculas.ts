import { prisma } from '@/lib/prisma'

export class MatriculaDuplicadaError extends Error {
  constructor() {
    super('Aluno já matriculado neste curso.')
    this.name = 'MatriculaDuplicadaError'
  }
}

export async function listarMatriculas(alunoId?: string, cursoId?: string) {
  return prisma.matricula.findMany({
    where: {
      ...(alunoId ? { alunoId } : {}),
      ...(cursoId ? { cursoId } : {}),
    },
    include: {
      aluno: true,
      curso: true,
    },
    orderBy: { dataInicio: 'desc' },
  })
}

export async function criarMatricula(alunoId: string, cursoId: string) {
  // RN-03: aluno só pode ser matriculado uma vez no mesmo curso
  const existente = await prisma.matricula.findUnique({
    where: { alunoId_cursoId: { alunoId, cursoId } },
  })

  if (existente) throw new MatriculaDuplicadaError()

  return prisma.matricula.create({
    data: { alunoId, cursoId },
    include: { aluno: true, curso: true },
  })
}

export async function excluirMatricula(id: string) {
  return prisma.matricula.delete({ where: { id } })
}
