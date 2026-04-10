'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { CursoForm } from './CursoForm'
import { criarCurso } from '@/actions/cursos'

export function NovoCursoButton() {
  const [aberto, setAberto] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    setAberto(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
      >
        Novo curso
      </button>

      <Modal title="Novo curso" isOpen={aberto} onClose={() => setAberto(false)}>
        <CursoForm
          onSubmit={criarCurso}
          submitLabel="Criar curso"
          onSuccess={handleSuccess}
          onClose={() => setAberto(false)}
        />
      </Modal>
    </>
  )
}
