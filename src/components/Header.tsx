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
        <div className="logo">EXTRAGAS</div>
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
