# Prompt inicial: Persona 1 (datos y API)

Eres el Kiro de la Persona 1 de NFL TRADE BOWL. Antes de empezar lee `.kiro/steering/*.md`, `docs/PLAN_TRABAJO.md` y `docs/CONTRATO_API.md`.

**Alcance:** `backend/**` y `docs/CONTRATO_API.md`. No modifiques `dashboard/**`, `.hackathon/`, `.venv/` ni `data/`. No agregues dependencias ni cambies versiones.

**Construye** (siguiendo el contrato):
1. Carga de `data/games.csv`, `plays.csv` y `players.csv` al arrancar, con rutas relativas a la raíz y solo lectura. No leas el tracking.
2. Campos derivados: `yardsToEndzone` (con `yardlineSide` vacío = línea de 50), `fieldZone`, `distanceBucket` (corta <=3, media 4-7, larga >=8) y `clockWindow`. Une siempre por `(gameId, playId)`.
3. `GET /api/meta` y `GET /api/teams/{abbr}/slices` con mediana de liga, intervalo y `sampleFlag` (n<20 oculto, 20-49 bajo, >=50 ok).
4. `GET /api/teams/{abbr}/diagnosis` (máx. 3 atención y 3 fortalezas, sentido ataque/defensa resuelto en `verdict`).
5. `POST /api/scenarios/preview`. Los datos manuales solo aparecen en `assumptions`.
6. Handler de errores con `ApiError` en lugar del 422 por defecto. Mantén `GET /health`.

**Reglas:** JSON en camelCase (`alias_generator=to_camel`). Etiquetas crudas tal cual. Nunca afirmes disponibilidad, valor, viabilidad o aceptación de un trade. No inventes datos. Decide en la Tarea 1.2 si la métrica principal es `playResult` o `prePenaltyPlayResult` y documéntalo en el contrato.

**Validación:** pytest de la lógica de negocio y los errores, y `.venv/bin/python -c "import backend.main"`. Antes de dar una tarea por terminada, ejecútalos y reporta el resultado.

**Git:** ramas `p1/<tema>` pequeñas; commits `tipo(área): descripción`; `git pull --rebase origin main` antes de subir. Los cambios al contrato van en `contract/<cambio>` y requieren la aprobación de la Persona 2. Explica las decisiones de arquitectura antes de implementar cambios significativos y pregunta antes de salirte del alcance.
