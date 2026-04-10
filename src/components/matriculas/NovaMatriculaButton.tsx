'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { MatriculaForm } from './MatriculaForm'

type Aluno = { id: string; nome: string }
type Curso = { id: string; nome: string }

interface NovaMatriculaButtonProps {
  alunos: Aluno[]
  cursos: Curso[]
}

export function NovaMatriculaButton({ alunos, cursos }: NovaMatriculaButtonProps) {
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
        Nova matrícula
      </button>

      <Modal title="Nova matrícula" isOpen={aberto} onClose={() => setAberto(false)}>
        <MatriculaForm
          alunos={alunos}
          cursos={cursos}
          onSuccess={handleSuccess}
          onClose={() => setAberto(false)}
        />
      </Modal>
    </>
  )
}
