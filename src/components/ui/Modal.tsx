'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ title, isOpen, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  // Fecha ao clicar no backdrop (fora do dialog)
  function handleClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const fora =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    if (fora) onClose()
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={handleClick}
      className="m-auto w-full max-w-lg rounded-2xl border border-secondary bg-white p-0 shadow-2xl backdrop:bg-black/40"
    >
      {/* Cabeçalho do modal */}
      <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 hover:bg-secondary hover:text-primary transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="max-h-[75vh] overflow-y-auto p-6">
        {children}
      </div>
    </dialog>
  )
}
