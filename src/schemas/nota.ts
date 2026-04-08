import { z } from 'zod'

export const notaSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória').max(100),
  valor: z.preprocess(
    (val) => (val === '' || val == null ? undefined : Number(val)),
    z
      .number({ required_error: 'A nota é obrigatória', invalid_type_error: 'O valor da nota deve ser um número' })
      .min(0, 'A nota não pode ser menor que 0')
      .max(10, 'A nota não pode ser maior que 10'),
  ),
  data: z.coerce.date({ errorMap: () => ({ message: 'Data inválida' }) }),
})

export type NotaFormData = z.infer<typeof notaSchema>
