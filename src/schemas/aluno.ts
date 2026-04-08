import { z } from 'zod'

export const alunoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  dataNascimento: z.coerce.date({ errorMap: () => ({ message: 'Data inválida' }) }),
  fotoUrl: z.string().url('URL inválida').or(z.literal('')).optional(),
  fotoPublicId: z.string().optional(),
})

export type AlunoFormData = z.infer<typeof alunoSchema>
