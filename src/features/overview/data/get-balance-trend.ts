'use server';

import { getMonthlyStats } from './get-monthly-stats';

export async function getBalanceTrend(months = 6) {
  const monthlyData = await getMonthlyStats(months);
  let cumulative = 0;

  return monthlyData.map((d) => {
    cumulative += d.income - d.expense;
    return {
      month: d.month,
      balance: cumulative
    };
  });
}
