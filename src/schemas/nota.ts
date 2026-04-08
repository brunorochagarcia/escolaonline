import { z } from 'zod'

export const notaSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória').max(100),
  valor: z.coerce
    .number({ invalid_type_error: 'Informe um número válido' })
    .min(0, 'A nota não pode ser menor que 0')
    .max(10, 'A nota não pode ser maior que 10'),
  data: z.coerce.date({ errorMap: () => ({ message: 'Data inválida' }) }),
})

export type NotaFormData = z.infer<typeof notaSchema>
