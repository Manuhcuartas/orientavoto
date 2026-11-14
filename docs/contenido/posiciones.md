# Posiciones de cada candidatura en las 25 afirmaciones (protocolo §3)

Documento de trabajo de la tarea 4.0. Preparado por Claude el 14 de noviembre de 2026 aplicando `docs/PROTOCOLO.md` §3 (tablas 3.2 y 3.3) y las reglas A1–A8 y D1–D10 de `afirmaciones.md` y `partidos.md`. **Borrador:** pendiente de la verificación por muestreo del responsable (§4.2) y de la revisión de los partidos en 72 horas (§4.3). Las tablas de cada partido, con la cita literal, el enlace y la fecha de cada posición, están en `posiciones/<id>.md` y son las que se adjuntan al correo.

## Programas del 29-N

| Candidatura | Programa | Fecha | Estado a 14-11-2026 |
|---|---|---|---|
| PSOE | — | — | No publicado; anunciado para el 15-11. **Hay que revisarlo antes del 16-11** |
| PP | [Programa electoral del PP para el 29-N, «La Reconstrucción Nacional»](https://www.pp.es/wp-content/uploads/2026/11/LA-RECONSTRUCCION-NACIONAL.pdf) | 10-11-2026 | Publicado |
| VOX | [Programa electoral de Vox para el 29-N, «Es sentido común»](https://www.voxespana.es/wp-content/uploads/2026/11/Programa-completo-A5-1.pdf) | 12-11-2026 | Publicado |
| FA | — | — | No publicado |
| PODEMOS | — | — | No publicado |
| ERC | — | — | Anunciado el 5-11 (258 propuestas), pero no localizado en esquerra.cat |
| JxCat | — | — | No publicado |
| EH Bildu | — | — | No publicado |
| EAJ-PNV | [Programa de EAJ-PNV para las elecciones generales de 2026](https://www.eaj-pnv.eus/es/adjuntos-documentos/21765/pdf/programa-electoral-29n) | 09-11-2026 | Publicado |
| BNG | [29N. Xerais 2026. Programa electoral do BNG](https://www.bng.gal/media/bnggaliza/files/2026/11/03/26_bng_xerais_documentos_programa_electoral.pdf) | 03-11-2026 | Publicado |
| CC | [«Defiende Canarias». Bases del programa electoral de CC y Municipalistas Primero Canarias para el 29-N](https://primerocanarias.com/wp-content/uploads/2026/11/CCA-26-Programa_Electoral-29NOV-comprimido.pdf) | 09-11-2026 | Publicado |
| UPN | — | — | Sin programa propio localizado (va en coalición con el PP) |
| Compromís | — | — | No localizado |
| Comuns | — | — | No localizado |
| CHA | — | — | No localizado |
| NC-BC | — | — | No localizado (UPC) |

Notas: la fecha del programa de Vox es la de su presentación (el PDF está generado el 4-11). El de CC está en la web de Municipalistas Primero Canarias, su socio de coalición. Las citas del BNG están en gallego, tal como aparecen en su programa. En las citas de los PDF se han unido las palabras partidas por guion al final de línea.

**Fuentes que faltan.** Sin programa, la posición de PSOE, Frente Amplio, Podemos, ERC, Junts, EH Bildu, UPN, Compromís, Comuns y CHA sale solo de sus votaciones. Cuando el PSOE publique su programa (anunciado para el 15-11) hay que repetir su tabla antes de la congelación del 16-11 (§5).

## Cómo se ha codificado

- **Votación:** voto mayoritario de los diputados de cada partido (§3.1), leído en el fichero oficial de votaciones nominales del Congreso de la votación elegida para cada afirmación (tabla de `afirmaciones.md`).
- **Programa:** solo se usa si trata la misma medida. Si trata una medida distinta del mismo tema, no se usa.
- **Combinación** (tabla 3.2): si coinciden, se citan ambos; si son contrarios (a favor frente a en contra), manda la votación; si el programa es claro y el partido se abstuvo, vale el programa; sin programa, abstención = neutral.
- **Sin posición** solo cuando no hay votación ni programa, o cuando los diputados del partido votaron divididos (A5).

## Resumen

Columnas: afirmaciones a01–a25. F = a favor, C = en contra, N = neutral, · = sin posición.

| Candidatura | a01 | a02 | a03 | a04 | a05 | a06 | a07 | a08 | a09 | a10 | a11 | a12 | a13 | a14 | a15 | a16 | a17 | a18 | a19 | a20 | a21 | a22 | a23 | a24 | a25 | Con posición |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PSOE | F | C | N | F | F | F | C | C | C | F | F | C | C | F | C | F | F | F | C | F | F | C | F | F | C | 25/25 |
| PP | C | F | C | C | C | C | F | F | F | F | C | F | F | C | F | C | C | C | F | F | C | F | N | F | F | 25/25 |
| VOX | C | F | C | C | C | C | F | F | F | C | C | F | F | C | F | C | C | C | C | C | C | F | C | F | F | 25/25 |
| FA | F | C | F | F | F | F | C | C | C | F | F | C | C | F | F | F | F | F | F | F | F | C | F | F | C | 25/25 |
| PODEMOS | F | C | F | F | F | C | C | C | C | F | F | C | C | F | C | F | F | F | F | F | F | C | F | F | C | 25/25 |
| ERC | F | C | F | F | F | F | C | C | C | F | F | C | C | F | F | F | F | F | F | F | F | C | N | N | C | 25/25 |
| JxCat | C | N | C | F | F | F | F | C | C | F | C | F | N | F | F | C | C | N | N | F | C | C | N | N | C | 25/25 |
| EH Bildu | F | C | F | F | F | F | C | C | C | F | F | C | C | F | N | F | F | F | F | F | F | C | F | N | C | 25/25 |
| EAJ-PNV | N | N | N | F | F | F | N | C | C | F | C | N | C | F | F | F | F | F | F | F | N | C | F | C | C | 25/25 |
| BNG | F | C | F | F | F | F | C | C | C | F | F | C | F | F | F | F | F | F | F | F | F | C | F | F | C | 25/25 |
| CC | F | F | N | F | F | F | N | C | C | F | N | F | C | F | F | F | N | F | C | F | C | F | F | N | C | 25/25 |
| UPN | C | F | C | C | C | C | F | N | N | F | C | F | F | C | F | C | C | C | F | F | F | F | F | F | N | 25/25 |
| Compromís | F | C | F | F | F | · | C | C | C | F | F | C | C | F | · | F | F | F | F | F | F | C | F | F | C | 23/25 |
| Comuns | F | C | F | F | F | F | C | C | C | F | F | C | C | F | F | F | F | F | F | F | F | C | F | F | C | 25/25 |
| CHA | · | · | · | F | F | C | · | C | C | F | F | C | C | · | · | F | · | F | F | F | · | C | · | F | C | 16/25 |
| NC-BC | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | 0/25 |

Las coaliciones toman las posiciones de su partido de referencia (§1 y `partidos.md`): UPN-PP → UPN; EH Bildu-ERC → EH Bildu; Comuns-Front Ampli → Comuns; Chunta Aragonesista-Frente Amplio → CHA; Compromís: Front Valencià → Compromís; Coalición Canaria-Municipalistas Primero Canarias (y al revés en Las Palmas) → CC; Unidad del Pueblo Canario → NC-BC; Frente Amplio y sus variantes de nombre (Andaluz, Asturies, Fronte Ampla, Fronte Zabala) y Aramés-Front Ampli → Frente Amplio.

**Cobertura** (umbrales de `meta.json`: aviso por debajo del 75 %, fuera del ranking por debajo del 50 %): todas las candidaturas tienen posición en 25 de 25 salvo Compromís (23), CHA (16: 64 %, con aviso) y NC-BC (0: la coalición UPC queda en el bloque «No hay datos suficientes»).

## Casos dudosos (§3.5)

| Candidatura | Afirmación | Motivo | Decisión aplicada |
|---|---|---|---|
| PP | a10 | Programa y votación contrarios: se aplica la votación (tabla 3.2). | Votación |
| VOX | a03 | Programa con versión parcial de la medida y votación en sentido claro; la tabla 3.2 no lo prevé (§3.5). | Votación; que lo confirme el responsable |
| VOX | a05 | Programa con versión parcial de la medida y votación en sentido claro; la tabla 3.2 no lo prevé (§3.5). | Votación; que lo confirme el responsable |
| EAJ-PNV | a13 | Programa con versión parcial de la medida y votación en sentido claro; la tabla 3.2 no lo prevé (§3.5). | Votación; que lo confirme el responsable |
| BNG | a12 | Programa y votación contrarios: se aplica la votación (tabla 3.2). | Votación |
| Compromís | a06 | Diputados divididos (A5): sin posición. | Sin posición (A5) |
| Compromís | a15 | Diputados divididos (A5): sin posición. | Sin posición (A5) |
| PP | a02 | El programa habla de 48 horas y la afirmación de 24; el PP votó a favor de su propia ley de 24 horas. Se codifica a favor. | A favor, como el voto; que lo confirme el responsable |
| CHA | todas | Jorge Pueyo, de CHA según la prensa (su ficha oficial no indica partido), dejó el escaño el 30-01-2026; su sustituta, Laura Vergara, no consta como de CHA. Sin diputado en 9 votaciones posteriores. En a12 se usa la votación anterior (A7) | 16 de 25; que el responsable confirme que CHA-Frente Amplio debe tomar las posiciones de CHA (D-tabla de `partidos.md`) |
| Comuns | todas | No hay dato oficial de afiliación: se toman como Comuns los diputados del grupo SUMAR elegidos en Barcelona, Girona y Tarragona (Pisarello, Aina Vidal, Badia, Boada, López Tagliafico, Ogou, Alonso Cantorné; Gala Pin hasta 2025) | Votaron siempre igual que el resto del grupo SUMAR, así que el resultado no cambia si se toman como Frente Amplio |
| Frente Amplio | todas | Voto del grupo SUMAR sin los diputados de Comuns, Compromís (Ibáñez) y CHA (Pueyo) (D1, D2) | Aplicado |
| NC-BC (UPC) | todas | Sin diputados ni programa localizado | Sin posición; UPC aparecerá en «No hay datos suficientes» salvo que publique programa antes del 16-11 |
| PSOE | todas | Programa anunciado para el 15-11 | Revisar su tabla con el programa antes del 16-11 |

## Volcado a `data/`

- `data/posiciones/<id>.json`: una entrada por afirmación con la posición, la justificación (con la cita del programa cuando la hay) y sus fuentes con enlace y fecha. Las coaliciones no tienen fichero propio: heredan las de su partido de referencia.
- `data/partidos.json`, `coaliciones.json` y `candidaturas.json` siguen `partidos.md`: candidaturas proclamadas en el BOE del 3-nov. Sin «Podemos (Paz, Casa y Trabajo)» en Ceuta (D6). Los nombres del PSOE en cada federación (PSC, PSdeG, PSE-EE…) no se muestran porque el modelo de datos solo tiene un nombre por partido.
- Partidos que solo aparecen dentro de coaliciones: Izquierda Unida (también por EUPV y EU), Movimiento Sumar y Municipalistas Primero Canarias.
- **Colores:** aproximados al color corporativo de cada partido. Pendientes de comprobar con su manual de marca. Solo se usan como marca pequeña junto a las siglas.
- `meta.json` sigue con `ficticio: true` (el cambio es de la tarea 4.2). `npm run validate`: 0 errores y 2 avisos de cobertura (CHA-Frente Amplio, 64 %; UPC, 0 %).

## Pendiente

1. Programa del PSOE (15-11) y de cualquier otra candidatura que publique antes del 16-11: repetir su tabla.
2. Verificación por muestreo del responsable: al menos 1 de cada 5 posiciones (§4.2).
3. Enviar a cada partido su tabla (`posiciones/<id>.md`) con `docs/CORREO-PARTIDOS.md` y registrar las respuestas (§4.3).
