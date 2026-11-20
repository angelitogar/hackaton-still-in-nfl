import type { ScenarioPreview, ScenarioRequest, SliceMetric } from '../types/api'
import { PERSPECTIVE_LABELS, STRATEGY_LABELS, segmentLabel } from './labels'
import { formatInteger, formatInterval, formatNumber } from './format'

function describeSlice(slice: SliceMetric): string {
  return (
    `${segmentLabel(slice.dimension, slice.bucket)}: media ${formatNumber(slice.avgPlayResult)} yd ` +
    `(mediana liga ${formatNumber(slice.leagueMedian)}, IC 95 % ${formatInterval(slice.ci)}, n=${formatInteger(slice.n)})`
  )
}

function section(title: string, lines: string[]): string[] {
  return lines.length === 0 ? [] : ['', title, ...lines.map((line) => `- ${line}`)]
}

/** Texto plano del escenario para copiar. Solo ordena lo que ya entregó la API. */
export function buildScenarioSummary(request: ScenarioRequest, preview: ScenarioPreview, season: number): string {
  const header = [
    'ESCENARIO HIPOTÉTICO · NFL TRADE BOWL',
    `Equipo: ${request.team} · ${PERSPECTIVE_LABELS[request.need.perspective]} · muestra histórica ${season}`,
    `Estrategia (elegida por el usuario): ${STRATEGY_LABELS[request.strategy]}`,
    `Necesidad: ${segmentLabel(request.need.dimension, request.need.bucket)}`,
  ]
  return [
    ...header,
    ...section('Evidencia calculada', preview.evidence.map(describeSlice)),
    ...section(
      'Perfiles históricos de equipos',
      preview.partnerProfiles.map(
        (profile) =>
          `${profile.team} (${profile.source === 'manual' ? 'elegido a mano' : 'calculado'}) · ${profile.slice ? describeSlice(profile.slice) : 'sin muestra histórica suficiente'}${profile.simulation ? ` · simulación: busca ${profile.simulation.theirNeed}; ofrecer ${profile.simulation.offerPlayer ?? 'selección ficticia'}; recibir ${profile.simulation.receivePlayer ?? 'sin excedente'}. ${profile.simulation.draftProposal}` : ''}`,
      ),
    ),
    ...section('Supuestos del usuario', preview.assumptions),
    ...section('Avisos', preview.disclaimers),
  ].join('\n')
}
