import { describe, it, expect } from 'vitest'
import { calcularMedia, calcularMediaGeral, calcularSituacao } from './notas'

// ─── RN-01: média aritmética simples ────────────────────────────────────────

describe('calcularMedia (RN-01)', () => {
  it('retorna null quando não há notas', () => {
    expect(calcularMedia([])).toBeNull()
  })

  it('retorna o próprio valor com uma única nota', () => {
    expect(calcularMedia([8])).toBe(8)
  })

  it('calcula média aritmética simples corretamente', () => {
    // (6 + 8 + 10) / 3 = 8
    expect(calcularMedia([6, 8, 10])).toBe(8)
  })

  it('preserva casas decimais na média', () => {
    // (5 + 6) / 2 = 5.5
    expect(calcularMedia([5, 6])).toBe(5.5)
  })

  it('aceita nota zero sem retornar null', () => {
    expect(calcularMedia([0, 10])).toBe(5)
  })

  it('nota mínima isolada (0) retorna 0, não null', () => {
    expect(calcularMedia([0])).toBe(0)
    expect(calcularMedia([0])).not.toBeNull()
  })

  it('nota máxima isolada (10) retorna 10', () => {
    expect(calcularMedia([10])).toBe(10)
  })
})

describe('calcularMediaGeral (RN-01 — múltiplos cursos)', () => {
  it('retorna null quando não há matrículas', () => {
    expect(calcularMediaGeral([])).toBeNull()
  })

  it('retorna null quando todas as matrículas não têm notas', () => {
    expect(calcularMediaGeral([{ notas: [] }, { notas: [] }])).toBeNull()
  })

  it('ignora matrículas sem notas no cálculo', () => {
    // apenas 1 nota de valor 8 → média = 8
    expect(calcularMediaGeral([{ notas: [] }, { notas: [{ valor: 8 }] }])).toBe(8)
  })

  it('faz média flat ponderada por quantidade de notas entre cursos', () => {
    // curso A: [10, 10] — curso B: [4] → (10+10+4)/3 ≈ 8
    const matriculas = [
      { notas: [{ valor: 10 }, { valor: 10 }] },
      { notas: [{ valor: 4 }] },
    ]
    expect(calcularMediaGeral(matriculas)).toBeCloseTo(8, 5)
  })
})

// ─── RN-02: situação por média ───────────────────────────────────────────────

describe('calcularSituacao (RN-02)', () => {
  it('retorna "Em Andamento" quando média é null (sem notas)', () => {
    expect(calcularSituacao(null)).toBe('Em Andamento')
  })

  it('retorna "Aprovado" com média exatamente 7.0 (fronteira inferior)', () => {
    expect(calcularSituacao(7.0)).toBe('Aprovado')
  })

  it('retorna "Aprovado" com média acima de 7.0', () => {
    expect(calcularSituacao(8.5)).toBe('Aprovado')
  })

  it('retorna "Aprovado" com média máxima 10', () => {
    expect(calcularSituacao(10)).toBe('Aprovado')
  })

  it('retorna "Em Andamento" com média 6.9 (abaixo do aprovado)', () => {
    expect(calcularSituacao(6.9)).toBe('Em Andamento')
  })

  it('retorna "Em Andamento" com média exatamente 5.0 (fronteira inferior da faixa)', () => {
    expect(calcularSituacao(5.0)).toBe('Em Andamento')
  })

  it('retorna "Reprovado" com média 4.9 (abaixo de 5.0)', () => {
    expect(calcularSituacao(4.9)).toBe('Reprovado')
  })

  it('retorna "Reprovado" com média zero', () => {
    expect(calcularSituacao(0)).toBe('Reprovado')
  })
})

// ─── Integração: calcularMedia + calcularSituacao ────────────────────────────

describe('integração calcularMedia + calcularSituacao', () => {
  it('média exatamente 7.0 via composição de notas → Aprovado', () => {
    // (5 + 9) / 2 = 7.0 — deve ser Aprovado, não Em Andamento
    expect(calcularSituacao(calcularMedia([5, 9]))).toBe('Aprovado')
  })

  it('média exatamente 5.0 via composição de notas → Em Andamento', () => {
    // (3 + 7) / 2 = 5.0 — deve ser Em Andamento, não Reprovado
    expect(calcularSituacao(calcularMedia([3, 7]))).toBe('Em Andamento')
  })

  it('aluno sem matrícula → calcularMediaGeral null → Em Andamento', () => {
    expect(calcularSituacao(calcularMediaGeral([]))).toBe('Em Andamento')
  })

  it('matrícula sem nota → calcularMedia null → Em Andamento', () => {
    expect(calcularSituacao(calcularMedia([]))).toBe('Em Andamento')
  })
})

// ─── Casos de borda: aluno sem matrícula ────────────────────────────────────

describe('aluno sem matrícula', () => {
  it('calcularMediaGeral retorna null', () => {
    expect(calcularMediaGeral([])).toBeNull()
  })

  it('calcularSituacao(null) retorna Em Andamento', () => {
    expect(calcularSituacao(null)).toBe('Em Andamento')
  })
})

// ─── Casos de borda: curso sem notas lançadas ───────────────────────────────

describe('curso sem notas lançadas', () => {
  it('calcularMediaGeral com todas as matrículas sem nota retorna null', () => {
    expect(calcularMediaGeral([{ notas: [] }, { notas: [] }])).toBeNull()
  })

  it('calcularMedia de um curso sem notas retorna null, não zero', () => {
    expect(calcularMedia([])).toBeNull()
    expect(calcularMedia([])).not.toBe(0)
  })
})
