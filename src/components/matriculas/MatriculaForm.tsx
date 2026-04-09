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
}

export function MatriculaForm({ alunos, cursos }: MatriculaFormProps) {
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
        router.push('/matriculas')
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

      <Field label="Aluno" error={errors?.alunoId?.[0]}>
        <select name="alunoId" defaultValue="" className={selectClass(!!errors?.alunoId)}>
          <option value="" disabled>
            Selecione um aluno…
          </option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Curso" error={errors?.cursoId?.[0]}>
        <select name="cursoId" defaultValue="" className={selectClass(!!errors?.cursoId)}>
          <option value="" disabled>
            Selecione um curso…
          </option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
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
        <a
          href="/matriculas"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isPending ? 'Salvando…' : 'Matricular'}
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

function selectClass(hasError: boolean) {
  return cn(
    'rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2',
    'bg-white dark:bg-zinc-900 dark:text-zinc-100',
    hasError
      ? 'border-red-400 focus:ring-red-300'
      : 'border-zinc-300 focus:ring-zinc-400 dark:border-zinc-700',
  )
}
