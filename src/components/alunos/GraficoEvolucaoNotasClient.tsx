'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { GraficoEvolucaoNotas as GraficoType } from './GraficoEvolucaoNotas'

const GraficoEvolucaoNotas = dynamic(
  () => import('./GraficoEvolucaoNotas').then((m) => m.GraficoEvolucaoNotas),
  { ssr: false },
)

export function GraficoEvolucaoNotasClient(props: ComponentProps<typeof GraficoType>) {
  return <GraficoEvolucaoNotas {...props} />
}