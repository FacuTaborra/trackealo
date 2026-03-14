-- Migration V3: Add installment tracking columns to transactions
-- Run this in Supabase SQL Editor

ALTER TABLE transactions
  ADD COLUMN
IF NOT EXISTS is_installment BOOLEAN DEFAULT false,
ADD COLUMN
IF NOT EXISTS installment_current INTEGER DEFAULT 0,
ADD COLUMN
IF NOT EXISTS installment_total INTEGER DEFAULT 0,
ADD COLUMN
IF NOT EXISTS installment_id TEXT DEFAULT '';
