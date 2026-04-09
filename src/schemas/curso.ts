import { z } from 'zod'

export const cursoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  descricao: z.string().min(10, 'Descrição deve ter ao menos 10 caracteres'),
  cargaHoraria: z.coerce.number().int().positive('Carga horária deve ser maior que zero'),
  instrutor: z.string().min(2, 'Nome do instrutor deve ter ao menos 2 caracteres').max(100),
  status: z.enum(['ATIVO', 'INATIVO']),
})

export type CursoFormData = z.infer<typeof cursoSchema>
