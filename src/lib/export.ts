import { getSmoothStepPath, Position } from '@xyflow/react'
import type { Diagram } from './diagram'
const palette: Record<string, [string, string, string]> = { mint: ['#ecf6ed','#cbded0','#43885b'], blue: ['#eef5fb','#cddfea','#4f85ae'], violet: ['#f1eefb','#dcd4ec','#8a71b3'], amber: ['#fbf7ea','#e7debf','#b19643'], rose: ['#fcf0f0','#ead3d3','#bd8080'], slate: ['#f0f5f4','#d3e1dc','#73968d'] }
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]!))
export function download(content: string | Blob, name: string, type = 'text/plain') {
  const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type }))
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000)
}
export function diagramSvg(d: Diagram): { svg: string; width: number; height: number } {
  const geom = new Map(d.nodes.map(n => [n.id, { x: n.position.x, y: n.position.y, w: n.measured?.width || 300, h: n.measured?.height || 57 + Math.max(44, n.data.attributes.filter(Boolean).length * 25 + 24) + Math.max(44, n.data.methods.filter(Boolean).length * 25 + 24) + (n.data.kind === 'class' ? 0 : 10) }]))
  const minX = Math.min(0, ...[...geom.values()].map(g => g.x)) - 75, minY = Math.min(0, ...[...geom.values()].map(g => g.y)) - 90
  const width = Math.ceil(Math.max(...[...geom.values()].map(g => g.x + g.w), 300) - minX + 75), height = Math.ceil(Math.max(...[...geom.values()].map(g => g.y + g.h), 200) - minY + 70)
  const point = (id: string, side?: string | null) => { const g = geom.get(id)!; return { x: g.x + (side === 'left' ? 0 : side === 'right' ? g.w : g.w / 2), y: g.y + (side === 'top' ? 0 : side === 'bottom' ? g.h : g.h / 2), pos: ({ left: Position.Left, right: Position.Right, top: Position.Top, bottom: Position.Bottom }[side || 'right'] || Position.Right) } }
  let body = `<text x="${minX + 35}" y="${minY + 38}" font-family="Arial,sans-serif" font-size="16" font-weight="600" fill="#52694c">${esc(d.name)}</text>`
  for (const e of d.edges) {
    if (!geom.has(e.source) || !geom.has(e.target)) continue
    const s = point(e.source, e.sourceHandle || 'right'), t = point(e.target, e.targetHandle || 'left'), data = e.data!
    const [path, lx, ly] = getSmoothStepPath({ sourceX: s.x, sourceY: s.y, targetX: t.x, targetY: t.y, sourcePosition: s.pos, targetPosition: t.pos, borderRadius: 12, offset: 34 })
    const end = ['inheritance','realization'].includes(data.kind) ? 'triangle' : data.kind === 'dependency' ? 'arrow' : ''
    const start = data.kind === 'composition' ? 'diamond-filled' : data.kind === 'aggregation' ? 'diamond' : ''
    body += `<path d="${path}" fill="none" stroke="#82938d" stroke-width="1.5" ${['dependency','realization'].includes(data.kind) ? 'stroke-dasharray="6 5"' : ''} ${end ? `marker-end="url(#${end})"` : ''} ${start ? `marker-start="url(#${start})"` : ''}/>`
    if (data.label) body += `<rect x="${lx - data.label.length * 3.3 - 8}" y="${ly - 10}" width="${data.label.length * 6.6 + 16}" height="20" rx="4" fill="#f7f9f5"/><text x="${lx}" y="${ly + 4}" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#788e7c">${esc(data.label)}</text>`
    const mult = (p: ReturnType<typeof point>, label: string) => `<text x="${p.x + (p.pos === Position.Left ? -22 : p.pos === Position.Right ? 22 : 17)}" y="${p.y + (p.pos === Position.Top ? -17 : p.pos === Position.Bottom ? 24 : -10)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#7f9181">${esc(label)}</text>`
    if (data.sourceMultiplicity) body += mult(s, data.sourceMultiplicity)
    if (data.targetMultiplicity) body += mult(t, data.targetMultiplicity)
  }
  for (const n of d.nodes) {
    const g = geom.get(n.id)!, [tint, border, ink] = palette[n.data.color] || palette.mint
    const head = n.data.kind === 'class' ? 57 : 67
    const attrs = n.data.attributes.filter(Boolean), methods = n.data.methods.filter(Boolean)
    const aHeight = Math.max(44, attrs.length * 25 + 24)
    body += `<g transform="translate(${g.x},${g.y})"><rect width="300" height="${g.h}" rx="9" fill="white" stroke="${border}"/><path d="M9 0 H291 Q300 0 300 9 V${head} H0 V9 Q0 0 9 0" fill="${tint}"/><line x1="0" y1="${head}" x2="300" y2="${head}" stroke="${border}"/>`
    if (n.data.kind !== 'class') body += `<text x="17" y="23" font-family="Arial,sans-serif" font-size="10" fill="${ink}">«${n.data.kind === 'enum' ? 'enumeration' : n.data.kind}»</text>`
    body += `<text x="17" y="${head - 22}" font-family="Arial,sans-serif" font-size="15" font-weight="600" ${n.data.kind === 'abstract' ? 'font-style="italic"' : ''} fill="#405548">${esc(n.data.name)}</text><line x1="0" y1="${head + aHeight}" x2="300" y2="${head + aHeight}" stroke="#e9ede8"/>`
    const member = (list: string[], y: number) => list.length ? list.map((line, i) => `<text x="17" y="${y + 28 + 25 * i}" font-family="Consolas,monospace" font-size="11" fill="#68766d">${esc(line)}</text>`).join('') : `<text x="17" y="${y + 27}" font-family="Arial,sans-serif" font-size="11" font-style="italic" fill="#a5afa4">${y === head ? 'Sin atributos' : 'Sin métodos'}</text>`
    body += member(attrs, head) + member(methods, head + aHeight) + '</g>'
  }
  const defs = `<defs><marker id="triangle" viewBox="0 0 16 16" refX="15" refY="8" markerWidth="15" markerHeight="15" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M1 1 L15 8 L1 15 Z" fill="white" stroke="#82938d" stroke-width="1.5"/></marker><marker id="arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M1 1 L11 6 L1 11" fill="none" stroke="#82938d" stroke-width="1.5"/></marker>${['diamond','diamond-filled'].map(id => `<marker id="${id}" viewBox="0 0 20 12" refX="19" refY="6" markerWidth="20" markerHeight="12" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M1 6 L10 1 L19 6 L10 11 Z" fill="${id === 'diamond-filled' ? '#82938d' : 'white'}" stroke="#82938d" stroke-width="1.5"/></marker>`).join('')}</defs>`
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}">${defs}<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#f7f9f5"/>${body}</svg>`, width, height }
}
export async function exportDiagram(d: Diagram, format: 'png' | 'svg', name: string) {
  const { svg, width, height } = diagramSvg(d)
  if (format === 'svg') { download(svg, `${name}.svg`, 'image/svg+xml'); return }
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    const img = new window.Image(); img.src = url; await img.decode()
    const canvas = document.createElement('canvas'), scale = Math.min(2, 8192 / Math.max(width, height))
    canvas.width = Math.ceil(width * scale); canvas.height = Math.ceil(height * scale)
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas no disponible')
    ctx.scale(scale, scale); ctx.drawImage(img, 0, 0)
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('No se pudo crear PNG')
    download(blob, `${name}.png`)
  } finally { URL.revokeObjectURL(url) }
}
