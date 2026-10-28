export type Source = {
  id: string
  name: string
  type: 'PDF' | 'DOCX'
  excerpt: string
  supports: string
}

export const sources: Source[] = [
  {
    id: 'operations-kpis',
    name: 'Operations_KPIs_Week23.pdf',
    type: 'PDF',
    excerpt:
      'Week 23 throughput closed at 96% of plan. Final inventory reconciliation remains open and the variance is not yet available.',
    supports: 'Throughput and inventory status',
  },
  {
    id: 'regional-updates',
    name: 'Regional_Updates_Week23.docx',
    type: 'DOCX',
    excerpt:
      'Two Southeast shipments moved to the next dispatch window. The working explanation references carrier capacity and requires Operations confirmation.',
    supports: 'Regional shipment update',
  },
]

export const recentChats = [
  'Weekly operations summary',
  'Southeast shipment delays',
  'Week 22 KPI questions',
]
