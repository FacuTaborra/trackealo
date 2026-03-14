import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExpensesChartLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-5 w-48' />
        <Skeleton className='h-4 w-32' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-[300px] w-full' />
      </CardContent>
    </Card>
  );
}
