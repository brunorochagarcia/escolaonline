'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cursoSchema, CursoFormData } from '@/schemas/curso'
import { cn } from '@/lib/utils'

interface CursoFormProps {
  defaultValues?: CursoFormData
  onSubmit: (data: CursoFormData) => Promise<{ errors?: Record<string, string[]> } | void>
  submitLabel: string
}

export function CursoForm({ defaultValues, onSubmit, submitLabel }: CursoFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CursoFormData>({
    resolver: zodResolver(cursoSchema),
    defaultValues: defaultValues ?? { status: 'ATIVO' },
  })

  function submit(data: CursoFormData) {
    setFormError(null)
    startTransition(async () => {
      const result = await onSubmit(data)
      if (!result?.errors) return
      for (const [field, messages] of Object.entries(result.errors)) {
        if (field === '_form') {
          setFormError(messages[0])
        } else {
          setError(field as keyof CursoFormData, { message: messages[0] })
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {formError}
        </p>
      )}

      <Field label="Nome" error={errors.nome?.message}>
        <input
          {...register('nome')}
          placeholder="Ex: Desenvolvimento Web Full Stack"
          className={inputClass(!!errors.nome)}
        />
      </Field>

      <Field label="Descrição" error={errors.descricao?.message}>
        <textarea
          {...register('descricao')}
          rows={3}
          placeholder="Descreva o conteúdo do curso"
          className={inputClass(!!errors.descricao)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Carga horária (h)" error={errors.cargaHoraria?.message}>
          <input
            {...register('cargaHoraria')}
            type="number"
            min={1}
            placeholder="Ex: 40"
            className={inputClass(!!errors.cargaHoraria)}
          />
        </Field>

        <Field label="Status" error={errors.status?.message}>
          <select {...register('status')} className={inputClass(!!errors.status)}>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </Field>
      </div>

      <Field label="Instrutor" error={errors.instrutor?.message}>
        <input
          {...register('instrutor')}
          placeholder="Ex: Rafael Mendes"
          className={inputClass(!!errors.instrutor)}
        />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <a
          href="/cursos"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isPending ? 'Salvando…' : submitLabel}
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