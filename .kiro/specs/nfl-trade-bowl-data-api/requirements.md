# Requirements Document

## Introduction

Esta especificación cubre el backend de datos y API de NFL TRADE BOWL (Persona 1). El Backend carga `games.csv`, `plays.csv` y `players.csv` al arrancar, calcula campos derivados y métricas por segmento, y expone `GET /api/meta`, `GET /api/teams/{abbr}/slices`, `GET /api/teams/{abbr}/diagnosis` y `POST /api/scenarios/preview` según `docs/CONTRATO_API.md`. La muestra es 2021, semanas 1 a 8. El Backend mantiene `GET /health`.

Alcance: `backend/**` y `docs/CONTRATO_API.md`. Quedan fuera `dashboard/**`, `.hackathon/`, `.venv/`, `data/`, el tracking, la IA con Bedrock y cualquier dependencia nueva. Los cambios al contrato van en una rama `contract/<cambio>` con aprobación de la Persona 2.

Fuentes consultadas: `docs/CONTRATO_API.md`, `docs/PLAN_TRABAJO.md`, `docs/PROMPT_PERSONA_1.md`, `CONTEXTO_DATOS.md` y `.kiro/steering/*.md` (ubicados en `hackaton-still-in-nfl/`).

## Glossary

- **Backend**: Aplicación FastAPI en `backend/main.py` que expone `app`.
- **Data_Loader**: Componente que lee `games.csv`, `plays.csv` y `players.csv` desde `data/` al arrancar.
- **Derived_Fields_Calculator**: Componente que calcula `yardsToEndzone`, `fieldZone`, `distanceBucket` y `clockWindow` por jugada.
- **Metrics_Engine**: Componente que calcula por equipo, perspectiva, dimensión y bucket: n, `avgPlayResult`, `explosiveRate`, `negativeRate`, `ci`, `leagueMedian`, `diff`, `percentile`, `sampleFlag` y `verdict`.
- **Findings_Engine**: Componente que selecciona y ordena las listas `attention` y `strengths` de un diagnóstico.
- **Scenario_Engine**: Componente que arma la vista previa de un escenario hipotético.
- **Error_Handler**: Componente que convierte errores en respuestas `ApiError`.
- **Primary_Metric**: Columna de `plays.csv` usada como resultado de jugada en `avgPlayResult`, `explosiveRate` y `negativeRate`. Candidatas: `playResult` y `prePenaltyPlayResult`.
- **Play_Key**: Par `(gameId, playId)`. `playId` solo no es único.
- **Perspective**: `offense` (equipo en `possessionTeam`) o `defense` (equipo en `defensiveTeam`).
- **Dimension**: Una de `down`, `distanceBucket`, `quarter`, `clockWindow`, `fieldZone`, `offenseFormation`, `playAction`, `coverageType`.
- **Bucket**: Valor de una Dimension. Las etiquetas crudas de `plays.csv` (`C`, `I`, `S`, `R`, `IN`, campos PFF) se conservan tal cual.
- **SampleFlag**: `hidden` si n < 20, `low` si 20 <= n <= 49, `ok` si n >= 50.
- **Verdict**: `favorable`, `adverse` o `inconclusive`, ya resuelto según Perspective.
- **League_Median**: Mediana de `avgPlayResult` de los 32 equipos para el mismo segmento y Perspective, entre equipos con n suficiente.
- **Manual_Input**: Datos escritos por el usuario: `strategy`, `manualRecord`, `futureAssetNote` y `partnerTeam` manual.
- **ApiError**: Cuerpo de error `{error: {code, message, details}}` definido en el contrato.
- **Trade_Claim**: Texto que afirma disponibilidad, valor, viabilidad, equidad o aceptación de un trade.

## Requirements

### Requirement 1: Carga de datos al arrancar

**User Story:** Como Persona 2 (interfaz), quiero que el Backend tenga los datos cargados al iniciar, para que las respuestas de la API no dependan de leer archivos por petición.

#### Acceptance Criteria

1. WHEN el Backend arranca, THE Data_Loader SHALL leer `data/games.csv`, `data/plays.csv` y `data/players.csv` usando rutas relativas a la raíz del proyecto, y SHALL completar la carga de los tres archivos antes de que el Backend acepte la primera petición.
2. THE Data_Loader SHALL abrir los archivos de `data/` solo en modo lectura.
3. THE Data_Loader SHALL omitir la lectura de cualquier archivo bajo `data/tracking/`.
4. THE Backend SHALL mantener los datos cargados en memoria sin escribir archivos en disco.
5. WHEN el Backend atiende una petición a un endpoint de datos después de una carga exitosa, THE Backend SHALL responder usando solo los datos en memoria, sin abrir ningún archivo de `data/`.
6. IF un CSV requerido no existe, no se puede leer o no se puede interpretar como CSV, THEN THE Backend SHALL completar su arranque, mantener `GET /health` disponible y responder 503 con el código `DATA_UNAVAILABLE` en todos los endpoints de datos, sin cargar parcialmente los archivos restantes.
7. IF el Backend responde 503 con `DATA_UNAVAILABLE`, THEN THE Backend SHALL incluir en la respuesta un mensaje que indique cuál archivo requerido falló, sin incluir rutas absolutas del sistema de archivos ni credenciales.
8. WHEN el Backend carga `plays.csv`, THE Data_Loader SHALL conservar sin modificar los valores de `playResult`, `prePenaltyPlayResult`, las etiquetas de `passResult` y las columnas con prefijo `pff_`, sin recodificarlas, sin convertir vacíos en otro valor y sin eliminar filas por tener valores nulos en esas columnas.
9. WHEN se recibe `GET /health`, THE Backend SHALL responder con código 200 y el cuerpo exacto `{"status": "ok"}`.
10. WHEN `backend/main.py` se importa, THE Backend SHALL ejecutar `cargar_env()` antes de crear cualquier cliente de boto3 y antes de leer variables de entorno, usando el código definido en las reglas del proyecto, y SHALL arrancar sin leer, validar ni exigir `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` ni `AWS_SESSION_TOKEN`.
11. IF el archivo `.env` no existe, THEN THE Backend SHALL arrancar con normalidad sin devolver error ni registrar mensajes de advertencia sobre credenciales.

### Requirement 2: Campos derivados por jugada

**User Story:** Como analista, quiero segmentos de campo, distancia y reloj consistentes, para comparar equipos en situaciones equivalentes.

#### Acceptance Criteria

1. THE Derived_Fields_Calculator SHALL unir `plays`, `games` y `players` solo por Play_Key (`gameId` y `playId`) o por `gameId` y `nflId`, sin usar `playId` aislado, `playDescription` ni `displayName`.
2. WHEN `yardlineSide` es igual a `possessionTeam`, THE Derived_Fields_Calculator SHALL calcular `yardsToEndzone` como `100 - yardlineNumber`.
3. WHEN `yardlineSide` no es vacío y es distinto de `possessionTeam`, THE Derived_Fields_Calculator SHALL calcular `yardsToEndzone` como `yardlineNumber`.
4. WHEN `yardlineSide` está vacío y `yardlineNumber` es igual a 50, THE Derived_Fields_Calculator SHALL calcular `yardsToEndzone` como 50.
5. WHEN `yardsToEndzone` tiene valor, THE Derived_Fields_Calculator SHALL asignar exactamente un valor de `fieldZone` a partir de `yardsToEndzone`, con los cortes numéricos de cada zona (límites inferior y superior inclusivos o exclusivos) y los nombres de zona documentados en `docs/CONTRATO_API.md`, sin huecos ni traslapes entre zonas para valores de 0 a 100.
6. WHEN `yardsToGo` es un entero menor o igual a 3 y mayor o igual a 1, THE Derived_Fields_Calculator SHALL asignar `distanceBucket` igual a `short`.
7. WHEN `yardsToGo` es un entero entre 4 y 7 inclusive, THE Derived_Fields_Calculator SHALL asignar `distanceBucket` igual a `medium`.
8. WHEN `yardsToGo` es un entero mayor o igual a 8, THE Derived_Fields_Calculator SHALL asignar `distanceBucket` igual a `long`.
9. WHEN `quarter` y `gameClock` (formato `mm:ss`, con minutos de 0 a 15 y segundos de 0 a 59) son interpretables, THE Derived_Fields_Calculator SHALL asignar exactamente un valor de `clockWindow`, con los nombres de ventana y los cortes por `quarter` y tiempo restante documentados en `docs/CONTRATO_API.md`.
10. IF `gameClock` no se puede interpretar con el formato `mm:ss` indicado, o `yardlineNumber` no es un entero entre 0 y 50 inclusive, o `yardsToGo` no es un entero mayor o igual a 1, THEN THE Derived_Fields_Calculator SHALL dejar sin valor (nulo) solo los campos derivados que dependen del dato inválido, conservar la jugada y los demás campos derivados, y excluir esa jugada únicamente de las Dimension que usan esos campos.
11. THE Derived_Fields_Calculator SHALL asignar a `playAction` el valor crudo `0` o `1` de `pff_playAction` y a `coverageType` el valor crudo de `pff_passCoverageType`, sin recodificar ni normalizar; IF el valor crudo está ausente, THEN THE Derived_Fields_Calculator SHALL dejar el campo sin valor.
12. FOR ALL jugadas con `yardsToEndzone` calculado, THE Derived_Fields_Calculator SHALL producir `yardsToEndzone` entre 0 y 100 inclusive (propiedad de invariante).
13. FOR ALL valores enteros de `yardsToGo` mayores o iguales a 1, THE Derived_Fields_Calculator SHALL asignar exactamente un `distanceBucket` (propiedad de invariante).

### Requirement 3: Decisión de la métrica principal

**User Story:** Como Persona 1, quiero decidir con evidencia entre `playResult` y `prePenaltyPlayResult`, para que las yardas medias no mezclen yardas de falta sin que se declare.

#### Acceptance Criteria

1. WHEN se ejecuta la Tarea 1.2, THE Backend SHALL incluir una prueba que compare `playResult` con `prePenaltyPlayResult` en las jugadas con `penaltyYards` no nulo y que reporte, para cada columna, el número de jugadas comparadas, la media de yardas con dos decimales y la diferencia absoluta de medias entre ambas columnas.
2. THE Primary_Metric SHALL ser exactamente una de las dos columnas, `playResult` o `prePenaltyPlayResult`, usada sin sustituciones en `avgPlayResult`, `explosiveRate`, `negativeRate`, `ci` y `leagueMedian`.
3. WHEN la Primary_Metric queda decidida, THE `docs/CONTRATO_API.md` SHALL documentar la columna elegida, el motivo con las cifras de la prueba del criterio 1 y el efecto de las jugadas con falta sobre cada uno de los cinco campos del criterio 2, en una rama `contract/<cambio>`.
4. IF la decisión cambia el significado de un campo del contrato, THEN THE Persona 1 SHALL obtener la aprobación explícita y registrada de la Persona 2 en la solicitud de unión antes de unir el cambio a `main`, y THE Persona 1 SHALL NOT unir la rama mientras no exista esa aprobación.
5. THE Backend SHALL conservar el nombre de campo `avgPlayResult` con el mismo tipo numérico en todas las respuestas, independientemente de la Primary_Metric elegida.
6. IF la columna elegida como Primary_Metric contiene valores nulos en alguna jugada incluida en el cálculo, THEN THE Backend SHALL excluir esas jugadas de los cinco campos del criterio 2 y reportar el número de jugadas excluidas en la prueba del criterio 1.

### Requirement 4: Metadatos de la muestra

**User Story:** Como Persona 2, quiero un endpoint de metadatos, para poblar selectores y mostrar los límites de los datos.

#### Acceptance Criteria

1. WHEN llega `GET /api/meta`, THE Backend SHALL responder 200 con un objeto JSON que contiene exactamente las claves `season`, `weeks`, `teams`, `positions`, `dimensions`, `thresholds`, `dataset` y `limits`, sin valores nulos en ninguna de ellas.
2. WHEN llega `GET /api/meta`, THE Backend SHALL calcular `season` (entero de cuatro dígitos), `weeks.min` y `weeks.max` (enteros, con `weeks.min` ≤ `weeks.max`) y `dataset` (conteos enteros no negativos de juegos, jugadas y jugadores) a partir de los CSV cargados, con los valores recalculados en cada arranque y no escritos a disco.
3. WHEN llega `GET /api/meta`, THE Backend SHALL devolver en `thresholds` exactamente los valores numéricos `minDisplay` igual a 20, `minFinding` igual a 50 y `explosiveYards` igual a 20.
4. WHEN llega `GET /api/meta`, THE Backend SHALL devolver en `teams` la lista sin duplicados de las abreviaturas observadas en `possessionTeam` y `defensiveTeam`, ordenadas alfabéticamente en orden ascendente, excluyendo valores vacíos o nulos.
5. WHEN llega `GET /api/meta`, THE Backend SHALL devolver en `positions` la lista sin duplicados de los valores distintos no vacíos de `officialPosition` en `players.csv`, con el texto original de cada valor (sin cambios de mayúsculas ni recodificación), ordenada alfabéticamente en orden ascendente.
6. WHEN llega `GET /api/meta`, THE Backend SHALL devolver en `limits` una lista de textos no vacíos, con al menos un texto por cada uno de estos ocho temas de datos ausentes: contratos, roster, cap, agentes libres, picks, equipo de `players.csv`, equipos especiales y `pffScoutingData.csv`.
7. WHEN llega `GET /api/meta`, THE Backend SHALL devolver en `dimensions` cada Dimension con sus valores exactos de `bucket`, y THE Backend SHALL listar esos mismos valores exactos de `bucket` de cada Dimension en `docs/CONTRATO_API.md`, sin diferencias de texto entre ambos.
8. IF los datos no están cargados o los CSV no se pudieron leer, THEN THE Error_Handler SHALL responder 503 con el código de error `DATA_UNAVAILABLE` y un mensaje que indique que los datos no están disponibles, sin devolver ninguna de las claves de metadatos parciales, y SHALL responder 200 en las solicitudes posteriores a `GET /api/meta` una vez que los datos estén cargados.

### Requirement 5: Segmentos por equipo con referencia de liga

**User Story:** Como analista, quiero ver cada segmento de un equipo contra la mediana de liga con su muestra e intervalo, para juzgar cuánto confiar en la cifra.

#### Acceptance Criteria

1. WHEN llega `GET /api/teams/{abbr}/slices` con `abbr` de uno de los 32 equipos, `dimension` perteneciente a las Dimensions documentadas en el contrato y `perspective` igual a `offense` o `defense`, THE Backend SHALL responder 200 con una `SliceTable` cuyas filas son `SliceMetric` de esa Dimension, una por Bucket con `sampleFlag` distinto de `hidden`.
2. IF `abbr` no corresponde a ninguno de los 32 equipos, o `dimension` o `perspective` no pertenecen a los valores documentados en el contrato, o falta alguno de los parámetros, THEN THE Backend SHALL responder 4xx con un cuerpo de error que indique el parámetro inválido y SHALL NOT devolver filas parciales.
3. THE Metrics_Engine SHALL calcular n como el número de jugadas del equipo en el Bucket para la Perspective solicitada, contando solo jugadas con Primary_Metric no nula.
4. THE Metrics_Engine SHALL calcular `avgPlayResult` como la media de la Primary_Metric, `explosiveRate` como la fracción con Primary_Metric mayor o igual a `explosiveYards`, y `negativeRate` como la fracción con Primary_Metric menor que 0, ambas fracciones en el rango de 0 a 1.
5. THE Metrics_Engine SHALL calcular `ci` como la media más y menos 1.96 por el error estándar de la media, donde el error estándar es la desviación estándar muestral (denominador n − 1) dividida entre la raíz de n.
6. WHEN n es igual a 1, THE Metrics_Engine SHALL devolver `ci` con `low` y `high` iguales a `avgPlayResult`.
7. THE Metrics_Engine SHALL calcular `leagueMedian` como la mediana de `avgPlayResult` de los equipos con n mayor o igual a `minDisplay` en el mismo Bucket y Perspective, hasta un máximo de 32 equipos.
8. IF ningún equipo tiene n mayor o igual a `minDisplay` en el Bucket y Perspective, THEN THE Metrics_Engine SHALL devolver `leagueMedian`, `diff` y `percentile` como nulos y `verdict` igual a `inconclusive`.
9. THE Metrics_Engine SHALL calcular `diff` como `avgPlayResult` menos `leagueMedian`.
10. THE Metrics_Engine SHALL calcular `percentile` como un valor de 0 a 100 inclusive, usando solo equipos con n mayor o igual a `minDisplay` en el mismo Bucket y Perspective.
11. WHEN n es menor que 20, THE Metrics_Engine SHALL asignar `sampleFlag` igual a `hidden` y THE Backend SHALL omitir esa fila de la respuesta.
12. WHEN n está entre 20 y 49 inclusive, THE Metrics_Engine SHALL asignar `sampleFlag` igual a `low`.
13. WHEN n es mayor o igual a 50, THE Metrics_Engine SHALL asignar `sampleFlag` igual a `ok`.
14. WHILE la Perspective es `offense`, THE Metrics_Engine SHALL asignar `verdict` igual a `favorable` si `ci.low` es mayor que `leagueMedian`, y `adverse` si `ci.high` es menor que `leagueMedian`.
15. WHILE la Perspective es `defense`, THE Metrics_Engine SHALL asignar `verdict` igual a `favorable` si `ci.high` es menor que `leagueMedian`, y `adverse` si `ci.low` es mayor que `leagueMedian`.
16. IF `ci.low` es menor o igual a `leagueMedian` y `ci.high` es mayor o igual a `leagueMedian`, THEN THE Metrics_Engine SHALL asignar `verdict` igual a `inconclusive`.
17. THE Backend SHALL devolver todos los campos de salida en camelCase usando `alias_generator=to_camel` y `populate_by_name=True`.
18. THE Backend SHALL devolver los valores de `bucket` crudos de `plays.csv` tal cual, y los de Dimensions derivadas con los valores documentados en el contrato.
19. FOR ALL `SliceMetric` devueltas, THE Metrics_Engine SHALL cumplir `ci.low <= avgPlayResult <= ci.high`, `0 <= explosiveRate <= 1` y `0 <= negativeRate <= 1` (propiedad de invariante).
20. FOR ALL `SliceMetric` devueltas con `leagueMedian` no nulo, THE Metrics_Engine SHALL cumplir `diff = avgPlayResult - leagueMedian` con tolerancia de 1e-9.
21. FOR ALL equipos de una Dimension y Perspective, THE Backend SHALL producir una suma de n de los Bucket igual al número de jugadas del equipo con valor en esa Dimension (propiedad de conservación, calculada antes de ocultar los `hidden`).

### Requirement 6: Diagnóstico por equipo

**User Story:** Como analista, quiero un diagnóstico con las áreas de atención y fortalezas más sólidas de un equipo, para empezar a plantear un escenario hipotético.

#### Acceptance Criteria

1. WHEN llega `GET /api/teams/{abbr}/diagnosis` con `abbr` de un equipo de los 32 existentes, THE Backend SHALL responder 200 con `team`, `perspective`, `season`, `sample`, `summary`, `attention`, `strengths`, `outcomeMix` y `caveats`.
2. IF `abbr` no corresponde a ninguno de los 32 equipos, THEN THE Backend SHALL responder 404 con un mensaje de error que indique que el equipo no existe, sin devolver datos de diagnóstico.
3. IF `perspective` se envía con un valor distinto de `offense` o `defense`, THEN THE Backend SHALL responder 422 con un mensaje de error que indique los valores permitidos, sin devolver datos de diagnóstico.
4. WHEN `perspective` no se envía, THE Backend SHALL usar `offense`.
5. THE Findings_Engine SHALL evaluar segmentos de todas las Dimension, sin limitarse a tercera oportunidad.
6. THE Findings_Engine SHALL incluir en `attention` y `strengths` solo segmentos con `sampleFlag` igual a `ok`.
7. THE Findings_Engine SHALL incluir en `attention` solo segmentos con `verdict` igual a `adverse` y en `strengths` solo segmentos con `verdict` igual a `favorable`.
8. THE Findings_Engine SHALL devolver como máximo 3 elementos en `attention` y 3 en `strengths`.
9. THE Findings_Engine SHALL ordenar cada lista por `abs(diff)` descendente, resolver empates por orden alfabético ascendente del nombre del segmento, y asignar `rank` consecutivo desde 1.
10. THE Findings_Engine SHALL redactar cada `explanation` como "tendencia observada" en muestra 2021 e incluir n, sin usar los términos "debilidad confirmada", "conversión oficial" ni "equipo actual".
11. IF ningún segmento cumple los criterios de `attention` o de `strengths`, THEN THE Findings_Engine SHALL devolver esa lista vacía (`[]`) y THE Backend SHALL añadir a `caveats` un texto que indique cuál lista quedó vacía, manteniendo la respuesta 200.
12. THE Backend SHALL calcular `summary` con la Primary_Metric de todas las jugadas del equipo en la Perspective, `leagueMedian` de los 32 equipos y `percentile` entre 0 y 100.
13. THE Backend SHALL calcular `outcomeMix` como la proporción (entre 0 y 1) de cada valor crudo de `passResult` del equipo, con `leagueMedian` y n, de modo que la suma de las proporciones del equipo sea 1 con tolerancia de 0.001.
14. THE Backend SHALL incluir en `caveats` que las cifras provienen de las jugadas disponibles de 2021, semanas 1 a 8, y que `plays.csv` no está documentado como universo completo.
15. WHERE la Primary_Metric es `playResult`, THE Backend SHALL incluir en `caveats` que `playResult` incluye yardas de falta.
16. FOR ALL diagnósticos, THE Findings_Engine SHALL cumplir que ningún segmento aparece a la vez en `attention` y `strengths` (propiedad de invariante).
17. FOR ALL diagnósticos con Perspective `defense`, THE Findings_Engine SHALL colocar en `strengths` los segmentos con `avgPlayResult` por debajo de `leagueMedian` con intervalo que excluye la mediana, y en `attention` los segmentos con `avgPlayResult` por encima de `leagueMedian` con intervalo que excluye la mediana.

### Requirement 7: Vista previa de escenarios

**User Story:** Como analista, quiero formular un escenario hipotético sobre una necesidad detectada, para ver evidencia calculada separada de mis supuestos.

#### Acceptance Criteria

1. WHEN llega `POST /api/scenarios/preview` con un `ScenarioRequest` válido, THE Backend SHALL responder 200 con `evidence`, `partnerProfiles`, `assumptions`, `missingData` y `disclaimers`, cada uno presente como lista (vacía si no hay elementos) en el cuerpo de la respuesta.
2. THE Scenario_Engine SHALL calcular `evidence` solo con `SliceMetric` del equipo y de la necesidad indicada en `need`, sin usar valores de Manual_Input.
3. WHEN el Scenario_Engine genera `partnerProfiles`, THE Scenario_Engine SHALL incluir con `source` igual a `computed` únicamente los equipos cuyo segmento relacionado con la necesidad tiene `verdict` favorable y `sampleFlag` igual a `ok`, hasta un máximo de 5 perfiles computados ordenados de forma determinista.
4. IF ningún equipo cumple las condiciones de `verdict` favorable y `sampleFlag` igual a `ok`, THEN THE Scenario_Engine SHALL devolver `partnerProfiles` sin perfiles `computed` y SHALL incluir en `disclaimers` un texto que indique que no se encontraron perfiles computados.
5. WHEN `partnerTeam` viene informado, THE Scenario_Engine SHALL añadir un `PartnerProfile` con `source` igual a `manual`, además de los perfiles `computed`, sin contarlo dentro del máximo de 5 perfiles computados.
6. THE Scenario_Engine SHALL incluir en cada `PartnerProfile.note` el texto exacto "perfil histórico 2021; no implica interés ni disponibilidad".
7. THE Scenario_Engine SHALL incluir `strategy`, `manualRecord`, `futureAssetNote` y `partnerTeam` manual solo en `assumptions`, y cada elemento de `assumptions` SHALL llevar el rótulo exacto "dato manual, no verificado".
8. THE Scenario_Engine SHALL producir `evidence` y `partnerProfiles` computados idénticos (comparación campo por campo) para dos solicitudes que difieren únicamente en Manual_Input (propiedad metamórfica).
9. THE Scenario_Engine SHALL listar en `missingData` exactamente los datos no disponibles: contratos, roster, cap, agentes libres, picks y valor de mercado.
10. THE Scenario_Engine SHALL incluir en `disclaimers` un texto que indique que el escenario es hipotético y otro que indique que no recomienda transacciones reales.
11. IF `futureAssetNote` excede 280 caracteres, THEN THE Error_Handler SHALL responder 422 con código `INVALID_PARAMETER` sin calcular el escenario.
12. IF la necesidad indicada en `need` tiene `sampleFlag` distinto de `ok`, THEN THE Error_Handler SHALL responder 422 con código `INSUFFICIENT_SAMPLE` sin calcular el escenario.
13. IF `targetPosition` no está en `Meta.positions`, THEN THE Error_Handler SHALL responder 422 con código `INVALID_PARAMETER` sin calcular el escenario.
14. THE Backend SHALL ejecutar el escenario sin escribir en disco ni modificar los datos en memoria, de modo que dos llamadas idénticas consecutivas devuelvan respuestas iguales.
15. FOR ALL textos devueltos por el Backend (`explanation`, `note`, `assumptions`, `missingData`, `disclaimers`, `caveats`, `limits`), THE Backend SHALL excluir cualquier Trade_Claim.

### Requirement 8: Manejo de errores

**User Story:** Como Persona 2, quiero un formato de error único y predecible, para mostrar estados de error sin interpretar respuestas distintas.

#### Acceptance Criteria

1. IF `{abbr}` no está en `Meta.teams`, THEN THE Error_Handler SHALL responder 404 con código `TEAM_NOT_FOUND` y `details` que incluya el valor recibido de `{abbr}`, sin modificar el estado del servidor.
2. IF `team` o `partnerTeam` del cuerpo de `POST /api/scenarios/preview` no está en `Meta.teams`, THEN THE Error_Handler SHALL responder 404 con código `TEAM_NOT_FOUND` y `details` que incluya el nombre del campo y el valor recibido.
3. IF `perspective`, `dimension`, `strategy` o un `bucket` de `need` tiene un valor fuera de los permitidos, THEN THE Error_Handler SHALL responder 422 con código `INVALID_PARAMETER` y `details` que incluya el nombre del campo y el valor recibido.
4. IF el cuerpo de un POST no es JSON válido, o le falta al menos un campo requerido, o un campo tiene un tipo distinto al esperado, THEN THE Error_Handler SHALL responder 422 con código `INVALID_PARAMETER` y `details` que incluya el nombre de cada campo inválido o faltante, en lugar del 422 por defecto de FastAPI.
5. THE Error_Handler SHALL responder todos los errores de rutas `/api` con la forma `{error: {code, message, details}}`, con las claves en camelCase, donde `code` es una cadena no vacía, `message` es una cadena de entre 1 y 200 caracteres y `details` es un objeto (vacío `{}` si no hay datos adicionales).
6. THE Error_Handler SHALL redactar `message` en español sin incluir rutas de archivo, trazas de pila, nombres de excepciones internas ni credenciales.
7. WHEN `GET /api/teams/{abbr}/slices` no recibe `dimension`, THE Error_Handler SHALL responder 422 con código `INVALID_PARAMETER` y `details` que incluya el nombre del campo `dimension`.
8. IF ocurre una excepción no controlada en un endpoint `/api`, THEN THE Error_Handler SHALL responder 500 con la forma `ApiError`, con código `INTERNAL_ERROR` y un `message` genérico en español, sin exponer la traza ni detalles internos, y SHALL mantener el servidor en ejecución para atender solicitudes posteriores.
9. IF una solicitud a una ruta `/api` no coincide con ningún endpoint definido, THEN THE Error_Handler SHALL responder 404 con código `NOT_FOUND` y la forma `ApiError`.

### Requirement 9: Calidad, pruebas y validación

**User Story:** Como equipo, quiero pruebas automatizadas de la lógica de negocio, para dar cada tarea por terminada con evidencia.

#### Acceptance Criteria

1. THE Backend SHALL incluir pruebas pytest en `backend/tests/` para `yardsToEndzone`, `distanceBucket`, `fieldZone` y `clockWindow`, con al menos un caso por cada valor de salida definido y un caso en cada límite entre valores consecutivos de salida.
2. THE Backend SHALL incluir una prueba pytest que verifique que `yardsToEndzone` devuelve el resultado correspondiente a la yarda 50 cuando `yardlineSide` es una cadena vacía.
3. THE Backend SHALL incluir pruebas pytest para los umbrales de `sampleFlag` con n igual a 0, 19, 20, 49 y 50, y verificar que cada valor produce la bandera definida en el contrato para su rango.
4. THE Backend SHALL incluir pruebas pytest para `verdict` que verifiquen el signo de la diferencia contra la mediana de liga para ataque y para defensa, con al menos un caso favorable y uno desfavorable por cada lado.
5. THE Backend SHALL incluir pruebas pytest que verifiquen que la mediana de liga coincide con el valor calculado de forma independiente con numpy sobre un conjunto de datos fijo de al menos 5 equipos.
6. THE Backend SHALL incluir una prueba pytest que verifique que ninguna lista de hallazgos contiene más de 3 elementos, incluso cuando hay más de 3 candidatos disponibles.
7. THE Backend SHALL incluir pruebas pytest, con `httpx` y `TestClient`, que provoquen cada código de error del contrato y verifiquen que cada respuesta tiene el formato `ApiError` definido y el estado HTTP asignado a ese código.
8. THE Backend SHALL incluir una prueba pytest que recorra todos los textos devueltos por todos los endpoints bajo `/api/...` y verifique que ninguno contiene una Trade_Claim.
9. THE Backend SHALL incluir una prueba pytest que invoque el escenario al menos con 3 valores distintos de Manual_Input y verifique que `evidence` es idéntico en todas las respuestas.
10. WHEN una tarea se da por terminada, THE Persona 1 SHALL ejecutar `.venv/bin/python -m pytest` y `.venv/bin/python -c "import backend.main"`, y reportar para cada comando su código de salida y, para pytest, el número de pruebas aprobadas y fallidas.
11. IF `.venv/bin/python -m pytest` termina con una o más pruebas fallidas o con código de salida distinto de 0, THEN THE Persona 1 SHALL NOT dar la tarea por terminada y SHALL reportar las pruebas fallidas.
12. THE Backend SHALL usar solo las dependencias y versiones del stack fijo, sin agregar paquetes.
13. WHEN se ejecuta la suite de pruebas, THE Backend SHALL dejar sin cambios todos los archivos de `data/`, verificable por igualdad del contenido antes y después de la ejecución.
14. WHERE se usa Git, THE Persona 1 SHALL trabajar en ramas con nombre `p1/<tema>`, crear commits con formato `tipo(área): descripción` y ejecutar `git pull --rebase origin main` antes de cada push.
