import {
  pgTable,
  serial,
  text,
  real,
  timestamp,
  unique,
  integer
} from 'drizzle-orm/pg-core';

export const apiKeysTable = pgTable('api_keys_table', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  name: text('name').notNull(),
  key_prefix: text('key_prefix').notNull(),
  key_hash: text('key_hash').notNull().unique(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  last_used_at: timestamp('last_used_at')
});

export const accountsTable = pgTable('accounts_table', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  balance: real('balance').notNull().default(0),
  currency: text('currency').notNull().default('ARS'),
  color: text('color'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const categoriesTable = pgTable(
  'categories_table',
  {
    id: serial('id').primaryKey(),
    user_id: text('user_id').notNull(),
    name: text('name').notNull(),
    icon: text('icon'),
    color: text('color'),
    created_at: timestamp('created_at').notNull().defaultNow()
  },
  (table) => [unique('category_name_user_idx').on(table.name, table.user_id)]
);

export const transactionsTable = pgTable('transactions_table', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  account_id: integer('account_id')
    .notNull()
    .references(() => accountsTable.id),
  category_id: integer('category_id').references(() => categoriesTable.id),
  amount: real('amount').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull(),
  notes: text('notes'),
  to_account_id: integer('to_account_id').references(() => accountsTable.id),
  to_amount: real('to_amount'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});
