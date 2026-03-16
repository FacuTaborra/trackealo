'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, Tag, X } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCategories } from '@/features/categories/data/get-categories';
import {
  useDashboardFilters,
  TIME_RANGE_LABELS,
  type TimeRange
} from '@/hooks/use-dashboard-filters';

const TIME_RANGE_OPTIONS: TimeRange[] = [
  'this_month',
  'last_3_months',
  'last_6_months',
  'this_year'
];

export function DashboardFiltersBar() {
  const { timeRange, categoryIds, setTimeRange, setCategoryIds } =
    useDashboardFilters();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories()
  });

  function toggleCategory(id: number) {
    if (categoryIds.includes(id)) {
      setCategoryIds(categoryIds.filter((c) => c !== id));
    } else {
      setCategoryIds([...categoryIds, id]);
    }
  }

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <div className='flex items-center gap-2'>
        <Calendar className='size-4 text-muted-foreground' />
        <Select
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as TimeRange)}
        >
          <SelectTrigger className='h-8 w-[180px] text-sm'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {TIME_RANGE_LABELS[opt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categories.length > 0 && (
        <div className='flex flex-wrap items-center gap-2'>
          <Tag className='size-4 text-muted-foreground' />
          {categories.map((cat) => {
            const isActive = categoryIds.includes(cat.id);
            return (
              <Badge
                key={cat.id}
                variant={isActive ? 'default' : 'outline'}
                className='cursor-pointer select-none transition-colors'
                style={
                  isActive && cat.color
                    ? { backgroundColor: cat.color, borderColor: cat.color, color: '#fff' }
                    : cat.color && !isActive
                      ? { borderColor: cat.color, color: cat.color }
                      : undefined
                }
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.name}
              </Badge>
            );
          })}

          {categoryIds.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-6 px-2 text-xs text-muted-foreground'
              onClick={() => setCategoryIds([])}
            >
              <X className='mr-1 size-3' />
              Limpiar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
