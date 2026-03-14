'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Row } from '@tanstack/react-table';
import { IconPencil, IconTrash } from '@tabler/icons-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { deleteTransactionAction } from '../../actions/delete-transaction';
import type { Transaction } from '../../data/get-transactions-schema';

interface CellActionProps {
  row: Row<Transaction>;
}

export function CellAction({ row }: CellActionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transaction = row.original;

  const { mutate: deleteTransaction, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const result = await deleteTransactionAction({ id: transaction.id });
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) throw new Error('Datos inválidos');
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transacción eliminada');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-8'>
          <span className='sr-only'>Abrir menú</span>
          <IconPencil className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() =>
            router.push(`/dashboard/transactions/${transaction.id}`)
          }
        >
          <IconPencil className='mr-2 size-4' />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          variant='destructive'
          onClick={() => deleteTransaction()}
          disabled={isDeleting}
        >
          <IconTrash className='mr-2 size-4' />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
