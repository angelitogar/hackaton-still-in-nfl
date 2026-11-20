# Contexto de los datos disponibles

> **Propósito de este documento:** dejar una referencia verificable del conjunto de datos que estaba disponible durante esta inspección. No propone una solución al reto ni atribuye significados que los archivos no documenten.
>
> **Corte del inventario:** alrededor de `2026-11-20T16:35:16Z` (UTC). El directorio de tracking cambió durante la inspección, por lo que su inventario es una **fotografía parcial** y debe verificarse de nuevo cuando termine la descarga.

## Convenciones de evidencia

| Marca | Qué significa |
|---|---|
| **[README]** | Información escrita en `hackaton-still-in-nfl/README.md`. |
| **[OBS]** | Resultado de inspeccionar los CSV y sus metadatos locales. Los tipos son los inferidos por `pandas.read_csv` con su configuración predeterminada; no son un esquema oficial. |
| **[HIP]** | Interpretación de trabajo basada en nombres de campos o patrones. No debe tratarse como un hecho hasta contar con documentación de la fuente. |

## 1. Documentación, propósito y alcance

### Lo que documenta el README

**[README]** El único README de proyecto localizado es `hackaton-still-in-nfl/README.md`. Solo identifica el repositorio y al equipo. No documenta el propósito del conjunto de datos, su procedencia, licencia, periodo de cobertura, diccionario de variables, unidades, frecuencia de tracking, reglas de codificación ni un manifiesto de archivos esperados.

**[OBS]** No se localizó un README ni un diccionario de datos dentro de `data/`. Por ello, este documento no puede aportar una definición oficial de las variables ni confirmar el alcance completo de la descarga.

### Alcance que sí puede observarse

**[OBS]** Los tres CSV base contienen 122 registros de juego, 1,679 registros de jugador y 8,557 registros de jugada. En `games.csv`, los valores observados corresponden a la temporada `2021`, semanas 1 a 8 y fechas entre `2021-09-09` y `2021-11-01`.

**[OBS]** `plays.csv` concentra variables de resultado de pase, situación de juego, formación, personal y tres campos con prefijo `pff_`. Contiene resultados de pase, sacks, scrambles y otros códigos. No existe documentación local que defina estos códigos ni que confirme que represente todas las jugadas oficiales de cada partido.

**[HIP]** Por sus nombres de columnas y por las descripciones de las jugadas, `plays.csv` parece una selección centrada en jugadas de pase o dropback. Esta interpretación requiere confirmación con una fuente documental antes de usarse como criterio analítico.

## 2. Estado de la descarga y archivos ausentes

### Verificación solicitada

- **[OBS]** No existe un archivo llamado `pffScoutingData.csv` en el workspace. Tampoco se localizó otro archivo cuyo nombre contenga `ScoutingData`.
- **[OBS]** Sí existen `pff_playAction`, `pff_passCoverage` y `pff_passCoverageType` dentro de `data/plays.csv`; estos campos no sustituyen un archivo PFF separado ni documentan su codificación.
- **[OBS]** La descarga de `data/tracking/` no estaba estabilizada: el inventario visible pasó de 10 a 37 CSV durante la inspección. Por tanto, **los archivos de tracking no deben considerarse completamente descargados ni con cobertura final verificada**.
- **[OBS]** No hay un manifiesto local que indique cuántos archivos de tracking se esperaban. Se puede demostrar que la descarga estaba cambiando, pero no la cifra oficial de archivos que deberían existir.

### Tablas base disponibles

| Archivo | Ubicación | Grano observado | Tamaño y perfil observado |
|---|---|---|---|
| `games.csv` | `data/games.csv` | Una fila por `gameId`; `gameId` no se repite. | 122 filas, 7 columnas, 6,737 bytes. |
| `players.csv` | `data/players.csv` | Una fila por `nflId`; `nflId` no se repite. | 1,679 filas, 7 columnas, 103,891 bytes. |
| `plays.csv` | `data/plays.csv` | Una fila por par `(gameId, playId)`; esa combinación no se repite. | 8,557 filas, 32 columnas, 2,347,966 bytes. |

**[OBS]** No se encontraron filas completas duplicadas en esas tres tablas. Los directorios ocultos presentes bajo `data/` no se tratan como tablas del conjunto de datos.

### Archivos de tracking visibles en el corte

**[OBS]** Cada archivo de esta lista está bajo `data/tracking/`. Los archivos que se alcanzaron a perfilar comparten el mismo encabezado de 16 columnas y contienen registros repetidos por jugada, frame y objeto. El patrón de nombre y las primeras filas verificadas asocian el sufijo con el `gameId`. Debido a la descarga en curso, vuelva a validar todo el directorio antes de asumir que esta lista o sus archivos están completos.

- `data/tracking/tracking_2021091210.csv`
- `data/tracking/tracking_2021091211.csv`
- `data/tracking/tracking_2021091212.csv`
- `data/tracking/tracking_2021091902.csv`
- `data/tracking/tracking_2021091903.csv`
- `data/tracking/tracking_2021091904.csv`
- `data/tracking/tracking_2021091905.csv`
- `data/tracking/tracking_2021091906.csv`
- `data/tracking/tracking_2021091907.csv`
- `data/tracking/tracking_2021091908.csv`
- `data/tracking/tracking_2021091909.csv`
- `data/tracking/tracking_2021091910.csv`
- `data/tracking/tracking_2021091911.csv`
- `data/tracking/tracking_2021091912.csv`
- `data/tracking/tracking_2021091913.csv`
- `data/tracking/tracking_2021092000.csv`
- `data/tracking/tracking_2021092300.csv`
- `data/tracking/tracking_2021092600.csv`
- `data/tracking/tracking_2021092601.csv`
- `data/tracking/tracking_2021092602.csv`
- `data/tracking/tracking_2021092603.csv`
- `data/tracking/tracking_2021092604.csv`
- `data/tracking/tracking_2021092605.csv`
- `data/tracking/tracking_2021092606.csv`
- `data/tracking/tracking_2021092607.csv`
- `data/tracking/tracking_2021092608.csv`
- `data/tracking/tracking_2021092609.csv`
- `data/tracking/tracking_2021092611.csv`
- `data/tracking/tracking_2021092612.csv`
- `data/tracking/tracking_2021092613.csv`
- `data/tracking/tracking_2021093000.csv`
- `data/tracking/tracking_2021100300.csv`
- `data/tracking/tracking_2021100301.csv`
- `data/tracking/tracking_2021100302.csv`
- `data/tracking/tracking_2021100303.csv`
- `data/tracking/tracking_2021100306.csv`
- `data/tracking/tracking_2021100310.csv`

**[OBS]** En ese corte había 37 nombres de archivos de tracking frente a 122 juegos en `games.csv`; eso equivale a una cobertura potencial de 30.3% por nombre de archivo, no a una garantía de que cada CSV esté completo o sea válido. Tampoco significa que 37 sea la cantidad final.

## 3. Esquema y significado verificable de las columnas

### `data/games.csv`

| Columna | Tipo inferido | Uso o significado verificable |
|---|---:|---|
| `gameId` | `int64` | Identificador único observado de la tabla. Permite relacionarla con `plays.gameId`. |
| `season` | `int64` | Campo numérico; todos los registros disponibles tienen el valor `2021`. El README no define su semántica. |
| `week` | `int64` | Campo numérico con valores de 1 a 8 en los datos disponibles. |
| `gameDate` | `object` | Cadena con formato visible `MM/DD/YYYY`, por ejemplo `09/09/2021`. Requiere parseo explícito como fecha. |
| `gameTimeEastern` | `object` | Cadena con formato visible `HH:MM:SS`, por ejemplo `20:20:00`. El nombre incluye `Eastern`, pero no hay definición local adicional. |
| `homeTeamAbbr` | `object` | Código textual de equipo local según el nombre de la columna; se observan valores como `TB` y `DAL`. |
| `visitorTeamAbbr` | `object` | Código textual de equipo visitante según el nombre de la columna. |

**[OBS]** No se detectaron valores faltantes en esta tabla. No hay una tabla local que documente oficialmente los códigos de equipo.

### `data/players.csv`

| Columna | Tipo inferido | Uso o significado verificable |
|---|---:|---|
| `nflId` | `int64` | Identificador único observado de jugador. Es la clave disponible para unir registros de jugador. |
| `height` | `object` | Texto con patrón visible como `6-4`; no está listo como medida numérica. |
| `weight` | `int64` | Medida numérica; la unidad no está documentada localmente. |
| `birthDate` | `object` | Fecha textual. Hay formatos visibles tanto `YYYY-MM-DD` como `MM/DD/YYYY`. |
| `collegeName` | `object` | Nombre textual de institución; no hay catálogo independiente. |
| `officialPosition` | `object` | Código textual de posición, por ejemplo `QB`, `WR` o `CB`. No hay diccionario local de códigos. |
| `displayName` | `object` | Nombre textual mostrado del jugador. No debe emplearse como clave de unión. |

**[OBS]** `birthDate` tiene 232 valores faltantes y `collegeName` 224. No se detectaron filas completas duplicadas ni valores repetidos de `nflId`.

### `data/plays.csv`

Los significados formales de esta tabla no están en el README. La columna «Uso o significado verificable» describe el nombre del campo, los patrones observados o su papel relacional, no una especificación oficial.

| Grupo | Columnas y tipos inferidos | Uso o significado verificable |
|---|---|---|
| Identificadores | `gameId` (`int64`), `playId` (`int64`) | La combinación `(gameId, playId)` es única en las 8,557 filas. `playId` solo no es único: tiene 3,762 valores distintos. |
| Texto de la jugada | `playDescription` (`object`) | Descripción textual, con abreviaturas de nombres, resultados y notas. No usarla para unir datos con `players.displayName`. |
| Situación | `quarter` (`int64`), `down` (`int64`), `yardsToGo` (`int64`), `gameClock` (`object`) | Variables numéricas y un reloj textual con patrón `MM:SS`. No hay definición de reglas de negocio en el README. |
| Equipos y posición de campo | `possessionTeam` (`object`), `defensiveTeam` (`object`), `yardlineSide` (`object`), `yardlineNumber` (`int64`), `absoluteYardlineNumber` (`float64`) | Códigos de equipo y números de posición de campo por nombre de columna. Las convenciones de orientación no están documentadas. |
| Marcador | `preSnapHomeScore` (`int64`), `preSnapVisitorScore` (`int64`) | Campos numéricos cuyo nombre indica marcador previo al snap; no se documenta la regla de actualización. |
| Resultado | `passResult` (`object`), `penaltyYards` (`float64`), `prePenaltyPlayResult` (`int64`), `playResult` (`int64`) | Códigos y resultados numéricos. Se observan valores de `passResult` como `C`, `I`, `S`, `R` e `IN`, sin leyenda local de sus códigos. |
| Faltas | `foulName1`, `foulName2`, `foulName3` (`object`); `foulNFLId1`, `foulNFLId2`, `foulNFLId3` (`float64`) | Hasta tres ranuras ordinales de nombre e identificador. Los IDs se leen como `float64` por los nulos, aunque los valores presentes parecen identificadores enteros. |
| Formación y personal | `offenseFormation` (`object`), `personnelO` (`object`), `defendersInBox` (`float64`), `personnelD` (`object`) | Etiquetas textuales y conteo numérico según los nombres de campo; no hay definición formal de categorías. |
| Tipo de dropback | `dropBackType` (`object`) | Etiqueta textual, con valores como `TRADITIONAL`, `SCRAMBLE` y variantes de rollout. La taxonomía no está documentada. |
| Campos con prefijo PFF | `pff_playAction` (`int64`), `pff_passCoverage` (`object`), `pff_passCoverageType` (`object`) | Los tres campos están presentes y sin nulos. `pff_playAction` toma 0 y 1. Hay categorías textuales de cobertura, pero no existe el archivo PFF separado ni una leyenda local que las defina. |

**[OBS]** Todos los `gameId` de `plays.csv` aparecen en `games.csv`; ningún juego de `games.csv` quedó sin al menos una fila de `plays.csv` durante la validación.

### `data/tracking/tracking_<gameId>.csv`

**[OBS]** Los archivos de tracking que se perfilaron comparten este encabezado:

```text
gameId,playId,nflId,frameId,time,jerseyNumber,team,playDirection,x,y,s,a,dis,o,dir,event
```

Los tipos y conteos siguientes provienen específicamente de `data/tracking/tracking_2021091903.csv`, ya existente y legible durante la inspección. No constituyen una garantía para los archivos que seguían apareciendo durante la descarga.

| Columna | Tipo inferido en `tracking_2021091903.csv` | Uso o significado verificable |
|---|---:|---|
| `gameId` | `int64` | Identificador de juego; coincide con el sufijo de archivo en el ejemplo perfilado. |
| `playId` | `int64` | Identificador de jugada que debe combinarse con `gameId` para unirse a `plays.csv`. |
| `nflId` | `float64` | Identificador de jugador cuando está presente. Es nulo en las filas del objeto `football` del ejemplo. |
| `frameId` | `int64` | Entero de frame. En el ejemplo va de 1 a 170 y se reutiliza entre jugadas; no es una clave global. |
| `time` | `object` | Cadena de fecha y hora ISO 8601 con `Z`, por ejemplo `2021-09-19T17:03:17Z`. |
| `jerseyNumber` | `float64` | Número de jersey cuando está presente; nulo para el objeto `football` en el ejemplo. |
| `team` | `object` | Código de equipo u objeto. En el ejemplo se observaron `IND`, `LA` y el valor especial `football`. |
| `playDirection` | `object` | Valores observados `left` y `right`. No hay documentación de cómo normalizar las coordenadas entre ambas direcciones. |
| `x`, `y` | `float64` | Valores numéricos de posición por nombre de campo. La unidad, el origen y el sistema de coordenadas no están documentados localmente. |
| `s`, `a`, `dis` | `float64` | Valores numéricos de movimiento por nombre de campo. Sus unidades y su método de cálculo no están documentados. |
| `o`, `dir` | `float64` | Valores numéricos angulares por nombre de campo. No se documentan unidad, cero angular ni sentido de giro. |
| `event` | `object` | Etiqueta textual de evento. En el CSV crudo se observa el literal `None` para la ausencia de evento. |

**[OBS]** En `tracking_2021091903.csv` hay 67,850 filas y 64 combinaciones distintas de `(gameId, playId)`. No tiene filas completas duplicadas. La clave compuesta `(gameId, playId, frameId, team, nflId)` no se repite en ese archivo, incluyendo el tratamiento del `nflId` nulo del balón.

## 4. Relaciones entre tablas y precauciones al unirlas

### Claves disponibles

| Relación | Clave | Cardinalidad verificada o esperada | Precaución |
|---|---|---|---|
| `games` → `plays` | `gameId` | Un juego puede tener muchas filas de `plays`; cada `plays.gameId` validado corresponde a un juego. | Unir por `gameId` y validar una relación muchos-a-uno desde `plays`. |
| `plays` → `tracking` | `(gameId, playId)` | Una fila de `plays` puede corresponder a muchos frames y objetos de tracking. | Nunca unir solo por `playId`, pues se repite entre juegos. Un join directo multiplica la fila de jugada por sus frames y objetos, lo cual es esperado a ese nivel de detalle. |
| `players` → `tracking` | `nflId` | Muchos registros de tracking pueden corresponder a un jugador. | Separar primero las filas con `team == 'football'` y `nflId` nulo. Convertir los IDs presentes a entero nullable antes de unir. |
| `players` → faltas en `plays` | `foulNFLId1`, `foulNFLId2`, `foulNFLId3` → `nflId` | Cada ranura de falta puede apuntar a un jugador. | Mantener unidos los pares del mismo sufijo, por ejemplo `foulName2` con `foulNFLId2`. Normalizar a formato largo antes de combinar las tres ranuras. |

**[OBS]** En el archivo de tracking perfilado, sus 64 pares `(gameId, playId)` existen en `plays.csv`; los 68 `nflId` no nulos distintos de ese archivo existen en `players.csv`. Esto valida la relación en la muestra, no en archivos que aún no se habían descargado.

### Esquema relacional de referencia

```text
games (gameId único)
  └── plays (gameId, playId únicos)
        ├── tracking (muchos objetos y frames por gameId, playId)
        └── foulNFLId1/2/3 ──► players (nflId único)

players (nflId único)
  └── tracking.nflId, excepto filas con team = football
```

### Reglas de unión que conviene conservar

1. Usar siempre `(gameId, playId)` para relacionar una jugada con tracking.
2. Conservar `gameId` después de cualquier agregado de tracking. `playId` no identifica una jugada en todo el conjunto.
3. Si se necesitan métricas por jugada, agregar primero el tracking al nivel de jugada; unir datos sin agregar cambia el grano del resultado.
4. No unir por `playDescription`, `displayName`, abreviaturas de nombres ni por un código de equipo aislado.
5. Tratar `nflId` y `foulNFLId*` como identificadores enteros anulables después de cargar los CSV, no como medidas continuas de tipo `float64`.
6. No intentar unir las filas `team == 'football'` con `players.csv`.

## 5. Valores faltantes, formatos e inconsistencias observados

### Tablas base

| Archivo | Campo | Nulos observados | Nota |
|---|---|---:|---|
| `players.csv` | `birthDate` | 232 | Además mezcla formatos de fecha visibles. |
| `players.csv` | `collegeName` | 224 | No imputar sin una fuente externa o una regla explícita. |
| `plays.csv` | `yardlineSide` | 125 | Campo textual; hay valores vacíos en el CSV. |
| `plays.csv` | `penaltyYards` | 7,801 | La ausencia de dato no debe convertirse automáticamente en cero. |
| `plays.csv` | `foulName1`, `foulNFLId1` | 7,821 cada uno | La primera ranura de falta suele estar vacía. |
| `plays.csv` | `foulName2`, `foulNFLId2` | 8,527 cada uno | La segunda ranura es aún menos frecuente. |
| `plays.csv` | `foulName3`, `foulNFLId3` | 8,556 cada uno | Solo hay un valor no nulo en cada una de estas dos columnas. |
| `plays.csv` | `absoluteYardlineNumber` | 1 | Se infiere como `float64` por el nulo. |
| `plays.csv` | `offenseFormation` | 7 | Campo textual. |
| `plays.csv` | `personnelO` | 1 | Campo textual. |
| `plays.csv` | `defendersInBox` | 7 | Se infiere como `float64` por los nulos. |
| `plays.csv` | `personnelD` | 1 | Campo textual. |
| `plays.csv` | `dropBackType` | 528 | No hay documentación para decidir si equivale a ausencia, categoría no aplicable o falta de captura. |

### Tracking: perfil de `tracking_2021091903.csv`

| Campo | Nulos observados | Evidencia y tratamiento recomendado |
|---|---:|---|
| `nflId` | 2,950 | Coinciden con las 2,950 filas cuyo `team` es `football`; no imputar un jugador. |
| `jerseyNumber` | 2,950 | Coinciden con el objeto `football` en la muestra. |
| `o` | 2,950 | Coinciden con el objeto `football` en la muestra. |
| `dir` | 2,950 | Coinciden con el objeto `football` en la muestra. |
| `event` | 63,066 | El CSV utiliza `None` como literal de ausencia y pandas lo interpreta como nulo con la lectura predeterminada. |

**[OBS]** En el ejemplo de tracking, `team` tiene 32,450 filas `IND`, 32,450 `LA` y 2,950 `football`. El campo `time` tiene solo 353 cadenas distintas frente a 67,850 filas, mientras que los frames 1 a 7 de la muestra comparten el mismo segundo. Para ordenar la secuencia dentro de una jugada, `frameId` es más específico que el texto de `time`.

### Otras limitaciones de formato y calidad

- **[OBS]** Los CSV usan valores como `NA` y `None` para ausencias. La política de carga debe ser consistente para no convertir algunos de ellos en texto y otros en nulos sin querer.
- **[OBS]** `birthDate` no usa un único formato visible. Debe parsearse con cuidado y conservar el valor original si falla la conversión.
- **[OBS]** `height` es texto con guion y `weight` no declara unidad. No calcular métricas físicas sin documentar la conversión elegida.
- **[OBS]** `collegeName` contiene al menos una entidad HTML visible (`Texas A&amp;M`), por lo que una limpieza textual puede ser necesaria según el uso.
- **[OBS]** No se documentan unidades de posición, velocidad, aceleración, distancia u orientación en tracking. Tampoco se documenta su frecuencia de muestreo, sistema de ejes o criterio de eventos.
- **[OBS]** Los campos PFF presentes en `plays.csv` carecen de diccionario local. No se deben reinterpretar ni recodificar por intuición.
- **[OBS]** La cobertura de juegos por semana es irregular a partir de la semana 6. Sin un manifiesto o README de datos, esto solo describe los archivos presentes; no prueba corrupción ni omisión oficial.

## 6. Información útil para continuar el proyecto

### Hechos que se pueden usar con seguridad

- `games.gameId`, `players.nflId` y el par `plays.(gameId, playId)` son claves candidatas verificadas en las tablas base.
- `plays` se relaciona correctamente con `games` mediante `gameId` en los datos inspeccionados.
- Los archivos de tracking usan una granularidad más fina que `plays`: una misma jugada tiene múltiples frames y múltiples objetos.
- El objeto balón aparece como `team = 'football'` y no como un jugador con `nflId` en el archivo de tracking perfilado.
- Hay un archivo de tracking legible y perfilado en profundidad: `data/tracking/tracking_2021091903.csv`.

### Aspectos que siguen sin documentación y no deben suponerse

- Propósito oficial del dataset, fuente, licencia y criterios de inclusión.
- Significado formal de los códigos de `passResult`, `dropBackType`, cobertura PFF, formación, personal y eventos.
- Unidades y orientación de `x`, `y`, `s`, `a`, `dis`, `o` y `dir`.
- Frecuencia de muestreo y semántica exacta de `frameId` y `time`.
- Número esperado de CSV de tracking y presencia esperada de `pffScoutingData.csv`.
- Si el conjunto de `plays` es exhaustivo para cada juego o una selección temática.

### Verificaciones necesarias cuando termine la descarga

1. Confirmar que el inventario de `data/tracking/` ya no cambia entre dos revisiones separadas en el tiempo.
2. Comprobar que todos los CSV de tracking se pueden leer completos y mantienen el encabezado común de 16 columnas.
3. Volver a contar juegos y pares `(gameId, playId)` cubiertos por tracking, sin inferirlos solo por nombre de archivo.
4. Validar que cada `gameId` de tracking exista en `games.csv` y cada par de tracking exista en `plays.csv`.
5. Buscar otra vez `pffScoutingData.csv` y cualquier README, diccionario o manifiesto que haya llegado con la descarga.
6. Actualizar este documento con el inventario estabilizado, las discrepancias reales y la documentación de la fuente si aparece.

**[OBS]** Los archivos originales bajo `data/` deben mantenerse de solo lectura. Las conversiones de tipo, agregados y tablas derivadas deben construirse en memoria o en ubicaciones de trabajo separadas, sin modificar los CSV fuente.
