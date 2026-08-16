import { IdentificationCard } from '@phosphor-icons/react'
import type { Customer } from '../types/quotation'
import { Section } from './Section'
const provinces = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

type Props = { value: Customer; onChange: (value: Customer) => void }

export function CustomerData({ value, onChange }: Props) {
  const field = (key: keyof Customer, next: string) => onChange({ ...value, [key]: next })

  return (
    <Section title="Datos del Cliente" icon={IdentificationCard}>
      <div className="grid">
        <label className="wide" htmlFor="customer-name">Razón Social / Nombre y Apellido</label>
        <input id="customer-name" name="customerName" className="wide" value={value.name} onChange={e => field('name', e.target.value)} />
        <label htmlFor="customer-tax-id">CUIT / DNI</label>
        <input id="customer-tax-id" name="customerTaxId" value={value.taxId} onChange={e => field('taxId', e.target.value)} />
        <label htmlFor="customer-phone">Teléfono</label>
        <input id="customer-phone" name="customerPhone" value={value.phone} onChange={e => field('phone', e.target.value)} />
        <label htmlFor="customer-email">Email</label>
        <input id="customer-email" name="customerEmail" type="email" value={value.email} onChange={e => field('email', e.target.value)} />
        <label className="wide" htmlFor="customer-address">Dirección de Instalación</label>
        <input id="customer-address" name="customerAddress" className="wide" value={value.address} onChange={e => field('address', e.target.value)} />
        <label htmlFor="customer-city">Localidad</label>
        <input id="customer-city" name="customerCity" value={value.city} onChange={e => field('city', e.target.value)} />
        <label htmlFor="customer-province">Provincia</label>
        <select id="customer-province" name="customerProvince" value={value.province} onChange={e => field('province', e.target.value)}>
          <option value="">Seleccionar...</option>
          {provinces.map(province => <option key={province}>{province}</option>)}
        </select>
      </div>
    </Section>
  )
}
