import type { Finding, Perspective } from '../types/api'
import { segmentLabel } from '../lib/labels'
import { Panel } from './ui/Panel'

interface Props { attention: Finding[]; strengths: Finding[]; perspective: Perspective }
type Zone = 'backfield' | 'line' | 'receivers' | 'coverage' | 'front' | 'team'
type Marker = { x: number; y: number; label: string; zone: Zone }

const OFFENSE: Marker[] = [
  { x: 160, y: 35, label: 'WR', zone: 'receivers' }, { x: 160, y: 195, label: 'WR', zone: 'receivers' },
  { x: 183, y: 62, label: 'TE', zone: 'receivers' },
  ...[77, 96, 115, 134, 153].map((y) => ({ x: 210, y, label: 'OL', zone: 'line' as Zone })),
  { x: 175, y: 115, label: 'QB', zone: 'backfield' }, { x: 140, y: 115, label: 'RB', zone: 'backfield' },
  { x: 110, y: 55, label: 'WR', zone: 'receivers' },
]
const DEFENSE: Marker[] = [
  ...[70, 100, 130, 160].map((y) => ({ x: 260, y, label: 'DL', zone: 'front' as Zone })),
  ...[65, 115, 165].map((y) => ({ x: 310, y, label: 'LB', zone: 'front' as Zone })),
  { x: 365, y: 45, label: 'CB', zone: 'coverage' }, { x: 365, y: 185, label: 'CB', zone: 'coverage' },
  { x: 390, y: 85, label: 'S', zone: 'coverage' }, { x: 390, y: 145, label: 'S', zone: 'coverage' },
]

/** Group links are illustrative hypotheses, not measurements of individual performance. */
function impliedZone(item: Finding, perspective: Perspective): Zone {
  if (item.dimension === 'coverageType') return perspective === 'offense' ? 'receivers' : 'coverage'
  if (item.dimension === 'playAction') return perspective === 'offense' ? 'backfield' : 'front'
  return 'team'
}

export function PerformanceMap({ attention, strengths, perspective }: Props) {
  const markers = perspective === 'offense' ? OFFENSE : DEFENSE
  const critical = attention[0]
  const redZone = critical ? impliedZone(critical, perspective) : null
  const greenZone = strengths[0] ? impliedZone(strengths[0], perspective) : null
  const zones: Record<Zone, { x: number; y: number; rx: number; ry: number }> = {
    backfield: { x: 155, y: 115, rx: 52, ry: 40 }, line: { x: 210, y: 115, rx: 30, ry: 105 },
    receivers: { x: 145, y: 115, rx: 58, ry: 100 }, coverage: { x: 375, y: 115, rx: 48, ry: 95 },
    front: { x: 285, y: 115, rx: 60, ry: 100 }, team: { x: 245, y: 115, rx: 210, ry: 100 },
  }
  const overlay = (zone: Zone, fill: string, key: string) => {
    const { x, y, rx, ry } = zones[zone]
    return <ellipse key={key} cx={x} cy={y} rx={rx} ry={ry} fill={fill} fillOpacity="0.2" stroke={fill} strokeOpacity="0.8" strokeWidth="2" strokeDasharray="5 4" />
  }
  return (
    <Panel title="Mapa de rendimiento" subtitle="Zonas orientativas: relacionan el tipo de jugada con grupos hipotéticos, no evalúan jugadores individuales.">
      <div className="grid items-center gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 230" role="img" aria-label="Formación de once jugadores con zonas hipotéticas rojas de mejora y verdes de fortaleza" className="w-full rounded-lg border border-zinc-700">
          <rect width="480" height="230" fill="#103c38" />
          {[48, 96, 144, 192, 240, 288, 336, 384, 432].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="230" stroke="#ffffff" strokeOpacity=".18" strokeWidth="2" />)}
          <line x1="240" y1="0" x2="240" y2="230" stroke="#fff" strokeOpacity=".45" strokeDasharray="5 5" />
          {redZone && overlay(redZone, '#ff4054', 'red')}
          {greenZone && overlay(greenZone, '#28e380', 'green')}
          <text x="12" y="20" fill="#fff" fontSize="11" fontWeight="700">{perspective === 'offense' ? 'ATAQUE' : 'DEFENSA'} · FORMACIÓN ILUSTRATIVA</text>
          {markers.map(({ x, y, label }, index) => <g key={`${label}-${index}`}><circle cx={x} cy={y} r="11" fill="#fff" stroke="#142c45" strokeWidth="2" /><text x={x} y={y+3} textAnchor="middle" fill="#142c45" fontSize="8" fontWeight="700">{label}</text></g>)}
        </svg>
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-md border border-red-400/50 bg-red-950/10 p-3"><h3 className="mb-2 text-sm font-semibold text-red-500">● Mejora prioritaria</h3>{critical && <p className="text-xs text-zinc-200">{segmentLabel(critical.dimension, critical.bucket)}{critical.fallback ? ' · prioridad relativa' : ''}</p>}<p className="mt-2 text-xs text-zinc-400">{redZone === 'team' ? 'Señal del equipo completo; no se asigna a una posición.' : 'Zona hipotética relacionada con el tipo de jugada.'}</p></section>
          <section className="rounded-md border border-green-500/50 bg-green-950/10 p-3"><h3 className="mb-2 text-sm font-semibold text-green-500">● Fortaleza principal</h3>{strengths.length ? <p className="text-xs text-zinc-200">{segmentLabel(strengths[0].dimension, strengths[0].bucket)}</p> : <p className="text-xs text-zinc-400">Sin fortaleza concluyente en esta muestra.</p>}<p className="mt-2 text-xs text-zinc-400">{greenZone === 'team' ? 'Señal del equipo completo; no se asigna a una posición.' : greenZone ? 'Zona hipotética relacionada con el tipo de jugada.' : ''}</p></section>
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-400">Los círculos son posiciones ilustrativas, no jugadores identificados. Los colores son hipótesis sobre grupos, no mediciones de rendimiento individual; pueden superponerse.</p>
    </Panel>
  )
}
