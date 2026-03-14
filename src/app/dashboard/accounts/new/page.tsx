import PageContainer from '@/components/layout/page-container';
import { AccountForm } from '@/features/accounts/components/account-form';

export default function NewAccountPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-4'>
        <h2 className='text-2xl font-bold tracking-tight'>Nueva cuenta</h2>
        <AccountForm />
      </div>
    </PageContainer>
  );
}
