# NFL TRADE BOWL: técnica

> `rules.md` manda en stack, despliegue, IA y entrega. Aquí solo se concreta.

## Stack obligatorio (verificado contra lo instalado, sin diferencias)

| Capa | Versión |
|---|---|
| Python / uv | 3.12.12 / 0.11.19 (siempre dentro de `.venv`) |
| FastAPI / Uvicorn / Pydantic | 0.115.14 / 0.34.3 / 2.11.7 |
| pandas / NumPy | 2.2.3 / 2.1.3 |
| pytest / httpx | 8.3.5 / 0.28.1 |
| Node / npm | 22.23.1 / 10.x (instalado 10.9.8; no actualizar npm) |
| React / Vite / TypeScript | 18.3.1 / 5.4.21 / 5.7.3 (modo estricto) |
| Tailwind CSS / Recharts | 3.4.19 / 3.10.1 (sintaxis de Tailwind 3 solamente) |
| strands-agents / boto3 | 1.64.0 / 1.44.0 (no se usan en el MVP) |

No se agregan dependencias ni se cambian versiones sin aprobación. No hay formateador, linter ni runner de pruebas del frontend; no se instalan.

## Responsabilidades

- **Backend (`backend/`):** carga de CSV, campos derivados, métricas, hallazgos y escenarios. Toda la lógica analítica vive aquí.
- **Frontend (`dashboard/`):** presentación, estado de la interfaz y llamadas a la API. Sin cálculos analíticos.

## Datos

- Solo se leen `data/games.csv`, `data/plays.csv` y `data/players.csv`. El tracking no se carga.
- Rutas relativas a la raíz: `Path(__file__).resolve().parent.parent / "data"`. Solo lectura.
- Se cargan una vez al arrancar (unos 2.5 MB) y se calculan en memoria. No se escribe a disco.
- `playId` no es único: toda unión usa `(gameId, playId)`. Detalles en `hackaton-still-in-nfl/CONTEXTO_DATOS.md`; el conteo de tracking de ese documento (37 archivos) está desactualizado: hoy son 105 de 122 juegos.

## API

Contrato en `docs/CONTRATO_API.md`. Rutas bajo `/api`, JSON en camelCase (`alias_generator=to_camel`, verificado), errores con formato único, `GET /health` intacto.

## Comandos

| Comando | Estado |
|---|---|
| `.venv/bin/python -m pytest` | Verificado (`pytest 8.3.5`); aún sin pruebas del proyecto |
| `.venv/bin/python -c "import backend.main"` | Verificado: importa y registra `/health` |
| `npm run typecheck` (en `dashboard/`) | Verificado, sin errores |
| `npm run build` (en `dashboard/`) | Declarado, sin ejecutar |
| `npm run dev` (en `dashboard/`) / `.venv/bin/uvicorn backend.main:app --reload` | Declarados, sin ejecutar |
| `sh .hackathon/setup.sh --check` | Declarado; el log histórico es OK |
| `sh .hackathon/setup.sh --entregar` | Solo al final: compila y crea el zip |

`npm` debe correr con el Node portable en el PATH si no hay Node 22.23.1 en el sistema: `PATH=<proyecto>/.hackathon/.tools/node/bin:$PATH`.

## Decisiones técnicas

- Vite necesita proxy `/api` hacia `http://localhost:8000` y conservar `base: './'` (pendiente de configurar; lo hace la Persona 2).
- Llamadas del dashboard sin diagonal inicial: `fetch('api/...')`. `dashboard/index.html` usa `/src/main.tsx` por defecto de Vite; el guard de entrega solo revisa `src/`, así que se revisa a mano.
- `npm run build` falla con errores de tipos; `--entregar` solo avisa. Se corrige siempre con `typecheck`.
- IA fuera del MVP. Si se añade: solo Bedrock con Nova, y la app debe funcionar sin ella.

## Pendiente

- Tamaño del zip: `--entregar` siempre incluye `data/` (unos 730 MB con tracking) y avisa desde 500 MB. Consultar a los organizadores.
