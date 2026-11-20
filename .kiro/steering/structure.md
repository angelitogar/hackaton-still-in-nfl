# NFL TRADE BOWL: estructura

## Raíz de trabajo y Git

- La raíz operativa y repositorio principal es `hackathon-unam/`: aquí están los datos, el entorno, el backend y el dashboard que se ejecutan y empaquetan.
- Hay una sola copia de trabajo, conectada al repositorio compartido. El clon anidado se retiró del proyecto y se guardó como respaldo fuera de él.
- La rama `p2/dashboard-mvp` sigue `origin/main` para integrar cambios, pero los cambios locales todavía deben revisarse y compartirse explícitamente. No hagas push ni fusiones destructivas por tu cuenta.
- No se versionan `data/`, `.venv/`, `node_modules/`, `dist/`, `.env` ni las herramientas del instalador.

## Estructura real

Proyecto instalado:

```text
hackathon-unam/
├── README.md                  # requerido por --entregar
├── backend/                   # Python (FastAPI)
│   ├── __init__.py
│   ├── main.py                # API y GET /health
│   ├── analysis.py            # análisis histórico en memoria
│   └── tests/                 # pruebas del backend
├── dashboard/                 # React + Vite + TypeScript + Tailwind 3
│   ├── index.html
│   ├── package.json, package-lock.json
│   ├── vite.config.ts, tailwind.config.js, postcss.config.js, tsconfig.json
│   └── src/ (main.tsx, App.tsx, index.css)
├── data/                      # solo lectura: games.csv, plays.csv, players.csv, tracking/
├── docs/                      # plan, contrato, prompts
├── .hackathon/                # instalador del evento: no mover ni editar
├── .kiro/steering/            # rules.md + product, tech, structure, conventions
└── .venv/                     # no mover
```

La app se ejecuta desde esta raíz. No uses el antiguo flujo de copia entre repositorios.

No se mueven `.hackathon/`, `.venv/` ni `.kiro/`, ni se cambia la estructura de carpetas del proyecto instalado.

## Dónde va el código nuevo

| Persona | Responsable de | Estructura propuesta |
|---|---|---|
| 1 | `backend/**`, `docs/CONTRATO_API.md` | `backend/api/` (routers), `backend/domain/` (carga, derivados, métricas, hallazgos, escenarios), `backend/schemas.py`, `backend/tests/` |
| 2 | `dashboard/src/**`, `dashboard/index.html`, `dashboard/vite.config.ts`, `README.md` | `src/api/`, `src/types/api.ts`, `src/components/`, `src/features/diagnosis/`, `src/features/scenario/`, `src/hooks/`, `src/lib/`, `src/mocks/` |
| Compartido | `docs/CONTRATO_API.md` ↔ `src/types/api.ts` | Solo se cambian con una rama `contract/<cambio>` y aprobación de ambos |

Criterio: un archivo, un dueño. Si algo cruza ambos lados, se discute en el contrato antes de escribirlo.
