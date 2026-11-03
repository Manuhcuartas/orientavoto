# Afirmaciones candidatas y propuesta de 25 (protocolo §2.2 y §2.3)

Documento de trabajo de la tarea 4.0. Preparado por Claude el 3 de noviembre de 2026 aplicando `docs/PROTOCOLO.md` §2.2 y §2.3. **Lista de 25 aprobada con reservas por el responsable el 3 de noviembre de 2026** (§2.2.4): se aprueba la lista completa tal como figura en «Propuesta de 25», con las reservas marcadas ⚠ y los casos A1–A8 todavía pendientes de decisión. Las afirmaciones ⚠ se confirman o se sustituyen por la siguiente reserva con fuente cuando haya voto nominal, texto de las mociones o programas, aplicando las mismas reglas. Las posiciones de este documento solo sirven para elegir afirmaciones: **no son las posiciones definitivas** ni se codifican en `data/` hasta después de la aprobación.

## Estado de las fuentes a 3 de noviembre

- **Programas del 29-N: ninguno publicado.** Según la prensa (datosclaros.es, Forbes, 18–19 de octubre) ni PSOE, PP, Vox, Frente Amplio ni Podemos han presentado su programa completo; no se ha encontrado ninguno de ERC, Junts, EH Bildu, PNV, BNG, CC, UPN, Compromís ni UPC. Faltan, por tanto, **los programas de todas las candidaturas**. Cuando se publiquen se repite la selección (antes del 11-nov) y pueden entrar afirmaciones que hoy están descartadas por falta de datos.
- **Votaciones de la legislatura:** ficheros oficiales del portal de datos abiertos del Congreso (<https://www.congreso.es/es/opendata/votaciones>), que dan el voto de cada diputado. Cada posición marcada **✔** se ha leído en el fichero oficial (enlace en la tabla de sesiones). El voto de cada partido es el mayoritario de sus diputados (§3.1): FA = grupo SUMAR; Podemos = Belarra, Sánchez Serna, Santana y Velarde (Mixto); BNG = Rego; CC = Valido; UPN = Catalán; Compromís = Ibáñez (grupo SUMAR) y Micó (grupo SUMAR hasta el 03-07-2025 y Mixto después).
- **Sin voto nominal publicado (⏳):** el pleno del 2 de octubre de 2026 (convalidación de los dos decretos de vivienda, derogados por 172–178 y 166–184) solo tiene en el portal el gráfico del resultado. Para esas afirmaciones el desglose por partido es el que publica la prensa, con enlace, y **no vale como fuente definitiva** (§3.1).
- **UPC (Canarias)** la encabeza Nueva Canarias-Bloque Canarista, sin diputados: no tiene votaciones y aparece como «sin datos» en todas (ver `partidos.md`, D4).

## Cómo se ha aplicado el protocolo

- **Candidaturas que cuentan** (14, de `partidos.md`): PSOE, PP, Vox, Frente Amplio (FA), Podemos (POD), ERC, Junts (JxC), EH Bildu (BIL), PNV, BNG, CC, UPN (para UPN-PP), Compromís (CMP) y UPC.
- **Posición en una votación** (§3.3): F = a favor de la afirmación, C = en contra, N = abstención, · = sin datos. Si la afirmación está redactada al revés que la iniciativa votada (por ejemplo, «suprimir» algo que se votó para crear), o si se votaron enmiendas a la totalidad, se traduce: votar a favor de devolver un texto = en contra de la medida.
- **Descarte por cobertura** (§2.2.2): si 8 o más de las 14 candidaturas no tienen fuente.
- **Descarte por no dividir:** si todas las que tienen fuente coinciden.
- **Descarte por repetir** otra afirmación.
- **Puntuación de división** (§2.2.3): el menor de los dos números «a favor» y «en contra» (cuanto más alto, más reparte). Empate: más candidaturas con fuente.
- **Votaciones de paquete:** un decreto con varias medidas no es una votación «sustancialmente igual» a cada medida por separado (§3.1). Las afirmaciones que solo tienen ese tipo de votación se marcan **dudosas** (§3.5).

## Votaciones usadas (ficheros oficiales)

| Clave | Fecha | Sesión y votación | Iniciativa | Resultado (sí–no–abst.) |
|---|---|---|---|---|
| S34-1 | 09-04-2024 | [Sesión 34, votación 1](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion034/20240409/Votacion001/VOT_20240409210631.json) | Toma en consideración de la PL para una regularización extraordinaria para personas extranjeras en España (ILP) | 310–33–0 |
| S34-12 | 09-04-2024 | [Sesión 34, votación 12](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion034/20240409/Votacion012/VOT_20240409210642.json) | PNL del GP Popular «para deflactar el IRPF ajustándolo a la inflación» | 169–160–14 |
| S59-1 | 17-09-2024 | [Sesión 59, votación 1](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion059/20240917/Votacion001/VOT_20240917204416.json) | Toma en consideración de la PL de SUMAR sobre alquiler de temporada y de habitaciones (rechazada) | 172–178–0 |
| S86-1 | 17-12-2024 | [Sesión 86, votación 1](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion086/20241217/Votacion001/VOT_20241217205720.json) | Toma en consideración de la PL de SUMAR, ERC, EH Bildu y Mixto sobre alquileres temporales (aprobada) | 176–169–0 |
| S89-2 | 22-01-2025 | [Sesión 89, votación 2](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion089/20250122/Votacion002/VOT_20250122154427.json) | Convalidación del RDL 10/2024, gravamen temporal energético para 2025 (derogado) | 165–183–1 |
| S98-13 | 13-03-2025 | [Sesión 98, votación 13](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion098/20250313/Votacion013/VOT_20250313133906.json) | Moción del GP Popular «sobre el infierno fiscal…», punto 4 (exención del IRPF del salario mínimo según la prensa; comprobar el texto del punto en el BOCG) | 211–121–13 |
| S99-1 | 18-03-2025 | [Sesión 99, votación 1](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion099/20250318/Votacion001/VOT_20250318201321.json) | Toma en consideración de la PL de Junts contra la ocupación ilegal de inmuebles | 300–44–0 |
| S106-15 | 10-04-2025 | [Sesión 106, votación 15](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion106/20250410/Votacion015/VOT_20250410155154.json) | Convalidación del RDL 2/2025 (reubicación de menores migrantes no acompañados) | 179–170–1 |
| S130-10 | 10-09-2025 | [Sesión 130, votación 10](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion130/20250910/Votacion010/VOT_20250910213544.json) | Enmiendas a la totalidad de devolución del proyecto de ley de reducción de la jornada (aprobadas: el proyecto decae) | 178–170–0 |
| S131-1 | 16-09-2025 | [Sesión 131, votación 1](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion131/20250916/Votacion001/VOT_20250916211204.json) | Toma en consideración de la PL de Vox «para restringir la regularización de inmigrantes ilegales a través del arraigo» | 169–177–1 |
| S132-3 | 17-09-2025 | [Sesión 132, votación 3](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion132/20250917/Votacion003/VOT_20250917194022.json) | PNL de SUMAR «relativa al establecimiento por ley de un despido realmente restaurativo y disuasorio» | 171–170–6 |
| S133-1 | 23-09-2025 | [Sesión 133, votación 1](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion133/20250923/Votacion001/VOT_20250923211048.json) | Toma en consideración de la PL de PSOE y Junts de delegación en Cataluña de competencias estatales en inmigración | 173–177–0 |
| S174-14/15 | 22-04-2026 | [votación 14](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion174/20260422/Votacion014/VOT_20260422152001.json) · [votación 15](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion174/20260422/Votacion015/VOT_20260422152002.json) | Moción del GP Popular «sobre el infierno fiscal…», puntos 1 y 2 (deflactar el IRPF y franquicia de IVA para autónomos según la prensa; no consta cuál es cuál) | 177–163–5 · 214–125–6 |
| S179-1 | 19-05-2026 | [Sesión 179, votación 1](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion179/20260519/Votacion001/VOT_20260519203502.json) | Toma en consideración de la PL del GP Popular contra la ocupación ilegal de inmuebles | 171–164–11 |
| S183-12 | 28-05-2026 | [Sesión 183, votación 12](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion183/20260528/Votacion012/VOT_20260528125351.json) | Convalidación del RDL 11/2026 (aportación de los usuarios en la prestación farmacéutica) | 164–33–149 |
| S193-19 | 23-07-2026 | [Sesión 193, votación 19](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion193/20260723/Votacion019/VOT_20260723212000.json) | Enmiendas a la totalidad de devolución del proyecto de LO de medidas excepcionales de sostenibilidad financiera (condonación de deuda autonómica; rechazadas) | 170–178–0 |
| S13-3 | 19-12-2023 | [Sesión 13, votación 3](https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion013/20231219/Votacion003/VOT_20231219233110.json) | PNL del GP Socialista sobre un Pacto de Estado por la Salud Mental | 296–0–49 |
| D-261002 | 02-10-2026 | [Sesión 203](https://www.congreso.es/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&targetLegislatura=XV&targetDate=02/10/2026) | Convalidación de los dos decretos de vivienda (derogados). **Sin voto nominal publicado** | 172–178 · 166–184 |

## Candidatas

Columnas: PSOE · PP · VOX · FA · POD · ERC · JxC · BIL · PNV · BNG · CC · UPN · CMP · UPC. «Div.» = puntuación de división; «Cob.» = candidaturas con fuente (de 14).

### Tema 1: Vivienda

| ID | Afirmación | Fuente | PSOE | PP | VOX | FA | POD | ERC | JxC | BIL | PNV | BNG | CC | UPN | CMP | UPC | Div. | Cob. | Decisión |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| V01 | Prohibir hasta 2030 los desahucios de hogares vulnerables que no tengan una alternativa de vivienda. | D-261002, primer decreto ⏳ ([eldiario.es](https://www.eldiario.es/politica/junts-pp-vox-tumban-decretos-vivienda-congreso_1_13557141.html), [Demócrata](https://www.democrata.es/politica/congreso-y-senado/el-congreso-tumba-el-decreto-de-vivienda-con-los-votos-de-pp-vox-junts-y-upn/)) | F | C | C | F | F | F | C | F | F | F | F | C | F | · | 4 | 13 | **Propuesta, dudosa**: decreto con varias medidas y sin voto nominal (A1, A2) |
| V02 | Permitir que el inquilino prorrogue hasta dos años su contrato de alquiler, con las mismas condiciones, cuando llegue a su fin. | D-261002, segundo decreto ⏳ ([Diario en Positivo](https://www.diarioenpositivo.com/politica/economia-amp-pp-vox-junts-pnv-cc-upn-tumban-segundo-decreto-renovacion-automatica-alquileres/20261002162702093090.html)) | F | C | C | F | F | F | C | F | C | F | C | C | F | · | 6 | 13 | **Propuesta, dudosa**: sin voto nominal (A2); comprobar en el BOE que el segundo decreto trataba solo de la prórroga |
| V03 | Regular por ley los alquileres de temporada y por habitaciones para que tengan las mismas protecciones que el alquiler de vivienda habitual. | S59-1 ✔ y S86-1 ✔ | F | C | C | F | F | F | dudosa | F | F | F | F | C | F | · | 3 | 12 | **Propuesta**. Junts votó en contra en S59-1 y a favor en S86-1 (A7) |
| V04 | Obligar a quien ocupa ilegalmente una vivienda a dejarla en 24 horas si no demuestra que tiene derecho a estar en ella. | S179-1 ✔ | C | F | F | C | C | C | N | C | N | C | F | F | C | · | 4 | 13 | **Propuesta** |
| V05 | Prohibir durante unos años que los grandes fondos de inversión compren viviendas. | D-261002, primer decreto ⏳ | F | C | C | F | F | F | C | F | F | F | F | C | F | · | 4 | 13 | **Propuesta, dudosa** (igual que V01) |
| V06 | Crear un impuesto del 10 % sobre los pisos turísticos. | D-261002 ⏳ | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada por ahora: no consta en cuál de los dos decretos iba. Reserva |
| V07 | Bajar al 4 % el IVA de la construcción de vivienda protegida. | D-261002 ⏳ | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada por ahora: ídem. Reserva |
| V08 | Mantener la Ley de Vivienda de 2023, que permite limitar el precio del alquiler en zonas tensionadas. | Ninguna votación en esta legislatura | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. Reserva para cuando haya programas |

Votación examinada y no usada: S99-1 (PL de Junts para agilizar desalojos de viviendas ocupadas, 300–44): **repite** V04.

### Tema 2: Inmigración

| ID | Afirmación | Fuente | PSOE | PP | VOX | FA | POD | ERC | JxC | BIL | PNV | BNG | CC | UPN | CMP | UPC | Div. | Cob. | Decisión |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| I01 | Aprobar una regularización extraordinaria de las personas extranjeras que ya viven y trabajan en España sin permiso de residencia. | S34-1 ✔ | F | F | C | F | F | F | F | F | F | F | F | F | F | · | 1 | 13 | **Propuesta** (solo Vox en contra; A6) |
| I02 | Suprimir el reparto obligatorio entre comunidades de los menores migrantes no acompañados y que cada comunidad decida cuántos acoge. | S106-15 ✔ (redactada al revés: sí al decreto = en contra de la afirmación) | C | F | F | C | C | C | C | C | C | C | C | N | C | · | 2 | 13 | **Propuesta** |
| I03 | Delegar en Cataluña competencias del Estado en inmigración, como la gestión de permisos de residencia y trabajo. | S133-1 ✔ | F | C | C | F | C | F | F | F | F | F | F | C | dudosa | · | 4 | 12 | **Propuesta**. En el grupo SUMAR votaron en contra Alberto Ibáñez (Compromís) y Jorge Pueyo (CHA); Àgueda Micó (Compromís, Mixto), a favor (A5) |
| I04 | Ampliar los casos en que se expulsa a extranjeros en situación irregular y acelerar las expulsiones. | No se ha encontrado una votación específica: la noticia de [The Objective](https://theobjective.com/espana/politica/2025-09-16/congreso-propuesta-vox-expulsar-inmigrantes-pp/) del 16-09-2025 corresponde a la PL de arraigo (S131-1). Hay mociones del PP con varios puntos (18-02-2026) cuyo texto hay que leer | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada por ahora: sin fuente. **Reserva 1** |
| I05 | Endurecer los requisitos de la residencia por arraigo, la vía para obtener permiso tras varios años viviendo en España. | S131-1 ✔ | C | F | F | C | C | C | C | C | C | C | C | N | C | · | 2 | 13 | **Propuesta** |
| I06 | Mantener el acceso a la sanidad pública de las personas extranjeras en situación irregular. | Real Decreto 180/2026 (Gobierno, sin votación en el Congreso) | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. Reserva |
| I07 | Que el Gobierno ejecute las órdenes de expulsión ya dictadas contra inmigrantes en situación irregular. | Moción del PP de febrero de 2026 ([MelillaHoy](https://melillahoy.es/el-congreso-insta-al-gobierno-a-ejecutar-de-forma-efectiva-la-expulsion-de-migrantes-gracias-a-la-abstencion-de-junts/amp/)); votada por puntos, falta identificar el punto | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: **repite** I04 |
| I08 | Exigir un contrato de trabajo firmado en origen como vía principal para venir a trabajar a España. | Ninguna | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. Reserva |

### Tema 3: Economía

| ID | Afirmación | Fuente | PSOE | PP | VOX | FA | POD | ERC | JxC | BIL | PNV | BNG | CC | UPN | CMP | UPC | Div. | Cob. | Decisión |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| E01 | Volver a aplicar un impuesto extraordinario a las grandes empresas energéticas. | S89-2 ✔ | F | C | C | F | F | F | C | F | C | F | N | C | F | · | 5 | 13 | **Propuesta** |
| E02 | Actualizar cada año todos los tramos del IRPF según la inflación. | S34-12 ✔ (y moción de 2026, S174-14/15) | C | F | F | C | C | C | N | C | N | N | C | F | C | · | 3 | 13 | **Propuesta**. Posible cambio de voto de FA en 2026 (A8) |
| E03 | Que quien cobra el salario mínimo no pague IRPF. | S98-13 ✔ (contenido del punto por confirmar en el BOCG) | C | F | F | F | F | F | N | N | F | F | F | N | F | · | 1 | 13 | **Propuesta** |
| E04 | Que el Estado perdone parte de la deuda que las comunidades autónomas tienen con él. | S193-19 ✔ (enmiendas a la totalidad: sí = en contra) | F | C | C | F | F | F | F | F | F | F | F | C | F | · | 3 | 13 | **Propuesta** |
| E05 | Eximir del IVA a los autónomos y pequeños negocios con ingresos anuales bajos. | S174-14 o S174-15 ✔ (falta saber cuál de los dos puntos es) | C | F | F | C/F | C | C/F | F | C/N | N/F | C/F | F | F | C | · | 5 o 3 | 13 | **Propuesta con reserva** hasta leer el texto de la moción (A8) |
| E06 | Mantener el impuesto a las grandes fortunas. | Ninguna votación específica localizada | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. Reserva |
| E07 | Revalorizar las pensiones cada año según el IPC. | Solo decretos de paquete (2025) | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente válida. Reserva |
| E08 | Bajar el IVA de los alimentos básicos al 0 %. | Solo decretos de paquete | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente válida. Reserva |

### Tema 4: Calidad del empleo

| ID | Afirmación | Fuente | PSOE | PP | VOX | FA | POD | ERC | JxC | BIL | PNV | BNG | CC | UPN | CMP | UPC | Div. | Cob. | Decisión |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| L01 | Reducir la jornada laboral máxima a 37,5 horas semanales sin bajar el sueldo. | S130-10 ✔ (enmiendas a la totalidad: sí = en contra) | F | C | C | F | F | F | C | F | F | F | F | C | F | · | 4 | 13 | **Propuesta** |
| L02 | Que la indemnización por despido improcedente pueda superar los 33 días por año cuando no compense el daño causado al trabajador. | S132-3 ✔ | F | C | C | F | F | F | N | F | F | F | F | C | F | · | 3 | 13 | **Propuesta** |
| L03 | Subir el salario mínimo hasta el 60 % del salario medio. | Ninguna votación (el salario mínimo lo fija el Gobierno por real decreto) | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. **Reserva 1** |
| L04 | Obligar a todas las empresas a registrar la jornada de forma digital, con acceso directo de la Inspección de Trabajo. | Ninguna votación (real decreto) | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. **Reserva 2** |
| L05 | Mantener la reforma laboral de 2021, que limita los contratos temporales. | Ninguna votación en esta legislatura | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. **Reserva 3** |
| L06 | Prohibir las prácticas no remuneradas en empresas. | Ninguna | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. Reserva |
| L07 | Permitir volver parcialmente al trabajo durante una baja médica si el trabajador lo pide. | Ninguna | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. Reserva |
| L08 | Bajar las cotizaciones sociales a las empresas que contraten a jóvenes con contrato indefinido. | Ninguna | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. Reserva |

Votaciones examinadas y no usadas: el RDL 7/2023 del subsidio de desempleo (sesión 15, votación 3, derogado 167–176: Podemos votó en contra por un detalle de cotización de los mayores de 52 años, demasiado técnico para una afirmación) y la PNL de SUMAR sobre la jornada de febrero de 2024 (sesión 23, votación 2), que repite L01.

### Tema 5: Sanidad

| ID | Afirmación | Fuente | PSOE | PP | VOX | FA | POD | ERC | JxC | BIL | PNV | BNG | CC | UPN | CMP | UPC | Div. | Cob. | Decisión |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S01 | Mantener la reforma del copago farmacéutico de 2026, que rebaja lo que pagan por sus medicamentos los pensionistas con menos ingresos. | S183-12 ✔ | F | N | C | F | F | N | N | F | F | F | F | F | F | · | 1 | 13 | **Propuesta** |
| S02 | Limitar por ley que la sanidad pública se gestione a través de empresas privadas. | Proyecto de ley de gestión pública (121/000094), sin votación en el pleno antes de la disolución | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. **Reserva 1** |
| S03 | Crear una Agencia Estatal de Salud Pública. | Votaciones de 2025 aún no leídas en el portal (la prensa habla de un primer «no» de PP, Vox y Junts como protesta ajena a la agencia: [iSanidad](https://isanidad.com/324330/el-congreso-tumba-la-agencia-estatal-de-salud-publica-con-los-votos-en-contra-de-pp-vox-y-junts/); aprobada después: [El Global](https://elglobalfarma.com/politica/congreso-aprueba-agencia-estatal-salud-publica/)) | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada por ahora: falta leer las votaciones oficiales. Reserva |
| S04 | Fijar por ley tiempos máximos de espera para operaciones y consultas, iguales en toda España. | Ninguna votación en el pleno | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. **Reserva 2** |
| S05 | Prohibir fumar en las terrazas de bares y restaurantes. | Proyecto de ley de julio de 2026, sin votación | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. **Reserva 3** |
| S06 | Que los funcionarios de MUFACE pasen a la sanidad pública y dejar de concertar su asistencia con aseguradoras privadas. | PNL rechazada en la Comisión de Sanidad (abril de 2025): no es votación nominal del pleno | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente válida. Reserva |
| S07 | Incluir el dentista en la sanidad pública para toda la población. | Ninguna | · | · | · | · | · | · | · | · | · | · | · | · | · | · | — | 0 | Descartada: sin fuente. Reserva |
| S08 | Aprobar un Pacto de Estado por la Salud Mental. | S13-3 ✔: sí de PP, PSOE, SUMAR, ERC y EH Bildu; abstención de Vox, PNV y Junts; en el Mixto, 3 sí y 5 abstenciones (voto individual pendiente de leer) | F | F | N | F | · | F | N | F | N | · | · | · | F | · | 0 | 9 | **Propuesta con reserva**: nadie vota en contra (división 0); entra solo porque faltan candidatas con datos (A6) |

## Propuesta de 25

Por tema, ordenadas por división (entre paréntesis, división y cobertura). ⚠ = entra con reserva.

**Vivienda**
1. V02 ⚠ · Permitir que el inquilino prorrogue hasta dos años su contrato de alquiler, con las mismas condiciones, cuando llegue a su fin. (6 · 13, sin voto nominal)
2. V04 · Obligar a quien ocupa ilegalmente una vivienda a dejarla en 24 horas si no demuestra que tiene derecho a estar en ella. (4 · 13)
3. V01 ⚠ · Prohibir hasta 2030 los desahucios de hogares vulnerables que no tengan una alternativa de vivienda. (4 · 13, decreto de paquete sin voto nominal)
4. V05 ⚠ · Prohibir durante unos años que los grandes fondos de inversión compren viviendas. (4 · 13, ídem)
5. V03 · Regular por ley los alquileres de temporada y por habitaciones para que tengan las mismas protecciones que el alquiler de vivienda habitual. (3 · 12)

**Inmigración**
6. I03 · Delegar en Cataluña competencias del Estado en inmigración, como la gestión de permisos de residencia y trabajo. (4 · 12)
7. I02 · Suprimir el reparto obligatorio entre comunidades de los menores migrantes no acompañados y que cada comunidad decida cuántos acoge. (2 · 13)
8. I05 · Endurecer los requisitos de la residencia por arraigo, la vía para obtener permiso tras varios años viviendo en España. (2 · 13)
9. I01 · Aprobar una regularización extraordinaria de las personas extranjeras que ya viven y trabajan en España sin permiso de residencia. (1 · 13)
10. I04 ⚠ · Ampliar los casos en que se expulsa a extranjeros en situación irregular y acelerar las expulsiones. (sin fuente todavía: pendiente de las mociones de 2026 o de los programas)

**Economía**
11. E01 · Volver a aplicar un impuesto extraordinario a las grandes empresas energéticas. (5 · 13)
12. E02 · Actualizar cada año todos los tramos del IRPF según la inflación. (3 · 13)
13. E04 · Que el Estado perdone parte de la deuda que las comunidades autónomas tienen con él. (3 · 13)
14. E05 ⚠ · Eximir del IVA a los autónomos y pequeños negocios con ingresos anuales bajos. (5 o 3 · 13, falta identificar el punto)
15. E03 · Que quien cobra el salario mínimo no pague IRPF. (1 · 13)

**Calidad del empleo**
16. L01 · Reducir la jornada laboral máxima a 37,5 horas semanales sin bajar el sueldo. (4 · 13)
17. L02 · Que la indemnización por despido improcedente pueda superar los 33 días por año cuando no compense el daño causado al trabajador. (3 · 13)
18. L03 ⚠ · Subir el salario mínimo hasta el 60 % del salario medio. (sin datos: pendiente de programas)
19. L04 ⚠ · Obligar a todas las empresas a registrar la jornada de forma digital, con acceso directo de la Inspección de Trabajo. (sin datos: pendiente de programas)
20. L05 ⚠ · Mantener la reforma laboral de 2021, que limita los contratos temporales. (sin datos: pendiente de programas)

**Sanidad**
21. S01 · Mantener la reforma del copago farmacéutico de 2026, que rebaja lo que pagan por sus medicamentos los pensionistas con menos ingresos. (1 · 13)
22. S08 ⚠ · Aprobar un Pacto de Estado por la Salud Mental. (0 · 9)
23. S02 ⚠ · Limitar por ley que la sanidad pública se gestione a través de empresas privadas. (sin datos: pendiente de programas)
24. S04 ⚠ · Fijar por ley tiempos máximos de espera para operaciones y consultas, iguales en toda España. (sin datos: pendiente de programas)
25. S05 ⚠ · Prohibir fumar en las terrazas de bares y restaurantes. (sin datos: pendiente de programas)

**Resumen:** 13 afirmaciones tienen ya fuente oficial suficiente y dividen (V03, V04, I01, I02, I03, I05, E01, E02, E03, E04, L01, L02, S01); 4 dependen de la votación del 2-oct sin voto nominal o de identificar el punto de una moción (V01, V02, V05, E05); S08 tiene fuente oficial pero nadie vota en contra; y 7 no tienen todavía ninguna fuente y quedan como reservas hasta que se publiquen los programas (I04, L03, L04, L05, S02, S04, S05). Las reservas «sin datos» se han elegido en el orden de la lista de candidatas, porque el protocolo no da una regla para elegir entre afirmaciones sin fuente. Si con los programas siguen sin fuente para la mitad de las candidaturas, se descartan.

### Equilibrio «cambiar / mantener» (§2.3)

- Proponen mantener la situación actual o revertir un cambio: I02 (revertir el reparto obligatorio de menores), S01 y L05 (mantener).
- Con la redacción actual, «de acuerdo» coincide con el voto de PP y Vox en V04, I02, I05, E02, E03 y E05, y con el de PSOE y FA en V01, V02, V03, V05, I01, I03, E01, E04, L01, L02 y S01. **Pendiente:** al redactar el texto final, invertir de forma neutra el sentido de dos o tres afirmaciones (como se ha hecho con I02) para que «de acuerdo» no favorezca a ningún bloque. El responsable decide cuáles.

## Casos dudosos y decisiones pendientes para el responsable

| # | Caso | Propuesta |
|---|---|---|
| A1 | **Decretos de paquete** (V01, V05, V06, V07: primer decreto de vivienda; E07, E08). El voto se emite sobre todo el decreto, no sobre cada medida. | Decidir por escrito si una votación de paquete cuenta como «sustancialmente igual» para cada medida que contiene (§3.1). Mientras no se decida, V01 y V05 entran con reserva y V06–V08 quedan en reserva. |
| A2 | **Votación del 2-oct-2026 sin voto nominal publicado.** | Esperar a que el Congreso lo publique o pedirlo. Sin él, V01, V02 y V05 no tienen fuente oficial (§3.1) y se sustituyen por reservas. |
| A3 | **Mociones votadas por puntos** (E03, E05, I07): el fichero oficial dice «Punto 4», pero no el texto del punto. | Leer el texto de cada moción en el BOCG y confirmar qué punto corresponde a cada medida antes de codificar. |
| A4 | **Sin programas.** | Repetir la selección cuando se publiquen, antes del 11-nov. Empleo y sanidad dependen de ello: hoy solo tienen dos afirmaciones cada uno con fuente válida. |
| A5 | **Votos divididos dentro de una candidatura** en I03: Compromís (Ibáñez en contra, Micó a favor) y CHA (Pueyo en contra, dentro del grupo SUMAR, que votó a favor). | Compromís: posición dudosa (D7 de `partidos.md`). CHA: afecta a la coalición CHA-Frente Amplio de Huesca y Zaragoza, que toma la posición de CHA (§1); se resolverá al codificar. |
| A6 | **I01** reparte poco (solo Vox en contra) y **S08** no tiene ningún voto en contra. | Se mantienen porque no hay alternativas con fuente en su tema. Si los programas aportan otras que dividan más, las sustituyen. |
| A7 | **Dos votaciones de la misma medida con distinto voto** (V03: Junts votó en contra en septiembre de 2024 y a favor en diciembre de 2024 de una versión con cambios). | El protocolo no dice qué votación prevalece. Propuesta: tomar la más reciente y mencionar la otra en la justificación. Decide el responsable. |
| A8 | **E02 y E05:** en la PNL de 2024 el grupo SUMAR votó en contra de deflactar el IRPF; en la moción de 2026 votó a favor de uno de los dos puntos fiscales (según la nota del PP, el de deflactar). | Ídem A7, y confirmar con el texto de la moción (A3). |
