# NFL TRADE BOWL: estructura

## Raíz de trabajo y Git

- **Raíz operativa y de entrega:** `hackathon-unam/` (cada persona tiene la suya, instalada con `setup.sh`).
- **Repositorio compartido:** `git@github.com:angelitogar/hackaton-still-in-nfl.git`, rama `main`. La carpeta `hackaton-still-in-nfl/` es un clon antiguo de ese remoto y no es la raíz de ejecución, porque `setup.sh` no instala en carpetas no vacías.
- Decisión confirmada (opción A): cada raíz instalada se conecta al remoto compartido. El procedimiento está en `docs/PLAN_TRABAJO.md`, Tarea 0.
- Fuera de Git: `data/`, `.venv/`, `node_modules/`, `dist/`, `.env`, `.hackathon/.tools/`, `.hackathon/.cache/`.

## Estructura real

```text
hackathon-unam/
├── README.md                  # requerido por --entregar
├── backend/                   # Python (FastAPI)
│   ├── __init__.py
│   └── main.py                # expone app y GET /health
├── dashboard/                 # React + Vite + TypeScript + Tailwind 3
│   ├── index.html
│   ├── package.json, package-lock.json
│   ├── vite.config.ts, tailwind.config.js, postcss.config.js, tsconfig.json
│   └── src/ (main.tsx, App.tsx, index.css)
├── data/                      # solo lectura: games.csv, plays.csv, players.csv, tracking/
├── docs/                      # plan, contrato, prompts
├── .hackathon/                # instalador del evento: no mover ni editar
├── .kiro/steering/            # rules.md + product, tech, structure, conventions
├── .venv/                     # no mover
└── hackaton-still-in-nfl/     # clon antiguo del remoto
```

No se mueven `.hackathon/`, `.venv/` ni `.kiro/`, ni se cambia la estructura de carpetas.

## Dónde va el código nuevo

| Persona | Responsable de | Estructura propuesta |
|---|---|---|
| 1 | `backend/**`, `docs/CONTRATO_API.md` | `backend/api/` (routers), `backend/domain/` (carga, derivados, métricas, hallazgos, escenarios), `backend/schemas.py`, `backend/tests/` |
| 2 | `dashboard/src/**`, `dashboard/index.html`, `dashboard/vite.config.ts`, `README.md` | `src/api/`, `src/types/api.ts`, `src/components/`, `src/features/diagnosis/`, `src/features/scenario/`, `src/hooks/`, `src/lib/`, `src/mocks/` |
| Compartido | `docs/CONTRATO_API.md` ↔ `src/types/api.ts` | Solo se cambian con una rama `contract/<cambio>` y aprobación de ambos |

Criterio: un archivo, un dueño. Si algo cruza ambos lados, se discute en el contrato antes de escribirlo.
