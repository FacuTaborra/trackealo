import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import Link from 'next/link';

import { SignInDonutCharts } from './sign-in-donut-charts';

export default function SignInViewPage(_props: { stars?: number } = {}) {
  return (
    <>
      <style>{`
        @keyframes signin-gradient-pulse-1 {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes signin-gradient-pulse-2 {
          0%, 100% { opacity: 0.3; transform: scale(1.02); }
          50% { opacity: 0.5; transform: scale(1); }
        }
        @keyframes signin-gradient-pulse-3 {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.03); }
        }
        .signin-gradient-1 {
          animation: signin-gradient-pulse-1 8s ease-in-out infinite;
        }
        .signin-gradient-2 {
          animation: signin-gradient-pulse-2 10s ease-in-out infinite 1.5s;
        }
        .signin-gradient-3 {
          animation: signin-gradient-pulse-3 9s ease-in-out infinite 3s;
        }
      `}</style>
      <div className='relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
        {/* Left panel - Dark premium fintech */}
        <div className='relative hidden h-full flex-col overflow-hidden border-r-2 border-emerald-400/40 lg:flex'>
          <div className='absolute inset-0 bg-[#0a0a0f]' />
          <div
            className='signin-gradient-1 pointer-events-none absolute -left-1/2 -top-1/2 h-full w-full rounded-full'
            style={{
              background:
                'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, transparent 55%)'
            }}
          />
          <div
            className='signin-gradient-2 pointer-events-none absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full'
            style={{
              background:
                'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 50%)'
            }}
          />
          <div
            className='signin-gradient-3 pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full'
            style={{
              background:
                'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 65%)'
            }}
          />
          <div className='relative z-20 flex flex-col p-10 lg:p-14'>
            <div className='flex items-center gap-2 text-xl font-semibold tracking-tight text-white'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-7 w-7 text-emerald-400'
              >
                <rect x='2' y='4' width='20' height='16' rx='2' />
                <path d='M12 8v8' />
                <path d='M8 12h8' />
              </svg>
              <span>
                Track<span className='text-emerald-400'>ealo</span>
              </span>
            </div>
            <div className='mt-16 flex flex-1 flex-col justify-center'>
              <div className='mx-auto max-w-xl'>
                <h1 className='text-3xl font-bold leading-tight tracking-tight text-white lg:text-4xl'>
                Controlá tus{' '}
                <span className='text-emerald-400'>finanzas</span> con precisión.
              </h1>
              <ul className='mt-10 space-y-4'>
                {[
                  {
                    icon: (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        className='h-5 w-5 shrink-0 text-emerald-400'
                      >
                        <rect x='2' y='4' width='20' height='16' rx='2' />
                        <path d='M12 8v8M8 12h8' />
                      </svg>
                    ),
                    label: 'Cuentas'
                  },
                  {
                    icon: (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        className='h-5 w-5 shrink-0 text-emerald-400'
                      >
                        <path d='M12 3v18' />
                        <path d='m8 7 4-4 4 4' />
                        <path d='m8 17 4 4 4-4' />
                      </svg>
                    ),
                    label: 'Transacciones'
                  },
                  {
                    icon: (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        className='h-5 w-5 shrink-0 text-emerald-400'
                      >
                        <path d='M12 2 2 7l10 5 10-5-10-5z' />
                        <path d='M2 17l10 5 10-5' />
                      </svg>
                    ),
                    label: 'Categorías'
                  }
                ].map((item) => (
                  <li
                    key={item.label}
                    className='flex items-center gap-3 text-zinc-300'
                  >
                    {item.icon}
                    <span className='font-medium'>{item.label}</span>
                  </li>
                ))}
              </ul>
              <div className='mt-12 rounded-xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm'>
                <div className='flex items-baseline justify-between'>
                  <span className='text-sm text-zinc-400'>Saldo total</span>
                  <span className='text-xl font-semibold tabular-nums text-emerald-400'>
                    $ 236.000
                  </span>
                </div>
                <div className='mt-2 flex items-baseline justify-between'>
                  <span className='text-sm text-zinc-400'>Ahorro del mes</span>
                  <span className='text-sm font-medium tabular-nums text-zinc-300'>
                    +12%
                  </span>
                </div>
              </div>
              <SignInDonutCharts />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Clerk form (light) */}
        <div className='flex h-full items-center justify-center bg-white p-4 lg:p-8'>
          <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
            <ClerkSignInForm
              appearance={{
                variables: {
                  colorBackground: '#0a0a0f',
                  colorInputBackground: '#18181b',
                  colorInputText: '#fafafa',
                  colorPrimary: '#10b981',
                  colorText: '#fafafa',
                  colorTextSecondary: '#a1a1aa',
                  borderRadius: '0.5rem'
                },
                elements: {
                  card: 'border border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                }
              }}
            />
            <p className='text-zinc-500 px-8 text-center text-sm'>
              Al continuar, aceptás nuestros{' '}
              <Link
                href='/terms'
                className='text-emerald-600 underline underline-offset-4 hover:text-emerald-700'
              >
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link
                href='/privacy'
                className='text-emerald-600 underline underline-offset-4 hover:text-emerald-700'
              >
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
