import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function BalanceTrendLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-5 w-44' />
        <Skeleton className='h-4 w-40' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-[300px] w-full' />
      </CardContent>
    </Card>
  );
}
