# SEO Fix Instructions for eltacochingonfresno.com
## Claude Code Prompt — Based on Seobility Audit (76% → Target 90%+)

Copy everything below the line into Claude Code:

---

```
You are fixing specific SEO issues on https://www.eltacochingonfresno.com/en — a Next.js 16.1.1 site with React 19, TypeScript, Tailwind CSS 4, next-intl (en/es), GSAP + WebGL, deployed on Vercel.

A Seobility audit scored the site 76% with these exact scores:
- Meta data: 98% (mostly fine)
- Page quality: 69% (needs work)
- Page structure (Others): 76% (needs work)
- Link structure: 56% (worst on-page score)
- Server configuration: 75% (needs work)
- External factors: 3% (backlinks — can't fix in code, but can prep for it)

Read the codebase first, then fix ONLY the flagged issues below. Do not break existing functionality.

---

## ISSUE 1 — 38 images have no alt attribute [Page Quality: Image SEO — WARNING]

This is the #1 priority from the to-do list.

- Find ALL <Image> (next/image) and <img> tags across the entire codebase
- Add descriptive, keyword-rich alt text to every single one that's missing it
- Guidelines for alt text:
  - Food images: describe the dish + "El Taco Chingón" or "Mexican" where natural
    e.g., alt="Carne asada tacos with fresh cilantro and lime at El Taco Chingón"
  - Hero/banner images: describe the scene
    e.g., alt="El Taco Chingón Fresno restaurant serving authentic Mexican street food"
  - Logo: alt="El Taco Chingón logo"  
  - Decorative/background images: alt="" (empty string, not missing)
  - Icons: alt="" if purely decorative, or descriptive if functional
- For any GSAP/WebGL canvas elements, add aria-label attributes
- Count: the audit found exactly 38 images missing alt. Make sure you get all 38.

---

## ISSUE 2 — H1 heading is too short (15 characters) [Page Structure: H1 — WARNING]

Current H1: "EL TACO CHINGON" (15 chars)
Requirement: At least 20 characters, should include primary keywords.

- Find the H1 tag on the /en homepage
- Change it to something like:
  "El Taco Chingón — Authentic Mexican Street Food in Fresno"
- For the /es page, use the Spanish equivalent:
  "El Taco Chingón — Comida Mexicana Auténtica en Fresno"
- Make sure these are set via the next-intl translation files so both locales are covered
- Ensure there is still only ONE <h1> on the page
- Keep the visual styling the same (you can use CSS to maintain the look while changing the text)
- If the visual design requires the short "EL TACO CHINGON" text, use a visually-hidden span with the full text for SEO and aria-label, or make the short text decorative and put the real H1 with the longer text as an sr-only element

---

## ISSUE 3 — Duplicate heading texts on the page [Page Structure: Headings — WARNING]

- Scan all heading tags (h1 through h6) rendered on the /en page
- Identify any headings that have identical text content
- Make each heading unique and descriptive
- Examples of what to look for:
  - Multiple h2s that all say "Menu" or "Our Food" — differentiate them
  - Section headings that repeat — give each a unique, keyword-relevant label
  - Headings that are generic like "Learn More" — make them specific
- Maintain proper heading hierarchy: H1 → H2 → H3 (no skipping levels)

---

## ISSUE 4 — 6 duplicate text blocks on the page [Page Quality: Content — WARNING]

The audit found 6 text duplicates including:
1: "Fresh tacos you can taste in every bite. Corn tortillas, fresh and war..."
2: "Authentic burritos, tacos, tortas — all priced right. Food comes out h..."
3: "Adobada fries, asada taco, chorizo taco, carnitas taco. Everything was..."

- Find these repeated text blocks in the components
- These look like customer reviews or menu item descriptions that appear multiple times
- Fix by either:
  a) Removing the duplicates so each text only appears once
  b) Rewriting duplicated content to be unique for each instance
  c) If these are in a carousel/slider that renders all items in DOM, consider lazy rendering or using CSS to show/hide rather than duplicating DOM nodes
- Check if content is being duplicated between SSR and client hydration

---

## ISSUE 5 — Average words per sentence is too low (7 words) [Page Quality: Content — WARNING]

- Review the body copy on the /en page
- Rewrite overly short, fragmented sentences into fuller prose
- Target: average sentence length of 12-20 words
- Focus on sections like "About", menu descriptions, and any marketing copy
- Don't change customer reviews if those are user-generated content
- Add connecting phrases and expand descriptions naturally
- Example: "Bold flavors. Fresh ingredients." → "Our bold flavors come from fresh, locally sourced ingredients prepared daily in our Fresno kitchen."

---

## ISSUE 6 — Duplicate anchor texts for internal links [Link Structure: Internal Links — WARNING]

- Find all internal <Link> and <a> tags on the /en page
- Identify links that share the same anchor text but go to different URLs
  (e.g., multiple "Read More" or "Order Now" links pointing to different pages)
- Make each anchor text unique and descriptive:
  - Instead of "Order Now" x3, use: "Order Tacos Online", "View Full Menu", "Start Your Order"
  - Instead of "Learn More" x2, use: "Learn About Our Story", "See Our Catering Options"
- Also check for multiple links with identical text pointing to the SAME URL — consolidate these

---

## ISSUE 7 — Internal links have dynamic parameters [Link Structure: Internal Links — WARNING]

- Find internal links that contain query parameters (e.g., ?ref=, ?utm=, ?id=)
- Remove dynamic parameters from internal links
- All internal URLs should be clean paths: /en, /en/menu, /en/about, etc.
- If you're using next-intl Link component, ensure it generates clean locale-prefixed URLs
- Check for any programmatically generated links that might append parameters

---

## ISSUE 8 — X-Powered-By header is exposed [Server Config: HTTP Header — WARNING]

- In next.config.ts (or next.config.js), add:
  ```typescript
  const nextConfig = {
    // ... existing config
    poweredByHeader: false,
  }
  ```
- This removes the "X-Powered-By: Next.js" header from responses

---

## ISSUE 9 — Server clock/time is wrong [Server Config: HTTP Header — WARNING]

- This is likely a Vercel edge/CDN issue, not a code fix
- Check if there are any custom headers being set with timestamps in next.config.ts or middleware
- If using middleware that sets date headers, verify it uses UTC
- NOTE: If this is purely Vercel's server clock, it may not be fixable from code — add a comment noting this for the site owner to check in Vercel dashboard

---

## ISSUE 10 — Few social sharing options [Page Quality: Social Media — WARNING]

- Add social media profile links in the footer or a visible section:
  - Instagram: https://www.instagram.com/eltacochingon1/
  - Facebook: link to the business Facebook page
  - Yelp: https://www.yelp.com/biz/el-taco-chingon-fresno-3
  - Google Maps / Google Business Profile link
- Optionally add share buttons (share to Facebook, X/Twitter, WhatsApp) on the page
- Ensure all external social links have rel="noopener noreferrer" and target="_blank"
- Use recognizable social media icons with proper aria-labels

---

## ISSUE 11 — Title keywords missing from H1 [Page Quality: Content — INFO]

The audit noted: "Some words from the page title are not used within H1 headings"
- Current title: "El Taco Chingon | Authentic Mexican Street Food"
- Current H1: "EL TACO CHINGON"
- The fix from Issue 2 should resolve this — ensure the expanded H1 includes keywords "Authentic", "Mexican", "Street Food" that match the title tag

---

## ISSUE 12 — Domain name is very long [Meta Data: Domain — WARNING]

- "eltacochingonfresno.com" flagged as very long
- This CANNOT be fixed in code — it's the domain name itself
- SKIP this issue entirely

---

## BONUS IMPROVEMENTS (not flagged but will boost score)

### A. Add JSON-LD Structured Data (Restaurant Schema)
Add to the main layout or homepage — inject via <script type="application/ld+json">:
```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "El Taco Chingón",
  "image": "https://www.eltacochingonfresno.com/og-image.jpg",
  "@id": "https://www.eltacochingonfresno.com",
  "url": "https://www.eltacochingonfresno.com",
  "telephone": "+15594177907",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4571 N Fresno St",
    "addressLocality": "Fresno",
    "addressRegion": "CA",
    "postalCode": "93726",
    "addressCountry": "US"
  },
  "servesCuisine": "Mexican",
  "priceRange": "$",
  "menu": "https://www.eltacochingonfresno.com/en/menu"
}
```

### B. Verify sitemap.xml & robots.txt
- Ensure app/sitemap.ts exists and includes all pages for both /en and /es locales
- Ensure public/robots.txt exists with:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://www.eltacochingonfresno.com/sitemap.xml
  ```

### C. Add hreflang alternate links
The audit showed "no alternate links specified" — add in metadata:
```typescript
alternates: {
  canonical: 'https://www.eltacochingonfresno.com/en',
  languages: {
    'en': 'https://www.eltacochingonfresno.com/en',
    'es': 'https://www.eltacochingonfresno.com/es',
  },
}
```

---

## EXECUTION ORDER (by impact on score):
1. Fix 38 missing image alt attributes (Issue 1) — biggest single fix
2. Fix H1: expand to 20+ chars with keywords (Issue 2 + Issue 11)
3. Fix duplicate heading texts (Issue 3)
4. Fix 6 duplicate text content blocks (Issue 4)
5. Fix duplicate anchor texts in internal links (Issue 6)
6. Remove dynamic parameters from internal links (Issue 7)
7. Disable X-Powered-By header (Issue 8)
8. Improve sentence length in body copy (Issue 5)
9. Add social sharing/profile links (Issue 10)
10. Add JSON-LD structured data (Bonus A)
11. Add hreflang alternates (Bonus C)
12. Verify sitemap + robots.txt (Bonus B)

After all fixes, run `npm run build` to confirm no errors, then deploy to Vercel.
```
