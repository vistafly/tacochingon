-- Enable Row Level Security on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Deny all direct client access to orders" ON public.orders;

-- Create restrictive policy that denies all anonymous access
-- This forces all database access to go through server-side API routes
-- which use the service role key and can implement proper authorization
CREATE POLICY "Deny all direct client access to orders"
ON public.orders
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Note: authenticated users would also need policies if you add Supabase Auth
-- For now, all access must go through your API routes which use the service role key
-- The service role key bypasses RLS, allowing your server-side code to work normally

-- Add helpful comment
COMMENT ON TABLE public.orders IS 'Orders table with RLS enabled. All client access must go through authenticated API routes.';
