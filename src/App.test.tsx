/**
 * @vitest-environment jsdom
 *
 * Integración de la aplicación completa: circuito prospección → cotización y
 * validación previa a la impresión. Recorre la app real, sin dobles de dominio.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import App from './App'
import { DEMO_PRICING_NOTICE } from './data/catalog'

// jsdom no implementa ResizeObserver, que el mapa usa para recalcular su tamaño.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

afterEach(cleanup)

const irA = (modulo: 'Cotizador' | 'Prospección') => {
  const tabs = screen.getAllByRole('button', { name: new RegExp(modulo) })
  fireEvent.click(tabs[0])
}

const esperarProspectos = async () => {
  await waitFor(() => expect(document.querySelector('.result-row')).not.toBeNull(), { timeout: 8000 })
}

const filas = () => [...document.querySelectorAll('.result-row')] as HTMLElement[]

const cotizarFila = (indice: number): string => {
  const fila = filas()[indice]
  const nombre = fila.querySelector('.row-name')?.textContent ?? ''
  fireEvent.click(within(fila).getByRole('button', { name: 'Cotizar' }))
  return nombre
}

const valorDe = (etiqueta: string): string =>
  (screen.getByLabelText(etiqueta) as HTMLInputElement).value

/** El botón del selector muestra capacidad y m³ en dos líneas: se busca por la capacidad. */
const tanque = (label: string): HTMLElement => {
  const boton = [...document.querySelectorAll('.tank-options button')].find(
    b => b.querySelector('b')?.textContent === label,
  )
  if (!boton) throw new Error(`no existe el tanque ${label}`)
  return boton as HTMLElement
}


/** Acciones de la barra superior. La barra inferior de teléfono repite
 * 'Descargar PDF', y en jsdom (sin CSS) ambas existen a la vez. */
const accion = (nombre: string): HTMLElement =>
  within(document.querySelector('.toolbar-actions') as HTMLElement).getByRole('button', { name: nombre })

describe('circuito prospección → cotización', () => {
  it('precarga sólo lo que el prospecto publica y mapea la categoría', async () => {
    render(<App />)
    irA('Prospección')
    await esperarProspectos()

    const nombre = cotizarFila(0)

    expect(valorDe('Razón Social / Nombre y Apellido')).toBe(nombre)
    // La categoría llega mapeada a un valor real del catálogo, no como rubro.
    expect(['comercial', 'industrial', 'agro']).toContain(categoriaSeleccionada())
    // El rubro exacto no se pierde al reducirlo a un segmento comercial.
    expect(valorDe('Rubro detectado en prospección').length).toBeGreaterThan(0)
  })

  it('no arrastra datos del cliente anterior entre dos prospectos consecutivos', async () => {
    render(<App />)
    irA('Prospección')
    await esperarProspectos()

    const primero = cotizarFila(0)
    expect(valorDe('Razón Social / Nombre y Apellido')).toBe(primero)

    // Se carga a mano todo lo que NO debe sobrevivir al siguiente prospecto.
    fireEvent.change(screen.getByLabelText('CUIT / DNI'), { target: { value: '30-11111111-9' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'contacto@ejemplo.com' } })
    fireEvent.change(screen.getByLabelText('Observaciones'), { target: { value: 'Acceso por portón trasero' } })
    fireEvent.change(screen.getByLabelText('Descripción del ítem 1'), { target: { value: 'Tanque 4000 L' } })
    fireEvent.click(tanque('4.000 L'))
    expect(document.querySelector('.tank-options .selected')).not.toBeNull()

    irA('Prospección')
    await esperarProspectos()
    const segundo = cotizarFila(1)

    expect(segundo).not.toBe(primero)
    expect(valorDe('Razón Social / Nombre y Apellido')).toBe(segundo)

    // Nada del cliente anterior sobrevive.
    expect(valorDe('CUIT / DNI')).toBe('')
    expect(valorDe('Email')).toBe('')
    expect((screen.getByLabelText('Observaciones') as HTMLTextAreaElement).value).toBe('')
    expect(valorDe('Descripción del ítem 1')).toBe('')
    expect(document.querySelector('.tank-options .selected')).toBeNull()
  })

  it('deja vacío lo que el prospecto no publica', async () => {
    render(<App />)
    irA('Prospección')
    await esperarProspectos()
    cotizarFila(0)

    // El primer prospecto del territorio no publica CUIT, email ni provincia:
    // esos campos tienen que quedar en blanco, no heredados ni inventados.
    expect(valorDe('CUIT / DNI')).toBe('')
    expect(valorDe('Email')).toBe('')
    expect((screen.getByLabelText('Provincia') as HTMLSelectElement).value).toBe('')
  })
})

describe('validación previa a la impresión', () => {
  beforeEach(() => {
    vi.spyOn(window, 'print').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('bloquea la impresión y explica qué falta, sin usar alert', () => {
    const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<App />)

    fireEvent.click(accion('Descargar PDF'))

    const errores = document.querySelector('.print-errors')
    expect(errores).not.toBeNull()
    expect(errores?.textContent).toContain('Cliente')
    expect(errores?.textContent).toContain('Tanque')
    expect(window.print).not.toHaveBeenCalled()
    expect(alerta).not.toHaveBeenCalled()
  })

  it('permite imprimir cuando los datos mínimos están completos', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Razón Social / Nombre y Apellido'), {
      target: { value: 'Frigorífico Supremo' },
    })
    fireEvent.click(tanque('4.000 L'))
    fireEvent.click(accion('Descargar PDF'))

    expect(document.querySelector('.print-errors')).toBeNull()
    expect(window.print).toHaveBeenCalledTimes(1)
  })

  it('bloquea si el email cargado no es válido', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Razón Social / Nombre y Apellido'), {
      target: { value: 'Frigorífico Supremo' },
    })
    fireEvent.click(tanque('4.000 L'))
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'contacto@' } })
    fireEvent.click(accion('Descargar PDF'))

    expect(document.querySelector('.print-errors')?.textContent).toContain('Email')
    expect(window.print).not.toHaveBeenCalled()
  })
})

describe('catálogo de tanques', () => {
  it('ofrece 6.000 L y no ofrece 8.000 L', () => {
    render(<App />)
    const opciones = [...document.querySelectorAll('.tank-options button')].map(b => b.textContent ?? '')
    expect(opciones.some(o => o.includes('6.000 L'))).toBe(true)
    expect(opciones.some(o => o.includes('8.000'))).toBe(false)
    expect(opciones).toHaveLength(6)
  })

  it('informa que el plano de 6.000 L está pendiente, sin reutilizar otro', () => {
    render(<App />)
    fireEvent.click(tanque('6.000 L'))

    expect(screen.getByText('Plano técnico pendiente de incorporación.')).toBeTruthy()
    expect(document.querySelector('.tank-plan')).toBeNull()
  })
})

describe('errores de impresión siempre vigentes', () => {
  beforeEach(() => {
    vi.spyOn(window, 'print').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const errores = () => document.querySelector('.print-errors')?.textContent ?? ''

  it('al corregir un campo desaparece su error y siguen los demás', () => {
    render(<App />)
    fireEvent.click(accion('Descargar PDF'))
    expect(errores()).toContain('Cliente')
    expect(errores()).toContain('Tanque')

    fireEvent.change(screen.getByLabelText('Razón Social / Nombre y Apellido'), {
      target: { value: 'Frigorífico Supremo' },
    })

    expect(errores()).not.toContain('Cliente')
    expect(errores()).toContain('Tanque')
  })

  it('desaparecen del todo al completar lo que falta', () => {
    render(<App />)
    fireEvent.click(accion('Descargar PDF'))
    expect(document.querySelector('.print-errors')).not.toBeNull()

    fireEvent.change(screen.getByLabelText('Razón Social / Nombre y Apellido'), {
      target: { value: 'Frigorífico Supremo' },
    })
    fireEvent.click(tanque('4.000 L'))

    expect(document.querySelector('.print-errors')).toBeNull()
  })

  it('una cotización creada desde un prospecto no hereda errores anteriores', async () => {
    render(<App />)
    fireEvent.click(accion('Descargar PDF'))
    expect(document.querySelector('.print-errors')).not.toBeNull()

    irA('Prospección')
    await esperarProspectos()
    cotizarFila(0)

    expect(document.querySelector('.print-errors')).toBeNull()
  })

  it('al cambiar de módulo y volver no quedan mensajes obsoletos', () => {
    render(<App />)
    fireEvent.click(accion('Descargar PDF'))
    expect(document.querySelector('.print-errors')).not.toBeNull()

    irA('Prospección')
    irA('Cotizador')

    expect(document.querySelector('.print-errors')).toBeNull()
  })

  it('bloquea la impresión mientras una fila de material tenga precio sin descripción', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Razón Social / Nombre y Apellido'), {
      target: { value: 'Frigorífico Supremo' },
    })
    fireEvent.click(tanque('4.000 L'))
    fireEvent.change(screen.getByLabelText('Precio unitario del ítem 1'), { target: { value: '250000' } })

    fireEvent.click(accion('Descargar PDF'))

    expect(errores()).toContain('Material 1')
    expect(window.print).not.toHaveBeenCalled()
  })
})

describe('presets: tanque y materiales como una sola operación', () => {
  const seccion = (titulo: string): HTMLElement => {
    const s = [...document.querySelectorAll('.section')].find(
      el => el.querySelector('.section-title')?.textContent === titulo,
    )
    if (!s) throw new Error(`no existe la sección ${titulo}`)
    return s as HTMLElement
  }

  const elegirTipo = (categoria: string, tipo: string) => {
    const selects = seccion('Datos de Instalación').querySelectorAll('select')
    fireEvent.change(selects[0], { target: { value: categoria } })
    fireEvent.change(seccion('Datos de Instalación').querySelectorAll('select')[1], {
      target: { value: tipo },
    })
  }

  const botonPreset = () => document.querySelector('.preset-apply') as HTMLButtonElement
  const descripciones = () =>
    [...document.querySelectorAll('input[id$="-description"]')].map(i => (i as HTMLInputElement).value)
  const tanqueElegido = () => document.querySelector('.tank-options .selected b')?.textContent ?? null

  it('el preset industrial deja seleccionado el tanque de 7.300 L', () => {
    render(<App />)
    elegirTipo('industrial', 'Fábrica - Proceso productivo')
    fireEvent.click(botonPreset())

    expect(descripciones()[0]).toContain('7300')
    expect(tanqueElegido()).toBe('7.300 L')
  })

  // El conflicto que motivó el cambio: 6.000 L elegido y luego el preset
  // industrial dejaba materiales de 7.300 L con el selector en 6.000 L.
  it('corrige el tanque aunque haya uno distinto elegido de antes', () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(tanque('6.000 L'))
    expect(tanqueElegido()).toBe('6.000 L')

    fireEvent.change(screen.getByLabelText('Descripción del ítem 1'), { target: { value: 'Cargado a mano' } })
    elegirTipo('industrial', 'Fábrica - Proceso productivo')
    fireEvent.click(botonPreset())

    expect(tanqueElegido()).toBe('7.300 L')
    expect(descripciones()[0]).toContain('7300')
    confirmar.mockRestore()
  })

  it('pide confirmación y explica qué se reemplaza', () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.change(screen.getByLabelText('Descripción del ítem 1'), { target: { value: 'Cargado a mano' } })
    elegirTipo('agro', 'Criadero de animales (avícola/porcino)')
    fireEvent.click(botonPreset())

    expect(confirmar).toHaveBeenCalledTimes(1)
    const mensaje = confirmar.mock.calls[0][0] as string
    expect(mensaje).toContain('materiales')
    expect(mensaje).toContain('tanque')
    expect(descripciones()).not.toContain('Cargado a mano')
    confirmar.mockRestore()
  })

  it('cancelar no cambia ni los materiales ni el tanque', () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<App />)
    fireEvent.click(tanque('2.000 L'))
    fireEvent.change(screen.getByLabelText('Descripción del ítem 1'), { target: { value: 'Cargado a mano' } })
    elegirTipo('industrial', 'Fábrica - Proceso productivo')
    fireEvent.click(botonPreset())

    expect(descripciones()).toContain('Cargado a mano')
    expect(tanqueElegido()).toBe('2.000 L')
    confirmar.mockRestore()
  })

  it('no pide confirmación si no hay materiales cargados', () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    elegirTipo('agro', 'Criadero de animales (avícola/porcino)')
    fireEvent.click(botonPreset())

    expect(confirmar).not.toHaveBeenCalled()
    expect(descripciones()).toContain('Calefactores infrarrojos GLP')
    confirmar.mockRestore()
  })
})

describe('aviso de valores ficticios', () => {
  it('está visible desde el arranque, sin haber cargado ningún preset', () => {
    render(<App />)
    expect(screen.getByText(DEMO_PRICING_NOTICE)).toBeTruthy()
  })

  it('no depende de las descripciones: editarlas no lo hace desaparecer', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Descripción del ítem 1'), {
      target: { value: 'Materiales propios del cliente' },
    })
    expect(screen.getByText(DEMO_PRICING_NOTICE)).toBeTruthy()
  })

  it('menciona materiales, mano de obra y costos', () => {
    expect(DEMO_PRICING_NOTICE).toContain('materiales')
    expect(DEMO_PRICING_NOTICE).toContain('mano de obra')
    expect(DEMO_PRICING_NOTICE).toContain('costos ficticios')
  })
})

describe('nueva cotización', () => {
  beforeEach(() => {
    vi.spyOn(window, 'print').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('cancelar conserva la cotización Y los errores en pantalla', () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<App />)

    fireEvent.change(screen.getByLabelText('Razón Social / Nombre y Apellido'), {
      target: { value: 'Frigorífico Supremo' },
    })
    fireEvent.click(accion('Descargar PDF'))
    expect(document.querySelector('.print-errors')).not.toBeNull()

    fireEvent.click(accion('Nueva cotización'))

    expect(confirmar).toHaveBeenCalled()
    // Nada se tocó: ni el cliente cargado ni los errores visibles.
    expect(valorDe('Razón Social / Nombre y Apellido')).toBe('Frigorífico Supremo')
    expect(document.querySelector('.print-errors')).not.toBeNull()
    confirmar.mockRestore()
  })

  it('confirmar limpia la cotización y también los errores', () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)

    fireEvent.change(screen.getByLabelText('Razón Social / Nombre y Apellido'), {
      target: { value: 'Frigorífico Supremo' },
    })
    fireEvent.click(accion('Descargar PDF'))
    expect(document.querySelector('.print-errors')).not.toBeNull()

    fireEvent.click(accion('Nueva cotización'))

    expect(valorDe('Razón Social / Nombre y Apellido')).toBe('')
    expect(document.querySelector('.print-errors')).toBeNull()
    confirmar.mockRestore()
  })
})

describe('plano técnico en la interfaz', () => {
  it('muestra el plano real de la capacidad elegida, con texto alternativo', () => {
    render(<App />)
    fireEvent.click(tanque('7.300 L'))

    const img = document.querySelector('.tank-plan') as HTMLImageElement
    expect(img).not.toBeNull()
    expect(img.getAttribute('src')).toContain('plano-tecnico-7300l')
    expect(img.getAttribute('alt')).toContain('7.300 L')
    expect(img.getAttribute('alt')).toContain('EXT-GLP-REF-7300')
  })

  it('cambia de plano al cambiar de capacidad', () => {
    render(<App />)
    fireEvent.click(tanque('500 L'))
    expect((document.querySelector('.tank-plan') as HTMLImageElement).src).toContain('plano-tecnico-500l')

    fireEvent.click(tanque('4.000 L'))
    expect((document.querySelector('.tank-plan') as HTMLImageElement).src).toContain('plano-tecnico-4000l')
  })

  it('para 6.000 L informa el estado pendiente y no muestra ningún plano', () => {
    render(<App />)
    fireEvent.click(tanque('6.000 L'))

    expect(screen.getByText('Plano técnico pendiente de incorporación.')).toBeTruthy()
    expect(document.querySelector('.tank-plan')).toBeNull()
  })

  it('ofrece ampliar el plano, apuntando al archivo de la capacidad elegida', () => {
    render(<App />)
    fireEvent.click(tanque('2.000 L'))

    const zoom = document.querySelector('.plan-zoom') as HTMLAnchorElement
    expect(zoom).not.toBeNull()
    expect(zoom.getAttribute('href')).toContain('plano-tecnico-2000l')
    // Mismo archivo que la imagen mostrada: no puede apuntar a otro plano.
    expect(zoom.getAttribute('href')).toBe(
      (document.querySelector('.tank-plan') as HTMLImageElement).getAttribute('src'),
    )
  })

  it('la ampliación abre pestaña nueva de forma segura y es alcanzable por teclado', () => {
    render(<App />)
    fireEvent.click(tanque('500 L'))

    const zoom = document.querySelector('.plan-zoom') as HTMLAnchorElement
    expect(zoom.getAttribute('target')).toBe('_blank')
    expect(zoom.getAttribute('rel')).toContain('noopener')
    expect(zoom.getAttribute('rel')).toContain('noreferrer')
    expect(zoom.getAttribute('aria-label')).toContain('500 L')
    // Un <a> con href entra en el orden de tabulación sin tabindex extra.
    expect(zoom.tagName).toBe('A')
    expect(zoom.hasAttribute('href')).toBe(true)
  })

  it('no ofrece ampliar cuando la capacidad no tiene plano', () => {
    render(<App />)
    fireEvent.click(tanque('6.000 L'))
    expect(document.querySelector('.plan-zoom')).toBeNull()
  })

  it('cambia el enlace de ampliación al cambiar de capacidad', () => {
    render(<App />)
    fireEvent.click(tanque('1.000 L'))
    expect((document.querySelector('.plan-zoom') as HTMLAnchorElement).href).toContain('plano-tecnico-1000l')

    fireEvent.click(tanque('7.300 L'))
    expect((document.querySelector('.plan-zoom') as HTMLAnchorElement).href).toContain('plano-tecnico-7300l')
  })
})

describe('materiales en el impreso', () => {
  const filas = () => [...document.querySelectorAll('.materials-table tbody tr')]

  it('marca como intactas las filas que nadie tocó', () => {
    render(<App />)
    // El formulario nace con tres filas vacías: las tres están intactas.
    expect(filas().filter(f => f.classList.contains('row-pristine'))).toHaveLength(3)
  })

  it('deja de marcarlas en cuanto se cargan, aunque sea sólo el precio', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Precio unitario del ítem 1'), { target: { value: '250000' } })

    const primera = filas()[0]
    expect(primera.classList.contains('row-pristine')).toBe(false)
    // Las otras dos siguen intactas y no se imprimirán.
    expect(filas().filter(f => f.classList.contains('row-pristine'))).toHaveLength(2)
  })

  it('no marca como intacta una fila inválida: tiene que verse el error', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Cantidad del ítem 1'), { target: { value: '0' } })
    expect(filas()[0].classList.contains('row-pristine')).toBe(false)
  })

  it('agrega un estado vacío para el impreso cuando no se usó ningún material', () => {
    render(<App />)
    const vacio = document.querySelector('.materials-empty')
    expect(vacio).not.toBeNull()
    expect(vacio?.textContent).toBe('Sin materiales cargados.')
  })

  it('quita ese estado vacío en cuanto hay un material usado', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Descripción del ítem 1'), { target: { value: 'Tanque GLP' } })
    expect(document.querySelector('.materials-empty')).toBeNull()
  })
})

describe('portada del documento', () => {
  it('usa el logotipo real, no el texto EXTRAGAS', () => {
    render(<App />)
    const logo = document.querySelector('.header .logo') as HTMLImageElement
    expect(logo).not.toBeNull()
    expect(logo.tagName).toBe('IMG')
    expect(logo.getAttribute('src')).toContain('extragas-logo')
    expect(logo.getAttribute('alt')).toContain('Extragas')
    // Dimensiones intrínsecas declaradas: conservan la proporción original.
    expect(logo.getAttribute('width')).toBe('700')
    expect(logo.getAttribute('height')).toBe('198')
  })
})

describe('secciones colapsables', () => {
  const encabezado = (titulo: string): HTMLElement => {
    const b = [...document.querySelectorAll('.section-toggle')].find(
      el => el.querySelector('.section-title')?.textContent === titulo,
    )
    if (!b) throw new Error(`no existe el encabezado ${titulo}`)
    return b as HTMLElement
  }

  it('el encabezado es accionable y declara si está abierto', () => {
    render(<App />)
    const boton = encabezado('Datos del Cliente')
    expect(boton.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(boton)
    expect(boton.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(boton)
    expect(boton.getAttribute('aria-expanded')).toBe('true')
  })

  it('oculta el cuerpo sin desmontarlo, para no perder lo cargado', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Razón Social / Nombre y Apellido'), {
      target: { value: 'Frigorífico Supremo' },
    })

    const boton = encabezado('Datos del Cliente')
    fireEvent.click(boton)

    const cuerpo = document.getElementById(boton.getAttribute('aria-controls') ?? '')
    expect(cuerpo?.hasAttribute('hidden')).toBe(true)
    // El campo sigue en el DOM con su valor: al reabrir no se perdió nada.
    expect(valorDe('Razón Social / Nombre y Apellido')).toBe('Frigorífico Supremo')

    fireEvent.click(boton)
    expect(cuerpo?.hasAttribute('hidden')).toBe(false)
    expect(valorDe('Razón Social / Nombre y Apellido')).toBe('Frigorífico Supremo')
  })

  it('el cuerpo conserva su id para que aria-controls apunte a algo real', () => {
    render(<App />)
    for (const boton of document.querySelectorAll('.section-toggle')) {
      const id = boton.getAttribute('aria-controls')
      expect(id).toBeTruthy()
      expect(document.getElementById(id ?? '')).not.toBeNull()
    }
  })
})

describe('legado', () => {
  it('no expone el archivo original desde la interfaz', () => {
    render(<App />)
    expect(screen.queryByText('Abrir original')).toBeNull()
    const enlaces = [...document.querySelectorAll('a')].map(a => a.getAttribute('href') ?? '')
    expect(enlaces.some(href => href.includes('legacy'))).toBe(false)
  })
})

/** La categoría seleccionada en el `select` de Datos de Instalación. */
function categoriaSeleccionada(): string {
  const selects = [...document.querySelectorAll('select')] as HTMLSelectElement[]
  const categoria = selects.find(s =>
    [...s.options].some(o => o.value === 'industrial' || o.value === 'agro'),
  )
  return categoria?.value ?? ''
}
