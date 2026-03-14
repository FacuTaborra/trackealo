'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconPencil, IconTrash } from '@tabler/icons-react';

import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { deleteCategoryAction } from '../actions/delete-category';
import { getCategoryIcon } from '../constants/category-options';
import type { Category } from '../data/get-categories-schema';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
}

export function CategoryCard({ category, onEdit }: CategoryCardProps) {
  const queryClient = useQueryClient();

  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const result = await deleteCategoryAction({ id: category.id });
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) throw new Error('Datos inválidos');
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría eliminada');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  });

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <span
          className='flex items-center gap-2 font-medium'
          style={category.color ? { color: category.color } : undefined}
        >
          {(() => {
            const Icon = getCategoryIcon(category.icon);
            return Icon ? <Icon className='size-4 shrink-0' /> : null;
          })()}
          {category.name}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='size-8'>
              <span className='sr-only'>Abrir menú</span>
              <IconPencil className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <IconPencil className='mr-2 size-4' />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              onClick={() => deleteCategory()}
              disabled={isDeleting}
            >
              <IconTrash className='mr-2 size-4' />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
    </Card>
  );
}
