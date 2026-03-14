import PageContainer from '@/components/layout/page-container';
import { AccountsListPage } from '@/features/accounts/components/accounts-list-page';

export default function AccountsPage() {
  return (
    <PageContainer scrollable={false}>
      <AccountsListPage />
    </PageContainer>
  );
}
