import { z } from 'zod'

export const cursoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  cargaHoraria: z.coerce.number().int().positive('Carga horária deve ser maior que zero'),
  instrutor: z.string().min(1, 'Instrutor é obrigatório').max(100),
  status: z.enum(['ATIVO', 'INATIVO']),
})

export type CursoFormData = z.infer<typeof cursoSchema>
