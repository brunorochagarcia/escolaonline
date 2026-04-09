import { Prisma } from '@prisma/client'
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
    select: {
      id: true,
      alunoId: true,
      cursoId: true,
      dataInicio: true,
      aluno: { select: { nome: true } },
      curso: { select: { nome: true } },
    },
    orderBy: { dataInicio: 'desc' },
  })
}

// RN-03: aluno só pode ser matriculado uma vez no mesmo curso.
// A constraint @@unique([alunoId, cursoId]) do banco é a fonte de verdade;
// capturamos o P2002 e relançamos como erro de domínio para a action tratar.
export async function criarMatricula(alunoId: string, cursoId: string, dataInicio: Date) {
  try {
    return await prisma.matricula.create({
      data: { alunoId, cursoId, dataInicio },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new MatriculaDuplicadaError()
    }
    throw err
  }
}

export async function buscarMatriculaParaLancarNota(id: string) {
  return prisma.matricula.findUnique({
    where: { id },
    select: {
      id: true,
      alunoId: true,
      aluno: { select: { nome: true, email: true } },
      curso: { select: { nome: true } },
    },
  })
}

export async function excluirMatricula(id: string) {
  return prisma.matricula.delete({ where: { id } })
}