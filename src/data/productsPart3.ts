import type { Product } from '../types.ts';

export const productsPart3: Product[] = [
  // HP 4000 / 4050
  {
    id: 'RG5-2661-000',
    name: 'Unidad de Fusión Remanufacturado HP 4000',
    description: 'Unidad de Fusión Remanufacturado para HP 4000 / 4050.',
    price: 0, // Price not specified in OCR for kit, but Fusion is listed. Wait, OCR says "Nuevo OEM" for Kit, and RG5-2661-000 for Fusion.
    // Let's look at the image/OCR again.
    // Kit de mantenimiento Nuevo OEM.
    // Unidad de Fusión Remanufacturado RG5-2661-000. No price listed next to it?
    // Ah, OCR says:
    // Kit de mantenimiento Nuevo OEM
    // Unidad de Fusión Remanufacturado RG5-2661-000 Remanufacturado
    // Filmina Calidad Original FFS-2100-OEM $ 176.00
    // It seems the price for Fusion is missing or I missed it.
    // Let's skip the ones without price or use 0 and mark as "Consultar".
    // Actually, looking at the crop 10, RG5-2661-000 doesn't have a price column value next to it.
    // I will skip it or put a placeholder.
    category: 'Refacciones HP',
    stock: 0
  },
  {
    id: 'FFS-2100-OEM-4000',
    name: 'Filmina Calidad Original HP 4000',
    description: 'Filmina Calidad Original para HP 4000 / 4050. Empaque de tubo, NO incluye grasa.',
    price: 176.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'FFS-2100-STD-4000',
    name: 'Filmina HP 4000',
    description: 'Filmina para HP 4000 / 4050.',
    price: 150.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RB1-8794-000',
    name: 'Rodillo de Presión HP 4000',
    description: 'Rodillo de Presión para HP 4000 / 4050 / C130 / CANON NP-7130, PC-920, etc.',
    price: 190.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RG5-2659-000',
    name: 'Resistencia HP 4000',
    description: 'Resistencia para HP 4000 / 4050.',
    price: 209.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'RS5-1310-000',
    name: 'Set de Bujes HP 4000',
    description: 'Set de Bujes (izquierdo y derecho) para HP 4000 / 4050.',
    price: 60.00,
    category: 'Refacciones HP',
    stock: 30
  },
  {
    id: 'RG5-4283-000',
    name: 'Rodillo de Transferencia HP 4000',
    description: 'Rodillo de Transferencia para HP 4000 / 4050.',
    price: 160.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'RG5-3718-000',
    name: 'Goma de Alimentación Tray 1 HP 4000',
    description: 'Goma de Alimentación Tray 1 para HP 4000 / 4050.',
    price: 58.00,
    category: 'Refacciones HP',
    stock: 25
  },
  {
    id: 'RF5-1885-000',
    name: 'Goma de Alimentación Tray 2 HP 4000',
    description: 'Goma de Alimentación Tray 2 para HP 4000 / 4050.',
    price: 58.00,
    category: 'Refacciones HP',
    stock: 25
  },
  {
    id: 'RB1-8865-000',
    name: 'Goma de Alimentación Tray 2 HP 4000 (Kit)',
    description: 'Goma de Alimentación Tray 2 para HP 4500, 4550, 5000, 5100, etc. Incluye (4) Gomas.',
    price: 165.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'RB1-5281-000',
    name: 'Pad de separación Tray 1 HP 4000',
    description: 'Pad de separación Tray 1 para HP 4000 / 4050.',
    price: 98.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RF5-3086-000',
    name: 'Pad de Separación Tray 1 HP 4000 (Alt)',
    description: 'Pad de Separación Tray 1 para HP 4000 / 4050.',
    price: 64.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RS5-0922-000',
    name: 'Engrane de Rodillo de Presión HP 4000',
    description: 'Engrane de Rodillo de Presión para HP 4000 / 4050.',
    price: 55.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RS5-0921-000',
    name: 'Engrane de Fusor HP 4000',
    description: 'Engrane de Fusor para HP 4000 / 4050.',
    price: 55.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RS5-0924-000',
    name: 'Engrane de Fusor HP 4000 (2)',
    description: 'Engrane de Fusor para HP 4000 / 4050.',
    price: 55.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RB1-8798-000',
    name: 'Rodillo de Liberación de Papel HP 4000',
    description: 'Rodillo de Liberación de Papel para HP 4000 / 4050.',
    price: 65.00,
    category: 'Refacciones HP',
    stock: 10
  },

  // HP 4100
  {
    id: 'RG5-5063-000',
    name: 'Unidad de Fusión Remanufacturado HP 4100',
    description: 'Unidad de Fusión Remanufacturado para HP 4100.',
    price: 907.00,
    category: 'Refacciones HP',
    stock: 5
  },
  {
    id: 'FFS-HP4100',
    name: 'Filmina HP 4100',
    description: 'Filmina para HP 4100. NO incluye grasa.',
    price: 150.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RB2-4919-000',
    name: 'Rodillo de Presión HP 4100',
    description: 'Rodillo de Presión para HP 4100.',
    price: 209.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RG5-5068-000',
    name: 'Resistencia HP 4100',
    description: 'Resistencia para HP 4100.',
    price: 160.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'BSH-4100-P',
    name: 'Set de Bujes HP 4100',
    description: 'Set de Bujes (izquierdo y derecho) para HP 4100.',
    price: 60.00,
    category: 'Refacciones HP',
    stock: 30
  },
  {
    id: 'RG5-5295-000',
    name: 'Rodillo de Transferencia HP 4100',
    description: 'Rodillo de Transferencia para HP 4100.',
    price: 160.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'RG5-3718-000-4100',
    name: 'Goma de Alimentación Tray 1 HP 4100',
    description: 'Goma de Alimentación Tray 1 para HP 4100.',
    price: 58.00,
    category: 'Refacciones HP',
    stock: 25
  },
  {
    id: 'RF5-3114-000',
    name: 'Goma de Alimentación Tray 2 HP 4100',
    description: 'Goma de Alimentación Tray 2 para HP 4100.',
    price: 55.00,
    category: 'Refacciones HP',
    stock: 25
  },
  {
    id: 'RB1-8865-000-4100',
    name: 'Goma de Alimentación Tray 2 HP 4100 (Kit)',
    description: 'Goma de Alimentación Tray 2 para HP 4000 / 4100. Incluye (4) Gomas.',
    price: 165.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'RB1-5281-000-4100',
    name: 'Pad de separación Tray 1 HP 4100',
    description: 'Pad de separación Tray 1 para HP 4100. CON ensamble.',
    price: 98.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RF5-3086-000-4100',
    name: 'Pad de Separación Tray 1 HP 4100 (Alt)',
    description: 'Pad de Separación Tray 1 para HP 4100.',
    price: 58.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RS5-0922-000-4100',
    name: 'Engrane de Rodillo de Presión HP 4100',
    description: 'Engrane de Rodillo de Presión para HP 4100.',
    price: 50.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RS6-0688-000',
    name: 'Engrane de Fusor HP 4100',
    description: 'Engrane de Fusor para HP 4100.',
    price: 50.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RS5-0675-000',
    name: 'Engrane de Fusor HP 4100 (2)',
    description: 'Engrane de Fusor para HP 4100.',
    price: 50.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RS6-0676-000',
    name: 'Engrane de Fusor HP 4100 (3)',
    description: 'Engrane de Fusor para HP 4100.',
    price: 50.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RS6-0677-000',
    name: 'Engrane de Fusor HP 4100 (4)',
    description: 'Engrane de Fusor para HP 4100.',
    price: 50.00,
    category: 'Refacciones HP',
    stock: 15
  },

  // HP 4200
  {
    id: 'RM1-0014-RFB',
    name: 'Unidad de Fusión Remanufacturado HP 4200',
    description: 'Unidad de Fusión Remanufacturado para HP 4200.',
    price: 1600.00,
    category: 'Refacciones HP',
    stock: 5
  },
  {
    id: 'FFS-4200-JP',
    name: 'Filmina HP 4200',
    description: 'Filmina para HP 4200. NO incluye grasa.',
    price: 225.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RC1-0070-000',
    name: 'Rodillo de Presión HP 4200',
    description: 'Rodillo de Presión para HP 4200.',
    price: 298.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'BSH-4250-GRF',
    name: 'Set de Bujes HP 4200',
    description: 'Set de Bujes (izquierdo y derecho) para HP 4200.',
    price: 125.00,
    category: 'Refacciones HP',
    stock: 30
  },
  {
    id: 'RM1-0699-000',
    name: 'Rodillo de Transferencia HP 4200',
    description: 'Rodillo de Transferencia para HP 4200.',
    price: 160.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'RL1-0019-000',
    name: 'Goma de Alimentación Tray 1 HP 4200',
    description: 'Goma de Alimentación Tray 1 para HP 4200.',
    price: 55.00,
    category: 'Refacciones HP',
    stock: 25
  },
  {
    id: 'RM1-0037-000',
    name: 'Goma de Alimentación Tray 2 HP 4200',
    description: 'Goma de Alimentación Tray 2 para HP 4200. El equipo usa (2).',
    price: 55.00,
    category: 'Refacciones HP',
    stock: 25
  },
  {
    id: 'RM1-0036-000',
    name: 'Goma de Alimentación Tray 2 HP 4200 (2)',
    description: 'Goma de Alimentación Tray 2 para HP 4200. El equipo usa (1).',
    price: 55.00,
    category: 'Refacciones HP',
    stock: 25
  },
  {
    id: 'CE988-67904',
    name: 'Kit de Gomas de Alimentación T2 HP 4200',
    description: 'Kit de Gomas de Alimentación T2 para HP 4200. Incluye: (2) Goma de Alimentación T2 RM1-0037-000, (1) Goma de Alimentación T2 RM1-0036-000.',
    price: 150.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'RL1-0007-000',
    name: 'Pad de separación Tray 1 HP 4200',
    description: 'Pad de separación Tray 1 para HP 4200.',
    price: 58.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RK-HP4250',
    name: 'Kit de Gomas T1 y T2 HP 4200',
    description: 'Kit de Gomas T1 y T2 para HP 4200. Incluye: (1) Pad de Separación T1, (1) Goma de Alimentación T1, (2) Goma de Alimentación T2, (1) Goma de Alimentación T2.',
    price: 263.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'RU5-0016-000',
    name: 'Engrane de Fusor Rod/Pres HP 4200',
    description: 'Engrane de Fusor Rod/Pres para HP 4200.',
    price: 65.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RU5-0277-000',
    name: 'Engrane Negro del Plato HP 4200',
    description: 'Engrane Negro del Plato para HP 4200.',
    price: 58.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RU5-0044-000',
    name: 'Engrane Blanco del Plato HP 4200',
    description: 'Engrane Blanco del Plato para HP 4200.',
    price: 60.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RM1-0043-000',
    name: 'Plato de Movimiento, Swing Plate HP 4200',
    description: 'Plato de Movimiento, Swing Plate para HP 4200.',
    price: 165.00,
    category: 'Refacciones HP',
    stock: 5
  },
  {
    id: 'RC1-3329-000',
    name: 'Guía de Salida de Fusor HP 4200',
    description: 'Guía de Salida de Fusor para HP 4200.',
    price: 165.00,
    category: 'Refacciones HP',
    stock: 5
  },
  {
    id: 'LVR-4200-LFT/RGHT',
    name: 'Palanca Elevadora de Fusor HP 4200',
    description: 'Palanca Elevadora de Fusor para HP 4200.',
    price: 88.00,
    category: 'Refacciones HP',
    stock: 10
  },

  // HP 4300
  {
    id: 'FFS-4250-JP-4300',
    name: 'Filmina HP 4300',
    description: 'Filmina para HP 4300. NO incluye grasa.',
    price: 350.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RC1-3321-000',
    name: 'Rodillo de Presión HP 4300',
    description: 'Rodillo de Presión para HP 4300.',
    price: 245.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'BSH-4250-GRF-4300',
    name: 'Set de Bujes HP 4300',
    description: 'Set de Bujes (izquierdo y derecho) para HP 4300.',
    price: 125.00,
    category: 'Refacciones HP',
    stock: 30
  },
  {
    id: 'RC1-0044-000',
    name: 'Rodillo de Transferencia HP 4300',
    description: 'Rodillo de Transferencia para HP 4300.',
    price: 160.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: '5851-3941',
    name: 'Kit de Gomas de Alimentación T2 HP 4300',
    description: 'Kit de Gomas de Alimentación T2 para HP 4300. Incluye: (2) Goma de Alimentación T2 RM1-0037-000, (1) Goma de Alimentación T2 RM1-0036-000.',
    price: 150.00,
    category: 'Refacciones HP',
    stock: 10
  },

  // HP 4350 / 4250
  {
    id: 'RM1-1082-RFB',
    name: 'Fusor Remanufacturado HP 4350',
    description: 'Fusor Remanufacturado para HP 4350 / 4250.',
    price: 2500.00,
    category: 'Refacciones HP',
    stock: 5
  },
  {
    id: 'RM1-1082-FIX',
    name: 'Ensamble de Fijación HP 4350',
    description: 'Ensamble de Fijación para HP 4350 / 4250.',
    price: 1085.00,
    category: 'Refacciones HP',
    stock: 5
  },
  {
    id: 'HE-4250',
    name: 'Resistencia (Heating Element) HP 4350',
    description: 'Resistencia (Heating Element) para HP 4350 / 4250 / M4345. Requiere de Pegamento especializado y Grasa de Alto rendimiento.',
    price: 485.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'FFS-4250-JP-4350',
    name: 'Filmina HP 4350',
    description: 'Filmina para HP 4350 / 4250. NO incluye grasa.',
    price: 350.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RC1-3321-000-4350',
    name: 'Rodillo de Presión HP 4350',
    description: 'Rodillo de Presión para HP 4350 / 4250. Calidad Original.',
    price: 245.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'BSH-4250-GRF-4350',
    name: 'Set de Bujes HP 4350',
    description: 'Set de Bujes (izquierdo y derecho) para HP 4350 / 4250. Negros de Grafito.',
    price: 125.00,
    category: 'Refacciones HP',
    stock: 30
  },
  {
    id: 'RM1-1110-000',
    name: 'Rodillo de Transferencia HP 4350',
    description: 'Rodillo de Transferencia para HP 4350 / 4250.',
    price: 160.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'RC1-3325-000',
    name: 'Engrane de Fusor Rod/Pres HP 4350',
    description: 'Engrane de Fusor Rod/Pres para HP 4350 / 4250.',
    price: 60.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RU5-0277',
    name: 'Engrane Negro del Plato HP 4350',
    description: 'Engrane Negro del Plato para HP 4350 / 4250.',
    price: 55.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RU5-0044-000-4350',
    name: 'Engrane Blanco del Plato HP 4350',
    description: 'Engrane Blanco del Plato para HP 4350 / 4250.',
    price: 60.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RM1-0043-000-4350',
    name: 'Plato de Movimiento, Swing Plate HP 4350',
    description: 'Plato de Movimiento, Swing Plate para HP 4350 / 4250.',
    price: 165.00,
    category: 'Refacciones HP',
    stock: 5
  },

  // HP 5000 / 5100
  {
    id: 'RG5-3528-RFB',
    name: 'Unidad de Fusión Remanufacturado HP 5000',
    description: 'Unidad de Fusión Remanufacturado para HP 5000 / 5100.',
    price: 1850.00,
    category: 'Refacciones HP',
    stock: 5
  },
  {
    id: 'Q1860-67902',
    name: 'Kit de Mantenimiento HP 5000',
    description: 'Kit de Mantenimiento para HP 5000 / 5100. Incluye: Unidad de fusión Remanufacturado, Rodillo de Transferencia, Gomas de Alimentación, Pad de Separación.',
    price: 0, // Price not listed in OCR for the kit, only components
    category: 'Refacciones HP',
    stock: 0
  },
  {
    id: 'RM1-2522-Fixing',
    name: 'Ensamble de Fijación HP 5000',
    description: 'Ensamble de Fijación para HP 5000 / 5100.',
    price: 1501.00,
    category: 'Refacciones HP',
    stock: 5
  },
  {
    id: 'FFS-5000-JP',
    name: 'Filmina Calidad OEM HP 5000',
    description: 'Filmina Calidad OEM para HP 5000 / 5100. NO incluye grasa.',
    price: 245.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RB2-1919-000',
    name: 'Rodillo de Presión HP 5000',
    description: 'Rodillo de Presión para HP 5000 / 5100. Calidad OEM.',
    price: 357.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'BSH-5000',
    name: 'Set de Bujes HP 5000',
    description: 'Set de Bujes (izquierdo y derecho) para HP 5000 / 5100.',
    price: 66.00,
    category: 'Refacciones HP',
    stock: 30
  },
  {
    id: 'RG5-3579-000',
    name: 'Rodillo de Transferencia HP 5000',
    description: 'Rodillo de Transferencia para HP 5000 / 5100.',
    price: 192.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'HE-5000',
    name: 'Resistencia HP 5000',
    description: 'Resistencia para HP 5000 / 5100.',
    price: 335.00,
    category: 'Refacciones HP',
    stock: 10
  },
  {
    id: 'RB2-1820-000',
    name: 'Goma de Alimentación Tray 1 HP 5000',
    description: 'Goma de Alimentación Tray 1 para HP 5000 / 5100.',
    price: 77.00,
    category: 'Refacciones HP',
    stock: 25
  },
  {
    id: 'RB2-1821-000',
    name: 'Goma de Alimentación Tray 2 HP 5000',
    description: 'Goma de Alimentación Tray 2 para HP 5000 / 5100.',
    price: 77.00,
    category: 'Refacciones HP',
    stock: 25
  },
  {
    id: 'RF5-2634-000',
    name: 'Goma de Alimentación Tray 3 HP 5000',
    description: 'Goma de Alimentación Tray 3 para HP 5000 / 5100.',
    price: 50.00,
    category: 'Refacciones HP',
    stock: 25
  },
  {
    id: 'RF5-2400-000',
    name: 'Pad de separación Tray 1 HP 5000',
    description: 'Pad de separación Tray 1 para HP 5000 / 5100.',
    price: 89.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RF5-2435-000',
    name: 'Pad de Separación Tray 2 HP 5000',
    description: 'Pad de Separación Tray 2 para HP 5000 / 5100.',
    price: 115.00,
    category: 'Refacciones HP',
    stock: 20
  },
  {
    id: 'RS6-0356-000',
    name: 'Engrane de Rodillo de Presion HP 5000',
    description: 'Engrane de Rodillo de Presion para HP 5000 / 5100.',
    price: 75.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RF5-2409-000',
    name: 'Arm Swing HP 5000',
    description: 'Arm Swing para HP 5000 / 5100.',
    price: 75.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RS6-0348-000',
    name: 'Engrane de Fusor HP 5000',
    description: 'Engrane de Fusor para HP 5000 / 5100.',
    price: 58.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RS6-0354-000',
    name: 'Engrane de Fusor HP 5000 (2)',
    description: 'Engrane de Fusor para HP 5000 / 5100.',
    price: 58.00,
    category: 'Refacciones HP',
    stock: 15
  },
  {
    id: 'RS6-0355-000',
    name: 'Engrane de Fusor HP 5000 (3)',
    description: 'Engrane de Fusor para HP 5000 / 5100.',
    price: 55.00,
    category: 'Refacciones HP',
    stock: 15
  }
];
