import { describe, it, expect } from 'vitest'
import { calcularMedia, calcularMediaGeral, calcularSituacao } from './notas'

// ─── RN-01: média aritmética simples ────────────────────────────────────────

describe('calcularMedia (RN-01)', () => {
  it('retorna null quando não há notas', () => {
    expect(calcularMedia([])).toBeNull()
  })

  it('retorna o próprio valor com uma única nota', () => {
    expect(calcularMedia([{ valor: 8 }])).toBe(8)
  })

  it('calcula média aritmética simples corretamente', () => {
    // (6 + 8 + 10) / 3 = 8
    expect(calcularMedia([{ valor: 6 }, { valor: 8 }, { valor: 10 }])).toBe(8)
  })

  it('preserva casas decimais na média', () => {
    // (5 + 6) / 2 = 5.5
    expect(calcularMedia([{ valor: 5 }, { valor: 6 }])).toBe(5.5)
  })

  it('aceita notas com valor zero', () => {
    expect(calcularMedia([{ valor: 0 }, { valor: 10 }])).toBe(5)
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
    // curso A: [10, 10] — curso B: [4] → (10+10+4)/3 = 8
    const matriculas = [
      { notas: [{ valor: 10 }, { valor: 10 }] },
      { notas: [{ valor: 4 }] },
    ]
    expect(calcularMediaGeral(matriculas)).toBeCloseTo(8, 5)
  })
})

// ─── RN-02: situação por média ───────────────────────────────────────────────

describe('calcularSituacao (RN-02)', () => {
  it('retorna "Em Andamento" sem nenhuma nota', () => {
    expect(calcularSituacao([])).toBe('Em Andamento')
  })

  it('retorna "Aprovado" com média exatamente 7.0 (limite inferior)', () => {
    expect(calcularSituacao([{ valor: 7 }])).toBe('Aprovado')
  })

  it('retorna "Aprovado" com média acima de 7.0', () => {
    expect(calcularSituacao([{ valor: 9 }, { valor: 8 }])).toBe('Aprovado')
  })

  it('retorna "Em Andamento" com média 6.9 (abaixo do aprovado)', () => {
    // (6 + 7.8) / 2 = 6.9
    expect(calcularSituacao([{ valor: 6 }, { valor: 7.8 }])).toBe('Em Andamento')
  })

  it('retorna "Em Andamento" com média exatamente 5.0 (limite inferior da faixa)', () => {
    expect(calcularSituacao([{ valor: 5 }])).toBe('Em Andamento')
  })

  it('retorna "Reprovado" com média 4.9 (abaixo de 5.0)', () => {
    // (4 + 5.8) / 2 = 4.9
    expect(calcularSituacao([{ valor: 4 }, { valor: 5.8 }])).toBe('Reprovado')
  })

  it('retorna "Reprovado" com média zero', () => {
    expect(calcularSituacao([{ valor: 0 }])).toBe('Reprovado')
  })
})