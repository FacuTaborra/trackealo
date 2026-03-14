'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { Button } from '@/components/ui/button';
import { CategoryIconSelect } from './category-icon-select';
import { CategoryColorSelect } from './category-color-select';
import {
  addCategorySchema,
  type AddCategoryInput
} from '../actions/add-category-schema';
import {
  updateCategorySchema,
  type UpdateCategoryInput
} from '../actions/update-category-schema';
import { addCategoryAction } from '../actions/add-category';
import { updateCategoryAction } from '../actions/update-category';
import type { Category } from '../data/get-categories-schema';

interface CategoryFormProps {
  category?: Category | null;
  onSuccess?: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(category);

  const formSchema = isEdit ? updateCategorySchema : addCategorySchema;
  const form = useForm<AddCategoryInput | UpdateCategoryInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      icon: '',
      color: ''
    },
    values: category
      ? {
          id: category.id,
          name: category.name,
          icon: category.icon ?? '',
          color: category.color ?? ''
        }
      : undefined
  });

  const { mutate: addCategory, isPending: isAdding } = useMutation({
    mutationFn: async (input: AddCategoryInput) => {
      const result = await addCategoryAction(input);
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) throw new Error('Datos inválidos');
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría creada correctamente');
      form.reset();
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al crear');
    }
  });

  const { mutate: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: async (input: UpdateCategoryInput) => {
      const result = await updateCategoryAction(input);
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) throw new Error('Datos inválidos');
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría actualizada correctamente');
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    }
  });

  const onSubmit = (data: AddCategoryInput | UpdateCategoryInput) => {
    if (isEdit && 'id' in data) {
      updateCategory(data as UpdateCategoryInput);
    } else {
      addCategory(data as AddCategoryInput);
    }
  };

  const isPending = isAdding || isUpdating;

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-4'
    >
      <FormInput control={form.control} name='name' label='Nombre' required />
      <CategoryIconSelect
        control={form.control}
        name='icon'
        label='Icono (opcional)'
      />
      <CategoryColorSelect
        control={form.control}
        name='color'
        label='Color (opcional)'
      />
      <Button type='submit' disabled={isPending}>
        {isEdit ? 'Guardar cambios' : 'Crear categoría'}
      </Button>
    </Form>
  );
}
