'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

const CORES = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626']

const CHART_MARGIN = { top: 8, right: 20, left: 0, bottom: 4 } as const
const TOOLTIP_STYLE = { fontSize: 12 } as const
const LEGEND_STYLE = { fontSize: 12 } as const
const TICK_STYLE = { fontSize: 11 } as const
const LABEL_APROVADO = { value: 'Aprovado', fontSize: 9, fill: '#16a34a', position: 'insideTopRight' } as const
const LABEL_MINIMO = { value: 'Mínimo', fontSize: 9, fill: '#d97706', position: 'insideTopRight' } as const
const DOT_PROPS = { r: 4 } as const
const ACTIVE_DOT_PROPS = { r: 6 } as const

interface Matricula {
  id: string
  curso: { nome: string }
  notas: { id: string; valor: number; data: string }[]
}

interface Props {
  matriculas: Matricula[]
}

export function GraficoEvolucaoNotas({ matriculas }: Props) {
  const comNotas = matriculas.filter((m) => m.notas.length > 0)
  if (comNotas.length === 0) return null

  // Pre-build label and aggregate same-day grades (average) in one O(total_notes) pass
  const byDateByCourse = new Map<string, Map<string, number[]>>()
  comNotas.forEach((m) => {
    m.notas.forEach((n) => {
      const label = new Date(n.data).toLocaleDateString('pt-BR')
      if (!byDateByCourse.has(label)) byDateByCourse.set(label, new Map())
      const byCourse = byDateByCourse.get(label)!
      const list = byCourse.get(m.curso.nome) ?? []
      list.push(n.valor)
      byCourse.set(m.curso.nome, list)
    })
  })

  const parseLabel = (s: string) => {
    const [d, mo, y] = s.split('/').map(Number)
    return new Date(y, mo - 1, d).getTime()
  }

  const todasDatas = [...byDateByCourse.keys()].sort((a, b) => parseLabel(a) - parseLabel(b))

  const data = todasDatas.map((label) => {
    const entry: Record<string, string | number | null> = { data: label }
    const byCourse = byDateByCourse.get(label)!
    comNotas.forEach((m) => {
      const valores = byCourse.get(m.curso.nome)
      entry[m.curso.nome] = valores
        ? Math.round((valores.reduce((s, v) => s + v, 0) / valores.length) * 10) / 10
        : null
    })
    return entry
  })

  return (
    <div className="mb-8 rounded-2xl border border-secondary bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-primary">Evolução das Notas</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="data" tick={TICK_STYLE} />
          <YAxis domain={[0, 10]} ticks={[0, 5, 7, 10]} tick={TICK_STYLE} />
          <Tooltip
            formatter={(v: number | string) => (v != null ? Number(v).toFixed(1) : '—')}
            contentStyle={TOOLTIP_STYLE}
          />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <ReferenceLine y={7} stroke="#16a34a" strokeDasharray="4 2" label={LABEL_APROVADO} />
          <ReferenceLine y={5} stroke="#d97706" strokeDasharray="4 2" label={LABEL_MINIMO} />
          {comNotas.map((m, i) => (
            <Line
              key={m.id}
              type="monotone"
              dataKey={m.curso.nome}
              stroke={CORES[i % CORES.length]}
              strokeWidth={2}
              dot={DOT_PROPS}
              activeDot={ACTIVE_DOT_PROPS}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
