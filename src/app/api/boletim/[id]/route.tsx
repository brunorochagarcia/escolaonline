import { NextRequest } from 'next/server'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { buscarAlunoParaBoletim } from '@/lib/api/alunos'
import { calcularMedia, calcularMediaGeral, calcularSituacao } from '@/lib/utils'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#18181b' },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#71717a', marginBottom: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e4e4e7', marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 6, color: '#3f3f46' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  label: { color: '#71717a' },
  value: { fontFamily: 'Helvetica-Bold' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f5',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
    color: '#71717a',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  colDescricao: { flex: 3 },
  colData: { flex: 2 },
  colNota: { flex: 1, textAlign: 'right' },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: '#f4f4f5',
    fontFamily: 'Helvetica-Bold',
  },
  badge: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#a1a1aa',
    fontSize: 8,
  },
})

function situacaoColor(situacao: string) {
  if (situacao === 'Aprovado') return '#16a34a'
  if (situacao === 'Reprovado') return '#dc2626'
  return '#d97706'
}

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteProps) {
  const { id } = await params
  const aluno = await buscarAlunoParaBoletim(id)

  if (!aluno) {
    return new Response('Aluno não encontrado', { status: 404 })
  }

  const mediaGeral = calcularMediaGeral(
    aluno.matriculas.map((m) => ({ notas: m.notas.map((n) => ({ valor: Number(n.valor) })) })),
  )

  const buffer = await renderToBuffer(
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Boletim Escolar</Text>
        <Text style={styles.subtitle}>
          Escola Online — gerado em {new Date().toLocaleDateString('pt-BR')}
        </Text>
        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Aluno</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{aluno.nome}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.value}>{aluno.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de nascimento</Text>
            <Text style={styles.value}>{aluno.dataNascimento.toLocaleDateString('pt-BR')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Média geral</Text>
            <Text style={styles.value}>
              {mediaGeral !== null ? mediaGeral.toFixed(1) : '—'}
            </Text>
          </View>
        </View>

        {aluno.matriculas.map((matricula) => {
          const media = calcularMedia(matricula.notas.map((n) => Number(n.valor)))
          const situacao = calcularSituacao(media)

          return (
            <View key={matricula.id} style={styles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.sectionTitle}>{matricula.curso.nome}</Text>
                <Text style={[styles.badge, { color: situacaoColor(situacao) }]}>{situacao}</Text>
              </View>

              {matricula.notas.length === 0 ? (
                <Text style={{ color: '#a1a1aa', fontSize: 9 }}>Nenhuma nota lançada.</Text>
              ) : (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={styles.colDescricao}>AVALIAÇÃO</Text>
                    <Text style={styles.colData}>DATA</Text>
                    <Text style={styles.colNota}>NOTA</Text>
                  </View>
                  {matricula.notas.map((nota) => (
                    <View key={nota.id} style={styles.tableRow}>
                      <Text style={styles.colDescricao}>{nota.descricao}</Text>
                      <Text style={styles.colData}>
                        {new Date(nota.data).toLocaleDateString('pt-BR')}
                      </Text>
                      <Text style={styles.colNota}>{nota.valor.toFixed(1)}</Text>
                    </View>
                  ))}
                  <View style={styles.mediaRow}>
                    <Text>Média do curso</Text>
                    <Text>{media !== null ? media.toFixed(1) : '—'}</Text>
                  </View>
                </>
              )}
            </View>
          )
        })}

        <Text style={styles.footer}>Escola Online</Text>
      </Page>
    </Document>,
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="boletim-${aluno.nome.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
    },
  })
}
