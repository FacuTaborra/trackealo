import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecentTransactionsLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-4 w-32' />
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
