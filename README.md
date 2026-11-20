# NFL TRADE BOWL

Herramienta para explorar cómo está construido un equipo de la NFL y plantear escenarios hipotéticos de mejora.

Equipo Still-In: Miguel Angel Jimenez y Angel Daniel Garcia.

## Qué hace

- Diagnostica un equipo con las jugadas de 2021 (semanas 1 a 8), en ataque o defensa.
- Compara segmentos de jugadas de pase (down, distancia, cuarto, reloj, zona de campo, formación, play action y cobertura) con la mediana de equipos que tienen muestra suficiente; muestra el tamaño de muestra y un intervalo aproximado.
- Presenta áreas de atención y fortalezas como tendencias observadas.
- Permite armar un escenario hipotético: estrategia (competir o reconstruir), necesidad, posición objetivo, socio calculado o elegido a mano y activo futuro.

## Qué no hace

Los datos no incluyen contratos, rosters, agentes libres, picks ni valor de mercado. Por eso nada de lo que muestra es una recomendación de trade ni afirma disponibilidad, viabilidad o valor. Los datos manuales (estrategia, récord, activos) se rotulan como supuestos y no influyen en los cálculos. El tracking no se usa en esta versión.

## Datos

`data/games.csv`, `data/plays.csv` y `data/players.csv`. La muestra contiene jugadas de pase históricas de 2021, semanas 1 a 8; no representa todas las jugadas ni plantillas actuales. `playResult` incluye yardas por penalización. Los hallazgos son exploratorios y no establecen causalidad.

## Cómo ejecutarlo

```sh
# Backend (desde la raíz del proyecto)
.venv/bin/uvicorn backend.main:app --reload

# Frontend (en otra terminal)
cd dashboard
PATH="../.hackathon/.tools/node/bin:$PATH" npm run dev
```

Abre la dirección `localhost` que muestra Vite. Verificación del entorno: `sh .hackathon/setup.sh --check`.

**La aplicación usa la API real por defecto.** Para iniciar el modo de demostración con datos ficticios, usa `VITE_USE_MOCKS=true` al arrancar Vite. Los escenarios son hipotéticos y no afirman disponibilidad ni viabilidad de trades.

Validación: `OPENBLAS_NUM_THREADS=1 .venv/bin/python -m pytest -q backend/tests` desde la raíz. En `dashboard/`, antepón `PATH="../.hackathon/.tools/node/bin:$PATH"` a `npm run typecheck` y `npm run build`.

## Stack

Python 3.12 · FastAPI · pandas · React 18 · Vite · TypeScript · Tailwind 3 · Recharts

## Documentación

Plan y reparto de trabajo: `docs/PLAN_TRABAJO.md`. Contrato de la API: `docs/CONTRATO_API.md`. Contexto de los datos: `CONTEXTO_DATOS.md`.
