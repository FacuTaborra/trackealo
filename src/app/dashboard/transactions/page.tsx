import PageContainer from '@/components/layout/page-container';
import { TransactionsListPage } from '@/features/transactions/components/transactions-list-page';

export default function TransactionsPage() {
  return (
    <PageContainer scrollable={false}>
      <TransactionsListPage />
    </PageContainer>
  );
}
