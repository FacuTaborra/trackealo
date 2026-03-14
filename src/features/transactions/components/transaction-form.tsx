'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import {
  addTransactionSchema,
  type AddTransactionInput
} from '../actions/add-transaction-schema';
import {
  updateTransactionSchema,
  type UpdateTransactionInput
} from '../actions/update-transaction-schema';
import { addTransactionAction } from '../actions/add-transaction';
import { updateTransactionAction } from '../actions/update-transaction';
import { getTransactionById } from '../data/get-transaction-by-id';
import { getAccounts } from '@/features/accounts/data/get-accounts';
import { getCategories } from '@/features/categories/data/get-categories';

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'income', label: 'Ingreso' },
  { value: 'expense', label: 'Gasto' },
  { value: 'transfer', label: 'Transferencia' }
];

interface TransactionFormProps {
  transactionId?: number;
}

export function TransactionForm({ transactionId }: TransactionFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(transactionId);

  const { data: transaction, isLoading: isLoadingTransaction } = useQuery({
    queryKey: ['transactions', transactionId],
    queryFn: () => getTransactionById({ id: transactionId! }),
    enabled: isEdit
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const accountOptions = accounts.map((a) => ({
    value: String(a.id),
    label: `${a.name} (${a.currency})`
  }));

  const categoryOptions = [
    { value: '__none__', label: 'Sin categoría' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name }))
  ];

  const baseSchema = isEdit ? updateTransactionSchema : addTransactionSchema;
  const formSchema = baseSchema.extend({
    account_id: z.coerce.number(),
    category_id: z
      .union([z.literal('__none__'), z.coerce.number()])
      .optional()
      .transform((v) => (v === '__none__' || v === undefined ? null : v))
  });
  const form = useForm({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      account_id: 0,
      category_id: '__none__' as any,
      amount: 0,
      type: 'expense',
      description: '',
      date: new Date(),
      notes: '',
      to_account_id: null
    },
    values: transaction
      ? {
          id: transaction.id,
          account_id: transaction.account_id,
          category_id:
            transaction.category_id != null
              ? String(transaction.category_id)
              : '__none__',
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          date: new Date(transaction.date),
          notes: transaction.notes ?? '',
          to_account_id: transaction.to_account_id
        }
      : undefined
  });

  const { mutate: addTransaction, isPending: isAdding } = useMutation({
    mutationFn: async (input: AddTransactionInput) => {
      const result = await addTransactionAction(input);
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) throw new Error('Datos inválidos');
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transacción creada correctamente');
      router.push('/dashboard/transactions');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al crear');
    }
  });

  const { mutate: updateTransaction, isPending: isUpdating } = useMutation({
    mutationFn: async (input: UpdateTransactionInput) => {
      const result = await updateTransactionAction(input);
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) throw new Error('Datos inválidos');
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transacción actualizada correctamente');
      router.push('/dashboard/transactions');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    }
  });

  const onSubmit = (data: Record<string, unknown>) => {
    const categoryId =
      data.category_id === '__none__' || data.category_id == null
        ? null
        : Number(data.category_id);
    const normalized = {
      ...data,
      account_id: Number(data.account_id),
      category_id: categoryId,
      to_account_id: data.to_account_id ? Number(data.to_account_id) : null
    };
    if (isEdit && 'id' in data) {
      updateTransaction(normalized as UpdateTransactionInput);
    } else {
      addTransaction(normalized as AddTransactionInput);
    }
  };

  const isPending = isAdding || isUpdating;

  if (isEdit && isLoadingTransaction) {
    return (
      <div className='flex flex-1 items-center justify-center p-8'>
        <p className='text-muted-foreground'>Cargando transacción...</p>
      </div>
    );
  }

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='mx-auto max-w-md space-y-6'
    >
      <FormSelect
        control={form.control}
        name='account_id'
        label='Cuenta'
        options={accountOptions}
        required
      />
      <FormSelect
        control={form.control}
        name='type'
        label='Tipo'
        options={TRANSACTION_TYPE_OPTIONS}
        required
      />
      <FormInput
        control={form.control}
        name='amount'
        label='Monto'
        type='number'
        step='0.01'
        required
      />
      <FormInput
        control={form.control}
        name='description'
        label='Descripción'
        required
      />
      <FormDatePicker
        control={form.control}
        name='date'
        label='Fecha'
        required
      />
      <FormSelect
        control={form.control}
        name='category_id'
        label='Categoría (opcional)'
        options={categoryOptions}
      />
      <FormTextarea control={form.control} name='notes' label='Notas (opcional)' />
      <div className='flex gap-2'>
        <Button type='submit' disabled={isPending}>
          {isEdit ? 'Guardar cambios' : 'Crear transacción'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/dashboard/transactions')}
        >
          Cancelar
        </Button>
      </div>
    </Form>
  );
}
