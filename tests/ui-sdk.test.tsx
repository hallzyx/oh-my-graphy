// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { createAgent } from '@ui-sdk/react/agent'
import { useState } from 'react'
import { Choice } from '../src/components/choice'
HTMLElement.prototype.showPopover = function () {}
HTMLElement.prototype.hidePopover = function () {}
Element.prototype.getAnimations = () => []
Element.prototype.scrollIntoView = function () {}
Element.prototype.checkVisibility = () => true
Element.prototype.getClientRects = () => [] as unknown as DOMRectList
document.elementFromPoint = () => null
document.elementsFromPoint = () => []
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
afterEach(cleanup)
it('exposes the UML type picker to agents and updates editor state through its callback', async () => {
  const agent = createAgent()
  function Harness() { const [value, setValue] = useState('class'); return <><Choice label="Tipo de elemento" value={value} options={[{ value: 'class', label: 'Clase' }, { value: 'interface', label: 'Interfaz' }]} onChange={setValue} /><output aria-label="Tipo activo">{value}</output></> }
  render(<Harness />)
  await act(async () => {})
  const snapshot = agent.snapshot().filter(e => !e.offPage && e.component !== 'more')
  for (const entry of snapshot) expect(entry.label).toBeTruthy()
  expect(snapshot.map(e => e.label)).toContain('Tipo de elemento')
  let result: Awaited<ReturnType<typeof agent.act>> | undefined
  await act(async () => { result = await agent.act({ steps: [{ ref: 'Tipo de elemento', action: 'setValue', args: ['Interfaz'] }] }) })
  expect(result?.ok, result?.error?.message).toBe(true)
  expect(screen.getByRole('status', { name: 'Tipo activo' }).textContent).toBe('interface')
})
