import logo from '../assets/extragas-logo.png'

type Props = {
  number: string
  date: string
  onNumber: (value: string) => void
  onDate: (value: string) => void
}

export function Header({ number, date, onNumber, onDate }: Props) {
  return (
    <header className="header">
      <div>
        {/* Logotipo real extraído del cotizador original (700×198). Se declaran
            las dimensiones intrínsecas para que conserve su proporción y no
            provoque salto de maquetación al cargar. */}
        <img
          className="logo"
          src={logo}
          width={700}
          height={198}
          alt="Extragas — Gas GLP a Granel"
        />
        <p>Gas GLP a Granel · Industria Argentina</p>
        <em>“Tu energía, nuestra responsabilidad.”</em>
      </div>
      <div className="document-info">
        <label htmlFor="quotation-number">COTIZACIÓN N°</label>
        <input
          id="quotation-number"
          name="quotationNumber"
          value={number}
          onChange={event => onNumber(event.target.value)}
        />
        <label htmlFor="quotation-date">Fecha</label>
        <input
          id="quotation-date"
          name="quotationDate"
          type="date"
          value={date}
          onChange={event => onDate(event.target.value)}
        />
        <small>Válida por 15 días</small>
      </div>
    </header>
  )
}
