import { Suspense } from 'react'
import { Status } from '@prisma/client'
import { listarCursos } from '@/lib/api/cursos'
import { auth } from '@/lib/auth'
import { FiltroStatus } from '@/components/cursos/FiltroStatus'
import { NovoCursoButton } from '@/components/cursos/NovoCursoButton'
import { CursosClient } from '@/components/cursos/CursosClient'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function CursosPage({ searchParams }: PageProps) {
  const { status } = await searchParams

  const statusFiltro =
    status === Status.ATIVO || status === Status.INATIVO ? status : undefined

  const [cursos, session] = await Promise.all([listarCursos(statusFiltro), auth()])
  const role = session?.user?.role

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Cursos</h1>
        <div className="flex items-center gap-3">
          <Suspense>
            <FiltroStatus />
          </Suspense>
          {role === 'ADMIN' && <NovoCursoButton />}
        </div>
      </div>

      {cursos.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum curso encontrado.</p>
      ) : (
        <CursosClient cursos={cursos} />
      )}
    </main>
  )
}
