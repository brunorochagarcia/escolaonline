'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { NotaForm } from './NotaForm'

interface LancarNotaButtonProps {
  matriculaId: string
  alunoId: string
}

export function LancarNotaButton({ matriculaId, alunoId }: LancarNotaButtonProps) {
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
        className="rounded-lg border border-secondary px-3 py-1.5 text-xs font-medium text-primary hover:bg-secondary transition-colors"
      >
        + Nota
      </button>

      <Modal title="Lançar nota" isOpen={aberto} onClose={() => setAberto(false)}>
        <NotaForm
          matriculaId={matriculaId}
          alunoId={alunoId}
          onSuccess={handleSuccess}
          onClose={() => setAberto(false)}
        />
      </Modal>
    </>
  )
}
