import { redirect } from 'next/navigation'

// Boletim foi mesclado com a página de detalhes do aluno.
export default async function BoletimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/alunos/${id}`)
}
