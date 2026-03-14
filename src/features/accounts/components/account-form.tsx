'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { Button } from '@/components/ui/button';
import { addAccountSchema, type AddAccountInput } from '../actions/add-account-schema';
import { updateAccountSchema, type UpdateAccountInput } from '../actions/update-account-schema';
import { addAccountAction } from '../actions/add-account';
import { updateAccountAction } from '../actions/update-account';
import { getAccountById } from '../data/get-account-by-id';

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'Cuenta corriente' },
  { value: 'savings', label: 'Ahorro' },
  { value: 'credit', label: 'Tarjeta de crédito' },
  { value: 'cash', label: 'Efectivo' }
];

const CURRENCY_OPTIONS = [
  { value: 'ARS', label: 'ARS - Peso argentino' },
  { value: 'USD', label: 'USD - Dólar' },
  { value: 'EUR', label: 'EUR - Euro' }
];

interface AccountFormProps {
  accountId?: number;
}

export function AccountForm({ accountId }: AccountFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(accountId);

  const { data: account, isLoading: isLoadingAccount } = useQuery({
    queryKey: ['accounts', accountId],
    queryFn: () => getAccountById({ id: accountId! }),
    enabled: isEdit
  });

  const formSchema = isEdit ? updateAccountSchema : addAccountSchema;
  const form = useForm<AddAccountInput | UpdateAccountInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'checking',
      balance: 0,
      currency: 'ARS',
      color: ''
    },
    values: account
      ? {
          id: account.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
          color: account.color ?? ''
        }
      : undefined
  });

  const { mutate: addAccount, isPending: isAdding } = useMutation({
    mutationFn: async (input: AddAccountInput) => {
      const result = await addAccountAction(input);
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) throw new Error('Datos inválidos');
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Cuenta creada correctamente');
      router.push('/dashboard/accounts');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al crear');
    }
  });

  const { mutate: updateAccount, isPending: isUpdating } = useMutation({
    mutationFn: async (input: UpdateAccountInput) => {
      const result = await updateAccountAction(input);
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) throw new Error('Datos inválidos');
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Cuenta actualizada correctamente');
      router.push('/dashboard/accounts');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    }
  });

  const onSubmit = (data: AddAccountInput | UpdateAccountInput) => {
    if (isEdit && 'id' in data) {
      updateAccount(data as UpdateAccountInput);
    } else {
      addAccount(data as AddAccountInput);
    }
  };

  const isPending = isAdding || isUpdating;

  if (isEdit && isLoadingAccount) {
    return (
      <div className='flex flex-1 items-center justify-center p-8'>
        <p className='text-muted-foreground'>Cargando cuenta...</p>
      </div>
    );
  }

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='mx-auto max-w-md space-y-6'
    >
      <FormInput control={form.control} name='name' label='Nombre' required />
      <FormSelect
        control={form.control}
        name='type'
        label='Tipo de cuenta'
        options={ACCOUNT_TYPE_OPTIONS}
        required
      />
      <FormInput
        control={form.control}
        name='balance'
        label='Saldo inicial'
        type='number'
        step='0.01'
      />
      <FormSelect
        control={form.control}
        name='currency'
        label='Moneda'
        options={CURRENCY_OPTIONS}
        required
      />
      <div className='flex gap-2'>
        <Button type='submit' disabled={isPending}>
          {isEdit ? 'Guardar cambios' : 'Crear cuenta'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/dashboard/accounts')}
        >
          Cancelar
        </Button>
      </div>
    </Form>
  );
}
