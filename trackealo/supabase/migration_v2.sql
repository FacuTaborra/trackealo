-- ExpenseTracker V2 Migration
-- Run this in Supabase SQL Editor AFTER the initial schema.sql

-- ═══════════════════════════════════════════
-- 1. Add new columns to transactions
-- ═══════════════════════════════════════════
ALTER TABLE transactions
  ADD COLUMN
IF NOT EXISTS payment_method TEXT DEFAULT 'Efectivo',
ADD COLUMN
IF NOT EXISTS notes TEXT DEFAULT '',
ADD COLUMN
IF NOT EXISTS owner_type TEXT DEFAULT 'MÍO',
ADD COLUMN
IF NOT EXISTS receipt_url TEXT DEFAULT '';

-- ═══════════════════════════════════════════
-- 2. Add interest_rate to installments
-- ═══════════════════════════════════════════
ALTER TABLE installments
  ADD COLUMN
IF NOT EXISTS interest_rate NUMERIC DEFAULT 0;

-- ═══════════════════════════════════════════
-- 3. Done! categories with emoji + budgets
--    are stored as JSON in user_settings.categories
--    Format: [{"name": "Comida", "emoji": "🍔", "budget": 50000}]
-- ═══════════════════════════════════════════
