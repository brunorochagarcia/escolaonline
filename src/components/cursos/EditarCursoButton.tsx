'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { CursoForm } from '@/components/cursos/CursoForm'
import { editarCurso } from '@/actions/cursos'
import type { CursoFormData } from '@/schemas/curso'

interface EditarCursoButtonProps {
  cursoId: string
  defaultValues: CursoFormData
}

export function EditarCursoButton({ cursoId, defaultValues }: EditarCursoButtonProps) {
  const [aberto, setAberto] = useState(false)
  const router = useRouter()

  const action = editarCurso.bind(null, cursoId)

  function handleSuccess() {
    setAberto(false)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-xl border border-secondary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary transition-colors"
      >
        Editar
      </button>

      <Modal title="Editar curso" isOpen={aberto} onClose={() => setAberto(false)}>
        <CursoForm
          defaultValues={defaultValues}
          onSubmit={action}
          submitLabel="Salvar alterações"
          onSuccess={handleSuccess}
          onClose={() => setAberto(false)}
        />
      </Modal>
    </>
  )
}
