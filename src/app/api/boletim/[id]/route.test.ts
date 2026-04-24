import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/api/alunos', () => ({ buscarAlunoParaBoletim: vi.fn() }))
vi.mock('@react-pdf/renderer', () => ({
  renderToBuffer: vi.fn(async () => Buffer.from('PDF')),
  Document: ({ children }: { children: unknown }) => children,
  Page: ({ children }: { children: unknown }) => children,
  Text: ({ children }: { children: unknown }) => children,
  View: ({ children }: { children: unknown }) => children,
  Svg: ({ children }: { children: unknown }) => children,
  Polyline: () => null,
  Circle: () => null,
  Rect: () => null,
  StyleSheet: { create: (s: unknown) => s },
}))
vi.mock('@react-pdf/renderer', async () => ({
  renderToBuffer: vi.fn(async () => Buffer.from('PDF')),
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
  Svg: () => null,
  Line: () => null,
  Polyline: () => null,
  Circle: () => null,
  Rect: () => null,
  StyleSheet: { create: (s: unknown) => s },
}))
vi.mock('papaparse', () => ({ default: { unparse: vi.fn(() => 'Curso,Nota\n') } }))

import { auth } from '@/lib/auth'
import { buscarAlunoParaBoletim } from '@/lib/api/alunos'
import { GET } from './route'

const mockAuth = vi.mocked(auth)
const mockBuscar = vi.mocked(buscarAlunoParaBoletim)

const makeReq = (url: string) =>
  new Request(url) as Parameters<typeof GET>[0]

const makeParams = (id: string): Parameters<typeof GET>[1] => ({
  params: Promise.resolve({ id }),
})

const alunoBase = {
  id: 'aluno-1',
  nome: 'Ana Silva',
  email: 'ana@escola.com',
  dataNascimento: new Date('2000-01-01'),
  matriculas: [
    {
      id: 'mat-1',
      dataInicio: new Date('2024-01-01'),
      curso: { nome: 'Matemática', instrutorId: 'prof-1' },
      notas: [
        { id: 'n1', descricao: 'P1', valor: 8.5, data: new Date('2024-03-01') },
      ],
    },
  ],
}

beforeEach(() => {
  mockAuth.mockReset()
  mockBuscar.mockReset()
})

describe('GET /api/boletim/[id]', () => {
  it('retorna 401 quando não autenticado', async () => {
    mockAuth.mockResolvedValue(null as never)
    const res = await GET(makeReq('http://x/api/boletim/aluno-1'), makeParams('aluno-1'))
    expect(res.status).toBe(401)
  })

  it('retorna 404 quando aluno não encontrado', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'admin@x.com' } } as never)
    mockBuscar.mockResolvedValue(null)
    const res = await GET(makeReq('http://x/api/boletim/nao-existe'), makeParams('nao-existe'))
    expect(res.status).toBe(404)
  })

  it('retorna 403 quando ALUNO acessa boletim de outro aluno', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'ALUNO', email: 'outro@x.com' } } as never)
    mockBuscar.mockResolvedValue(alunoBase as never)
    const res = await GET(makeReq('http://x/api/boletim/aluno-1'), makeParams('aluno-1'))
    expect(res.status).toBe(403)
  })

  it('ALUNO acessa o próprio boletim sem erro de autorização', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'ALUNO', email: 'ana@escola.com' } } as never)
    mockBuscar.mockResolvedValue(alunoBase as never)
    const res = await GET(makeReq('http://x/api/boletim/aluno-1'), makeParams('aluno-1'))
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
  })

  it('retorna CSV com Content-Type correto para format=csv', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'admin@x.com' } } as never)
    mockBuscar.mockResolvedValue(alunoBase as never)
    const res = await GET(
      makeReq('http://x/api/boletim/aluno-1?format=csv'),
      makeParams('aluno-1'),
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/csv')
    expect(res.headers.get('content-disposition')).toContain('attachment')
  })

  it('filename do CSV não contém aspas mesmo com nome com caracteres especiais', async () => {
    const alunoEspecial = { ...alunoBase, nome: 'João "O Grande" Silva' }
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'admin@x.com' } } as never)
    mockBuscar.mockResolvedValue(alunoEspecial as never)
    const res = await GET(
      makeReq('http://x/api/boletim/aluno-1?format=csv'),
      makeParams('aluno-1'),
    )
    const disposition = res.headers.get('content-disposition') ?? ''
    expect(disposition).not.toContain('"o-grande"')
    expect(disposition).not.toMatch(/filename="[^"]*"[^"]*"/)
  })
})
