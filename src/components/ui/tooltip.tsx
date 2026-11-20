import * as React from 'react'
import * as Primitive from '@radix-ui/react-tooltip'
export const TooltipProvider = Primitive.Provider
export function Tip({ children, label }: {children: React.ReactNode; label: string}) { return <Primitive.Root><Primitive.Trigger asChild>{children}</Primitive.Trigger><Primitive.Portal><Primitive.Content side="top" sideOffset={7} className="z-50 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md">{label}<Primitive.Arrow /></Primitive.Content></Primitive.Portal></Primitive.Root> }
