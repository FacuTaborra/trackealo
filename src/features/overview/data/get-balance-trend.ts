'use server';

import { getMonthlyStats } from './get-monthly-stats';
import type { DashboardFilters } from './dashboard-filters';

export async function getBalanceTrend(filters: DashboardFilters) {
  const monthlyData = await getMonthlyStats(filters);
  let cumulative = 0;

  return monthlyData.map((d) => {
    cumulative += d.income - d.expense;
    return {
      month: d.month,
      balance: cumulative
    };
  });
}
