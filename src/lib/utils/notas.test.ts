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

// ─── Casos de borda: limites absolutos das notas (0 e 10) ───────────────────

describe('limites absolutos de nota (0 e 10)', () => {
  it('calcularMedia com nota mínima isolada (0) retorna 0, não null', () => {
    expect(calcularMedia([{ valor: 0 }])).toBe(0)
  })

  it('calcularMedia com nota máxima isolada (10) retorna 10', () => {
    expect(calcularMedia([{ valor: 10 }])).toBe(10)
  })

  it('nota 10 isolada → situação Aprovado', () => {
    expect(calcularSituacao([{ valor: 10 }])).toBe('Aprovado')
  })

  it('nota 0 isolada → situação Reprovado', () => {
    expect(calcularSituacao([{ valor: 0 }])).toBe('Reprovado')
  })

  it('média exatamente 5.0 via composição de notas → Em Andamento', () => {
    // (3 + 7) / 2 = 5.0 — deve ser Em Andamento, não Reprovado
    expect(calcularSituacao([{ valor: 3 }, { valor: 7 }])).toBe('Em Andamento')
  })

  it('média exatamente 7.0 via composição de notas → Aprovado', () => {
    // (5 + 9) / 2 = 7.0 — deve ser Aprovado, não Em Andamento
    expect(calcularSituacao([{ valor: 5 }, { valor: 9 }])).toBe('Aprovado')
  })
})

// ─── Casos de borda: aluno sem matrícula ────────────────────────────────────

describe('aluno sem matrícula', () => {
  it('calcularMediaGeral retorna null', () => {
    expect(calcularMediaGeral([])).toBeNull()
  })

  it('calcularSituacao retorna Em Andamento (sem notas para calcular)', () => {
    expect(calcularSituacao([])).toBe('Em Andamento')
  })
})

// ─── Casos de borda: curso sem alunos matriculados ──────────────────────────

describe('curso sem alunos matriculados', () => {
  it('matrícula existente mas sem notas lançadas → situação Em Andamento', () => {
    // Representa um aluno matriculado num curso onde nenhuma nota foi lançada ainda
    expect(calcularSituacao([])).toBe('Em Andamento')
  })

  it('calcularMediaGeral com todas as matrículas sem nota retorna null', () => {
    // Dois cursos matriculados, nenhum com nota → sem média
    expect(calcularMediaGeral([{ notas: [] }, { notas: [] }])).toBeNull()
  })

  it('calcularMedia de um curso sem notas retorna null (não zero)', () => {
    // null sinaliza "sem dados", diferente de média zero
    expect(calcularMedia([])).toBeNull()
    expect(calcularMedia([])).not.toBe(0)
  })
})