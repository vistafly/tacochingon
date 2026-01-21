# Row Level Security (RLS) Fix for Orders Table

## Security Issue

**Severity:** CRITICAL

The `public.orders` table in Supabase had Row Level Security (RLS) disabled, which created a serious security vulnerability:

### What was vulnerable:
1. **Direct client access**: Anyone with the anon key could query ALL orders from the database
2. **No authentication**: The GET `/api/orders/[id]` endpoint had no authentication checks
3. **Client-side subscriptions**: Real-time subscriptions allowed anyone to monitor order updates
4. **Data exposure**: Customer PII (names, emails, phone numbers) and payment data were accessible

### Impact:
- Attackers could enumerate all orders by guessing payment intent IDs or order numbers
- Customer personal information was exposed
- Business data (order volumes, revenue) was accessible
- Compliance risk (GDPR, PCI-DSS, etc.)

## Solution Overview

The fix implements a defense-in-depth security model:

1. **Database level**: Enable RLS on the orders table
2. **API level**: Add authentication to all order endpoints
3. **Client level**: Route all database access through authenticated API endpoints

## How to Apply This Fix

### Step 1: Apply the SQL Migration

Run the migration in your Supabase dashboard:

1. Go to your Supabase project
2. Navigate to the SQL Editor
3. Open and run the migration file: `supabase/migrations/20260121_enable_rls_orders.sql`

Alternatively, copy and paste the SQL:

```sql
-- Enable Row Level Security on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Deny all direct client access to orders" ON public.orders;

-- Create restrictive policy that denies all anonymous access
CREATE POLICY "Deny all direct client access to orders"
ON public.orders
FOR ALL
TO anon
USING (false)
WITH CHECK (false);
```

### Step 2: Verify the Changes

After applying the migration:

1. **Test database access is blocked:**
   - Try to query orders from the browser console using the Supabase client
   - You should get an RLS policy violation error

2. **Test API access works:**
   - Visit an order page: `/order/[payment-intent-id]`
   - The order should load successfully (using the authenticated API)

3. **Test admin access works:**
   - Log in to the admin panel
   - Verify you can view and update orders

### Step 3: Monitor for Issues

After deployment, monitor for:
- 401 Unauthorized errors (may indicate missing email verification)
- Failed order lookups (check localStorage for stored emails)
- Admin access issues

## Technical Details

### Database Security

**RLS Policy:**
- Denies ALL operations (SELECT, INSERT, UPDATE, DELETE) to the `anon` role
- Server-side code uses the `service_role` key which bypasses RLS
- All client access MUST go through authenticated API routes

### API Authentication

**Customer Access** (`/api/orders/[id]`):
- Requires customer email as a query parameter
- Validates that the email matches the order's customer email
- Email is stored in localStorage during checkout

**Admin Access** (all endpoints):
- Requires valid admin PIN in cookies
- ENV variable: `ADMIN_PIN`

### Code Changes

1. **[CheckoutForm.tsx:94-105](src/components/checkout/CheckoutForm.tsx#L94-L105)**
   - Stores customer email in localStorage before redirecting to order page
   - Key format: `order_{paymentIntentId}_email`

2. **[useOrderSubscription.ts](src/hooks/useOrderSubscription.ts)**
   - Changed from direct Supabase queries to API calls
   - Passes customer email from localStorage for authentication
   - Replaced real-time subscriptions with polling (every 3 seconds)
   - Polling only active for non-terminal orders (not completed/cancelled)

3. **[/api/orders/[id]/route.ts:9-53](src/app/api/orders/[id]/route.ts#L9-L53)**
   - GET endpoint now requires either admin auth OR customer email
   - Email is validated against the order's customer_email field
   - Returns 401 if authentication fails

## Security Best Practices

### Current Implementation

✅ **Good:**
- RLS enabled at database level
- API authentication required
- Customer email verification
- Admin PIN authentication
- Service role key only used server-side

⚠️ **Limitations:**
- LocalStorage can be cleared (customer loses access)
- Email in localStorage is not encrypted
- Polling vs real-time updates (slight delay)

### Recommended Improvements (Optional)

For enhanced security, consider:

1. **Email verification links**: Instead of localStorage, send email confirmation links with time-limited tokens
2. **Session-based auth**: Implement proper session management for customers
3. **Rate limiting**: Add rate limiting to prevent brute-force attempts
4. **Audit logging**: Log all order access attempts
5. **Encryption**: Encrypt sensitive data at rest in the database

## Rollback Procedure

If you need to rollback this change:

```sql
-- Disable RLS (NOT RECOMMENDED)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Remove the policy
DROP POLICY IF EXISTS "Deny all direct client access to orders" ON public.orders;
```

Then revert the code changes:
```bash
git revert HEAD
```

**WARNING:** Rolling back will re-expose the security vulnerability. Only do this if absolutely necessary and you have an alternative security measure in place.

## Testing Checklist

Before deploying to production:

- [ ] SQL migration applied successfully
- [ ] RLS is enabled (verify in Supabase dashboard)
- [ ] Customer can place order and view order status
- [ ] Customer email is stored in localStorage
- [ ] Order page loads with correct data
- [ ] Order status updates via polling (place test order)
- [ ] Admin can view all orders
- [ ] Admin can update order status
- [ ] Unauthorized access returns 401
- [ ] Direct Supabase client queries are blocked

## Support

If you encounter issues after applying this fix:

1. Check browser console for errors
2. Verify the SQL migration was applied successfully
3. Ensure environment variables are set correctly:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PIN`
4. Clear localStorage and test a fresh order flow

## References

- [Supabase Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgREST RLS](https://postgrest.org/en/stable/auth.html)
- [OWASP Top 10 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
