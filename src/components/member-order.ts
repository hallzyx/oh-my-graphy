import { createChange, createReorder, definePrimitive, type ChangeDetails, type ReorderDraft, type ReorderReason } from '@ui-sdk/core'

type MemberOrderOptions = {
  value: string[]
  labels: Record<string, string>
  onValueChange: (value: string[], details: ChangeDetails<ReorderReason>) => void
}

type MemberOrderState = {
  value: string[]
  moving: ReorderDraft | null
}

export const memberOrder = definePrimitive({
  name: 'uml-member-order',
  options: { value: 'value', labels: 'value', onValueChange: 'callback' },
  controlled: ['value'],
  state: ({ value }: MemberOrderOptions): MemberOrderState => ({ value, moving: null }),
  sync: ({ value }) => ({ value }),
  api: (context) => {
    const change = createChange(context)
    const reorder = createReorder(context, {
      slot: 'item',
      key: 'value',
      draft: 'moving',
      set: (value, details) => change('value', value, details),
      preview: true,
      label: (id) => context.options().labels[id],
      message: ({ type, label, position, total }) => {
        if (type === 'cancel') return `Movimiento de ${label} cancelado.`
        if (type === 'grab') return `${label} seleccionado para mover. Posición ${position} de ${total}.`
        return `${label}, posición ${position} de ${total}.`
      },
    })

    return {
      reorder,
      move: (id: string, position: number) => (
        Number.isInteger(position) && position >= 1 && position <= context.store.get().value.length
        && reorder.move(id, position - 1)
      ),
      items: () => context.store.get().value.map((id) => ({ value: id, label: context.options().labels[id] })),
    }
  },
  slots: (slot) => ({
    root: slot({ state: (state, { api }) => ({ order: api.reorder.order(state) }) }),
    item: slot<{ value: string }>({
      props: { value: 'string' },
      attrs: (state, { key }) => ({ 'data-moving': state.moving?.key === key ? '' : undefined }),
      bind: (element, part) => part.api.reorder.bind(element, part),
    }),
    handle: slot<{ value: string }>({
      props: { value: 'string' },
      attrs: (state, { key }) => ({ type: 'button', 'aria-pressed': String(state.moving?.key === key) }),
      on: {
        keydown: (event, { api, key }) => api.reorder.keydown(event, key),
        pointerdown: (event, { api, key }) => api.reorder.pointerdown(event, key),
      },
    }),
  }),
  agent: { actions: ['move'], items: (api) => api.items() },
})
