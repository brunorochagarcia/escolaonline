import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from './auth-guard'

const mockAuth = vi.mocked(auth)

beforeEach(() => mockAuth.mockReset())

describe('requireAuth', () => {
  it('lança erro quando não há sessão', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(requireAuth()).rejects.toThrow(/não autenticado/i)
  })

  it('retorna a sessão quando autenticado', async () => {
    const session = { user: { id: 'u1', role: 'ADMIN', email: 'a@b.com' } }
    mockAuth.mockResolvedValue(session as never)
    await expect(requireAuth()).resolves.toEqual(session)
  })
})

describe('requireRole', () => {
  it('lança Não autenticado quando sem sessão', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(requireRole('ADMIN')).rejects.toThrow(/não autenticado/i)
  })

  it('lança Não autorizado para role fora da lista', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'ALUNO', email: 'a@b.com' } } as never)
    await expect(requireRole('ADMIN')).rejects.toThrow(/não autorizado/i)
  })

  it('resolve a sessão quando role está na lista', async () => {
    const session = { user: { id: 'u1', role: 'ADMIN', email: 'a@b.com' } }
    mockAuth.mockResolvedValue(session as never)
    await expect(requireRole('ADMIN', 'PROFESSOR')).resolves.toEqual(session)
  })

  it('lança Não autorizado para role null', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: null, email: 'a@b.com' } } as never)
    await expect(requireRole('ADMIN')).rejects.toThrow(/não autorizado/i)
  })

  it('lança Não autorizado para role undefined', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' } } as never)
    await expect(requireRole('ADMIN')).rejects.toThrow(/não autorizado/i)
  })

  it('lança Não autorizado para lista vazia de roles', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'a@b.com' } } as never)
    await expect(requireRole()).rejects.toThrow(/não autorizado/i)
  })

  it('aceita PROFESSOR quando lista inclui PROFESSOR', async () => {
    const session = { user: { id: 'u1', role: 'PROFESSOR', email: 'p@b.com' } }
    mockAuth.mockResolvedValue(session as never)
    await expect(requireRole('ADMIN', 'PROFESSOR')).resolves.toEqual(session)
  })
})
