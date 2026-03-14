'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const EMPTY_VALUE = '__none__';

interface FilterSelectOption {
  id: string;
  label: string;
}

interface FilterSelectProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  options: FilterSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function FilterSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Seleccione...',
  disabled = false,
  isLoading = false,
  className
}: FilterSelectProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue === EMPTY_VALUE) {
      onValueChange(null);
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <Select
      value={value || EMPTY_VALUE}
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={className}>
        {isLoading ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='size-4 animate-spin' />
            <span>Cargando...</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          value={EMPTY_VALUE}
          className='text-muted-foreground italic'
        >
          {placeholder}
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
