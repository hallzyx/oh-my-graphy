import { describe, expect, it } from 'vitest'
import { cleanDiagram, deleteElements, makeEdge, parseDiagram, sampleDiagram, toMermaid } from '../src/lib/diagram'
import { diagramSvg } from '../src/lib/export'
describe('project import and editing', () => {
  it('round-trips a complete project without internal React Flow metadata', () => {
    const d = sampleDiagram(); d.nodes[0].selected = true; d.nodes[0].measured = { width: 300, height: 200 }
    const imported = parseDiagram(JSON.parse(JSON.stringify(cleanDiagram(d))))
    expect(imported.nodes).toHaveLength(6); expect(imported.edges).toHaveLength(5)
    expect(imported.nodes[0].selected).toBeUndefined(); expect(imported.nodes[0].measured).toBeUndefined()
    expect(imported.edges[0].data).toEqual(d.edges[0].data)
  })
  it('rejects malformed nodes, duplicate ids, dangling edges and invalid relation types', () => {
    const d = sampleDiagram()
    expect(() => parseDiagram({ ...d, nodes: [{ ...d.nodes[0], position: { x: '1', y: 0 } }] })).toThrow()
    expect(() => parseDiagram({ ...d, nodes: [d.nodes[0], d.nodes[0]] })).toThrow()
    expect(() => parseDiagram({ ...d, edges: [{ ...d.edges[0], target: 'missing' }] })).toThrow()
    expect(() => parseDiagram({ ...d, edges: [{ ...d.edges[0], data: { ...d.edges[0].data, kind: 'bad' } }] })).toThrow()
    expect(() => parseDiagram({ ...d, edges: [{ ...d.edges[0], sourceHandle: '<bad>' }] })).toThrow()
  })
  it('removes connected relations when deleting a class and preserves unrelated elements', () => {
    const d = deleteElements(sampleDiagram(), ['pedido'])
    expect(d.nodes).toHaveLength(5); expect(d.edges).toHaveLength(1)
    expect(d.edges[0].source).toBe('detalle'); expect(d.edges[0].target).toBe('producto')
  })
})
describe('exports', () => {
  it('exports all six UML relation directions with cardinality', () => {
    const d = sampleDiagram(); d.edges = (['association','inheritance','composition','aggregation','dependency','realization'] as const).map(k => makeEdge('cliente','pedido', k, { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'conecta' }))
    const code = toMermaid(d)
    for (const symbol of ['--','--|>','*--','o--','..>','..|>']) expect(code).toContain(`"1" ${symbol} "0..*"`)
    expect(code).toContain('<<interface>>'); expect(code).toContain('<<enumeration>>')
  })
  it('escapes markup in SVG and includes offscreen classes and relation markers', () => {
    const d = sampleDiagram(); d.nodes[0].data.name = '<script>alert("x")</script>'; d.nodes[0].position = { x: -500, y: -500 }
    const { svg, width, height } = diagramSvg(d)
    expect(svg).not.toContain('<script>'); expect(svg).toContain('&lt;script&gt;')
    expect(svg).toContain('marker-start="url(#diamond-filled)"'); expect(svg).toContain('Producto')
    expect(width).toBeGreaterThan(1600); expect(height).toBeGreaterThan(1000)
  })
})
