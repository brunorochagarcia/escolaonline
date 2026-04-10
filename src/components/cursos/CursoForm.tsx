'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cursoSchema, CursoFormData } from '@/schemas/curso'
import { CursoActionResult } from '@/actions/cursos'
import { cn } from '@/lib/utils'

interface CursoFormProps {
  defaultValues?: CursoFormData
  onSubmit: (data: CursoFormData) => Promise<CursoActionResult>
  submitLabel: string
  redirectTo?: string
  onSuccess?: () => void
  onClose?: () => void
}

export function CursoForm({
  defaultValues,
  onSubmit,
  submitLabel,
  redirectTo,
  onSuccess,
  onClose,
}: CursoFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const router = useRouter()

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
      if ('success' in result) {
        if (onSuccess) {
          onSuccess()
        } else if (redirectTo) {
          router.push(redirectTo)
        }
        return
      }
      for (const [field, messages] of Object.entries(result.error)) {
        if (field === '_form') {
          setFormError(messages![0])
        } else {
          setError(field as keyof CursoFormData, { message: messages![0] })
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {formError && (
        <p className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">
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
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-secondary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
        ) : (
          <a
            href="/cursos"
            className="rounded-xl border border-secondary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary transition-colors"
          >
            Cancelar
          </a>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
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
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      {children}
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full rounded-xl border px-3 py-2 text-sm bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-secondary',
    hasError ? 'border-accent' : 'border-secondary',
  )
}
