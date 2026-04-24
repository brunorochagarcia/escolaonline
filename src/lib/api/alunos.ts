import { prisma } from '@/lib/prisma'
import { AlunoFormData } from '@/schemas/aluno'
import { calcularMedia, calcularMediaGeral, calcularSituacao } from '@/lib/utils/notas'

const alunoListSelect = {
  id: true,
  nome: true,
  email: true,
  dataNascimento: true,
  fotoUrl: true,
  _count: { select: { matriculas: true } },
} as const

export async function listarAlunos() {
  return prisma.aluno.findMany({
    select: alunoListSelect,
    orderBy: { nome: 'asc' },
  })
}

export async function listarAlunosParaSelect() {
  return prisma.aluno.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' },
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
    select: alunoListSelect,
    orderBy: { nome: 'asc' },
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

// RN-04: apenas alunos com ao menos uma nota lançada
export async function listarAlunosParaRanking() {
  return prisma.aluno.findMany({
    where: {
      matriculas: {
        some: {
          notas: { some: {} },
        },
      },
    },
    select: {
      id: true,
      nome: true,
      fotoUrl: true,
      matriculas: {
        select: {
          notas: { select: { valor: true } },
        },
      },
    },
  })
}

export async function buscarAlunoParaBoletim(id: string) {
  return prisma.aluno.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      dataNascimento: true,
      matriculas: {
        select: {
          id: true,
          dataInicio: true,
          curso: { select: { nome: true, instrutorId: true } },
          notas: {
            select: { id: true, descricao: true, valor: true, data: true },
            orderBy: { data: 'asc' },
          },
        },
        orderBy: { dataInicio: 'asc' },
      },
    },
  })
}

export async function buscarSituacaoPorCurso() {
  const cursos = await prisma.curso.findMany({
    where: { status: 'ATIVO' },
    select: {
      id: true,
      nome: true,
      matriculas: {
        select: { notas: { select: { valor: true } } },
      },
    },
    orderBy: { nome: 'asc' },
  })

  return cursos.map(curso => {
    let aprovados = 0, emAndamento = 0, reprovados = 0
    for (const matricula of curso.matriculas) {
      const media = calcularMedia(matricula.notas.map(n => Number(n.valor)))
      const situacao = calcularSituacao(media)
      if (situacao === 'Aprovado') aprovados++
      else if (situacao === 'Reprovado') reprovados++
      else emAndamento++
    }
    return { id: curso.id, nome: curso.nome, total: curso.matriculas.length, aprovados, emAndamento, reprovados }
  })
}

export async function buscarSituacaoDosAlunos() {
  const alunos = await prisma.aluno.findMany({
    select: {
      matriculas: {
        select: { notas: { select: { valor: true } } },
      },
    },
  })

  let aprovados = 0, emAndamento = 0, reprovados = 0

  for (const aluno of alunos) {
    const media = calcularMediaGeral(
      aluno.matriculas.map(m => ({
        notas: m.notas.map(n => ({ valor: Number(n.valor) })),
      }))
    )
    const situacao = calcularSituacao(media)
    if (situacao === 'Aprovado') aprovados++
    else if (situacao === 'Reprovado') reprovados++
    else emAndamento++
  }

  return { aprovados, emAndamento, reprovados, total: alunos.length }
}

export async function buscarAlunoIdPorEmail(email: string) {
  return prisma.aluno.findUnique({
    where: { email },
    select: { id: true },
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
