/**
 * Saneamiento de enlaces externos.
 *
 * Los sitios web vienen de OpenStreetMap, que es editable por cualquiera. Un
 * valor como `javascript:...` en un `href` ejecuta código en el navegador del
 * usuario, así que sólo se aceptan `http` y `https`; cualquier otro esquema
 * —incluido `data:`— se descarta y el enlace no se muestra.
 */

const ALLOWED_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:'])

/** Devuelve la URL si es navegable y segura; `undefined` en cualquier otro caso. */
export function safeHttpUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  try {
    const parsed = new URL(raw)
    return ALLOWED_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined
  } catch {
    // OSM guarda dominios sueltos ("extragas.com.ar") que no son URL absolutas.
    return undefined
  }
}
