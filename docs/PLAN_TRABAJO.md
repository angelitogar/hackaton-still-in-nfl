> **Actualización:** El flujo de dos carpetas y `scripts/sync.sh` descrito abajo está obsoleto. Existe una sola carpeta de trabajo: `hackathon-unam/`, vinculada al repositorio compartido. Los cambios locales aún no están publicados.

# Plan de trabajo en paralelo: NFL TRADE BOWL

Base: unas **8 h efectivas por persona** (plazo real pendiente). Si el plazo cambia, se escalan los bloques. Producto en `.kiro/steering/product.md`, contrato en `docs/CONTRATO_API.md`.

## Responsabilidades

| | Persona 1: datos y API | Persona 2: interfaz |
|---|---|---|
| Propio | `backend/**`, `docs/CONTRATO_API.md`, `.kiro/steering/*` | `dashboard/src/**`, `dashboard/index.html`, `dashboard/vite.config.ts`, `README.md` |
| No tocar | `dashboard/**` | `backend/**` |
| Compartido | `docs/CONTRATO_API.md` ↔ `dashboard/src/types/api.ts`, solo por rama `contract/<cambio>` | idem |

## Fases

| Fase | Persona 1 | Persona 2 | Integración |
|---|---|---|---|
| **0 · Cimientos** (0:00-0:45) | 0.1 Clonar la carpeta compartida y probar `scripts/sync.sh` (ver abajo). 0.2 `sh .hackathon/setup.sh --check`. 0.3 Subir línea base de `backend/` y docs. | 0.1 Igual. 0.2 `--check`. 0.3 Subir línea base de `dashboard/`, proxy `/api` en `vite.config.ts`, `types/api.ts` y mocks con la forma del contrato. | Ambos con `main` actualizado y el contrato en mano |
| **1 · Base** (0:45-3:00) | 1.1 `GET /api/meta` real. 1.2 Carga de CSV y campos derivados (`yardsToEndzone`, `fieldZone`, `distanceBucket`, `clockWindow`) con pruebas; decidir `playResult` vs `prePenaltyPlayResult`. 1.3 `GET /slices` con mediana de liga, intervalo y banderas. Cierre: stubs con la forma del contrato. | 1.1 Layout, selector de equipo y perspectiva. 1.2 Tablas y gráficas Recharts contra mocks. 1.3 Estados de carga, vacío y error. | **I1 (3:00):** la UI pasa de mocks a `/meta` y `/slices` reales |
| **2 · Hallazgos** (3:00-5:00) | 2.1 `GET /diagnosis`: atención, fortalezas, `outcomeMix`, `caveats`. 2.2 Pruebas de umbrales y signo ataque/defensa. | 2.1 Paneles de atención y fortalezas con n, intervalo y badges. 2.2 Panel fijo "Datos que faltan". | **I2 (5:00):** diagnóstico completo |
| **3 · Escenarios** (5:00-6:30) | 3.1 `POST /scenarios/preview` (perfiles calculados o socio manual, avisos). 3.2 Pruebas con `httpx`. | 3.1 Laboratorio: estrategia, necesidad, posición, socio, activo futuro, récord manual. 3.2 Resumen copiable (sin escribir a disco). | **I3 (6:30):** escenario completo; **se congelan funciones** |
| **4 · Cierre** (6:30-8:00) | 4.1 Revisar tamaño del zip y `--check`. 4.2 Corregir bugs. | 4.1 README final con `docs/preview.png`. 4.2 Pulido visual. | **I4:** `--entregar` y revisión cruzada |

Una tarea está terminada cuando cumple el contrato, pasa sus validaciones y está en `main`.

**Si una parte se retrasa:** P1 atrasado, la UI sigue con mocks y se prioriza `/slices` y `/diagnosis`; el escenario se simplifica. P2 atrasado, se entregan tablas sin gráficas. A las 6:30 se retira lo inconcluso de la UI.

## Carpeta compartida y Git

**Decisión vigente:** el código se comparte en el repositorio `git@github.com:angelitogar/hackaton-still-in-nfl.git` (rama `main`), clonado en `hackaton-still-in-nfl/`. Todo el trabajo se versiona ahí. La app se **ejecuta y se entrega** desde el proyecto instalado con `setup.sh` (`hackathon-unam/`), porque `setup.sh` y `--entregar` exigen `backend/`, `dashboard/` y `data/` en esa raíz. El proyecto instalado no es un repositorio Git.

`scripts/sync.sh` copia entre ambas carpetas solo código y documentos: `backend/`, `dashboard/` (sin `node_modules` ni `dist`), `README.md`, `docs/` y los cuatro archivos de steering de producto. No toca `data/`, `.venv`, `.hackathon`, `rules.md` ni `.env`.

### Flujo de trabajo

1. En la carpeta compartida: `git switch main && git pull --rebase origin main`, y luego `git switch -c p<N>/<tema>`.
2. `sh scripts/sync.sh pull` trae lo último al proyecto instalado.
3. Trabaja y valida en el proyecto instalado (`npm run typecheck`, pytest, etc.).
4. `sh scripts/sync.sh push <área>` devuelve tu trabajo a la carpeta compartida. Cada persona empuja **solo su área**:
   - Persona 1: `backend` y `docs`.
   - Persona 2: `dashboard` (incluye `README.md`).
5. En la carpeta compartida: `git status`, `git diff`, commit, `git pull --rebase origin main` y push de tu rama. La otra persona revisa antes del merge a `main`.

Si la carpeta compartida no está dentro del proyecto, usa `PROJECT_DIR=/ruta/al/proyecto sh scripts/sync.sh ...`.

### Reglas

- `main` solo recibe merges revisados por la otra persona. Ramas `p1/<tema>`, `p2/<tema>`, `contract/<cambio>`, de unos 90 minutos como máximo.
- Commits `tipo(área): descripción`. No uses `reset --hard`.
- Un archivo, un dueño. `package-lock.json` y `requirements.*` no se tocan sin aprobación.
- Antes de un `pull`, comprueba que no tienes cambios sin empujar en el proyecto: se sobrescriben.
- El script no borra archivos. Si eliminas uno, bórralo a mano en ambos lados.
- `data/` no va en Git: se comparte aparte (unidad compartida o copia directa) y debe quedar idéntica en ambas máquinas.

## Validaciones

| Qué | Comando | Estado |
|---|---|---|
| Typecheck | `npm run typecheck` en `dashboard/` | Verificado |
| Build | `npm run build` en `dashboard/` | Declarado |
| Backend | `.venv/bin/python -m pytest` y `import backend.main` | Verificados; aún sin pruebas del proyecto |
| Entorno / entrega | `sh .hackathon/setup.sh --check` / `--entregar` | Declarados |

Pruebas de negocio mínimas: `yardsToEndzone` (incluye `yardlineSide` vacío en la 50), cubetas, umbrales de muestra, signo ataque/defensa, mediana de liga, formato de error y que ningún texto afirme disponibilidad o viabilidad. El frontend no tiene runner; se valida con `typecheck`, `build` y revisión manual.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Zip de ~730 MB (`--entregar` incluye siempre `data/`; avisa desde 500 MB) | Consultar a los organizadores; no se borra nada sin autorización |
| Hallazgos espurios por muestras pequeñas | Umbrales, intervalos, "no concluyente", máximo 3 por sentido |
| `playResult` sin documentar (incluye yardas de falta) | Etiquetarlo y probar el caso |
| Rutas con diagonal inicial en `index.html` | Revisión manual; el guard solo mira `src/` |
| Entornos distintos | `--check` en la Fase 0 |
| Cambios de contrato | Rama `contract/` con aprobación de ambos |

## Lista de entrega

1. `README.md` no vacío en la raíz, con imagen.
2. `sh .hackathon/setup.sh --check` en OK.
3. `npm run typecheck` y `npm run build` sin errores.
4. Sin diagonal inicial ni `localhost` en el dashboard.
5. Sin `.env` ni credenciales en código.
6. pytest en verde.
7. Tamaño del zip confirmado.
8. `sh .hackathon/setup.sh --entregar` y subida del `.zip`.
