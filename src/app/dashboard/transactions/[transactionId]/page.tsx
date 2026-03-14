import PageContainer from '@/components/layout/page-container';
import { TransactionForm } from '@/features/transactions/components/transaction-form';

export default async function EditTransactionPage({
  params
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  const id = parseInt(transactionId, 10);

  if (Number.isNaN(id)) {
    return (
      <PageContainer>
        <p className='text-destructive'>ID de transacción inválido</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-4'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Editar transacción
        </h2>
        <TransactionForm transactionId={id} />
      </div>
    </PageContainer>
  );
}
