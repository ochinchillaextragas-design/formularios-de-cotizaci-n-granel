import { Package, Sparkle } from '@phosphor-icons/react'
import type { Material } from '../types/quotation'
import type { MaterialPreset } from '../data/catalog'
import { tankByValue } from '../data/catalog'
import { isPristineMaterialRow } from '../utils/quotationValidation'
import { formatMoney } from '../utils/money'
import { newId } from '../utils/id'
import { Section } from './Section'

type Props = {
  items: Material[]
  /** Preset correspondiente al tipo de instalación elegido, si existe. */
  preset?: MaterialPreset
  /** Aplica tanque y materiales en una sola operación (lo resuelve `App`). */
  onApplyPreset: () => void
  onChange: (v: Material[]) => void
}

export function Materials({ items, preset, onApplyPreset, onChange }: Props) {
  const update = (id: string, key: keyof Material, value: string | number) =>
    onChange(items.map(i => (i.id === id ? { ...i, [key]: value } : i)))

  const addRow = () =>
    onChange([...items, { id: newId(), description: '', quantity: 1, unit: 'u', unitPrice: 0 }])

  const presetTank = preset ? tankByValue(preset.tankCapacity) : undefined
  // Filas que el usuario efectivamente usó. Las que siguen intactas se ven en
  // pantalla (son el formulario) pero no se imprimen: no dicen nada.
  const filasUsadas = items.filter(item => !isPristineMaterialRow(item)).length

  return (
    <Section title="Materiales y Equipos" icon={Package}>
      {preset && presetTank && (
        <div className="preset-bar">
          <button type="button" className="preset-apply" onClick={onApplyPreset}>
            <Sparkle size={18} weight="fill" aria-hidden />
            <span>
              Cargar configuración sugerida para “{preset.name}”
              <small>
                {preset.items.length} materiales · tanque {presetTank.label}
              </small>
            </span>
          </button>
        </div>
      )}

      {/* Una sola tabla para ambos tamaños: a partir de 720 px hacia abajo el CSS
          la reordena en tarjetas. Mantener un único DOM evita duplicar campos,
          etiquetas e identificadores. */}
      <div className="table-wrap">
        <table className="materials-table">
          <thead>
            <tr>
              <th>#</th><th>Descripción</th><th>Cantidad</th><th>Unidad</th>
              <th>Precio Unit.</th><th>Subtotal</th><th />
            </tr>
          </thead>
          <tbody>
            {items.map((i, n) => (
              <tr key={i.id} className={isPristineMaterialRow(i) ? 'row-pristine' : undefined}>
                <td className="c-num" data-label="Ítem">{n + 1}</td>
                <td className="c-desc" data-label="Descripción">
                  <input id={`material-${i.id}-description`} name={`materials[${i.id}].description`} aria-label={`Descripción del ítem ${n + 1}`} value={i.description}
                    onChange={e => update(i.id, 'description', e.target.value)} />
                </td>
                <td className="c-qty" data-label="Cantidad">
                  <input id={`material-${i.id}-quantity`} name={`materials[${i.id}].quantity`} aria-label={`Cantidad del ítem ${n + 1}`} type="number" min="1" step="1" inputMode="numeric"
                    value={i.quantity} onChange={e => update(i.id, 'quantity', Number(e.target.value))} />
                </td>
                <td className="c-unit" data-label="Unidad">
                  <input id={`material-${i.id}-unit`} name={`materials[${i.id}].unit`} aria-label={`Unidad del ítem ${n + 1}`} value={i.unit}
                    onChange={e => update(i.id, 'unit', e.target.value)} />
                </td>
                <td className="c-price" data-label="Precio unitario">
                  <input id={`material-${i.id}-unit-price`} name={`materials[${i.id}].unitPrice`} aria-label={`Precio unitario del ítem ${n + 1}`} type="number" min="0" step="0.01" inputMode="decimal"
                    value={i.unitPrice} onChange={e => update(i.id, 'unitPrice', Number(e.target.value))} />
                </td>
                <td className="c-sub" data-label="Subtotal">{formatMoney(i.quantity * i.unitPrice)}</td>
                <td className="c-del">
                  <button type="button" className="delete" aria-label={`Eliminar ítem ${n + 1}`}
                    onClick={() => onChange(items.filter(x => x.id !== i.id))}>
                    <span aria-hidden>×</span>
                    <span className="delete-text">Eliminar</span>
                  </button>
                </td>
              </tr>
            ))}

            {/* Sólo aparece en el impreso, cuando ninguna fila llegó a usarse:
                una tabla con encabezados y nada debajo se lee como un error. */}
            {filasUsadas === 0 && (
              <tr className="materials-empty">
                <td colSpan={7}>Sin materiales cargados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button type="button" className="add" onClick={addRow}>+ Agregar ítem</button>
    </Section>
  )
}
