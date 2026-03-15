import { useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/lib/hooks'

interface EntityComboboxProps<T> {
  value: number | null
  displayValue: string
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearLabel?: string
  fetchOptions: (search: string) => Promise<T[]>
  getItemId: (item: T) => number
  getItemLabel: (item: T) => string
  onSelect: (item: T) => void
  onClear?: () => void
}

export function EntityCombobox<T>({
  value,
  displayValue,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  clearLabel,
  fetchOptions,
  getItemId,
  getItemLabel,
  onSelect,
  onClear,
}: EntityComboboxProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<T[]>([])

  const debouncedSearch = useDebounce(search, 300)

  const fetchOptionsRef = useRef(fetchOptions)
  fetchOptionsRef.current = fetchOptions

  useEffect(() => {
    fetchOptionsRef.current(debouncedSearch).then(setOptions)
  }, [debouncedSearch])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" role="combobox" className="w-full justify-between" />}>
        {displayValue || placeholder}
        <ChevronsUpDown className="ml-2 size-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {clearLabel && (
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    onClear?.()
                    setSearch('')
                    setOpen(false)
                  }}
                >
                  {clearLabel}
                </CommandItem>
              )}
              {options.map((item) => (
                <CommandItem
                  key={getItemId(item)}
                  value={String(getItemId(item))}
                  onSelect={() => {
                    onSelect(item)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4',
                      value === getItemId(item) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {getItemLabel(item)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
