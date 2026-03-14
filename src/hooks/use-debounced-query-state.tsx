'use client';

import * as React from 'react';
import { useQueryState } from 'nuqs';
import { useDebouncedCallback } from './use-debounced-callback';

type ParserWithOptions = {
  withOptions: (options: any) => any;
};

type DebouncedOptions = {
  debounceMs?: number;
  startTransition?: React.TransitionStartFunction;
  shallow?: boolean;
  history?: 'push' | 'replace';
  scroll?: boolean;
  throttleMs?: number;
};

export function useDebouncedQueryState<T = string>(
  key: string,
  parser: ParserWithOptions,
  options: DebouncedOptions = {}
) {
  const { debounceMs = 500, ...queryStateOptions } = options;

  const [queryValue, setQueryValue] = useQueryState<T>(
    key,
    parser.withOptions(queryStateOptions)
  );

  // Estado local para actualización inmediata en UI
  const [localValue, setLocalValue] = React.useState<T | null>(queryValue);

  // Sincronizar estado local cuando cambia el query param (ej: al limpiar filtros)
  React.useEffect(() => {
    setLocalValue(queryValue);
  }, [queryValue]);

  // Debounce para actualizar el query param
  const debouncedSetQueryValue = useDebouncedCallback((value: T | null) => {
    setQueryValue(value as any);
  }, debounceMs);

  const setValue = React.useCallback(
    (value: T | null) => {
      setLocalValue(value);
      debouncedSetQueryValue(value);
    },
    [debouncedSetQueryValue]
  );

  return [localValue, setValue] as const;
}
