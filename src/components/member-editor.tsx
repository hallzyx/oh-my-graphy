import { useId, useLayoutEffect, useRef, useState, type ClipboardEvent } from 'react'
import { createParts } from '@ui-sdk/react/primitive'
import { GripVertical, Plus, X } from 'lucide-react'
import { uid } from '@/lib/diagram'
import { memberOrder } from './member-order'
import { Button } from './ui/button'
import { Input } from './ui/input'

const OrderedList = createParts(memberOrder, { root: 'ol', item: 'li', handle: 'button' })

type MemberEditorProps = {
  kind: 'attributes' | 'methods'
  values: string[]
  onChange: (values: string[]) => void
}

export function MemberEditor({ kind, values, onChange }: MemberEditorProps) {
  const attribute = kind === 'attributes'
  const heading = attribute ? 'Atributos' : 'Métodos'
  const label = attribute ? 'Atributo' : 'Método'
  const singular = label.toLowerCase()
  const example = attribute ? '- id: UUID' : '+ confirmar(): void'
  const instructions = useId()
  const inputs = useRef(new Map<string, HTMLInputElement>())
  const addButton = useRef<HTMLButtonElement>(null)
  const pendingFocus = useRef<string | null>(null)
  let [ids, setIds] = useState<string[]>(() => values.map(uid))

  // Diagram undo and redo can change the list length outside this editor.
  if (ids.length !== values.length) {
    ids = ids.slice(0, values.length)
    while (ids.length < values.length) ids.push(uid())
    setIds(ids)
  }

  const entries = new Map(ids.map((id, index) => [id, { value: values[index], index }]))
  const labels = Object.fromEntries(ids.map((id, index) => [id, values[index].trim() || `${label} ${index + 1}`]))

  useLayoutEffect(() => {
    const id = pendingFocus.current
    if (!id) return
    pendingFocus.current = null
    const input = inputs.current.get(id)
    if (!input) {
      addButton.current?.focus()
      return
    }
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
    input.scrollIntoView?.({ block: 'nearest' })
  }, [ids])

  function insert(after: number) {
    const id = uid()
    pendingFocus.current = id
    setIds([...ids.slice(0, after + 1), id, ...ids.slice(after + 1)])
    onChange([...values.slice(0, after + 1), '', ...values.slice(after + 1)])
  }

  function remove(index: number) {
    pendingFocus.current = ids[index + 1] ?? ids[index - 1] ?? 'add'
    setIds(ids.filter((_, position) => position !== index))
    onChange(values.filter((_, position) => position !== index))
  }

  function paste(event: ClipboardEvent<HTMLInputElement>, index: number) {
    const text = event.clipboardData.getData('text/plain')
    if (!/[\r\n]/.test(text)) return
    const lines = text.split(/\r\n|[\r\n]/).map(line => line.trim()).filter(Boolean)
    if (!lines.length) return
    event.preventDefault()

    const { selectionStart, selectionEnd } = event.currentTarget
    lines[0] = values[index].slice(0, selectionStart ?? 0) + lines[0]
    lines[lines.length - 1] += values[index].slice(selectionEnd ?? values[index].length)
    const inserted = lines.slice(1).map(uid)
    pendingFocus.current = inserted.at(-1) ?? ids[index]
    setIds([...ids.slice(0, index + 1), ...inserted, ...ids.slice(index + 1)])
    onChange([...values.slice(0, index), ...lines, ...values.slice(index + 1)])
  }

  function commitOrder(order: string[]) {
    if (order.length !== ids.length || order.some(id => !entries.has(id))) return
    if (order.every((id, index) => id === ids[index])) return
    setIds(order)
    onChange(order.map(id => entries.get(id)!.value))
  }

  return (
    <section className="inspector-section member-section">
      <div className="member-section-heading">
        <h3>{heading}<span className="member-count">{values.length}</span></h3>
        <Button ref={addButton} size="sm" variant="ghost" className="add-member" onClick={() => insert(values.length - 1)}>
          <Plus /> Añadir {singular}
        </Button>
      </div>
      <p id={instructions} className="sr-only">
        Para mover una fila, pulsa Espacio, usa las flechas y pulsa Espacio otra vez. Escape cancela.
      </p>
      <OrderedList.Root className="member-list" aria-label={heading} value={ids} labels={labels} onValueChange={commitOrder}>
        {({ order }) => order.map((id, visualIndex) => {
          const entry = entries.get(id)
          if (!entry) return null
          const { value: signature, index } = entry
          return (
            <OrderedList.Item key={id} value={id} className="member-row" aria-label={labels[id]}>
              <OrderedList.Handle
                value={id}
                className="member-grip"
                aria-label={`Mover ${singular} ${visualIndex + 1}`}
                aria-describedby={instructions}
                disabled={values.length < 2}
                title={`Mover ${singular}`}
              ><GripVertical aria-hidden="true" /></OrderedList.Handle>
              <Input
                ref={input => {
                  if (input) inputs.current.set(id, input)
                  else inputs.current.delete(id)
                }}
                aria-label={`${label} ${visualIndex + 1}`}
                value={signature}
                placeholder={example}
                title={signature || undefined}
                spellCheck={false}
                autoComplete="off"
                onChange={event => {
                  const next = event.target.value
                  onChange(values.map((current, position) => position === index ? next : current))
                }}
                onPaste={event => paste(event, index)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    if (signature.trim()) insert(index)
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="member-delete"
                aria-label={`Eliminar ${singular} ${visualIndex + 1}`}
                title={`Eliminar ${singular}`}
                onClick={() => remove(index)}
              ><X /></Button>
            </OrderedList.Item>
          )
        })}
      </OrderedList.Root>
      {values.length === 0 && <p className="empty-members">Sin {heading.toLowerCase()}.</p>}
    </section>
  )
}
