import PageContainer from '@/components/layout/page-container';
import { AccountForm } from '@/features/accounts/components/account-form';

export default async function EditAccountPage({
  params
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const id = parseInt(accountId, 10);

  if (Number.isNaN(id)) {
    return (
      <PageContainer>
        <p className='text-destructive'>ID de cuenta inválido</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-4'>
        <h2 className='text-2xl font-bold tracking-tight'>Editar cuenta</h2>
        <AccountForm accountId={id} />
      </div>
    </PageContainer>
  );
}
