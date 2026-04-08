import { prisma } from '@/lib/prisma'
import { AlunoFormData } from '@/schemas/aluno'

export async function listarAlunos() {
  return prisma.aluno.findMany({
    orderBy: { nome: 'asc' },
    include: {
      _count: { select: { matriculas: true } },
    },
  })
}

export async function buscarPorNomeOuEmail(termo: string) {
  return prisma.aluno.findMany({
    where: {
      OR: [
        { nome: { contains: termo, mode: 'insensitive' } },
        { email: { contains: termo, mode: 'insensitive' } },
      ],
    },
    orderBy: { nome: 'asc' },
    include: {
      _count: { select: { matriculas: true } },
    },
  })
}

export async function buscarAlunoPorId(id: string) {
  return prisma.aluno.findUnique({
    where: { id },
    include: {
      matriculas: {
        include: {
          curso: true,
          notas: true,
        },
      },
    },
  })
}

export async function criarAluno(data: AlunoFormData) {
  return prisma.aluno.create({
    data: {
      nome: data.nome,
      email: data.email,
      dataNascimento: data.dataNascimento,
      fotoUrl: data.fotoUrl || null,
      fotoPublicId: data.fotoPublicId || null,
    },
  })
}

export async function buscarAlunoParaEdicao(id: string) {
  return prisma.aluno.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      dataNascimento: true,
      fotoUrl: true,
      fotoPublicId: true,
    },
  })
}

export async function editarAluno(id: string, data: AlunoFormData) {
  return prisma.aluno.update({
    where: { id },
    data: {
      nome: data.nome,
      email: data.email,
      dataNascimento: data.dataNascimento,
      fotoUrl: data.fotoUrl || null,
      fotoPublicId: data.fotoPublicId || null,
    },
  })
}
