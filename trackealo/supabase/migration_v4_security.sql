-- Migration V4: Security hardening — Add database-level constraints
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════════
-- 1. Transaction constraints
-- ═══════════════════════════════════════════
ALTER TABLE transactions
  ADD CONSTRAINT chk_transactions_amount CHECK (amount > 0)
,
ADD CONSTRAINT chk_transactions_description_len CHECK
(char_length
(description) BETWEEN 1 AND 500);

-- ═══════════════════════════════════════════
-- 2. Installment constraints
-- ═══════════════════════════════════════════
ALTER TABLE installments
  ADD CONSTRAINT chk_installments_amount CHECK (total_amount > 0)
,
ADD CONSTRAINT chk_installments_total CHECK
(total BETWEEN 1 AND 120),
ADD CONSTRAINT chk_installments_monthly CHECK
(monthly > 0);

-- ═══════════════════════════════════════════
-- 3. Goals constraints
-- ═══════════════════════════════════════════
ALTER TABLE goals
  ADD CONSTRAINT chk_goals_target CHECK (target_amount > 0)
,
ADD CONSTRAINT chk_goals_current CHECK
(current_amount >= 0),
ADD CONSTRAINT chk_goals_name_len CHECK
(char_length
(name) BETWEEN 1 AND 200);

-- ═══════════════════════════════════════════
-- 4. Add DELETE policy for user_settings (was missing)
-- ═══════════════════════════════════════════
DO $$
BEGIN
    IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'user_settings' AND policyname = 'Users can delete own settings'
  ) THEN
    CREATE POLICY "Users can delete own settings"
      ON user_settings FOR
    DELETE USING (auth.uid
    () = user_id);
END
IF;
END $$;
