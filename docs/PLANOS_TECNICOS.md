# Planos técnicos de referencia

Estado: **integrados** para cinco de las seis capacidades del catálogo.

---

## Qué hay integrado

| Capacidad | Plano | Documento | Archivo |
|---|---|---|---|
| 500 L / 0,5 m³ | ✔ | `EXT-GLP-REF-500` | `src/assets/extragas/plans/plano-tecnico-500l.svg` |
| 1.000 L / 1 m³ | ✔ | `EXT-GLP-REF-1000` | `src/assets/extragas/plans/plano-tecnico-1000l.svg` |
| 2.000 L / 2 m³ | ✔ | `EXT-GLP-REF-2000` | `src/assets/extragas/plans/plano-tecnico-2000l.svg` |
| 4.000 L / 4 m³ | ✔ | `EXT-GLP-REF-4000` | `src/assets/extragas/plans/plano-tecnico-4000l.svg` |
| **6.000 L / 6 m³** | **✘ sin plano** | — | — |
| 7.300 L / 7,3 m³ | ✔ | `EXT-GLP-REF-7300` | `src/assets/extragas/plans/plano-tecnico-7300l.svg` |

### 6.000 L

No existe plano fuente para esa capacidad. **No se reutiliza el de otra ni se
dibuja un sustituto.** La interfaz muestra:

> Plano técnico pendiente de incorporación

Cuando el plano exista, integrarlo es agregar la entrada correspondiente a
`tankPlans` en `src/data/catalog.ts` y su código de documento. El modelo ya lo
contempla; no hace falta tocar componentes.

---

## Nota técnica obligatoria

Estos planos son **material de referencia comercial y de preevaluación**, no
documentación constructiva certificada.

- **Las medidas y condiciones requieren validación final de Ingeniería y
  Seguridad de Extragas.**
- En la documentación de origen había una **discrepancia entre 1.400 mm y
  1.500 mm** para el ancho de platea de las capacidades de 1 y 2 m³: los
  presupuestos indicaban 2500 × 1400 mm y el plano técnico 2500 × 1500 mm.
  **Se priorizó la medida de 1.500 mm indicada en el plano técnico**, y queda
  registrada acá para que Ingeniería la confirme.
- **No debe utilizarse esta demo para ejecutar una obra sin revisión
  profesional.** No reemplaza proyecto ejecutivo, cálculo, relevamiento de
  sitio, firma de instalador matriculado ni validación contra normativa
  NAG/ENARGAS vigente.

El mismo aviso viaja en la interfaz, debajo de cada plano, y se imprime con la
cotización.

---

## Decisiones de integración

**Formato.** Se integran los SVG, no los PNG ni los PDF: son nítidos a cualquier
escala y no se degradan al imprimir en A4.

**Archivos independientes.** Cada SVG pesa ~230 kB, muy por encima del umbral de
inline de Vite, así que se sirven como recursos aparte. El bundle de JavaScript
no los contiene.

**Relación de aspecto.** Los SVG declaran `viewBox="0 0 1400 990"` (A4
apaisado). Se muestran con `<img>` a ancho completo y alto automático: no se
recortan ni se deforman en teléfono, escritorio o impresión.

**Texto alternativo.** Cada plano describe capacidad, código de documento y
contenido del esquema.

**7.300 L.** El plano entregado corresponde a la instalación **superficial**
disponible. No se inventó una variante subterránea.

**Impresión.** El plano no se parte entre páginas (`break-inside: avoid`) y
conserva sus rellenos con `print-color-adjust: exact`.

---

## Procedencia y verificación

Los activos llegaron en `extragas-planos-tecnicos-integracion.zip`, con
`manifest.json` y hashes SHA-256. Los cinco SVG integrados fueron verificados
contra ese manifiesto antes de copiarlos:

| Archivo | SHA-256 |
|---|---|
| `plano-tecnico-500l.svg` | `cffac715a9fbcdad0d22ed2b6f46573a66936a6a013f9a560e76c106dfae519f` |
| `plano-tecnico-1000l.svg` | `63536b163887258af85ece84f689c96f20d95441c2b178690a693d76020af963` |
| `plano-tecnico-2000l.svg` | `8a5f6fae34a5248315138a437b8b07ed176c30d094886ceb69399845db0a7faa` |
| `plano-tecnico-4000l.svg` | `4ce57e61166a891bdf72a6a77321163c5fcd6d6ac4fa3856c96caab45a76c192` |
| `plano-tecnico-7300l.svg` | `01831842d82edfe822e072cba0738aec52a523c09f2f7b78134f298236a6f0d5` |

El paquete de origen incluye además vistas previas PNG, PDF individuales, un PDF
combinado y el generador reproducible `tools/generate_extragas_plans.py`. **Nada
de eso se versiona en este repositorio**: sólo los cinco SVG que la aplicación
usa. El resto queda en el paquete de origen como material de trabajo.
