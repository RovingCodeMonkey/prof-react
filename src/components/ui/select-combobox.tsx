import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface SelectComboboxOption<T extends string | number> {
  value: T
  label: string
}

interface SelectComboboxProps<T extends string | number> {
  value: T
  options: SelectComboboxOption<T>[]
  onChange: (value: T) => void
  className?: string
}

export function SelectCombobox<T extends string | number>({
  value,
  options,
  onChange,
  className,
}: SelectComboboxProps<T>) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" role="combobox" className={cn('justify-between', className)} />}>
        {selected?.label ?? ''}
        <ChevronsUpDown className="ml-2 size-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-32 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={String(opt.value)}
                  onSelect={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-2 size-4', value === opt.value ? 'opacity-100' : 'opacity-0')} />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
