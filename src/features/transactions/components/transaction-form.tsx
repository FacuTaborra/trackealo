'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { z } from 'zod';

import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

const TRANSACTION_TYPES = [
  {
    value: 'income',
    label: 'Ingreso',
    icon: ArrowUpRight,
    color: 'text-green-500',
    activeBg: 'bg-green-500/10 border-green-500 text-green-500'
  },
  {
    value: 'expense',
    label: 'Gasto',
    icon: ArrowDownLeft,
    color: 'text-red-500',
    activeBg: 'bg-red-500/10 border-red-500 text-red-500'
  },
  {
    value: 'transfer',
    label: 'Transferencia',
    icon: ArrowLeftRight,
    color: 'text-blue-500',
    activeBg: 'bg-blue-500/10 border-blue-500 text-blue-500'
  }
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
    to_account_id: z
      .union([z.literal('__none__'), z.coerce.number()])
      .optional()
      .transform((v) => (v === '__none__' || v === undefined ? null : v)),
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
      to_account_id: '__none__' as any,
      to_amount: undefined as number | undefined
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
          to_account_id:
            transaction.to_account_id != null
              ? String(transaction.to_account_id)
              : '__none__',
          to_amount: transaction.to_amount ?? undefined
        }
      : undefined
  });

  const selectedType = form.watch('type');
  const watchedAccountId = form.watch('account_id');
  const watchedToAccountId = form.watch('to_account_id');

  const fromAccount = accounts.find(
    (a) => a.id === Number(watchedAccountId)
  );
  const toAccount = accounts.find(
    (a) => a.id === Number(watchedToAccountId)
  );
  const isTransfer = selectedType === 'transfer';
  const isCrossCurrency =
    isTransfer &&
    fromAccount &&
    toAccount &&
    fromAccount.currency !== toAccount.currency;

  const accountOptionsFiltered = accountOptions.filter(
    (o) => o.value && o.value !== '__none__'
  );
  const originOptions = isTransfer
    ? accountOptionsFiltered.filter((o) => o.value !== String(watchedToAccountId))
    : accountOptionsFiltered;
  const destinationOptions = isTransfer
    ? accountOptionsFiltered.filter((o) => o.value !== String(watchedAccountId))
    : accountOptionsFiltered;

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
    if (data.type === 'transfer') {
      const toId = data.to_account_id;
      if (
        toId === '__none__' ||
        toId == null ||
        toId === '' ||
        Number(toId) === 0
      ) {
        toast.error('Seleccioná la cuenta destino');
        return;
      }
      if (isCrossCurrency && (data.to_amount == null || Number(data.to_amount) <= 0)) {
        toast.error('Ingresá el monto que entra en la cuenta destino');
        return;
      }
    }

    const categoryId =
      data.category_id === '__none__' || data.category_id == null
        ? null
        : Number(data.category_id);
    const toAccountId =
      data.to_account_id === '__none__' ||
      data.to_account_id == null ||
      data.to_account_id === ''
        ? null
        : Number(data.to_account_id);
    const toAmount =
      isCrossCurrency &&
      data.to_amount != null &&
      Number(data.to_amount) > 0
        ? Number(data.to_amount)
        : null;

    const normalized = {
      ...data,
      account_id: Number(data.account_id),
      category_id: categoryId,
      to_account_id: toAccountId,
      to_amount: toAmount
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
      className='w-full max-w-lg'
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? 'Editar transacción' : 'Datos de la transacción'}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? 'Modificá los datos de la transacción.'
              : 'Registrá un ingreso, gasto o transferencia.'}
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Selector visual de tipo */}
          <div className='space-y-2'>
            <p className='text-sm font-medium'>
              Tipo <span className='text-destructive'>*</span>
            </p>
            <div className='grid grid-cols-3 gap-2'>
              {TRANSACTION_TYPES.map((t) => {
                const Icon = t.icon;
                const isActive = selectedType === t.value;
                return (
                  <button
                    key={t.value}
                    type='button'
                    onClick={() => {
                      form.setValue('type', t.value);
                      if (t.value !== 'transfer') {
                        form.setValue('to_account_id', undefined);
                        form.setValue('to_amount', undefined);
                      }
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? t.activeBg
                        : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className='size-5' />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Cuenta(s) y monto(s) */}
          <div className='space-y-4'>
            {isTransfer ? (
              <>
                {accounts.length < 2 && (
                  <p className='text-muted-foreground text-sm'>
                    Necesitás al menos 2 cuentas para hacer una transferencia.
                  </p>
                )}
                <FormSelect
                  control={form.control}
                  name='account_id'
                  label='Cuenta origen'
                  options={originOptions}
                  required
                />
                <FormSelect
                  control={form.control}
                  name='to_account_id'
                  label='Cuenta destino'
                  options={[
                    { value: '__none__', label: 'Seleccionar cuenta destino' },
                    ...destinationOptions
                  ]}
                  required
                />
                {isCrossCurrency ? (
                  <div className='grid grid-cols-2 gap-4'>
                    <FormInput
                      control={form.control}
                      name='amount'
                      label={`Monto que sale (${fromAccount?.currency ?? ''})`}
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                      required
                    />
                    <FormInput
                      control={form.control}
                      name='to_amount'
                      label={`Monto que entra (${toAccount?.currency ?? ''})`}
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                      required
                    />
                  </div>
                ) : (
                  <FormInput
                    control={form.control}
                    name='amount'
                    label='Monto'
                    type='number'
                    step='0.01'
                    placeholder='0.00'
                    required
                  />
                )}
              </>
            ) : (
              <>
                <FormSelect
                  control={form.control}
                  name='account_id'
                  label='Cuenta'
                  options={accountOptions}
                  required
                />
                <FormInput
                  control={form.control}
                  name='amount'
                  label='Monto'
                  type='number'
                  step='0.01'
                  placeholder='0.00'
                  required
                />
              </>
            )}
          </div>

          <Separator />

          {/* Descripción, fecha y categoría */}
          <div className='space-y-4'>
            <FormInput
              control={form.control}
              name='description'
              label='Descripción'
              placeholder='Ej: Supermercado, Netflix...'
              required
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormDatePicker
                control={form.control}
                name='date'
                label='Fecha'
                required
              />
              <FormSelect
                control={form.control}
                name='category_id'
                label='Categoría'
                options={categoryOptions}
              />
            </div>
            <FormTextarea
              control={form.control}
              name='notes'
              label='Notas (opcional)'
              placeholder='Información adicional...'
            />
          </div>
        </CardContent>

        <CardFooter className='flex gap-2 border-t pt-6'>
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
        </CardFooter>
      </Card>
    </Form>
  );
}
