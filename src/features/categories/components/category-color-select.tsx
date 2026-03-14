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
  CATEGORY_COLOR_OPTIONS,
  NONE_VALUE
} from '../constants/category-options';

interface CategoryColorSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {}

export function CategoryColorSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label = 'Color',
  disabled,
  className
}: CategoryColorSelectProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectValue =
          field.value && field.value !== '' ? field.value : NONE_VALUE;
        const selected = CATEGORY_COLOR_OPTIONS.find(
          (o) => o.value === selectValue
        );
        return (
          <FormItem className={className}>
            {label && <FormLabel>{label}</FormLabel>}
            <Select
              onValueChange={(v) => field.onChange(v === NONE_VALUE ? '' : v)}
              value={field.value && field.value !== '' ? field.value : NONE_VALUE}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar color'>
                    {selected?.value && selected.value !== NONE_VALUE ? (
                      <span className='flex items-center gap-2'>
                        <span
                          className='size-4 shrink-0 rounded-full border'
                          style={{ backgroundColor: selected.value }}
                        />
                        {selected.label}
                      </span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CATEGORY_COLOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value || 'none'} value={option.value}>
                    <span className='flex items-center gap-2'>
                      {option.value ? (
                        <span
                          className='size-4 shrink-0 rounded-full border'
                          style={{ backgroundColor: option.value }}
                        />
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
