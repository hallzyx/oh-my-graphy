import type { Edge, Node, Viewport } from '@xyflow/react'
export type ClassKind = 'class' | 'interface' | 'abstract' | 'enum'
export type RelationKind = 'association' | 'inheritance' | 'composition' | 'aggregation' | 'dependency' | 'realization'
export type ClassData = { name: string; kind: ClassKind; color: string; attributes: string[]; methods: string[]; description: string; [key: string]: unknown }
export type RelationData = { kind: RelationKind; label: string; sourceMultiplicity: string; targetMultiplicity: string; [key: string]: unknown }
export type ClassNode = Node<ClassData, 'uml'>
export type RelationEdge = Edge<RelationData, 'uml'>
export type Diagram = { id: string; name: string; description: string; nodes: ClassNode[]; edges: RelationEdge[]; viewport?: Viewport; updatedAt: number }
export type Workspace = { version: 1; activeId: string; diagrams: Diagram[] }
export const colors = ['mint', 'blue', 'violet', 'amber', 'rose', 'slate']
export const kinds: Record<ClassKind, string> = { class: 'Clase', interface: 'Interfaz', abstract: 'Clase abstracta', enum: 'Enumeración' }
export const relations: Record<RelationKind, { label: string; symbol: string; help: string }> = {
  association: { label: 'Asociación', symbol: '──', help: 'Una clase se relaciona con otra.' },
  inheritance: { label: 'Herencia', symbol: '─▷', help: 'El origen hereda de la clase destino.' },
  composition: { label: 'Composición', symbol: '◆─', help: 'El origen contiene al destino; comparten su ciclo de vida.' },
  aggregation: { label: 'Agregación', symbol: '◇─', help: 'El origen agrupa al destino; puede existir por separado.' },
  dependency: { label: 'Dependencia', symbol: '╌›', help: 'El origen utiliza al destino.' },
  realization: { label: 'Realización', symbol: '╌▷', help: 'El origen implementa la interfaz destino.' },
}
export const uid = () => crypto.randomUUID()
export const makeNode = (name = 'NuevaClase', kind: ClassKind = 'class', position = { x: 100, y: 100 }): ClassNode => ({ id: uid(), type: 'uml', position, data: { name, kind, color: 'mint', attributes: [], methods: [], description: '' } })
export const makeEdge = (source: string, target: string, kind: RelationKind = 'association', data: Partial<RelationData> = {}): RelationEdge => ({ id: uid(), type: 'uml', source, target, sourceHandle: 'right', targetHandle: 'left', data: { kind, label: '', sourceMultiplicity: '', targetMultiplicity: '', ...data } })
export function sampleDiagram(template: 'shop' | 'library' | 'blank' = 'shop'): Diagram {
  const d: Diagram = { id: uid(), name: template === 'shop' ? 'Sistema de pedidos' : template === 'library' ? 'Biblioteca digital' : 'Diagrama sin título', description: template === 'shop' ? 'Del cliente a la entrega. Un modelo para cada idea.' : 'Tu próxima idea empieza aquí.', nodes: [], edges: [], updatedAt: Date.now() }
  if (template === 'blank') return d
  const sample = (id: string, name: string, x: number, y: number, color: string, attributes: string[], methods: string[], kind: ClassKind = 'class'): ClassNode => ({ id, type: 'uml', position: { x, y }, data: { name, kind, color, attributes, methods, description: '' } })
  if (template === 'library') {
    d.nodes = [sample('lector', 'Lector', 0, 0, 'blue', ['- id: UUID', '- nombre: String'], ['+ solicitarPrestamo(): void']), sample('prestamo', 'Prestamo', 390, 0, 'mint', ['- fecha: Date', '- vencimiento: Date'], ['+ devolver(): void']), sample('libro', 'Libro', 780, 0, 'amber', ['- isbn: String', '- titulo: String', '- disponible: Boolean'], ['+ reservar(): void'])]
    d.edges = [makeEdge('lector', 'prestamo', 'association', { label: 'solicita', sourceMultiplicity: '1', targetMultiplicity: '0..*' }), makeEdge('prestamo', 'libro', 'association', { label: 'incluye', sourceMultiplicity: '0..*', targetMultiplicity: '1' })]
    return d
  }
  d.nodes = [
    sample('cliente', 'Cliente', 0, 10, 'blue', ['- id: UUID', '- nombre: String', '- email: String'], ['+ realizarPedido(): Pedido', '+ verHistorial(): List<Pedido>']),
    sample('pedido', 'Pedido', 420, 10, 'mint', ['- id: UUID', '- fecha: Date', '- total: Decimal', '- estado: EstadoPedido'], ['+ agregarProducto(): void', '+ calcularTotal(): Decimal', '+ confirmar(): void']),
    sample('detalle', 'DetallePedido', 840, 10, 'violet', ['- cantidad: Integer', '- precioUnitario: Decimal'], ['+ subtotal(): Decimal']),
    sample('pago', 'MetodoPago', 0, 405, 'slate', [], ['+ procesar(monto: Decimal): Boolean', '+ reembolsar(): void'], 'interface'),
    sample('estado', 'EstadoPedido', 420, 430, 'amber', ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO'], [], 'enum'),
    sample('producto', 'Producto', 840, 380, 'rose', ['- id: UUID', '- nombre: String', '- precio: Decimal', '- stock: Integer'], ['+ actualizarStock(): void', '+ disponible(): Boolean'])
  ]
  const edge = (source: string, target: string, kind: RelationKind, label: string, sm: string, tm: string, vertical = false): RelationEdge => ({ ...makeEdge(source, target, kind, { label, sourceMultiplicity: sm, targetMultiplicity: tm }), ...(vertical ? { sourceHandle: 'bottom', targetHandle: 'top' } : {}) })
  d.edges = [edge('cliente', 'pedido', 'association', 'realiza', '1', '0..*'), edge('pedido', 'detalle', 'composition', 'contiene', '1', '1..*'), edge('pedido', 'pago', 'dependency', 'usa', '', ''), edge('pedido', 'estado', 'dependency', 'tiene', '', '', true), edge('detalle', 'producto', 'association', 'referencia', '0..*', '1', true)]
  d.edges[2].sourceHandle = 'bottom'; d.edges[2].targetHandle = 'right'
  return d
}
export function cleanDiagram(d: Diagram): Diagram {
  return { ...d, nodes: d.nodes.map(({ id, type, position, data }) => ({ id, type, position, data })), edges: d.edges.map(({ id, type, source, target, sourceHandle, targetHandle, data }) => ({ id, type, source, target, sourceHandle, targetHandle, data })) }
}
export function parseDiagram(input: unknown): Diagram {
  if (!input || typeof input !== 'object') throw new Error('El archivo no contiene un diagrama válido.')
  const d = input as Diagram
  if (typeof d.name !== 'string' || !Array.isArray(d.nodes) || !Array.isArray(d.edges) || d.nodes.length > 500 || d.edges.length > 2000) throw new Error('Formato no válido o diagrama demasiado grande (máximo 500 clases).')
  const ids = new Set<string>()
  d.nodes.forEach(n => {
    if (!n || typeof n.id !== 'string' || !n.id || ids.has(n.id) || !n.position || !Number.isFinite(n.position.x) || !Number.isFinite(n.position.y) || !n.data || typeof n.data.name !== 'string' || !Object.hasOwn(kinds, n.data.kind) || !colors.includes(n.data.color) || !Array.isArray(n.data.attributes) || !Array.isArray(n.data.methods) || ![...n.data.attributes, ...n.data.methods].every(s => typeof s === 'string')) throw new Error('Una de las clases contiene datos no válidos.')
    ids.add(n.id)
  })
  const edgeIds = new Set<string>()
  d.edges.forEach(e => {
    if (!e || typeof e.id !== 'string' || edgeIds.has(e.id) || !ids.has(e.source) || !ids.has(e.target) || !e.data || !Object.hasOwn(relations, e.data.kind) || !['label', 'sourceMultiplicity', 'targetMultiplicity'].every(k => typeof e.data?.[k] === 'string') || (e.sourceHandle && !['top','bottom','left','right'].includes(e.sourceHandle)) || (e.targetHandle && !['top','bottom','left','right'].includes(e.targetHandle))) throw new Error('Una de las relaciones contiene datos no válidos.')
    edgeIds.add(e.id)
  })
  return cleanDiagram({ ...d, id: typeof d.id === 'string' ? d.id : uid(), description: typeof d.description === 'string' ? d.description : '', updatedAt: Date.now(), viewport: undefined, nodes: d.nodes.map(n => ({ ...n, type: 'uml', data: { ...n.data, description: typeof n.data.description === 'string' ? n.data.description : '' } })), edges: d.edges.map(e => ({ ...e, type: 'uml' })) })
}
export function toMermaid(d: Diagram): string {
  const ids = new Map(d.nodes.map((n, i) => [n.id, `Class${i + 1}`]))
  const safe = (s: string) => s.replace(/[{}\n\r"`<>]/g, '').trim()
  const lines = ['classDiagram', '  direction LR']
  for (const n of d.nodes) {
    const id = ids.get(n.id)
    lines.push(`  class ${id}["${safe(n.data.name)}"] {`)
    if (n.data.kind !== 'class') lines.push(`    <<${n.data.kind === 'enum' ? 'enumeration' : n.data.kind}>>`)
    n.data.attributes.concat(n.data.methods).forEach(a => { if (a.trim()) lines.push(`    ${safe(a).replace(/List([A-Za-z]+)/g, 'List~$1~')}`) })
    lines.push('  }')
  }
  const symbols: Record<RelationKind, string> = { association: '--', inheritance: '--|>', composition: '*--', aggregation: 'o--', dependency: '..>', realization: '..|>' }
  for (const e of d.edges) if (e.data) lines.push(`  ${ids.get(e.source)} ${e.data.sourceMultiplicity ? `"${safe(e.data.sourceMultiplicity)}" ` : ''}${symbols[e.data.kind]} ${e.data.targetMultiplicity ? `"${safe(e.data.targetMultiplicity)}" ` : ''}${ids.get(e.target)}${e.data.label ? ` : ${safe(e.data.label).replace(/:/g, '')}` : ''}`)
  return lines.join('\n')
}
export function deleteElements(d: Diagram, nodeIds: string[], edgeIds: string[] = []): Diagram { return { ...d, nodes: d.nodes.filter(n => !nodeIds.includes(n.id)), edges: d.edges.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target) && !edgeIds.includes(e.id)) } }
