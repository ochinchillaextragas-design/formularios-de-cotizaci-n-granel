# Plan de migración

## Fase 1 — Base y preservación (actual)

- Preservar el archivo original íntegro.
- Auditar reglas, datos, recursos, cálculos y riesgos.
- Crear React + TypeScript + Vite y límites de componentes.
- Mantener identidad visual, edición básica, cálculos e impresión.
- No agregar backend, Supabase, usuarios ni datos ficticios.

## Fase 2 — Paridad funcional controlada

- Extraer automáticamente logo, banner, marca de agua y planos base64 a activos versionables; verificar hashes.
- Migrar todos los presets y reglas a catálogos tipados, previa resolución comercial de 7.300/8.000 L.
- Centralizar cálculos, IVA, moneda y condiciones; agregar pruebas unitarias.
- Implementar validación de formulario y accesibilidad.
- Agregar borradores locales múltiples con versión de esquema, importación/exportación y recuperación de errores.
- Comparar visualmente pantalla e impresión con el legado.

## Fase 3 — Cotizaciones reales

- Diseñar esquema y políticas de seguridad; recién entonces evaluar/incorporar Supabase.
- Implementar autenticación, organizaciones, roles y permisos.
- Persistir clientes, cotizaciones versionadas, catálogo y precios con vigencia.
- Generar PDF determinista y almacenar documentos con trazabilidad.
- Incorporar estados de cotización, aprobación y registro de cambios.

## Fase 4 — CRM comercial

- Oportunidades, embudo, responsables, notas, tareas y próximas acciones.
- Historial de contactos y seguimiento por cliente/cotización.
- Búsqueda, filtros, tableros y métricas.
- Notificaciones e integraciones sólo tras definir permisos, consentimiento y coste.

## Criterios transversales

- Migrar por módulos, no mediante una reescritura única.
- Mantener el legado accesible hasta aprobar paridad.
- No introducir dependencias de pago para funciones básicas.
- Cada fase requiere build, lint, pruebas relevantes y revisión visual/impresa.
