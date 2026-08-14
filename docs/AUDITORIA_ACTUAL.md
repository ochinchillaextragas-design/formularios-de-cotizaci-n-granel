# Auditoría del cotizador actual

## Alcance

La fuente auditada es el `index.html` original de 1,48 MB y 1.360 líneas, preservado sin alteraciones en `legacy/cotizador-original.html`. Es una aplicación autocontenida: estructura, estilos, lógica y recursos gráficos base64 conviven en un único archivo.

## Estructura visual

- Franja institucional, barra fija de acciones y documento central con apariencia de cotización imprimible.
- Encabezado con marca, número, fecha y validez; banner fotográfico; secciones colapsables; pie institucional y firmas.
- Paleta principal azul `#060E9F`, verde `#00953A` y violeta `#606DB2` reservado principalmente al tanque/guía técnica.
- CSS responsive y reglas específicas de impresión, incluidas correcciones para que la tabla de materiales no desborde el PDF.
- Logo, fotografía, marca de agua y cinco planos están embebidos como data URI/base64. Esto explica casi todo el peso del archivo y dificulta cacheo, mantenimiento y versionado.

## Campos relevados

**Documento:** número de cotización, fecha y validez fija de 15 días.

**Cliente:** razón social/nombre, CUIT/DNI, teléfono, email, dirección de instalación, localidad y provincia.

**Instalación:** categoría, tipo específico, consumo estimado en m³/mes, capacidad y ubicación del tanque, observaciones.

**Materiales:** descripción, cantidad, unidad, precio unitario y subtotal por fila; altas y bajas dinámicas.

**Mano de obra:** horas, costo por hora y subtotal calculado.

**Condiciones:** texto editable y espacios para firmas.

Ningún campo usa `required`; tampoco hay validación de CUIT/DNI, teléfono, coherencia entre tipo y tanque, límites comerciales, vigencia ni mensajes de error por campo. Los `min` numéricos son una ayuda del navegador, no una validación integral.

## Comportamiento y cálculos

- Los tipos específicos dependen de cuatro categorías: residencial, comercial, industrial y agro.
- Sólo cuatro tipos poseen un catálogo sugerido de materiales: vivienda con calefacción/ACS, restaurante/parrilla, fábrica/proceso productivo y criadero.
- Elegir uno de esos tipos puede reemplazar, previa confirmación, todas las filas existentes.
- Cada subtotal es `cantidad × precio unitario`.
- Mano de obra es `horas × costo hora`; el costo inicial es `$ 8.500`.
- Base imponible es materiales más mano de obra; IVA fijo del 21%; total es base más IVA.
- Los importes se muestran con formato `es-AR`, pero los valores persistidos quedan como strings y no hay modelo de moneda, descuentos, flete, redondeo ni impuestos configurables.

## Selector y planos

El selector ofrece 500, 1.000, 2.000, 4.000 y 7.300 litros. Cada valor apunta a una imagen base64 y una leyenda. Al cambiar la capacidad se oculta el estado vacío y se muestra el plano correspondiente. Los planos son ilustrativos y el propio documento indica que deben ajustarse al relevamiento y normativa.

## Persistencia, nueva cotización e impresión

- `guardarCotizacion()` serializa documento, cliente, instalación, ítems, mano de obra y condiciones en la única clave `extragas_cotizacion` de `localStorage`.
- Cada guardado sobrescribe el anterior. No hay listado, búsqueda, IDs estables, versiones, estados ni recuperación ante JSON corrupto.
- `cargarCotizacion()` recupera sólo esa última cotización, con confirmación antes de reemplazar la pantalla.
- “Nueva cotización” recarga la página; los cambios no guardados se pierden tras un `confirm`.
- “Descargar PDF” expande secciones, cambia temporalmente el título y llama a `window.print()`. No genera ni descarga por sí mismo un PDF; depende del diálogo y capacidad de impresión del navegador.

## Reglas, precios y contenido hardcodeado

- Catálogo de categorías/tipos, cuatro listas de materiales y todos sus precios están en JavaScript.
- IVA 21%, validez de 15 días, costo hora, moneda, condiciones comerciales, garantías y exclusiones están fijos en HTML/JS.
- Las referencias a NAG 200/201 y ENARGAS están como texto informativo, sin versión, fecha de revisión ni fuente administrable.
- No existe separación entre configuración comercial, catálogo, datos de cotización y presentación.

## Inconsistencias y riesgos

1. **7.300 vs. 8.000 litros:** selector y plano máximo indican 7.300 L, pero el preset “Fábrica - Proceso productivo” agrega “Tanque GLP 8000 L”. Puede cotizarse un producto que no coincide con la capacidad/plano seleccionado.
2. **Una sola cotización local:** `localStorage` sobrescribe la única clave y está ligado al navegador/dispositivo; no constituye historial ni respaldo.
3. **PDF indirecto:** `window.print()` no asegura nombre, formato, contenido ni almacenamiento de un archivo PDF.
4. **Precios/materiales rígidos:** actualizar catálogo requiere editar código y volver a distribuir el archivo; no hay vigencia, moneda, proveedor ni auditoría.
5. **Validación ausente:** se puede guardar o imprimir una cotización incompleta o inconsistente.
6. **CRM ausente:** no hay usuarios, roles, permisos, clientes reutilizables, responsables, etapas, tareas, notas, actividad, historial, seguimiento ni métricas.
7. **Seguridad e integridad:** cualquier usuario puede modificar precios y condiciones; no hay autenticación ni trazabilidad.
8. **Mantenibilidad:** handlers inline, acceso global al DOM, estado implícito y base64 gigantes acoplan toda la solución.
9. **Cobertura parcial:** la mayoría de los tipos no carga materiales sugeridos.
10. **Manejo de errores:** el JSON de `localStorage` se parsea sin `try/catch`; un valor corrupto detiene la carga.

## Decisión para fase 1

El original permanece disponible y funcional como referencia. La app V2 introduce un modelo tipado, componentes por responsabilidad y datos/configuración separados, sin backend, Supabase ni datos ficticios. La persistencia real y la migración automática de recursos se reservan para fases posteriores.
