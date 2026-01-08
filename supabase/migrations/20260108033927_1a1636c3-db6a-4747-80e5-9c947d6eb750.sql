-- Fix lawn-images bucket security: make private and add user-scoped access

-- Make the bucket private
UPDATE storage.buckets SET public = false WHERE id = 'lawn-images';

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view lawn images" ON storage.objects;

-- Create policy for users to view their own images (based on folder structure)
CREATE POLICY "Users can view their own lawn images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lawn-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy for users to delete their own images
CREATE POLICY "Users can delete their own lawn images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'lawn-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Update the upload policy to require user folder structure
DROP POLICY IF EXISTS "Authenticated users can upload lawn images" ON storage.objects;

CREATE POLICY "Authenticated users can upload to their own folder" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'lawn-images' AND (storage.foldername(name))[1] = auth.uid()::text);