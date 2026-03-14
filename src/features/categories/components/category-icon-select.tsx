'use client';

import { FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { BaseFormFieldProps } from '@/types/base-form';
import {
  CATEGORY_ICON_OPTIONS,
  getCategoryIcon,
  NONE_VALUE
} from '../constants/category-options';

interface CategoryIconSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {}

export function CategoryIconSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label = 'Icono',
  disabled,
  className
}: CategoryIconSelectProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectValue =
          field.value && field.value !== '' ? field.value : NONE_VALUE;
        const SelectedIcon = getCategoryIcon(field.value);
        const selectedOption = CATEGORY_ICON_OPTIONS.find(
          (o) => o.value === selectValue
        );
        return (
          <FormItem className={className}>
            {label && <FormLabel>{label}</FormLabel>}
            <Select
              onValueChange={(v) => field.onChange(v === NONE_VALUE ? '' : v)}
              value={selectValue}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar icono'>
                    {SelectedIcon ? (
                      <span className='flex items-center gap-2'>
                        <SelectedIcon className='size-4' />
                        {selectedOption?.label}
                      </span>
                    ) : (
                      selectedOption?.label
                    )}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CATEGORY_ICON_OPTIONS.map((option) => (
                  <SelectItem key={option.value || 'none'} value={option.value}>
                    <span className='flex items-center gap-2'>
                      {option.Icon ? (
                        <option.Icon className='size-4 shrink-0' />
                      ) : (
                        <span className='inline-block size-4 shrink-0' />
                      )}
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
