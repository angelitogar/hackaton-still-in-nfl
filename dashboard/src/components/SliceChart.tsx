import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SliceMetric } from '../types/api'
import { bucketLabel } from '../lib/labels'
import { formatNumber } from '../lib/format'

interface ChartDatum {
  name: string
  team: number
  league: number
}

function toChartData(rows: SliceMetric[]): ChartDatum[] {
  return rows.map((row) => ({
    name: bucketLabel(row.dimension, row.bucket),
    team: row.avgPlayResult,
    league: row.leagueMedian,
  }))
}

const formatTooltipValue = (value: unknown): string =>
  typeof value === 'number' ? `${formatNumber(value)} yd` : String(value ?? '')

export function SliceChart({ rows, teamLabel }: { rows: SliceMetric[]; teamLabel: string }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={toChartData(rows)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
          <YAxis stroke="#a1a1aa" tick={{ fontSize: 11 }} unit=" yd" width={56} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', fontSize: 12 }}
            formatter={formatTooltipValue}
            cursor={{ fill: '#27272a' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="team" name={teamLabel} fill="#34d399" radius={[3, 3, 0, 0]} />
          <Bar dataKey="league" name="Mediana de la liga" fill="#52525b" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
