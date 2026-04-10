'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

type Curso = { id: string; nome: string }

interface FiltroCursoProps {
  cursos: Curso[]
}

export function FiltroCurso({ cursos }: FiltroCursoProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const cursoIdAtual = searchParams.get('cursoId') ?? ''

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('cursoId', e.target.value)
    } else {
      params.delete('cursoId')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={cursoIdAtual}
      onChange={handleChange}
      className="rounded-xl border border-secondary bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
    >
      <option value="">Todos os cursos</option>
      {cursos.map((curso) => (
        <option key={curso.id} value={curso.id}>
          {curso.nome}
        </option>
      ))}
    </select>
  )
}
