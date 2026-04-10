'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { alunoSchema, AlunoFormData } from '@/schemas/aluno'
import { AlunoActionResult } from '@/actions/alunos'
import { cn } from '@/lib/utils'

type AlunoDefaultValues = Partial<Omit<AlunoFormData, 'dataNascimento'>> & {
  dataNascimento?: string
}

interface AlunoFormProps {
  defaultValues?: AlunoDefaultValues
  onSubmit: (data: AlunoFormData, fotoBase64?: string) => Promise<AlunoActionResult>
  submitLabel: string
  /** Modo página: redireciona para esta rota após sucesso */
  redirectTo?: string
  /** Modo modal: chamado após sucesso (fechar modal + refresh) */
  onSuccess?: () => void
  /** Modo modal: chamado pelo botão Cancelar */
  onClose?: () => void
}

export function AlunoForm({
  defaultValues,
  onSubmit,
  submitLabel,
  redirectTo,
  onSuccess,
  onClose,
}: AlunoFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const [fotoBase64, setFotoBase64] = useState<string | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(defaultValues?.fotoUrl ?? null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
    defaultValues: defaultValues as Partial<AlunoFormData>,
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setFotoBase64(base64)
      setFotoPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  function submit(data: AlunoFormData) {
    setFormError(null)
    startTransition(async () => {
      const result = await onSubmit(data, fotoBase64 ?? undefined)
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
          setError(field as keyof AlunoFormData, { message: messages![0] })
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

      <Field label="Foto de perfil (opcional)">
        <div className="flex items-center gap-4">
          {fotoPreview && (
            <img
              src={fotoPreview}
              alt="Preview da foto"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-secondary"
            />
          )}
          <label className="cursor-pointer rounded-xl border border-secondary px-3 py-2 text-sm text-primary hover:bg-secondary transition-colors">
            {fotoPreview ? 'Trocar foto' : 'Escolher arquivo'}
            <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
          </label>
        </div>
      </Field>

      <input type="hidden" {...register('fotoUrl')} />
      <input type="hidden" {...register('fotoPublicId')} />

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
            href="/alunos"
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
