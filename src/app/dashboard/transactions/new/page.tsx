import PageContainer from '@/components/layout/page-container';
import { TransactionForm } from '@/features/transactions/components/transaction-form';

export default function NewTransactionPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-4'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Nueva transacción
        </h2>
        <TransactionForm />
      </div>
    </PageContainer>
  );
}
