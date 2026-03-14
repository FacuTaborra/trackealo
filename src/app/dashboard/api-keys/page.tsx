import PageContainer from '@/components/layout/page-container';
import { ApiKeysListPage } from '@/features/api-keys/components/api-keys-list-page';

export default function ApiKeysPage() {
  return (
    <PageContainer>
      <ApiKeysListPage />
    </PageContainer>
  );
}
