'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { criarMatricula, MatriculaActionResult } from '@/actions/matriculas'
import { cn } from '@/lib/utils'

type Aluno = { id: string; nome: string }
type Curso = { id: string; nome: string }

type FormErrors = Extract<MatriculaActionResult, { error: unknown }>['error']

interface MatriculaFormProps {
  alunos: Aluno[]
  cursos: Curso[]
  onSuccess?: () => void
  onClose?: () => void
}

export function MatriculaForm({ alunos, cursos, onSuccess, onClose }: MatriculaFormProps) {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<FormErrors | null>(null)
  const router = useRouter()

  const hoje = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErrors(null)
    startTransition(async () => {
      const result = await criarMatricula({
        alunoId: fd.get('alunoId'),
        cursoId: fd.get('cursoId'),
        dataInicio: fd.get('dataInicio'),
      })
      if ('success' in result) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/matriculas')
        }
        return
      }
      setErrors(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors?._form && (
        <div className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">
          {errors._form[0]}
        </div>
      )}

      <Field label="Aluno" error={errors?.alunoId?.[0]}>
        <select name="alunoId" defaultValue="" className={selectClass(!!errors?.alunoId)}>
          <option value="" disabled>Selecione um aluno…</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      </Field>

      <Field label="Curso" error={errors?.cursoId?.[0]}>
        <select name="cursoId" defaultValue="" className={selectClass(!!errors?.cursoId)}>
          <option value="" disabled>Selecione um curso…</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </Field>

      <Field label="Data de início" error={errors?.dataInicio?.[0]}>
        <input
          type="date"
          name="dataInicio"
          defaultValue={hoje}
          className={selectClass(!!errors?.dataInicio)}
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
            href="/matriculas"
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
          {isPending ? 'Salvando…' : 'Matricular'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      {children}
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  )
}

function selectClass(hasError: boolean) {
  return cn(
    'w-full rounded-xl border px-3 py-2 text-sm bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-secondary',
    hasError ? 'border-accent' : 'border-secondary',
  )
}
