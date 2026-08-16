# Plan de migración

## Fase 1 — Base y preservación (completa)

- Preservar el archivo original íntegro.
- Auditar reglas, datos, recursos, cálculos y riesgos.
- Crear React + TypeScript + Vite y límites de componentes.
- Mantener identidad visual, edición básica, cálculos e impresión.
- No agregar backend, Supabase, usuarios ni datos ficticios.

## Fase 2 — Paridad funcional controlada (EN CURSO)

**La Fase 2 no está completa.** Falta el plano de 6.000 L, el banner y la marca
de agua, y la comparación A4 definitiva contra el legado.

### Resuelto

- **Planos técnicos integrados** para 500, 1.000, 2.000, 4.000 y 7.300 L, como
  SVG independientes verificados contra el manifiesto de origen. **6.000 L sigue
  sin plano fuente** y muestra su estado pendiente. Detalle, nota técnica y
  discrepancia de cotas en [PLANOS_TECNICOS.md](PLANOS_TECNICOS.md).
- **Presets atados a su capacidad de tanque:** aplicar un preset actualiza
  materiales y tanque en una sola operación, sin estados intermedios
  contradictorios.
- **Aviso permanente de valores ficticios**, independiente del contenido de los
  materiales, visible en pantalla y en el impreso.
- **Materiales editables en teléfono** como tarjetas apiladas, sin
  desplazamiento horizontal.
- **Catálogo de seis capacidades tipado:** 500 / 1.000 / 2.000 / 4.000 / 6.000 /
  7.300 L, cada una con equivalencia en m³ y descripción comercial.
- **Eliminación activa del tanque de 8.000 L.** No existe como capacidad
  ofrecible, y el preset industrial que lo mencionaba pasó a 7.300 L. La
  discrepancia de la auditoría queda cerrada, con pruebas que lo verifican.
- **Retiro público del legado.** `legacy/cotizador-original.html` sigue
  versionado como referencia interna y testigo de paridad, pero no se publica:
  no se copia a `dist`, no se sirve y no se enlaza desde la interfaz.
- **Módulo de prospección granel** (detección, clasificación GLP, deduplicación,
  scoring e interfaz responsive). Ver
  [ARQUITECTURA_PROSPECCION.md](ARQUITECTURA_PROSPECCION.md).
- **Validaciones previas a la impresión:** número, fecha, cliente, tanque, email,
  cantidades mínimas, importes no negativos y números finitos. Los errores se
  muestran dentro de la interfaz y se recalculan sobre la cotización actual.
- **Los cuatro presets heredados** migrados a catálogo tipado, con confirmación
  antes de reemplazar materiales cargados y aviso visible de que los importes son
  ficticios.
- **Extracción del logotipo** a `src/assets/extragas-logo.png`.
- **Secciones colapsables accesibles**, que se imprimen expandidas.

### Pendiente

- **Plano técnico de 6.000 L.** Es la única capacidad sin plano fuente. Hasta
  que exista, la interfaz informa "Plano técnico pendiente de incorporación" en
  lugar de reutilizar otro plano o generar una ilustración. Integrarlo será
  agregar su entrada a `tankPlans` en `src/data/catalog.ts`.
- **Validación de Ingeniería y Seguridad** de las cotas de los planos ya
  integrados, incluida la discrepancia 1.400 / 1.500 mm registrada en
  [PLANOS_TECNICOS.md](PLANOS_TECNICOS.md).
- **Banner fotográfico y marca de agua.** Siguen embebidos en base64 dentro del
  legado; todavía no se extrajeron como activos versionables.
- **Manifiesto de activos y script de extracción reproducible.** No existen aún:
  el logotipo se extrajo de forma puntual.
- **Comparación A4 definitiva** de pantalla e impresión contra el legado, que
  sólo puede cerrarse con los planos reales incorporados.
- **Centralización de moneda y condiciones** con pruebas adicionales.
- **Borradores locales múltiples** con versión de esquema, importación/exportación
  y recuperación de errores.

## Fase 3 — Cotizaciones reales (pendiente)

- Diseñar esquema y políticas de seguridad; recién entonces evaluar/incorporar Supabase.
- Implementar autenticación, organizaciones, roles y permisos.
- Persistir clientes, cotizaciones versionadas, catálogo y precios con vigencia.
- Generar PDF determinista y almacenar documentos con trazabilidad.
- Incorporar estados de cotización, aprobación y registro de cambios.
- Para prospección: mover Overpass y Nominatim al servidor con caché, y persistir
  prospectos, asignaciones y el vínculo prospecto → cotización.

## Fase 4 — CRM comercial (pendiente)

- Oportunidades, embudo, responsables, notas, tareas y próximas acciones.
- Historial de contactos y seguimiento por cliente/cotización.
- Búsqueda, filtros, tableros y métricas.
- Notificaciones e integraciones sólo tras definir permisos, consentimiento y coste.
- Para prospección: sumar proveedores adicionales (Google Places con credencial de
  backend, padrones oficiales), deduplicar por identidad fiscal y medir conversión
  por rubro y territorio.

## Criterios transversales

- Migrar por módulos, no mediante una reescritura única.
- No introducir dependencias de pago para funciones básicas.
- No inventar activos técnicos: si un plano falta, se declara faltante.
- Ningún importe de la demostración se presenta como tarifa comercial real.
- Cada fase requiere build, lint, pruebas relevantes y revisión visual/impresa.
