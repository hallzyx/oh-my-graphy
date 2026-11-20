import { useCallback, useEffect, useRef, useState } from 'react'
import { cleanDiagram, parseDiagram, sampleDiagram, type Diagram, type Workspace } from './diagram'
import { toast } from 'sonner'
const KEY = 'oh-my-graphy.workspace.v1'
export function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const value = JSON.parse(raw)
      if (value.version === 1 && Array.isArray(value.diagrams) && value.diagrams.length > 0) {
        const diagrams = value.diagrams.map(parseDiagram)
        return { version: 1, diagrams, activeId: diagrams.some((d: Diagram) => d.id === value.activeId) ? value.activeId : diagrams[0].id }
      }
    }
  } catch { toast.error('No se pudo abrir el guardado local. Puedes importar una copia JSON.'); }
  const d = sampleDiagram()
  return { version: 1, diagrams: [d], activeId: d.id }
}
export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace)
  const [saved, setSaved] = useState<'saved' | 'saving' | 'error'>('saved')
  const history = useRef<Record<string, { past: Diagram[]; future: Diagram[] }>>({})
  const [historyVersion, setHistoryVersion] = useState(0)
  const current = workspace.diagrams.find(d => d.id === workspace.activeId)!
  const currentRef = useRef(current); currentRef.current = current
  useEffect(() => {
    setSaved('saving')
    const timer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify({ ...workspace, diagrams: workspace.diagrams.map(cleanDiagram) })); setSaved('saved') }
      catch { setSaved('error'); toast.error('El navegador no pudo guardar. Exporta una copia JSON para conservar tu trabajo.') }
    }, 500)
    return () => clearTimeout(timer)
  }, [workspace])
  useEffect(() => {
    const flush = () => { try { localStorage.setItem(KEY, JSON.stringify({ ...workspace, diagrams: workspace.diagrams.map(cleanDiagram) })) } catch { /* The visible save status already reports storage failures. */ } }
    const onVisibilityChange = () => { if (document.visibilityState === 'hidden') flush() }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', onVisibilityChange) }
  }, [workspace])
  const checkpoint = useCallback(() => {
    const d = currentRef.current
    const h = history.current[d.id] ||= { past: [], future: [] }
    h.past = [...h.past.slice(-59), structuredClone(d)]; h.future = []
    setHistoryVersion(v => v + 1)
  }, [])
  const update = useCallback((fn: (d: Diagram) => Diagram, record = true) => {
    if (record) checkpoint()
    setWorkspace(w => ({ ...w, diagrams: w.diagrams.map(d => d.id === w.activeId ? { ...fn(d), updatedAt: Date.now() } : d) }))
  }, [checkpoint])
  const navigateHistory = useCallback((redo = false) => {
    const d = currentRef.current, h = history.current[d.id]
    if (!h || !(redo ? h.future : h.past).length) return
    const destination = redo ? h.future.pop()! : h.past.pop()!
    if (redo) h.past.push(structuredClone(d)); else h.future.push(structuredClone(d))
    setWorkspace(w => ({ ...w, diagrams: w.diagrams.map(x => x.id === d.id ? destination : x) }))
    setHistoryVersion(v => v + 1)
  }, [])
  const addDiagram = (d: Diagram) => setWorkspace(w => ({ ...w, activeId: d.id, diagrams: [...w.diagrams, d] }))
  const switchDiagram = (id: string) => setWorkspace(w => ({ ...w, activeId: id }))
  const removeDiagram = (id: string) => setWorkspace(w => {
    let diagrams = w.diagrams.filter(d => d.id !== id)
    if (!diagrams.length) diagrams = [sampleDiagram('blank')]
    return { ...w, diagrams, activeId: w.activeId === id ? diagrams[0].id : w.activeId }
  })
  const h = history.current[current.id]
  void historyVersion
  return { workspace, current, saved, update, checkpoint, addDiagram, switchDiagram, removeDiagram, undo: () => navigateHistory(), redo: () => navigateHistory(true), canUndo: !!h?.past.length, canRedo: !!h?.future.length }
}
