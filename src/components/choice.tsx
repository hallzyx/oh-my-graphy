import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectLabel, SelectTrigger, SelectValue } from '@ui-sdk/react/select'
import { Check, ChevronDown } from 'lucide-react'
export function Choice({ label, value, options, onChange }: { label: string; value: string; options: {value: string; label: string}[]; onChange: (v: string) => void }) {
  return <Select items={options} value={value} onValueChange={v => { if (typeof v === 'string') onChange(v) }}><SelectLabel className="field-label">{label}</SelectLabel><SelectTrigger className="choice-trigger"><SelectValue /><ChevronDown size={15} /></SelectTrigger><SelectContent className="choice-content" sideOffset={5}>{options.map(o => <SelectItem className="choice-item" key={o.value} value={o.value}>{o.label}<SelectItemIndicator><Check size={14} /></SelectItemIndicator></SelectItem>)}</SelectContent></Select>
}
