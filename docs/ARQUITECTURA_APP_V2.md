# Arquitectura App V2

## Objetivo de esta base

Convertir progresivamente el documento monolítico en una aplicación de cotizaciones y, después, CRM comercial. La fase 1 establece límites claros sin introducir servicios pagos, backend ni Supabase.

## Capas

```text
src/
├── components/     UI y módulos funcionales
├── data/           configuración temporal y catálogos
├── hooks/          futuros casos de uso/estado reutilizable
├── types/          contrato tipado del dominio
├── utils/          funciones puras (formato, futuros cálculos)
├── App.tsx         composición y estado de la cotización activa
└── main.tsx        arranque de React
```

Los módulos mínimos solicitados están representados por `Layout`, `Header`, `CustomerData`, `InstallationData`, `TankSelector`, `TechnicalPlan`, `Materials`, `Labor`, `EconomicSummary`, `Conditions` y `QuotationActions`.

## Estado y dominio

`Quotation` es el agregado inicial: documento, cliente, instalación, materiales, mano de obra y condiciones. En esta fase el estado vive en React y no se persiste deliberadamente. Los cálculos derivados no se duplican en el estado: subtotal de materiales, mano de obra, IVA y total se calculan a partir de sus entradas.

## Preparación para persistencia futura

La UI no debe importar un cliente de base de datos. Una siguiente fase puede definir interfaces como `QuotationRepository`, `CustomerRepository` y `CatalogRepository`, con una implementación local para desarrollo y otra remota. Así Supabase podrá incorporarse detrás de adaptadores, con migraciones, Row Level Security y autenticación, sin acoplar componentes a SDKs.

Entidades previstas para el CRM: usuarios/perfiles, clientes, contactos, oportunidades, cotizaciones, versiones, líneas, actividades, tareas, comentarios, estados e historial de auditoría. No se crean aún tablas ni credenciales.

## Recursos visuales

El legado conserva todos los recursos embebidos. La app V2 mantiene la paleta, jerarquía de documento, secciones, tabla, resumen y comportamiento de impresión. Los base64 no se copiaron manualmente: deben extraerse mediante un script verificable a archivos estáticos, con nombres y hashes, durante la migración visual detallada.

## Coste y ejecución

React, TypeScript, Vite y ESLint son herramientas open source y la ejecución local no tiene coste. Una futura infraestructura deberá poder iniciar en planes gratuitos; esto será una decisión explícita de una fase posterior.
