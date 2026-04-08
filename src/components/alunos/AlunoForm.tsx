'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { alunoSchema, AlunoFormData } from '@/schemas/aluno'
import { AlunoActionResult } from '@/actions/alunos'
import { cn } from '@/lib/utils'

// dataNascimento chega como string YYYY-MM-DD do input[type=date];
// zod coerce.date converte na hora da validação.
type AlunoDefaultValues = Partial<Omit<AlunoFormData, 'dataNascimento'>> & {
  dataNascimento?: string
}

interface AlunoFormProps {
  defaultValues?: AlunoDefaultValues
  onSubmit: (data: AlunoFormData) => Promise<AlunoActionResult | void>
  submitLabel: string
}

export function AlunoForm({ defaultValues, onSubmit, submitLabel }: AlunoFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
    defaultValues: defaultValues as Partial<AlunoFormData>,
  })

  function submit(data: AlunoFormData) {
    setFormError(null)
    startTransition(async () => {
      const result = await onSubmit(data)
      if (!result?.errors) return
      for (const [field, messages] of Object.entries(result.errors)) {
        if (field === '_form') {
          setFormError(messages![0])
        } else {
          setError(field as keyof AlunoFormData, { message: messages![0] })
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
          placeholder="Ex: Maria da Silva"
          className={inputClass(!!errors.nome)}
        />
      </Field>

      <Field label="E-mail" error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          placeholder="Ex: maria@email.com"
          className={inputClass(!!errors.email)}
        />
      </Field>

      <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
        <input
          {...register('dataNascimento')}
          type="date"
          className={inputClass(!!errors.dataNascimento)}
        />
      </Field>

      <Field label="URL da foto (opcional)" error={errors.fotoUrl?.message}>
        <input
          {...register('fotoUrl')}
          type="url"
          placeholder="https://exemplo.com/foto.jpg"
          className={inputClass(!!errors.fotoUrl)}
        />
      </Field>

      {/* Preserva o ID do Cloudinary ao editar sem trocar a foto */}
      <input type="hidden" {...register('fotoPublicId')} />

      <div className="flex justify-end gap-3 pt-2">
        <a
          href="/alunos"
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