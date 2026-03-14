'use server';

import { z } from 'zod';

import { getAuthContext } from '@/lib/context';

import { accountSchema } from './get-accounts-schema';
import { findAccountsByUserId } from './accounts-repo';

export async function getAccounts() {
  const { session } = await getAuthContext();
  const rows = await findAccountsByUserId(session.user.id);
  return z.array(accountSchema).parse(rows);
}
