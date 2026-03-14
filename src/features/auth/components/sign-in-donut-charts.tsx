'use client';

import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';

const CATEGORY_DATA = [
  { name: 'Comida', value: 35, color: '#10b981' },
  { name: 'Transporte', value: 25, color: '#34d399' },
  { name: 'Servicios', value: 20, color: '#6ee7b7' },
  { name: 'Ocio', value: 15, color: '#a7f3d0' },
  { name: 'Otros', value: 5, color: '#d1fae5' }
];

const ACCOUNT_DATA = [
  { name: 'Santander', value: 45, color: '#10b981' },
  { name: 'Galicia', value: 30, color: '#34d399' },
  { name: 'Nación', value: 15, color: '#6ee7b7' },
  { name: 'Efectivo', value: 10, color: '#a7f3d0' }
];

export function SignInDonutCharts() {
  return (
    <div className='mt-10 grid grid-cols-2 gap-4'>
      <div className='rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
        <p className='text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-wider'>
          Gastos por categoría
        </p>
        <div className='h-28 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                cx='50%'
                cy='50%'
                innerRadius={28}
                outerRadius={44}
                paddingAngle={2}
                dataKey='value'
                animationBegin={200}
                animationDuration={1200}
              >
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={`cat-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className='rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
        <p className='text-muted-foreground mb-3 text-center text-xs font-medium uppercase tracking-wider'>
          Gastos por cuenta
        </p>
        <div className='h-28 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={ACCOUNT_DATA}
                cx='50%'
                cy='50%'
                innerRadius={28}
                outerRadius={44}
                paddingAngle={2}
                dataKey='value'
                animationBegin={400}
                animationDuration={1200}
              >
                {ACCOUNT_DATA.map((entry, index) => (
                  <Cell key={`acc-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
