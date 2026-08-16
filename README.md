# Extragas — Cotizador GLP a Granel App V2

Base React + TypeScript + Vite para evolucionar el cotizador existente hacia una aplicación de cotizaciones y CRM comercial, preservando su identidad y el original funcional.

## Ejecutar localmente

Requiere Node.js y npm.

```bash
npm install
npm run dev
```

Verificaciones:

```bash
npm run build
npm run lint
```

Todo lo incluido en esta fase se ejecuta localmente con coste USD 0.

## Estructura

- `src/components`: módulos de interfaz y cotización.
- `src/prospecting`: módulo de prospección granel (detección, clasificación, scoring y pantalla).
- `src/data`: catálogos/configuración temporal desacoplados de la UI.
- `src/types`: modelo tipado del dominio.
- `src/utils`: funciones puras compartidas.
- `docs`: auditoría, arquitectura y plan incremental.
- `legacy/cotizador-original.html`: copia íntegra del cotizador previo a la migración.

## Sobre el archivo original

`legacy/cotizador-original.html` se conserva **como referencia interna del
repositorio**. No se publica: no se copia a `dist`, no se sirve desde la
aplicación y no hay ningún enlace hacia él en la interfaz. Para consultarlo, se
abre el archivo directamente desde el repositorio.

No modificar su contenido: es el testigo contra el que se compara la paridad
funcional de la migración.

## Módulos

- **Cotizador**: edición de datos, selector de tanque, materiales, mano de obra,
  IVA 21% y total, con validación previa a la impresión.
- **Planos técnicos**: cinco capacidades traen plano de referencia integrado; 6.000 L queda pendiente. Ver [los planos](docs/PLANOS_TECNICOS.md).
- **Prospección**: detecta empresas del territorio con consumo térmico compatible
  con GLP, las puntúa y las deriva al cotizador. Ver
  [la arquitectura de prospección](docs/ARQUITECTURA_PROSPECCION.md).

## Alcance de la demo

No hay backend ni persistencia: la acción de guardado no almacena nada y no se
agregó Supabase ni ninguna base de datos.

**Los valores económicos son ficticios.** Los materiales sugeridos y sus precios
vienen de la demostración original de Extragas y no son tarifa comercial
vigente. La aplicación lo señaliza de forma permanente junto al Resumen
Económico, en pantalla y en el impreso:

> Demo comercial — materiales, mano de obra y costos ficticios sujetos a
> validación de Extragas.

Las empresas del módulo de prospección, en cambio, **son reales**: provienen de
OpenStreetMap y cada una enlaza a su registro de origen.

Leé [la auditoría](docs/AUDITORIA_ACTUAL.md), [la arquitectura](docs/ARQUITECTURA_APP_V2.md) y [el plan](docs/PLAN_MIGRACION.md) antes de continuar la migración.
