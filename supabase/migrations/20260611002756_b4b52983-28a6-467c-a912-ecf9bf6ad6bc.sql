
-- RLS policies for expert-photos storage bucket
-- Public read access for photo URLs to work in <img> tags
CREATE POLICY "Public can view expert photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'expert-photos');

-- Authenticated users can upload to their own folder (first path segment = auth.uid())
CREATE POLICY "Users can upload their own expert photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'expert-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own expert photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'expert-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own expert photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'expert-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
