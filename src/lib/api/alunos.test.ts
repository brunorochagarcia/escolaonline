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
    mockFindMany.mockResolvedValue([] as never)

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
    mockFindMany.mockResolvedValue(alunosComNota as never)

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

// ─── Casos de borda: curso sem alunos matriculados no ranking ────────────────

describe('curso sem alunos — impacto no ranking (RN-04)', () => {
  beforeEach(() => {
    mockFindMany.mockReset()
  })

  it('aluno matriculado apenas em cursos sem notas não é retornado pelo banco', async () => {
    // O where garante que o banco só devolve alunos com ao menos uma nota;
    // um curso sem notas lançadas não satisfaz a condição — mock simula esse comportamento
    mockFindMany.mockResolvedValue([] as never)

    const resultado = await listarAlunosParaRanking()

    expect(resultado).toHaveLength(0)
  })

  it('aluno com nota em um curso e matrícula sem nota em outro aparece no ranking', async () => {
    // Apenas o curso com nota satisfaz o where; o outro curso é ignorado pelo banco
    const aluno = {
      id: 'a1',
      nome: 'Carol',
      fotoUrl: null,
      matriculas: [
        { notas: [{ valor: 9 }] }, // curso com nota
        { notas: [] },              // curso sem nota (não retornado pelo where, mas pode vir no include)
      ],
    }
    mockFindMany.mockResolvedValue([aluno] as never)

    const resultado = await listarAlunosParaRanking()

    expect(resultado).toHaveLength(1)
    // Média geral considera apenas a nota existente
    expect(
      calcularMediaGeral(
        resultado[0].matriculas.map((m) => ({ notas: m.notas.map((n) => ({ valor: Number(n.valor) })) })),
      ),
    ).toBe(9)
  })
})