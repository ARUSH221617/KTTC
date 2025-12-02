'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface InstructorSelectProps {
  value: string;
  onChange: (value: string) => void;
  instructors: { id: string; name: string }[];
  error?: string;
}

export function InstructorSelect({
  value,
  onChange,
  instructors,
  error
}: InstructorSelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              error && "border-red-500"
            )}
          >
            {value
              ? instructors.find((instructor) => instructor.id === value)?.name
              : "Select instructor..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search instructor..." />
            <CommandList>
              <CommandEmpty>No instructor found.</CommandEmpty>
              <CommandGroup>
                {instructors.map((instructor) => (
                  <CommandItem
                    key={instructor.id}
                    value={instructor.name}
                    onSelect={() => {
                      onChange(instructor.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === instructor.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {instructor.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
