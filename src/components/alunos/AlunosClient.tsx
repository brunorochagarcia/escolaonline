'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

type Aluno = {
  id: string
  nome: string
  email: string
  dataNascimento: Date
  fotoUrl: string | null
  _count: { matriculas: number }
}

interface AlunosClientProps {
  alunos: Aluno[]
}

export function AlunosClient({ alunos }: AlunosClientProps) {
  const [termo, setTermo] = useState('')

  const resultado = useMemo(() => {
    const t = termo.trim().toLowerCase()
    if (!t) return alunos
    return alunos.filter(
      (a) => a.nome.toLowerCase().includes(t) || a.email.toLowerCase().includes(t),
    )
  }, [termo, alunos])

  return (
    <div>
      <div className="mb-4">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome ou e-mail…"
          className="w-full rounded-xl border border-secondary bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary sm:max-w-xs"
        />
      </div>

      {resultado.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {termo ? `Nenhum aluno encontrado para "${termo}".` : 'Nenhum aluno cadastrado.'}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-secondary">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs font-semibold uppercase tracking-wide text-primary">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Nascimento</th>
                <th className="px-4 py-3">Matrículas</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {resultado.map((aluno) => (
                <tr key={aluno.id} className="bg-white hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900">{aluno.nome}</td>
                  <td className="px-4 py-3 text-zinc-500">{aluno.email}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{aluno._count.matriculas}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/alunos/${aluno.id}/boletim`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Boletim
                      </Link>
                      <Link
                        href={`/alunos/${aluno.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Detalhes →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
