// crypto.randomUUID() sólo existe en contextos seguros (https o localhost).
// Al probar la app desde otro dispositivo por IP de red local no está definido
// y agregar un ítem rompería la tabla, así que se usa un respaldo.
type UUIDProvider = { randomUUID?: () => string }

export const newId = (
  provider: UUIDProvider | null = typeof crypto !== 'undefined' ? crypto : null,
): string =>
  typeof provider?.randomUUID === 'function'
    ? provider.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10).padEnd(8, '0')}`
