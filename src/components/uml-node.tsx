import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Box, Braces, ListOrdered } from 'lucide-react'
import type { ClassNode } from '@/lib/diagram'
export const UmlNode = memo(function UmlNode({ data, selected }: NodeProps<ClassNode>) {
  const Icon = data.kind === 'interface' ? Braces : data.kind === 'enum' ? ListOrdered : Box
  return <div className={`uml-node color-${data.color} ${selected ? 'is-selected' : ''}`}>
    <div className="uml-node-heading"><span className="uml-icon"><Icon size={17} /></span><div>{data.kind !== 'class' && <span className="stereotype">«{data.kind === 'enum' ? 'enumeration' : data.kind}»</span>}<strong className={data.kind === 'abstract' ? 'italic' : ''}>{data.name || 'SinNombre'}</strong></div><span className="uml-node-dots">···</span></div>
    <div className="uml-compartment">{data.attributes.filter(Boolean).length ? data.attributes.filter(Boolean).map((a, i) => <div className="uml-member" key={i}><span className="visibility">{ /^[+\-#~]/.test(a) ? a[0] : ''}</span><span>{a.replace(/^[+\-#~]\s*/, '')}</span></div>) : <span className="uml-empty">Sin atributos</span>}</div>
    <div className="uml-compartment">{data.methods.filter(Boolean).length ? data.methods.filter(Boolean).map((a, i) => <div className="uml-member" key={i}><span className="visibility method">{ /^[+\-#~]/.test(a) ? a[0] : ''}</span><span>{a.replace(/^[+\-#~]\s*/, '')}</span></div>) : <span className="uml-empty">Sin métodos</span>}</div>
    {([['top', Position.Top], ['right', Position.Right], ['bottom', Position.Bottom], ['left', Position.Left]] as const).map(([id, position]) => <Handle key={id} type="source" id={id} position={position} aria-label={`Conectar ${data.name} por ${id}`} />)}
  </div>
})
