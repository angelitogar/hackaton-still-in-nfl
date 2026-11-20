# NFL TRADE BOWL

Herramienta para explorar cómo está construido un equipo de la NFL y plantear escenarios hipotéticos de mejora.

Equipo Still-In: Miguel Angel Jimenez y Angel Daniel Garcia.

## Qué hace

- Diagnostica un equipo con las jugadas de 2021 (semanas 1 a 8), en ataque o defensa.
- Compara cada segmento de jugada (down, distancia, cuarto, reloj, zona de campo, formación, play action y cobertura) con la mediana de los 32 equipos de la muestra, mostrando tamaño de muestra e intervalo.
- Presenta áreas de atención y fortalezas como tendencias observadas.
- Permite armar un escenario hipotético: estrategia (competir o reconstruir), necesidad, posición objetivo, socio calculado o elegido a mano y activo futuro.

## Qué no hace

Los datos no incluyen contratos, rosters, agentes libres, picks ni valor de mercado. Por eso nada de lo que muestra es una recomendación de trade ni afirma disponibilidad, viabilidad o valor. Los datos manuales (estrategia, récord, activos) se rotulan como supuestos y no influyen en los cálculos. El tracking no se usa en esta versión.

## Datos

`data/games.csv` (122 juegos), `data/plays.csv` (8,557 jugadas) y `data/players.csv` (1,679 jugadores). Es una muestra histórica de 2021 y no representa plantillas actuales. Los códigos de `passResult` y los campos PFF se muestran como etiquetas crudas porque el conjunto no incluye diccionario.

## Cómo ejecutarlo

```sh
# Backend (desde la raíz del proyecto)
.venv/bin/uvicorn backend.main:app --reload

# Frontend (en otra terminal)
cd dashboard && npm run dev
```

Abre la dirección `localhost` que muestra Vite. Verificación del entorno: `sh .hackathon/setup.sh --check`.

**Datos de demostración o API real.** Mientras el backend no implemente los endpoints de `docs/CONTRATO_API.md`, el dashboard usa datos de ejemplo con la forma exacta del contrato y lo avisa con un banner. Para usar la API real: `VITE_USE_MOCKS=false npm run dev` (con Uvicorn en el puerto 8000; Vite reenvía `/api`).

Validación del frontend: `npm run typecheck` y `npm run build` dentro de `dashboard/`.

## Stack

Python 3.12 · FastAPI · pandas · React 18 · Vite · TypeScript · Tailwind 3 · Recharts

## Documentación

Plan y reparto de trabajo: `docs/PLAN_TRABAJO.md`. Contrato de la API: `docs/CONTRATO_API.md`. Contexto de los datos: `hackaton-still-in-nfl/CONTEXTO_DATOS.md`.

<!-- Pendiente (Fase 4): añadir la captura docs/preview.png y comprobar los comandos de ejecución. -->
![Vista previa](docs/preview.png)
