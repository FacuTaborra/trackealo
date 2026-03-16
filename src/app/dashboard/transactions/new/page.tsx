import PageContainer from '@/components/layout/page-container';
import { TransactionForm } from '@/features/transactions/components/transaction-form';

export default function NewTransactionPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Nueva transacción
          </h2>
          <p className='text-muted-foreground mt-1 text-sm'>
            Registrá un ingreso, gasto o transferencia en tus cuentas.
          </p>
        </div>
        <TransactionForm />
      </div>
    </PageContainer>
  );
}
