import { Resend } from 'resend'
import { env } from '@/lib/env'

const resend = new Resend(env.RESEND_API_KEY)

interface NotaLancadaParams {
  nomeAluno: string
  emailAluno: string
  nomeCurso: string
  descricaoNota: string
  valorNota: number
  dataNota: Date
}

export async function enviarAlertaNota(params: NotaLancadaParams): Promise<void> {
  const { nomeAluno, emailAluno, nomeCurso, descricaoNota, valorNota, dataNota } = params

  await resend.emails.send({
    from: 'Escola Online <onboarding@resend.dev>',
    to: emailAluno,
    subject: `Nova nota lançada — ${nomeCurso}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 16px; font-size: 18px; color: #18181b;">Nova nota registrada</h2>
        <p style="margin: 0 0 12px; color: #3f3f46;">
          Olá, <strong>${nomeAluno}</strong>!
        </p>
        <p style="margin: 0 0 16px; color: #3f3f46;">
          Uma nova nota foi lançada no curso <strong>${nomeCurso}</strong>:
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 12px; background: #f4f4f5; color: #71717a; font-weight: 600;">Avaliação</td>
            <td style="padding: 8px 12px; background: #f4f4f5;">${descricaoNota}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; color: #71717a; font-weight: 600;">Nota</td>
            <td style="padding: 8px 12px; font-weight: 700; font-size: 16px;">${valorNota.toFixed(1)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #f4f4f5; color: #71717a; font-weight: 600;">Data</td>
            <td style="padding: 8px 12px; background: #f4f4f5;">${dataNota.toLocaleDateString('pt-BR')}</td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; font-size: 12px; color: #a1a1aa;">
          Escola Online
        </p>
      </div>
    `,
  })
}
