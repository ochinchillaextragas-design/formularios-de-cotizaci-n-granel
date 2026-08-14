export const tankCapacities = [
  { value: '500', label: '500 L (0,5 m³)' }, { value: '1000', label: '1.000 L (1 m³)' },
  { value: '2000', label: '2.000 L (2 m³)' }, { value: '4000', label: '4.000 L (4 m³)' },
  { value: '7300', label: '7.300 L (7,3 m³)' },
]
// Etiquetas tal como aparecen en el selector del original.
export const categoryLabels: Record<string, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  industrial: 'Industrial',
  agro: 'Agro / Rural',
}
export const categories: Record<string, string[]> = {
  residencial: ['Vivienda unifamiliar - Calefacción + ACS', 'Vivienda unifamiliar - Solo cocina', 'Vivienda unifamiliar - Calefacción + cocina + ACS', 'Departamento - Consumo bajo', 'Barrio privado / Country', 'PH / Casa de fin de semana'],
  comercial: ['Restaurante / Parrilla', 'Hotel / Hospedaje', 'Lavadero industrial', 'Panadería / Confitería', 'Gimnasio / Vestuarios', 'Local comercial - Calefacción', 'Edificio de oficinas'],
  industrial: ['Fábrica - Proceso productivo', 'Galpón - Calefacción zonal', 'Planta de tratamiento', 'Secado de granos / productos', 'Caldera industrial', 'Horno industrial'],
  agro: ['Criadero de animales (avícola/porcino)', 'Invernadero / Vivero', 'Secadora de granos', 'Campo / Estancia - Casa principal', 'Tambo / Lechería'],
}
export const defaultConditions = `- Precios válidos por 15 días desde la fecha de emisión.
- Forma de pago: 50% anticipo, 50% contra entrega. (Consultar otras opciones).
- El plazo de instalación se acordará al confirmar la orden.
- La instalación cumple con normativas NAG y disposiciones de ENARGAS.
- No incluye: flete (a cotizar según ubicación), obra civil, conexión eléctrica, trámites municipales.
- Garantía sobre materiales: según especificaciones del fabricante.
- Garantía sobre mano de obra: 6 meses.`
