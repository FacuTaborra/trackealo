import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryBreakdownLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-4 w-36' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-[300px] w-full rounded-full' />
      </CardContent>
    </Card>
  );
}
