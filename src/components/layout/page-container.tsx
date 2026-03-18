import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className='h-[calc(100dvh-52px)]'>
          <div className='flex flex-1 p-4 md:px-6'>
            <div className='mx-auto w-full max-w-7xl'>{children}</div>
          </div>
        </ScrollArea>
      ) : (
        <div className='flex flex-1 flex-col p-4 md:px-6'>
          <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col'>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
