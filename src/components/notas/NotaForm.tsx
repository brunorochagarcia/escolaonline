'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { lancarNota, NotaActionResult } from '@/actions/notas'
import { cn } from '@/lib/utils'

type FormErrors = Extract<NotaActionResult, { error: unknown }>['error']

interface NotaFormProps {
  matriculaId: string
  alunoId: string
}

export function NotaForm({ matriculaId, alunoId }: NotaFormProps) {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<FormErrors | null>(null)
  const router = useRouter()

  const hoje = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErrors(null)
    startTransition(async () => {
      const result = await lancarNota(matriculaId, alunoId, {
        descricao: fd.get('descricao'),
        valor: fd.get('valor'),
        data: fd.get('data'),
      })
      if ('success' in result) {
        router.push(`/alunos/${alunoId}`)
        return
      }
      setErrors(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors?._form && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {errors._form[0]}
        </div>
      )}

      <Field label="Descrição" error={errors?.descricao?.[0]}>
        <input
          name="descricao"
          type="text"
          placeholder="Ex: Prova 1, Trabalho Final…"
          className={inputClass(!!errors?.descricao)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nota (0–10)" error={errors?.valor?.[0]}>
          <input
            name="valor"
            type="number"
            min="0"
            max="10"
            step="0.1"
            placeholder="Ex: 8.5"
            className={inputClass(!!errors?.valor)}
          />
        </Field>

        <Field label="Data" error={errors?.data?.[0]}>
          <input
            name="data"
            type="date"
            defaultValue={hoje}
            className={inputClass(!!errors?.data)}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <a
          href={`/alunos/${alunoId}`}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isPending ? 'Salvando…' : 'Lançar nota'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2',
    'bg-white dark:bg-zinc-900 dark:text-zinc-100',
    hasError
      ? 'border-red-400 focus:ring-red-300'
      : 'border-zinc-300 focus:ring-zinc-400 dark:border-zinc-700',
  )
}
