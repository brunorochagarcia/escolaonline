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

  const todasDatas = [
    ...new Set(
      comNotas.flatMap((m) =>
        m.notas.map((n) => new Date(n.data).toLocaleDateString('pt-BR')),
      ),
    ),
  ].sort((a, b) => {
    const parse = (s: string) => {
      const [d, mo, y] = s.split('/').map(Number)
      return new Date(y, mo - 1, d).getTime()
    }
    return parse(a) - parse(b)
  })

  const data = todasDatas.map((label) => {
    const entry: Record<string, string | number | null> = { data: label }
    comNotas.forEach((m) => {
      const nota = m.notas.find(
        (n) => new Date(n.data).toLocaleDateString('pt-BR') === label,
      )
      entry[m.curso.nome] = nota != null ? nota.valor : null
    })
    return entry
  })

  return (
    <div className="mb-8 rounded-2xl border border-secondary bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-primary">Evolução das Notas</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="data" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 10]} ticks={[0, 5, 7, 10]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v: number) => (v != null ? v.toFixed(1) : '—')}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine
            y={7}
            stroke="#16a34a"
            strokeDasharray="4 2"
            label={{ value: 'Aprovado', fontSize: 9, fill: '#16a34a', position: 'insideTopRight' }}
          />
          <ReferenceLine
            y={5}
            stroke="#d97706"
            strokeDasharray="4 2"
            label={{ value: 'Mínimo', fontSize: 9, fill: '#d97706', position: 'insideTopRight' }}
          />
          {comNotas.map((m, i) => (
            <Line
              key={m.id}
              type="monotone"
              dataKey={m.curso.nome}
              stroke={CORES[i % CORES.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
