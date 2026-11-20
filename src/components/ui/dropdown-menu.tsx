import * as React from 'react'
import * as Primitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'
export const DropdownMenu = Primitive.Root
export const DropdownMenuTrigger = Primitive.Trigger
export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof Primitive.Content>, React.ComponentPropsWithoutRef<typeof Primitive.Content>>(({ className, sideOffset = 7, ...props }, ref) => <Primitive.Portal><Primitive.Content ref={ref} sideOffset={sideOffset} className={cn('z-50 min-w-48 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg', className)} {...props} /></Primitive.Portal>)
export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof Primitive.Item>, React.ComponentPropsWithoutRef<typeof Primitive.Item>>(({ className, ...props }, ref) => <Primitive.Item ref={ref} className={cn('relative flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4', className)} {...props} />)
export const DropdownMenuSeparator = Primitive.Separator
