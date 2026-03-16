import PageContainer from '@/components/layout/page-container';
import { AccountForm } from '@/features/accounts/components/account-form';

export default function NewAccountPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Nueva cuenta</h2>
          <p className='text-muted-foreground mt-1 text-sm'>
            Agregá una cuenta bancaria, tarjeta o efectivo para empezar a registrar transacciones.
          </p>
        </div>
        <AccountForm />
      </div>
    </PageContainer>
  );
}
