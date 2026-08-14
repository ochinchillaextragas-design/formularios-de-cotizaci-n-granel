export type Material = { id: string; description: string; quantity: number; unit: string; unitPrice: number }
export type Customer = { name: string; taxId: string; phone: string; email: string; address: string; city: string; province: string }
export type Installation = { category: string; type: string; estimatedConsumption: number; tankCapacity: string; tankLocation: string; notes: string }
export type Quotation = { number: string; date: string; customer: Customer; installation: Installation; materials: Material[]; laborHours: number; hourlyRate: number; conditions: string }
