import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findMany: vi.fn(),
    },
  },
}))

import { listarAlunosParaRanking } from './alunos'
import { prisma } from '@/lib/prisma'
import { calcularMediaGeral } from '@/lib/utils/notas'

const mockFindMany = vi.mocked(prisma.aluno.findMany)

// ─── RN-04: ranking exclui alunos sem notas ──────────────────────────────────

describe('listarAlunosParaRanking (RN-04) — filtro na query', () => {
  beforeEach(() => {
    mockFindMany.mockReset()
  })

  it('chama o Prisma com where que exige ao menos uma nota', async () => {
    mockFindMany.mockResolvedValue([])

    await listarAlunosParaRanking()

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          matriculas: {
            some: {
              notas: { some: {} },
            },
          },
        },
      }),
    )
  })

  it('retorna apenas os alunos que o banco entregou (sem filtro extra)', async () => {
    const alunosComNota = [
      { id: 'a1', nome: 'Ana', fotoUrl: null, matriculas: [{ notas: [{ valor: 8 }] }] },
      { id: 'a2', nome: 'Bruno', fotoUrl: null, matriculas: [{ notas: [{ valor: 6 }] }] },
    ]
    mockFindMany.mockResolvedValue(alunosComNota)

    const resultado = await listarAlunosParaRanking()

    expect(resultado).toHaveLength(2)
  })
})

describe('calcularMediaGeral — segunda linha de defesa do RN-04', () => {
  it('retorna null para aluno sem nenhuma matrícula', () => {
    expect(calcularMediaGeral([])).toBeNull()
  })

  it('retorna null para aluno com matrículas mas sem nenhuma nota', () => {
    expect(calcularMediaGeral([{ notas: [] }, { notas: [] }])).toBeNull()
  })

  it('retorna a média correta quando há notas', () => {
    expect(calcularMediaGeral([{ notas: [{ valor: 8 }, { valor: 6 }] }])).toBe(7)
  })
})