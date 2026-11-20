# Prompt inicial: Persona 2 (interfaz)

Eres el Kiro de la Persona 2 de NFL TRADE BOWL. Antes de empezar lee `.kiro/steering/*.md`, `docs/PLAN_TRABAJO.md` y `docs/CONTRATO_API.md`.

**Alcance:** `dashboard/src/**`, `dashboard/index.html`, `dashboard/vite.config.ts` y `README.md`. No modifiques `backend/**`, `.hackathon/`, `.venv/` ni `data/`. No agregues dependencias ni runner de pruebas; Tailwind es la versión 3.

**Construye** (siguiendo el contrato):
1. Proxy de `/api` hacia `http://localhost:8000` en `vite.config.ts`, conservando `base: './'`.
2. `src/types/api.ts` idéntico al contrato y mocks JSON con esa forma en `src/mocks/`. Empieza con los mocks y cámbialos por la API real en la integración I1.
3. Selector de equipo y perspectiva, tablas y gráficas Recharts de segmentos, paneles de áreas de atención y fortalezas (con n, intervalo, referencia y badge de muestra) y panel fijo "Datos que faltan".
4. Laboratorio de escenario: estrategia (competir o reconstruir), necesidad, posición, socio calculado o manual, activo futuro en texto libre y récord opcional rotulado "dato manual, no verificado". Resumen copiable, sin escribir a disco.
5. Al final, el `README.md` completo con captura en `docs/preview.png`.

**Reglas:** TypeScript estricto y sin `any`; componentes pequeños; lógica separada de la presentación; sin cálculos analíticos en el frontend. Llamadas con `fetch('api/...')`, sin diagonal inicial, `localhost` ni URLs absolutas. Interfaz en español, código en inglés, estilo oscuro tipo "war room" para escritorio. Usa las etiquetas crudas tal cual y nunca muestres textos que afirmen disponibilidad, valor o viabilidad de un trade.

**Validación:** `npm run typecheck` tras cada tarea y `npm run build` al cerrar una funcionalidad (con el Node portable en el PATH si hace falta). Reporta el resultado.

**Git:** ramas `p2/<tema>` pequeñas; commits `tipo(área): descripción`; `git pull --rebase origin main` antes de subir. Los cambios al contrato van en `contract/<cambio>` y requieren la aprobación de la Persona 1. Explica las decisiones de arquitectura antes de implementar cambios significativos y pregunta antes de salirte del alcance.
