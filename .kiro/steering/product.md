# NFL TRADE BOWL: producto

> Las reglas de stack y despliegue de `rules.md` tienen prioridad sobre este archivo.

## Propósito

Herramienta para explorar cómo está construido un equipo de la NFL y plantear **escenarios hipotéticos** de mejora. Parte de un diagnóstico histórico (muestra 2021, semanas 1 a 8) y termina en un laboratorio donde el usuario formula supuestos. No recomienda transacciones reales.

## Usuarios

- **Propuesto:** jueces del hackathon y analistas deportivos con conocimiento básico de la NFL.
- **Pendiente:** confirmar si hay un usuario principal más específico.

## Requisitos confirmados

- Alcance "escenario A": diagnóstico histórico + laboratorio de escenarios hipotéticos.
- El diagnóstico usa **cualquier tipo de jugada** que aporte valor, no solo terceras oportunidades.
- La estrategia `competir` o `reconstruir` la elige el usuario a mano. Nunca se calcula.
- El récord es opcional, lo escribe el usuario, indica su temporada y **no entra en ningún cálculo**.
- Trades, perfiles de socios y activos futuros son exploración hipotética. Importa la funcionalidad del MVP, no el realismo del mercado.
- Interfaz en español; código y API en inglés; estilo oscuro tipo "war room", escritorio primero.

## Flujo principal

1. Elegir equipo y perspectiva (ataque o defensa).
2. Ver el diagnóstico: resumen, áreas de atención, fortalezas, mezcla de resultados y advertencias.
3. Elegir una necesidad (un hallazgo) y abrir el laboratorio.
4. Indicar estrategia, posición objetivo, socio (calculado o manual) y activo futuro (texto libre).
5. Leer el resumen del escenario: evidencia calculada, supuestos manuales y datos que faltan.

## Propuestas de método (configurables, a validar)

- Métricas por segmento: yardas medias según `playResult`, tasa explosiva (`playResult >= 20`), tasa negativa (`playResult < 0`), mezcla de etiquetas crudas de `passResult`.
- Segmentos: `down`, `distanceBucket` (corta <=3, media 4-7, larga >=8), `quarter`, `clockWindow`, `fieldZone`, `offenseFormation`, `playAction`, `coverageType`.
- Referencia: mediana de los 32 equipos de la misma muestra, mismo segmento y perspectiva.
- Muestra: n < 20 se oculta; 20 a 49 se muestra como "muestra baja" y no es hallazgo; n >= 50 puede ser hallazgo.
- Intervalo: media ± 1.96 · error estándar. Si incluye la mediana de liga, el veredicto es "no concluyente".
- Máximo 3 áreas de atención y 3 fortalezas, rotuladas "tendencia observada", no "debilidad".

## Fuera del MVP

Tracking, IA con Bedrock, equipos especiales, profundidad real de plantilla, trades, agentes libres o picks reales, recomendación automática de competir o reconstruir.

## Limitaciones de los datos y su efecto

| Limitación | Efecto en el producto |
|---|---|
| Solo 2021, semanas 1 a 8 | Toda cifra lleva la etiqueta de muestra histórica; nunca se habla del presente. |
| `plays.csv` no está documentado como universo completo | Se dice "jugadas disponibles", no "todas las jugadas". |
| Sin diccionario de `playResult`, `passResult` ni campos PFF | Se muestran como etiquetas crudas. En penalizaciones `playResult` incluye las yardas de la falta. |
| Sin contratos, roster, cap, agentes libres, picks ni valor de mercado | Panel permanente "Datos que faltan". No se afirma disponibilidad, valor ni viabilidad. |
| `players.csv` sin equipo | No se atribuye una debilidad a un jugador o posición. |
| Sin datos de equipos especiales | Eje excluido. |
| Tracking en 105 de 122 juegos; sin `pffScoutingData.csv` | No se usa en el MVP. |

## Criterios de éxito

- El diagnóstico de un equipo carga de punta a punta con n, intervalo y referencia visibles.
- El laboratorio produce un resumen que separa evidencia, supuestos y datos faltantes.
- Ninguna pantalla afirma disponibilidad, valor o viabilidad de un trade.
- La app funciona sin IA y `--entregar` termina sin errores.

## Decisiones pendientes

- Plazo real de entrega (se planifica con 8 h por persona).
- Si `playResult` o `prePenaltyPlayResult` es la métrica principal (se decide con una prueba en la Tarea 1.2).
