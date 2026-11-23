import {
  Box, Check, ChevronDown, Copy, GitBranch, Pencil, Plus, SlidersHorizontal, Trash2, X,
} from 'lucide-react'
import { colors, kinds, relations, type ClassData, type ClassNode, type Diagram, type RelationData, type RelationEdge, type RelationKind } from '@/lib/diagram'
import { Choice } from './choice'
import { MemberEditor } from './member-editor'
import { Button } from './ui/button'
import { Input, Textarea } from './ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'

type InspectorProps = {
  node?: ClassNode
  edge?: RelationEdge
  diagram: Diagram
  updateClass: (patch: Partial<ClassData>) => void
  updateEdge: (patch: Partial<RelationData>) => void
  remove: () => void
  duplicate: () => void
  close: () => void
  openRelation: () => void
  selectEdge: (id: string) => void
  rename: (name: string, description: string) => void
}

export function Inspector({ node, edge, diagram, updateClass, updateEdge, remove, duplicate, close, openRelation, selectEdge, rename }: InspectorProps) {
  const connected = node ? diagram.edges.filter(e => e.source === node.id || e.target === node.id) : []
  const relation = edge?.data

  return (
    <aside className={node ? 'inspector inspector-class' : 'inspector'} aria-label="Inspector">
      <div className={node ? 'inspector-sticky' : undefined}>
        <div className="inspector-top">
          <span><SlidersHorizontal size={16} />Inspector</span>
          <Button size="icon" variant="ghost" onClick={close} aria-label="Cerrar inspector"><X /></Button>
        </div>
        {node && (
          <div className="inspector-object class-heading">
            <span className={`object-icon color-${node.data.color}`}><Box size={20} /></span>
            <div>
              <Input
                id="class-name"
                aria-label="Nombre de la clase"
                placeholder="Sin nombre"
                title={node.data.name || undefined}
                value={node.data.name}
                onChange={e => updateClass({ name: e.target.value })}
              />
              <span>{kinds[node.data.kind]}</span>
            </div>
            <Button size="icon" variant="ghost" onClick={duplicate} aria-label="Duplicar clase" title="Duplicar clase"><Copy /></Button>
          </div>
        )}
      </div>

      {node ? (
        <>
          <Tabs defaultValue="properties" key={`${diagram.id}:${node.id}`}>
            <TabsList>
              <TabsTrigger value="properties">Propiedades</TabsTrigger>
              <TabsTrigger value="relations">Relaciones <span className="tab-count">{connected.length}</span></TabsTrigger>
            </TabsList>
            <TabsContent value="properties">
              <p className="member-guide">Arrastra para ordenar. Pulsa <kbd>Enter</kbd> para añadir debajo o pega varias firmas, una por línea.</p>
              <MemberEditor kind="attributes" values={node.data.attributes} onChange={attributes => updateClass({ attributes })} />
              <MemberEditor kind="methods" values={node.data.methods} onChange={methods => updateClass({ methods })} />
              <details className="inspector-section class-details">
                <summary>Tipo, color y descripción <ChevronDown size={15} aria-hidden="true" /></summary>
                <div className="class-details-fields">
                  <Choice
                    label="Tipo de elemento"
                    value={node.data.kind}
                    options={Object.entries(kinds).map(([value, label]) => ({ value, label }))}
                    onChange={kind => updateClass({ kind: kind as ClassData['kind'] })}
                  />
                  <span className="field-label">Color del elemento</span>
                  <div className="color-options">
                    {colors.map(color => (
                      <button
                        key={color}
                        aria-label={`Color ${color}`}
                        aria-pressed={node.data.color === color}
                        onClick={() => updateClass({ color })}
                        className={`color-swatch color-${color} ${color === node.data.color ? 'chosen' : ''}`}
                      >{color === node.data.color && <Check size={13} />}</button>
                    ))}
                  </div>
                  <label className="field-label" htmlFor="class-description">Descripción</label>
                  <Textarea id="class-description" placeholder="¿Qué representa esta clase?" value={node.data.description} onChange={e => updateClass({ description: e.target.value })} />
                </div>
              </details>
            </TabsContent>
            <TabsContent value="relations">
              <p className="inspector-hint">Relaciones de {node.data.name}. Selecciona una para editarla.</p>
              <div className="relation-list">
                {connected.map(e => (
                  <button key={e.id} onClick={() => selectEdge(e.id)}>
                    <span className="relation-glyph">{relations[e.data!.kind].symbol}</span>
                    <span>
                      <strong>{diagram.nodes.find(n => n.id === (e.source === node.id ? e.target : e.source))?.data.name}</strong>
                      <small>{relations[e.data!.kind].label}</small>
                    </span>
                  </button>
                ))}
              </div>
              <Button className="w-full" variant="outline" onClick={openRelation}><Plus />Nueva relación</Button>
            </TabsContent>
          </Tabs>
          <div className="inspector-footer">
            <Button variant="ghost" className="text-destructive w-full justify-start" onClick={remove}><Trash2 />Eliminar clase</Button>
            <span>También puedes presionar Supr</span>
          </div>
        </>
      ) : edge && relation ? (
        <>
          <div className="inspector-object">
            <span className="object-icon color-mint"><GitBranch size={21} /></span>
            <div><strong>Relación UML</strong><span>{relations[relation.kind].label}</span></div>
          </div>
          <section className="inspector-section first">
            <div className="relation-endpoints">
              <span>{diagram.nodes.find(n => n.id === edge.source)?.data.name}</span>
              <GitBranch size={15} />
              <span>{diagram.nodes.find(n => n.id === edge.target)?.data.name}</span>
            </div>
            <Choice label="Tipo de relación" value={relation.kind} options={Object.entries(relations).map(([value, r]) => ({ value, label: r.label }))} onChange={kind => updateEdge({ kind: kind as RelationKind })} />
            <p className="inspector-hint">{relations[relation.kind].help}</p>
            <label className="field-label" htmlFor="edge-label">Etiqueta</label>
            <Input id="edge-label" placeholder="Ej. contiene" value={relation.label} onChange={e => updateEdge({ label: e.target.value })} />
            <label className="field-label" htmlFor="source-multiplicity">Multiplicidad del origen</label>
            <Input id="source-multiplicity" placeholder="Ej. 1, 0..1, 1..*" value={relation.sourceMultiplicity} onChange={e => updateEdge({ sourceMultiplicity: e.target.value })} />
            <label className="field-label" htmlFor="target-multiplicity">Multiplicidad del destino</label>
            <Input id="target-multiplicity" placeholder="Ej. 0..*" value={relation.targetMultiplicity} onChange={e => updateEdge({ targetMultiplicity: e.target.value })} />
          </section>
          <div className="inspector-footer">
            <Button variant="ghost" className="text-destructive w-full justify-start" onClick={remove}><Trash2 />Eliminar relación</Button>
          </div>
        </>
      ) : (
        <>
          <div className="inspector-object">
            <span className="object-icon color-mint"><Box size={21} /></span>
            <div><strong>Tu diagrama</strong><span>Un espacio para tus ideas</span></div>
          </div>
          <section className="inspector-section first">
            <label className="field-label" htmlFor="diagram-name">Nombre del diagrama</label>
            <Input id="diagram-name" value={diagram.name} onChange={e => rename(e.target.value, diagram.description)} />
            <label className="field-label" htmlFor="diagram-description">Descripción</label>
            <Textarea id="diagram-description" value={diagram.description} onChange={e => rename(diagram.name, e.target.value)} />
            <div className="diagram-stats">
              <span><b>{diagram.nodes.length}</b>elementos</span><span><b>{diagram.edges.length}</b>relaciones</span>
            </div>
            <div className="tip-card">
              <Pencil size={18} /><strong>Hazlo tuyo</strong>
              <p>Selecciona una clase para editarla. Arrastra desde un punto de conexión para crear una relación.</p>
            </div>
          </section>
        </>
      )}
    </aside>
  )
}
