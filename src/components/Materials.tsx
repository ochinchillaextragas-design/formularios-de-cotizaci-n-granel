import type { Material } from '../types/quotation'
import { formatMoney } from '../utils/money'
import { newId } from '../utils/id'
import { Section } from './Section'

export function Materials({ items, onChange }: { items: Material[]; onChange: (v: Material[]) => void }) {
  const update = (id: string, key: keyof Material, value: string | number) =>
    onChange(items.map(i => (i.id === id ? { ...i, [key]: value } : i)))

  const addRow = () =>
    onChange([...items, { id: newId(), description: '', quantity: 1, unit: 'u', unitPrice: 0 }])

  return (
    <Section title="📦 Materiales y Equipos">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Descripción</th><th>Cantidad</th><th>Unidad</th>
              <th>Precio Unit.</th><th>Subtotal</th><th />
            </tr>
          </thead>
          <tbody>
            {items.map((i, n) => (
              <tr key={i.id}>
                <td>{n + 1}</td>
                <td>
                  <input id={`material-${i.id}-description`} name={`materials[${i.id}].description`} aria-label={`Descripción del ítem ${n + 1}`} value={i.description}
                    onChange={e => update(i.id, 'description', e.target.value)} />
                </td>
                <td>
                  <input id={`material-${i.id}-quantity`} name={`materials[${i.id}].quantity`} aria-label={`Cantidad del ítem ${n + 1}`} type="number" min="1" step="1"
                    value={i.quantity} onChange={e => update(i.id, 'quantity', Number(e.target.value))} />
                </td>
                <td>
                  <input id={`material-${i.id}-unit`} name={`materials[${i.id}].unit`} aria-label={`Unidad del ítem ${n + 1}`} value={i.unit}
                    onChange={e => update(i.id, 'unit', e.target.value)} />
                </td>
                <td>
                  <input id={`material-${i.id}-unit-price`} name={`materials[${i.id}].unitPrice`} aria-label={`Precio unitario del ítem ${n + 1}`} type="number" min="0" step="0.01"
                    value={i.unitPrice} onChange={e => update(i.id, 'unitPrice', Number(e.target.value))} />
                </td>
                <td>{formatMoney(i.quantity * i.unitPrice)}</td>
                <td>
                  <button type="button" className="delete" aria-label={`Eliminar ítem ${n + 1}`}
                    onClick={() => onChange(items.filter(x => x.id !== i.id))}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="add" onClick={addRow}>+ Agregar ítem</button>
    </Section>
  )
}
