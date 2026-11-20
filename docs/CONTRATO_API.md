# Contrato de API: NFL TRADE BOWL

Estado: **propuesta aprobada para empezar**. Se cambia solo con una rama `contract/<cambio>` y acuerdo de ambas personas. Dueño: Persona 1. Espejo en TypeScript: `dashboard/src/types/api.ts` (Persona 2).

## Reglas generales

- Todas las rutas van bajo `/api`. El dashboard llama con `fetch('api/...')`, sin diagonal inicial.
- JSON en camelCase (en Python: `alias_generator=to_camel`, `populate_by_name=True`).
- Sin escritura a disco. `POST` solo calcula.
- Muestra de referencia: 2021, semanas 1 a 8. `season` y `weeks` viajan en `meta`.
- Las etiquetas crudas de `plays.csv` (`C`, `I`, `S`, `R`, `IN`, PFF) se devuelven tal cual.

## Tipos

```ts
type Perspective = 'offense' | 'defense'
type Strategy = 'compete' | 'rebuild'
type Dimension =
  | 'down' | 'distanceBucket' | 'quarter' | 'clockWindow'
  | 'fieldZone' | 'offenseFormation' | 'playAction' | 'coverageType'
type SampleFlag = 'ok' | 'low' | 'hidden'
type Verdict = 'favorable' | 'adverse' | 'inconclusive'

interface SliceMetric {
  dimension: Dimension
  bucket: string            // etiqueta cruda o derivada (p. ej. "short")
  n: number
  avgPlayResult: number     // yardas medias según playResult
  explosiveRate: number     // 0..1, playResult >= thresholds.explosiveYards
  negativeRate: number      // 0..1, playResult < 0
  ci: { low: number; high: number }  // media ± 1.96·EE
  leagueMedian: number      // mediana de los 32 equipos, mismo segmento y perspectiva
  diff: number              // avgPlayResult - leagueMedian
  percentile: number        // 0..100 entre equipos con n suficiente
  sampleFlag: SampleFlag
  verdict: Verdict          // ya considera el sentido ataque/defensa
}

interface Finding extends SliceMetric { rank: number; explanation: string }

interface OutcomeShare { label: string; share: number; leagueMedian: number; n: number }

interface Meta {
  season: number
  weeks: { min: number; max: number }
  teams: string[]
  positions: string[]
  dimensions: Dimension[]
  thresholds: { minDisplay: number; minFinding: number; explosiveYards: number }
  dataset: { games: number; plays: number; players: number }
  limits: string[]          // textos de "Datos que faltan"
}

interface Diagnosis {
  team: string
  perspective: Perspective
  season: number
  sample: { plays: number; games: number }
  summary: { avgPlayResult: number; leagueMedian: number; percentile: number }
  attention: Finding[]      // máx. 3
  strengths: Finding[]      // máx. 3
  outcomeMix: OutcomeShare[]
  caveats: string[]
}

interface SliceTable { dimension: Dimension; rows: SliceMetric[] }

interface ScenarioRequest {
  team: string
  strategy: Strategy                      // elegida por el usuario
  need: { dimension: Dimension; bucket: string; perspective: Perspective }
  targetPosition?: string                 // de Meta.positions
  partnerTeam?: string | null             // elección manual opcional
  manualRecord?: { season: number; wins: number; losses: number; ties?: number }
  futureAssetNote?: string                // texto libre, máx. 280 caracteres
}

interface PartnerProfile {
  team: string
  slice: SliceMetric       // fortaleza relacionada con la necesidad
  source: 'computed' | 'manual'
  note: string             // "perfil histórico 2021; no implica interés ni disponibilidad"
}

interface ScenarioPreview {
  evidence: SliceMetric[]  // calculada
  partnerProfiles: PartnerProfile[]
  assumptions: string[]    // datos manuales, rotulados "dato manual, no verificado"
  missingData: string[]
  disclaimers: string[]
}

interface ApiError {
  error: { code: 'TEAM_NOT_FOUND' | 'INVALID_PARAMETER' | 'INSUFFICIENT_SAMPLE' | 'DATA_UNAVAILABLE'
           message: string; details: Record<string, unknown> }
}
```

## Endpoints

| Método y ruta | Parámetros | Respuesta | Errores |
|---|---|---|---|
| `GET /api/meta` | n/a | `Meta` | 503 `DATA_UNAVAILABLE` |
| `GET /api/teams/{abbr}/diagnosis` | `perspective` (`offense` por defecto) | `Diagnosis` | 404 `TEAM_NOT_FOUND`, 422 `INVALID_PARAMETER` |
| `GET /api/teams/{abbr}/slices` | `dimension`, `perspective` | `SliceTable` | 404, 422 |
| `POST /api/scenarios/preview` | cuerpo `ScenarioRequest` | `ScenarioPreview` | 404, 422, 422 `INSUFFICIENT_SAMPLE` si la necesidad no tiene n suficiente |

## Reglas de contenido

- `verdict` y `rank` ya vienen resueltos: el frontend no calcula ni reordena.
- Un segmento con `sampleFlag = 'low'` nunca aparece en `attention` ni en `strengths`. Con `'hidden'` no se devuelve.
- `manualRecord`, `strategy`, `futureAssetNote` y `partnerTeam` manual no modifican ninguna métrica; solo aparecen en `assumptions`.
- Ningún texto del backend afirma disponibilidad, valor, viabilidad o aceptación de un trade.
- El handler de errores reemplaza el 422 por defecto de FastAPI por `ApiError`.

## Pendiente de validar

- Métrica principal: `playResult` o `prePenaltyPlayResult` (Tarea 1.2).
- Umbrales (`minDisplay=20`, `minFinding=50`, `explosiveYards=20`) y cubetas de distancia (corta <=3, media 4-7, larga >=8).
- Valores exactos de `bucket` por dimensión; Persona 1 los lista en `/api/meta` o en este documento al terminar la Tarea 1.2.
