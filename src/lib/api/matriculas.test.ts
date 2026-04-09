import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Prisma } from '@prisma/client'

// Moca o módulo do Prisma antes de importar o código que o usa
vi.mock('@/lib/prisma', () => ({
  prisma: {
    matricula: {
      create: vi.fn(),
    },
  },
}))

import { criarMatricula, MatriculaDuplicadaError } from './matriculas'
import { prisma } from '@/lib/prisma'

const mockCreate = vi.mocked(prisma.matricula.create)

// ─── RN-03: matrícula única por aluno/curso ──────────────────────────────────

describe('criarMatricula (RN-03)', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it('cria a matrícula quando não existe duplicata', async () => {
    const matriculaEsperada = {
      id: 'mat-1',
      alunoId: 'aluno-1',
      cursoId: 'curso-1',
      dataInicio: new Date(),
    }
    mockCreate.mockResolvedValue(matriculaEsperada)

    const resultado = await criarMatricula('aluno-1', 'curso-1', new Date())

    expect(resultado).toEqual(matriculaEsperada)
    expect(mockCreate).toHaveBeenCalledOnce()
  })

  it('lança MatriculaDuplicadaError quando o banco retorna P2002', async () => {
    const erroDuplicata = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '5.0.0', meta: {} },
    )
    mockCreate.mockRejectedValue(erroDuplicata)

    await expect(criarMatricula('aluno-1', 'curso-1', new Date())).rejects.toThrow(
      MatriculaDuplicadaError,
    )
  })

  it('MatriculaDuplicadaError carrega a mensagem correta', async () => {
    const erroDuplicata = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '5.0.0', meta: {} },
    )
    mockCreate.mockRejectedValue(erroDuplicata)

    await expect(criarMatricula('aluno-1', 'curso-1', new Date())).rejects.toThrow(
      'Aluno já matriculado neste curso.',
    )
  })

  it('repassa outros erros do banco sem transformar', async () => {
    const erroGenerico = new Error('Conexão perdida')
    mockCreate.mockRejectedValue(erroGenerico)

    await expect(criarMatricula('aluno-1', 'curso-1', new Date())).rejects.toThrow(
      'Conexão perdida',
    )
    await expect(criarMatricula('aluno-1', 'curso-1', new Date())).rejects.not.toThrow(
      MatriculaDuplicadaError,
    )
  })
})