export type Material = { id: string; description: string; quantity: number; unit: string; unitPrice: number }
export type Customer = { name: string; taxId: string; phone: string; email: string; address: string; city: string; province: string }
/**
 * `sourceIndustry` guarda el rubro exacto detectado en prospección (por ejemplo
 * "Asfalto"). La categoría comercial reduce 13 rubros a 4 segmentos, así que sin
 * este campo el dato de origen se perdería al crear la cotización.
 */
export type Installation = { category: string; type: string; estimatedConsumption: number; tankCapacity: string; tankLocation: string; notes: string; sourceIndustry?: string }
export type Quotation = { number: string; date: string; customer: Customer; installation: Installation; materials: Material[]; laborHours: number; hourlyRate: number; conditions: string }
