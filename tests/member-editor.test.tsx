// @vitest-environment jsdom
import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createAgent } from '@ui-sdk/react/agent'
import { afterEach, expect, it, vi } from 'vitest'
import { MemberEditor } from '../src/components/member-editor'

afterEach(cleanup)
Element.prototype.checkVisibility = () => true

function renderAttributes(onCommit = vi.fn()) {
  function Harness() {
    const [values, setValues] = useState(['- id: UUID', '- fecha: Date', '- total: Decimal'])
    return <MemberEditor kind="attributes" values={values} onChange={next => {
      onCommit(next)
      setValues(next)
    }} />
  }

  render(<Harness />)
  return onCommit
}

function attributes() {
  return screen.getAllByRole<HTMLInputElement>('textbox', { name: /^Atributo \d+$/ })
}

it('creates a focused row with Enter and inserts pasted lines in a single edit', () => {
  const commit = renderAttributes()
  fireEvent.keyDown(attributes()[0], { key: 'Enter' })
  expect(document.activeElement).toBe(attributes()[1])
  expect(attributes().map(input => input.value)).toEqual(['- id: UUID', '', '- fecha: Date', '- total: Decimal'])

  commit.mockClear()
  fireEvent.paste(attributes()[1], {
    clipboardData: { getData: () => '- nota: String\r\n\r\n- activo: boolean' },
  })
  expect(commit).toHaveBeenCalledExactlyOnceWith(['- id: UUID', '- nota: String', '- activo: boolean', '- fecha: Date', '- total: Decimal'])
  expect(document.activeElement).toBe(attributes()[2])
})

it('only commits sorting when a member is dropped and cancels with Escape', () => {
  const commit = renderAttributes()
  const handle = screen.getByRole('button', { name: 'Mover atributo 3' })
  fireEvent.keyDown(handle, { key: ' ' })
  fireEvent.keyDown(handle, { key: 'ArrowUp' })
  expect(attributes()[1].value).toBe('- total: Decimal')
  expect(commit).not.toHaveBeenCalled()
  fireEvent.keyDown(handle, { key: 'Escape' })
  expect(attributes()[2].value).toBe('- total: Decimal')
  expect(commit).not.toHaveBeenCalled()

  fireEvent.keyDown(handle, { key: ' ' })
  fireEvent.keyDown(handle, { key: 'ArrowUp' })
  fireEvent.keyDown(handle, { key: ' ' })
  expect(commit).toHaveBeenCalledExactlyOnceWith(['- id: UUID', '- total: Decimal', '- fecha: Date'])
})

it('exposes the named list to agents and moves a member to its requested position', async () => {
  const agent = createAgent()
  const commit = renderAttributes()
  await act(async () => {})
  const list = agent.snapshot().find(entry => entry.label === 'Atributos' && !entry.offPage)
  expect(list?.actions).toContain('move')
  const member = list?.items?.find(item => item.label === '- total: Decimal')
  expect(member?.value).toBeTruthy()

  let ok = false
  await act(async () => {
    const result = await agent.act({ steps: [{ ref: 'Atributos', action: 'move', args: [member!.value, 2] }] })
    ok = result.ok
  })
  expect(ok).toBe(true)
  expect(commit).toHaveBeenCalledExactlyOnceWith(['- id: UUID', '- total: Decimal', '- fecha: Date'])
})
