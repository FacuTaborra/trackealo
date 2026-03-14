-- Migration v5: Storage policies for receipts bucket
-- STEP 1: Create the bucket manually in Supabase Dashboard:
--   Storage → New Bucket → Name: "receipts" → Private (NOT public)
--   Then come back here and run ONLY the policies below.

-- STEP 2: Run these policies after creating the bucket

-- Upload policy: users can upload to their own folder
CREATE POLICY "Users can upload own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read policy: users can view their own files
CREATE POLICY "Users can read own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete policy: users can delete their own files
CREATE POLICY "Users can delete own receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
