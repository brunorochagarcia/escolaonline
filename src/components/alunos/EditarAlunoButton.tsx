'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { AlunoForm } from '@/components/alunos/AlunoForm'
import { editarAluno } from '@/actions/alunos'

interface EditarAlunoButtonProps {
  alunoId: string
  defaultValues: {
    nome: string
    email: string
    dataNascimento: string
    fotoUrl: string
    fotoPublicId: string
  }
}

export function EditarAlunoButton({ alunoId, defaultValues }: EditarAlunoButtonProps) {
  const [aberto, setAberto] = useState(false)
  const router = useRouter()

  const action = editarAluno.bind(null, alunoId)

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

      <Modal title="Editar aluno" isOpen={aberto} onClose={() => setAberto(false)}>
        <AlunoForm
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
