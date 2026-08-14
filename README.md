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
- `src/data`: catálogos/configuración temporal desacoplados de la UI.
- `src/types`: modelo tipado del dominio.
- `src/utils`: funciones puras compartidas.
- `docs`: auditoría, arquitectura y plan incremental.
- `legacy/cotizador-original.html`: copia íntegra y funcional previa a la migración.

La app V2 se sirve desde `/`. El original se abre desde la acción “Abrir original” o directamente en `/legacy/cotizador-original.html` durante desarrollo.

## Estado de fase 1

La interfaz modular permite editar datos, seleccionar tanque, administrar materiales, calcular mano de obra, IVA 21% y total, e imprimir desde el navegador. La acción de guardado permanece explícitamente sin persistencia: no se agregó Supabase, backend ni contenido ficticio.

Leé [la auditoría](docs/AUDITORIA_ACTUAL.md), [la arquitectura](docs/ARQUITECTURA_APP_V2.md) y [el plan](docs/PLAN_MIGRACION.md) antes de continuar la migración.
