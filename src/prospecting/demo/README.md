# Datos de demostración — procedencia

## Qué hay acá

| Archivo | Contenido |
|---|---|
| `osm-canuelas-2026-08-15.demo.json` | 387 empresas reales de OpenStreetMap |
| `osm-canuelas-2026-08-15.overpass.ql` | La consulta exacta que produjo ese archivo |

## Cómo se obtuvo

1. **Geocodificación.** `Cañuelas, Buenos Aires, Argentina` se resolvió contra
   Nominatim el 2026-08-15 → `-35.0540248, -58.7617379`.
2. **Consulta.** Se ejecutó `osm-canuelas-2026-08-15.overpass.ql` contra
   `https://maps.mail.ru/osm/tools/overpass/api/interpreter` (mirror de Overpass)
   con radio de 35 000 m. Devolvió 387 elementos.
3. **Recorte.** Se conservaron sólo los elementos con nombre y coordenada, y de
   cada uno únicamente las etiquetas útiles para prospectar (nombre, contacto,
   dirección y las claves de clasificación). No se agregó, completó ni modificó
   ningún valor.

## Garantía sobre el contenido

**Ninguna empresa de este archivo es inventada.** Todas existen en la base de
OpenStreetMap y pueden verificarse una por una: cada prospecto de la interfaz
enlaza a su registro original en `openstreetmap.org`.

Las empresas que no publican teléfono, sitio web o dirección aparecen
incompletas. No se rellenan con datos estimados ni con marcadores de posición
que parezcan reales.

## Licencia

© OpenStreetMap contributors — ODbL 1.0. La atribución se muestra en la interfaz
y no debe quitarse.

## Cómo regenerarlo

```bash
curl -s -A "ExtragasProspeccionGranel/0.1 (contacto@ejemplo)" \
  -X POST --data-urlencode "data@osm-canuelas-2026-08-15.overpass.ql" \
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter" \
  -o crudo.json
```

Los datos de OSM cambian con el tiempo: una recaptura va a devolver un conjunto
distinto. Si se regenera, actualizar `capturedAt` y la fecha del nombre del
archivo para que la interfaz siga informando la fecha correcta.

## Nota sobre el endpoint

El mirror de Mail.ru **no es una fuente independiente**: sirve los mismos datos
de OpenStreetMap que `overpass-api.de`. Se lo usa por disponibilidad, no por
cobertura adicional.
