'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { AlunoForm } from './AlunoForm'
import { criarAluno } from '@/actions/alunos'

export function NovoAlunoButton() {
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
        Novo aluno
      </button>

      <Modal title="Novo aluno" isOpen={aberto} onClose={() => setAberto(false)}>
        <AlunoForm
          onSubmit={criarAluno}
          submitLabel="Criar aluno"
          onSuccess={handleSuccess}
          onClose={() => setAberto(false)}
        />
      </Modal>
    </>
  )
}
