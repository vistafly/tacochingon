# Admin Location Management + Firebase Migration Plan

## Status: COMPLETED

**Date created:** 2026-02-08
**Last updated:** 2026-02-09
**Completed:** 2026-02-09 - Full migration (Option A) executed

---

## What the user wants

1. **Admin portal location management** - Allow the administrator to change the taco truck's location from the admin panel, and have the public website reflect those changes in real-time.
2. **Migrate from Supabase to Firebase** - Transfer ALL backend services (orders, real-time subscriptions, settings, auth) from Supabase to Firebase.
3. **Status toggle** - Admin can toggle the truck as open/closed and set a custom status message (e.g., "Moving to new spot, back in 30 min").

## User decisions (confirmed)

| Decision | Choice |
|----------|--------|
| Storage backend | Firebase (migrate everything from Supabase) |
| Location fields | Full address only (street, city, state, zip) - Google Maps will geocode |
| Admin UI placement | New `/admin/settings` page with navigation between Orders and Settings |
| Status toggle | Yes - open/closed toggle + optional status message on public site |
| Migration approach | **NOT YET DECIDED** - User paused before choosing between full migration, settings-only, or incremental |

## Outstanding question (ask on resume)

> "Migrating all of Supabase to Firebase is a large task. How would you like to approach this?"
> - **Option A: Full migration now** - Migrate everything (orders, auth, real-time) from Supabase to Firebase in one task.
> - **Option B: Firebase for settings only** - Use Firebase just for new settings/location feature. Keep Supabase for orders. Migrate orders later.
> - **Option C: Incremental migration** - Start with Firebase for settings/location now, set up Firebase infrastructure so orders can be migrated in a follow-up task.
>
> Also: Does the user already have a Firebase project, or do they need to create one?

---

## Current Architecture (as of pause)

### Tech Stack
- **Framework:** Next.js 16.1.1 (App Router), React 19, TypeScript
- **Database:** Supabase (PostgreSQL) with real-time subscriptions
- **State management:** Zustand v5 with persistence
- **Payments:** Stripe
- **i18n:** next-intl (EN/ES bilingual)
- **Animations:** GSAP + WebGL smoke effect
- **Styling:** Tailwind CSS 4

### Current Supabase usage (what needs migrating)
1. **Orders table** - Full CRUD with real-time subscriptions (`src/lib/supabase/types.ts`)
2. **Admin auth** - PIN-based, HTTP-only cookies (custom, not Supabase Auth)
3. **Real-time** - Order status updates via Supabase subscriptions in admin dashboard
4. **API routes that use Supabase:**
   - `POST /api/checkout` - Creates orders after Stripe payment
   - `GET /api/orders/[id]` - Fetch order by ID (email verification)
   - `PATCH /api/orders/[id]` - Update order status (admin)
   - `GET /api/admin/orders` - List all orders (admin)
   - `POST /api/webhooks/stripe` - Stripe webhook creates order records
5. **Supabase client files:**
   - `src/lib/supabase/client.ts` - Browser client (lazy-loaded proxy)
   - `src/lib/supabase/server.ts` - Server client (service role key)
   - `src/lib/supabase/types.ts` - Database type definitions

### Current location storage (hardcoded)
- `src/lib/constants.ts` → `BUSINESS_INFO.address` (street, city, state, zip)
- `src/data/mock-settings.ts` → `mockSettings.address` (street, city, state, zip, coordinates)
- `src/lib/settings-service.ts` → Abstract layer (currently returns mock data, has `getSettings()`, `updateSettings()`, `toggleAcceptingOrders()`)

### Where location is displayed on public site
1. **Footer** (`src/components/layout/Footer.tsx`) - Full address with MapPin icon
2. **Location page** (`src/app/[locale]/location/page.tsx`) - Google Maps embed + address card + hours
3. **Hero section** (`src/components/home/HeroSection.tsx`) - "Fresno, CA" badge

### Existing admin portal
- `/admin` → Redirects to `/admin/login`
- `/admin/login` → PIN authentication (4-6 digit PIN from env var `ADMIN_PIN`)
- `/admin/orders` → Order management dashboard with real-time updates
- Auth uses HTTP-only cookie `admin_token` with 24-hour expiry

### Key type definitions
- `src/types/settings.ts` → `BusinessSettings`, `Address`, `DayHours`, `BusinessHours`
- `src/types/order.ts` → `Order`, `OrderItem`, `OrderStatus`, `Customer`
- `src/types/menu.ts` → `MenuItem`, `Category`, `LocalizedString`
- `src/types/cart.ts` → `CartItem`, `SelectedCustomization`, `Cart`

### Environment variables currently in use
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional)
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_PIN`
- `NODE_ENV`

---

## Implementation Plan (high-level)

### Phase 1: Firebase Setup
1. Install Firebase SDK (`firebase`, `firebase-admin`)
2. Create Firebase config files:
   - `src/lib/firebase/client.ts` - Browser SDK initialization
   - `src/lib/firebase/admin.ts` - Admin SDK initialization (server-side)
3. Add Firebase environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON, for admin SDK)

### Phase 2: Settings/Location Feature (Firebase Firestore)
1. Create Firestore collection: `settings` with a single document `business`
2. Document structure:
   ```json
   {
     "address": {
       "street": "3649 N Blackstone Ave",
       "city": "Fresno",
       "state": "CA",
       "zip": "93726"
     },
     "isOpen": true,
     "statusMessage": null,
     "isAcceptingOrders": true,
     "pauseMessage": null,
     "updatedAt": "2026-02-08T..."
   }
   ```
3. Update `src/lib/settings-service.ts` to use Firestore instead of mock data
4. Create new admin page: `src/app/admin/settings/page.tsx`
   - Address form (street, city, state, zip)
   - Open/closed toggle
   - Status message text field
   - Save button with loading state
5. Add navigation between `/admin/orders` and `/admin/settings` (sidebar or tab bar)
6. Update public-facing components to fetch from Firestore:
   - Footer → dynamic address
   - Location page → dynamic address + geocoded map
   - Hero section → dynamic city/state badge

### Phase 3: Migrate Orders to Firebase (if full migration chosen)
1. Create Firestore collection: `orders`
2. Update all API routes to use Firebase Admin SDK instead of Supabase:
   - `/api/checkout`
   - `/api/orders/[id]`
   - `/api/admin/orders`
   - `/api/webhooks/stripe`
3. Replace Supabase real-time subscriptions with Firestore `onSnapshot` listeners in admin dashboard
4. Update type definitions if needed
5. Remove Supabase dependencies

### Phase 4: Cleanup
1. Remove Supabase packages (`@supabase/supabase-js`, `@supabase/ssr`)
2. Remove Supabase config files and env vars
3. Update `.env.example` with Firebase vars
4. Test all flows end-to-end

---

## Files that will be created/modified

### New files
- `src/lib/firebase/client.ts` - Firebase browser SDK init
- `src/lib/firebase/admin.ts` - Firebase Admin SDK init
- `src/app/admin/settings/page.tsx` - Admin settings page
- `src/components/admin/AdminNav.tsx` - Navigation between admin pages (orders/settings)

### Modified files
- `src/lib/settings-service.ts` - Switch from mock data to Firestore
- `src/components/layout/Footer.tsx` - Fetch dynamic location
- `src/app/[locale]/location/page.tsx` - Fetch dynamic location
- `src/components/home/HeroSection.tsx` - Fetch dynamic city/state
- `src/app/admin/orders/page.tsx` - Add navigation component
- `messages/en.json` - Add admin settings translations
- `messages/es.json` - Add admin settings translations
- `package.json` - Add firebase dependencies

### If full Supabase migration
- `src/app/api/checkout/route.ts` - Switch to Firebase
- `src/app/api/orders/[id]/route.ts` - Switch to Firebase
- `src/app/api/admin/orders/route.ts` - Switch to Firebase
- `src/app/api/webhooks/stripe/route.ts` - Switch to Firebase
- Delete `src/lib/supabase/` directory
- Delete `src/lib/supabase/types.ts`

---

## Resume instructions

When resuming this task:
1. Read this file first: `PLAN-admin-location-firebase.md`
2. Ask the user the **outstanding question** about migration approach (full vs incremental vs settings-only) and whether they have a Firebase project ready
3. Once answered, proceed with the implementation phases above
4. The existing codebase is well-typed and organized - follow existing patterns (TypeScript, Tailwind, next-intl for translations, Zustand for client state)
