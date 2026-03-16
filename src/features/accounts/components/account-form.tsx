'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Building2,
  PiggyBank,
  CreditCard,
  Banknote
} from 'lucide-react';

import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
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
  addAccountSchema,
  type AddAccountInput
} from '../actions/add-account-schema';
import {
  updateAccountSchema,
  type UpdateAccountInput
} from '../actions/update-account-schema';
import { addAccountAction } from '../actions/add-account';
import { updateAccountAction } from '../actions/update-account';
import { getAccountById } from '../data/get-account-by-id';

const ACCOUNT_TYPES = [
  {
    value: 'checking',
    label: 'Cta. corriente',
    icon: Building2,
    activeBg: 'bg-blue-500/10 border-blue-500 text-blue-500'
  },
  {
    value: 'savings',
    label: 'Ahorro',
    icon: PiggyBank,
    activeBg: 'bg-green-500/10 border-green-500 text-green-500'
  },
  {
    value: 'credit',
    label: 'Crédito',
    icon: CreditCard,
    activeBg: 'bg-orange-500/10 border-orange-500 text-orange-500'
  },
  {
    value: 'cash',
    label: 'Efectivo',
    icon: Banknote,
    activeBg: 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
  }
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

  const selectedType = form.watch('type');

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
      className='w-full max-w-lg'
    >
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar cuenta' : 'Datos de la cuenta'}</CardTitle>
          <CardDescription>
            {isEdit
              ? 'Modificá los datos de tu cuenta.'
              : 'Completá la información para registrar una nueva cuenta.'}
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Nombre */}
          <FormInput
            control={form.control}
            name='name'
            label='Nombre'
            placeholder='Ej: Santander, Mercado Pago...'
            required
          />

          {/* Selector visual de tipo */}
          <div className='space-y-2'>
            <p className='text-sm font-medium'>
              Tipo de cuenta <span className='text-destructive'>*</span>
            </p>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
              {ACCOUNT_TYPES.map((t) => {
                const Icon = t.icon;
                const isActive = selectedType === t.value;
                return (
                  <button
                    key={t.value}
                    type='button'
                    onClick={() => form.setValue('type', t.value as 'checking' | 'savings' | 'credit' | 'cash')}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-all ${
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

          {/* Saldo y moneda */}
          <div className='grid grid-cols-2 gap-4'>
            <FormInput
              control={form.control}
              name='balance'
              label='Saldo inicial'
              type='number'
              step='0.01'
              placeholder='0'
            />
            <FormSelect
              control={form.control}
              name='currency'
              label='Moneda'
              options={CURRENCY_OPTIONS}
              required
            />
          </div>
        </CardContent>

        <CardFooter className='flex gap-2 border-t pt-6'>
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
        </CardFooter>
      </Card>
    </Form>
  );
}
