'use client';

import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const WalletIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={cn('size-5 shrink-0', className)}
  >
    <rect x='2' y='4' width='20' height='16' rx='2' />
    <path d='M12 8v8' />
    <path d='M8 12h8' />
  </svg>
);

export function SidebarBrand() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link
          href='/dashboard/overview'
          className={cn(
            'flex flex-1 items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground',
            isCollapsed && 'size-8 justify-center p-2'
          )}
          title='Trackealo'
        >
      {isCollapsed ? (
        <div className='bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg font-bold text-sm'>
          T
        </div>
      ) : (
        <>
          <div className='bg-primary text-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg'>
            <WalletIcon className='size-4' />
          </div>
          <div className='flex min-w-0 flex-col gap-0.5 leading-none'>
            <span className='font-semibold truncate'>
              Track<span className='text-primary'>ealo</span>
            </span>
          </div>
        </>
      )}
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
