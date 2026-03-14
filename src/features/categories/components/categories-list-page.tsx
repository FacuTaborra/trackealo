'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconPlus } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { getCategories } from '../data/get-categories';
import { CategoryCard } from './category-card';
import { CategoryForm } from './category-form';
import type { Category } from '../data/get-categories-schema';

export function CategoriesListPage() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center p-8'>
        <p className='text-muted-foreground'>Cargando categorías...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-1 items-center justify-center p-8'>
        <p className='text-destructive'>
          Error al cargar las categorías. Intenta de nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>Categorías</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className='mr-2 size-4' />
              Nueva categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva categoría</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSuccess={() => {
                setAddDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {editingCategory && (
        <Dialog
          open={Boolean(editingCategory)}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar categoría</DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              onSuccess={() => {
                setEditingCategory(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {categories && categories.length > 0 ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={setEditingCategory}
            />
          ))}
        </div>
      ) : (
        <div className='flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-8'>
          <p className='text-muted-foreground text-center'>
            No tienes categorías aún. Crea una para clasificar tus gastos e
            ingresos.
          </p>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className='mt-4'>
                <IconPlus className='mr-2 size-4' />
                Crear primera categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva categoría</DialogTitle>
              </DialogHeader>
              <CategoryForm
                onSuccess={() => {
                  setAddDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
