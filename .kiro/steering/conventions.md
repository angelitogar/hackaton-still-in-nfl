# NFL TRADE BOWL: convenciones

## Confirmadas

- Código limpio, componentes pequeños y reutilizables, lógica de negocio separada de la presentación.
- TypeScript estricto y sin `any`.
- Sin dependencias nuevas sin justificarlas y obtener aprobación. Sin formateador, linter ni runner nuevos.
- Se conserva la arquitectura existente; los cambios significativos se explican antes de implementarlos.
- Pruebas para la lógica de negocio importante.
- Interfaz, README y documentación de producto en español. Código, nombres de API y modelos en inglés.
- Estilo visual: oscuro tipo "war room", denso, escritorio primero.

## Propuestas adoptadas por defecto

- Nombres: `snake_case` en Python, `camelCase` en JSON y TypeScript, `PascalCase` en componentes y tipos, `kebab-case` en carpetas de features si hay varias palabras.
- Commits: `tipo(área): descripción` (`feat`, `fix`, `test`, `docs`, `chore`). Ramas `p1/<tema>`, `p2/<tema>`, `contract/<cambio>`.
- Un PR pequeño por tarea, revisado por la otra persona. `git pull --rebase origin main` antes de subir.
- La raíz operativa es también un repositorio Git. Compara las dos copias antes de sincronizar; evita scripts que sobrescriban cambios sin revisarlos.
- Cada archivo tiene un solo dueño; el ajeno solo se toca por acuerdo.

## Datos y lenguaje del producto

- Etiquetas crudas (`C`, `I`, `S`, `R`, `IN`, campos PFF) se muestran tal cual.
- Se dice "tendencia observada" y "muestra 2021", nunca "debilidad confirmada", "conversión oficial" ni "equipo actual".
- Prohibido afirmar disponibilidad, valor de mercado, viabilidad, equidad o aceptación de un trade.
- Los datos manuales se rotulan "dato manual, no verificado" y no entran en cálculos.
- Toda cifra muestra su n y la muestra de la que sale.

## Validación antes de dar una tarea por terminada

- Backend: pytest de la lógica tocada y `import backend.main` sin errores.
- Frontend: `npm run typecheck` y, al cerrar una funcionalidad, `npm run build`.
- Integración: ambos lados contra el contrato real, sin mocks.
- Antes de entregar: `sh .hackathon/setup.sh --check`, luego `--entregar`.

## Automatizaciones

No hay hooks de Kiro configurados. Propuesta pendiente de aprobación: un hook `PostTaskExec` que ejecute `npm run typecheck` tras tareas del frontend. No existe formateador ni linter, así que no se propone un hook de formato.

## Seguridad

Sin llaves ni credenciales en código, README o logs. `.env` no se versiona. No se leen ni exigen `AWS_*`.
