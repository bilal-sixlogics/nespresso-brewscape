# Translation / Localization Audit

**Scope:** Every live page under `src/app/` and every component under `src/components/` actually reachable from the running site (67 files total). Read in full, file by file — not a keyword grep.

**Excluded (confirmed dead code — zero imports anywhere in the codebase, unreachable from any route):**
`src/components/atoms/Button.tsx`, `src/components/atoms/Typography.tsx`, `src/components/molecules/Accordion.tsx`, `src/components/molecules/QuantityStepper.tsx`, `src/components/organisms/DetailSection.tsx`, `src/components/organisms/Header.tsx`, `src/components/organisms/Hero.tsx`. These were not audited since nothing renders them.

## How to read this file

Every finding is one of two kinds:

- **MISSING** — the string is hardcoded with **no localization mechanism at all**. Every user sees the exact same text regardless of which of the 5 supported languages (fr/en/de/ru/nl) they have selected.
- **PARTIAL** — the string goes through a local two-way helper — an inline `language === 'fr' ? 'X' : 'Y'` ternary, a per-file `tx(fr, en)` / `t(fr, en)` function, or a `field`/`fieldEn` data pair — instead of the real `useLanguage().t(key)` system backed by `src/lib/translations.ts`. This covers French and English only. **German, Russian, and Dutch users silently see the English (or French) fallback text** for every one of these, even though the site is set up to support all 5 languages.

Not flagged (by design): dynamic data from the backend/API (product/brand/category names, descriptions, prices, order numbers, user names, addresses, blog post content), already-correct `t('key')` calls, code comments/console logs, CSS classes, purely decorative emoji, and technical attributes with no linguistic content.

## Executive summary

| Area | Files audited | MISSING | PARTIAL | Total |
|---|---|---|---|---|
| Core commerce (Home, Shop, PDP, ProductCard/Panel/FilterDrawer, IntensityBar, CupSeparator, TrustIndicators) | 10 | 22 | 59 | 81 |
| Layout / nav / modals (layout.tsx, SiteChrome, Header, PromoStrip, Footer, CartDrawer, LoginModal, OtpVerificationModal, ReviewModal, FlagIcon) | 10 | 46 | 20 | 66 |
| Auth & account flows (login/register/forgot/reset-password, notifications, wishlist, order-success/failed, orders/[id], checkout, account, ProtectedRoute) | 12 | 166 | 113 | 279 |
| Commerce category pages (machines, sweets, accessories, wholesale, visit-shop, MobileCarousel, LoadMoreButton, ProductSkeleton, SectionRenderer, RichText) | 10 | 33 | 85 | 118 |
| Content pages (contact, faq, blog, blog/[id]+client, our-origins, brew-guide, TestimonialsSection) | 8 | 50 | 45 | 95 |
| Legal pages & icons (privacy, terms, shipping, returns, not-found, error, 4 icon components) | 10 | 45 | 42 | 87 |
| **Total** | **60** | **362** | **364** | **726** |

## Root-cause patterns (read this before fixing file-by-file)

1. **Duplicated ad-hoc translation helpers instead of the shared system.** At least 9 files define their own local two-way helper (`tx(fr, en)`, `t(fr, en)`, or a `field`/`fieldEn` data-pair pattern) instead of using `useLanguage().t(key)` + `src/lib/translations.ts`. This is the single biggest source of PARTIAL findings and affects nearly every page built after the initial ones: `ProductDetailPageClient.tsx`, `FilterDrawer.tsx`, `CartDrawer.tsx`, `contact/page.tsx`, `faq/page.tsx`, `machines/sweets/accessories/page.tsx`, `checkout/page.tsx`, `wishlist/page.tsx`, `notifications/page.tsx`, `shipping/page.tsx`, `privacy/page.tsx`, `terms/page.tsx`, `returns/page.tsx` (partially). Consolidating these into real `translations.ts` keys would fix hundreds of findings at once and add de/ru/nl coverage for free.
2. **Whole pages/components with zero localization mechanism** (100% MISSING, hardcoded English throughout): `login`, `register`, `forgot-password`, `reset-password`, `wholesale`, `visit-shop`, `order-success`, `order-failed`, `orders/[id]`, `our-origins`, `brew-guide` pages; `OtpVerificationModal`, `ReviewModal`, `BlogPostClient`, `TrustIndicators`, `SectionRenderer`, `MobileCarousel`, `LoadMoreButton` components. These need translation keys added from scratch, not just a refactor.
3. **Accessibility attributes are the most commonly missed spot even in otherwise well-translated files** — `aria-label`, `alt`, `placeholder`, `title` on buttons/inputs/images are hardcoded English in `Header.tsx`, `ProductCard.tsx`, `ProductDetailPanel.tsx`, `FilterDrawer.tsx`, `CartDrawer.tsx`, `MobileCarousel.tsx`, `PromoStrip.tsx` even where the visible text nearby is properly translated.
4. **Fallback/error strings are almost never translated.** Every `catch` block's `apiErr.message ?? 'Some hardcoded fallback'` across auth, checkout, account, and modal components is hardcoded English — these are exactly the messages users see when something goes wrong, currently untranslated everywhere.
5. **Locale-aware date/number formatting only branches on French vs. everything else** (e.g. `toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', ...)` in `page.tsx`) — German/Russian/Dutch users get English-formatted dates.
6. **Hardcoded status/label maps.** Several pages define their own English-only lookup object for order/notification statuses instead of translation keys: `STATUS_CONFIG` in `orders/[id]/page.tsx`, `PAYMENT_LABELS`/`REASONS` in `order-success`/`order-failed`, `TYPE_META` in `notifications/page.tsx`.
7. **`src/app/our-origins/page.tsx`** has ~12 full editorial paragraphs (brand histories) that are pure static English copy with no localization at all — this is the largest single block of untranslated content by word count.
8. `src/components/ui/TrustIndicators.tsx` is fully hardcoded (MISSING) but its one call site in `ProductDetailPageClient.tsx` is currently commented out, so it isn't live on the site today — still worth fixing since it's one edit away from shipping.

---

## Core commerce

### `src/app/page.tsx` (Homepage)
- **Line 50** — PARTIAL — ternary renders `"Explorez"` / `"Explore"`
- **Line 55** — PARTIAL — ternary renders `"Nos Catégories"` / `"Shop by Category"`
- **Line 193** — PARTIAL — ternary renders `"Nos Partenaires"` / `"Our Partners"`
- **Line 198** — PARTIAL — ternary renders `"Marques de Confiance"` / `"Trusted Brands"`
- **Line 205** — PARTIAL — ternary renders `"Les grandes marques du café, toutes réunies sur notre plateforme."` / `"World-renowned coffee brands, all available on our platform."`
- **Line 213** — PARTIAL — ternary renders `"Découvrir Nos Marques"` / `"Discover Our Brands"`
- **Line 287** — PARTIAL — ternary renders `"Le Journal"` / `"The Journal"`
- **Line 291** — PARTIAL — ternary renders `"Nos Derniers"` / `"Latest"`
- **Line 292** — PARTIAL — ternary renders `"Articles"` / `"Stories"`
- **Line 299** — PARTIAL — ternary renders `"Voir tout"` / `"View All"`
- **Line 335** — PARTIAL — `toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', ...)` — only distinguishes fr, de/ru/nl get `en-GB` formatting
- **Line 360** — PARTIAL — ternary renders `"Voir tous les articles"` / `"View All Articles"`
- **Line 463** — MISSING — `alt="Iced Coffee Cup"` (hardcoded English, no localization at all)
- **Line 519** — PARTIAL — ternary renders `"Pourquoi Cafrezzo"` / `"Why Shop With Us"`
- **Line 524** — PARTIAL — ternary renders `"Une Expérience Sans Compromis"` / `"An Experience You Can Trust"`
- **Line 590** — PARTIAL — ternary renders `"Sélection"` / `"Featured"`
- **Line 591** — PARTIAL — ternary renders `"Vedette"` / `"Collection"`
- **Line 598** — PARTIAL — ternary renders `"Voir tout"` / `"View All"`
- **Line 621** — PARTIAL — ternary renders `"Voir toute la collection"` / `"View Entire Collection"`

### `src/app/shop/page.tsx`
No missing/partial translations found — all static text goes through `t('key')`.

### `src/app/shop/[slug]/page.tsx`
No missing/partial translations found (server component wrapper, no rendered text).

### `src/app/shop/[slug]/ProductDetailPageClient.tsx`
Defines a local `const t = (fr, en) => language === 'fr' ? fr : en;` — every call site below is PARTIAL unless noted MISSING.
- **Line 52** — MISSING — `({count} avis)` — hardcoded French word "avis", not passed through the helper at all, shown to every language
- **Line 148** — PARTIAL — `t('Produit introuvable', 'Product Not Found')`
- **Line 150** — PARTIAL — `t('Retour à la boutique', 'Back to Shop')`
- **Line 163** — MISSING — fallback unit `name: 'Unité'` (hardcoded French, always shown when no default sale unit exists)
- **Line 190** — PARTIAL — `t('Accueil', 'Home')`
- **Line 192** — PARTIAL — `t('Boutique', 'Shop')`
- **Line 213** — PARTIAL — `t('new','New')`
- **Line 259** — MISSING — `Best Seller` badge text (hardcoded English, no wrapper at all)
- **Line 262** — MISSING — `Nouveau` badge text (hardcoded French, shown regardless of language)
- **Line 265** — MISSING — `♻️ Éco` badge text (hardcoded French)
- **Line 299** — PARTIAL — `t('Notes aromatiques', 'Aromatic Notes')`
- **Line 311** — PARTIAL — `t('Choisir le format', 'Choose Format')`
- **Line 354** — PARTIAL — `t('Ajouté !', 'Added!')` / `t('Total', 'Total')`
- **Line 366** — PARTIAL — `title={t('Partager', 'Share')}`
- **Line 371** — PARTIAL — `t('Lien copié', 'Link copied')`
- **Line 379** — PARTIAL — `t('🚚 Livraison offerte dès ...', '🚚 Free shipping from ...')`
- **Line 396** — PARTIAL — `t('Description', 'Description')`
- **Line 397** — PARTIAL — `t('Caractéristiques', 'Specifications')`
- **Line 398** — PARTIAL — `t('Avis (${count})', 'Reviews (${count})')`
- **Line 409** — PARTIAL — `t('Aucune description disponible.', 'No description available.')`
- **Line 413** — PARTIAL — `t('Profil Gustatif', 'Taste Profile')`
- **Line 415** — PARTIAL — `t('Amertume', 'Bitterness')`
- **Line 416** — PARTIAL — `t('Acidité', 'Acidity')`
- **Line 417** — PARTIAL — `t('Torréfaction', 'Roastiness')`
- **Line 418** — PARTIAL — `t('Corps', 'Body')`
- **Line 419** — PARTIAL — `t('Douceur', 'Sweetness')`
- **Line 447** — PARTIAL — `t('Intensité', 'Intensity')`
- **Line 448** — PARTIAL — `t('Torréfaction', 'Roast Level')`
- **Line 449** — PARTIAL — `t('Origine', 'Origin')`
- **Line 450** — PARTIAL — `t('Méthode', 'Process')`
- **Line 451** — MISSING — `{ label: 'Poids', value: ... }` (hardcoded French label, no wrapper)
- **Line 452** — PARTIAL — `t('Formats', 'Brew Sizes')`
- **Line 453** — PARTIAL — `t('Allergènes', 'Allergens')`
- **Line 474** — PARTIAL — `t('avis', 'reviews')`
- **Line 506** — PARTIAL — `t('Achat vérifié', 'Verified Purchase')`
- **Line 519** — PARTIAL — `t("Aucun avis pour l'instant", 'No reviews yet')`
- **Line 520** — PARTIAL — `t('Soyez le premier à partager votre expérience', 'Be the first to share your experience')`
- **Line 533** — PARTIAL — `t('Vous aimerez aussi', 'You Might Also Like')`
- **Line 535** — PARTIAL — `t('Voir tout', 'View All')`

### `src/components/ui/ProductCard.tsx`
- **Line 63** — MISSING — `aria-label={\`View ${product.name}\`}` ("View" hardcoded English)
- **Line 131** — MISSING — `BEST` badge text (hardcoded English)
- **Line 225** — MISSING — `aria-label={\`Quick look at ${product.name}\`}` ("Quick look at" hardcoded English)

### `src/components/ui/ProductDetailPanel.tsx`
- **Line 80** — MISSING — `{open ? 'Close' : 'Read'}` (hardcoded English, keyed on open-state, not language)
- **Line 153** — MISSING — fallback unit `name: 'Unit'` (hardcoded English, always shown regardless of language)
- **Line 207** — MISSING — `aria-label="Close product panel"`
- **Line 329** — MISSING — `'Optimisation en cours...'` (hardcoded French, shown while redirecting regardless of language)
- **Line 358** — MISSING — `aria-label="Decrease"`
- **Line 366** — MISSING — `aria-label="Increase"`

### `src/components/ui/FilterDrawer.tsx`
Uses a local `t = (fr, en) => language === 'fr' ? fr : en` helper — every call site is PARTIAL unless noted MISSING.
- **Line 182** — PARTIAL — `t('Filtres', 'Filters')`
- **Line 190** — MISSING — `aria-label="Close filters"`
- **Line 200** — PARTIAL — `t('En stock uniquement', 'In Stock Only')`
- **Line 205** — MISSING — `aria-label="In stock only"`
- **Line 217** — PARTIAL — `t('Catégorie', 'Category')`
- **Line 237** — PARTIAL — `t('Marque', 'Brand')`
- **Line 257** — PARTIAL — `t('Intensité', 'Intensity')`
- **Line 272** — PARTIAL — `t(\`Prix (${currency_symbol})\`, \`Price (${currency_symbol})\`)`
- **Line 283** — MISSING — `<Section title="Tags">` (hardcoded, no localization mechanism)
- **Line 312** — PARTIAL — `t('Réinitialiser', 'Reset')`
- **Line 318** — PARTIAL — `t(\`Voir ${resultCount} résultats\`, \`Show ${resultCount} results\`)`

### `src/components/ui/IntensityBar.tsx`
No missing/partial translations found (uses `t('intensity')` from the shared table).

### `src/components/ui/CupSeparator.tsx`
No missing/partial translations found (purely decorative, `aria-hidden="true"`, no text).

### `src/components/ui/TrustIndicators.tsx`
Never calls `useLanguage()` — everything hardcoded. **Not currently rendered anywhere live** (its one call site in `ProductDetailPageClient.tsx` is commented out) but flagged since it will ship as-is the moment it's re-enabled.
- **Line 16** — MISSING — `{ title: 'freeShipping', description: 'freeShippingDesc' }` — these look like translation keys but are never run through `t()` in this component, so they'd literally render as `"freeShipping"` / `"freeShippingDesc"` if used as-is
- **Line 17** — MISSING — `{ title: 'Freshly Roasted', description: 'Roasted to order, shipped within 48h' }` (hardcoded English)
- **Line 18** — MISSING — `{ title: 'Secure Checkout', description: '100% secure payment' }` (hardcoded English)

---

## Layout, navigation & modals

### `src/app/layout.tsx`
- **Line 18** — MISSING — `metadata = baseMetadata` imports hardcoded English-only title/description from `src/lib/seo.ts` (lines 12, 16, 36-38: `"Cafrezzo | Your Coffee Experience"`, `"Discover the bold and sophisticated world of Cafrezzo premium coffee..."`). No `language`-based branching — every locale gets the same English `<title>`/meta description.

### `src/components/layout/SiteChrome.tsx`
No missing/partial translations found (purely structural, no rendered text).

### `src/components/layout/Header.tsx`
- **Line 284** — MISSING — `aria-label="Open menu"`
- **Line 329** — MISSING — `aria-label="Search"`
- **Line 337** — MISSING — `aria-label="Account"`
- **Line 342** — MISSING — `Hi, {user?.name?.split(' ')[0] || 'User'}` — hardcoded `"Hi, "` prefix and `'User'` fallback
- **Line 350** — MISSING — `aria-label="Open cart"`
- **Line 380** — MISSING — `aria-label="Navigation menu"`
- **Line 384** — MISSING — `"Menu"` (mobile drawer heading)
- **Line 387** — MISSING — `aria-label="Close menu"`
- **Line 396** — MISSING — `"Discover"` (mobile nav section label)
- **Line 409** — MISSING — `"Shop"` (mobile nav section label)
- **Line 424** — MISSING — `"Language"` (mobile nav label)
- **Line 433** — MISSING — `"Login / Register"` (button label)
- **Line 441** — MISSING — `"My Account"` (link label)

### `src/components/layout/PromoStrip.tsx`
- **Line 17** — PARTIAL — `messages = language === 'fr' ? banner.messages : banner.messagesEn` — banner copy in `src/lib/config.ts` only ever authored in French or English; de/ru/nl users see English promo text
- **Line 53** — MISSING — `` aria-label={`Message ${i + 1}`} `` — hardcoded English word "Message"
- **Line 62** — MISSING — `aria-label="Dismiss"`

### `src/components/layout/Footer.tsx`
- **Line 42** — MISSING — `setNlError(apiErr.message ?? 'Subscription failed. Please try again.')` — hardcoded newsletter fallback error text
(everything else in Footer correctly uses `t()`)

### `src/components/ui/CartDrawer.tsx`
Defines a local `tx(fr, en)` helper — every call site is PARTIAL unless noted MISSING.
- **Line 71** — PARTIAL — `tx('Mon Panier', 'My Cart')`
- **Line 72** — PARTIAL — `tx('article(s)', 'item(s)')`
- **Line 81** — PARTIAL — `tx('Vider', 'Clear')`
- **Line 86** — MISSING — `aria-label="Close cart"`
- **Line 101** — PARTIAL — `tx('Plus que', 'Only')` / `tx('pour la livraison gratuite !', 'away from free shipping!')`
- **Line 117** — PARTIAL — `tx('Livraison gratuite offerte ! 🎉', 'Free shipping unlocked! 🎉')`
- **Line 131** — PARTIAL — `tx('Votre panier est vide', 'Your cart is empty')`
- **Line 136** — PARTIAL — `tx('Continuer mes achats', 'Continue Shopping')`
- **Line 173** — MISSING — `aria-label="Decrease quantity"`
- **Line 181** — MISSING — `aria-label="Increase quantity"`
- **Line 196** — MISSING — `` aria-label={`Remove ${displayName} from cart`} `` — hardcoded English
- **Line 220** — PARTIAL — `tx('Ajouter un code promo', 'Add Promo Code')`
- **Line 231** — PARTIAL — `tx('Code promo', 'Promo code')` (sr-only label)
- **Line 238** — PARTIAL — `tx('Code promo', 'Promo code')` (input placeholder)
- **Line 245** — PARTIAL — `tx('Appliquer', 'Apply')`
- **Line 260** — PARTIAL — `tx('Supprimer', 'Remove')`
- **Line 270** — PARTIAL — `tx('Sous-total', 'Subtotal')`
- **Line 280** — PARTIAL — `tx('Livraison', 'Shipping')`
- **Line 281** — PARTIAL — `tx('Calculée au paiement', 'Calculated at checkout')`
- **Line 284** — PARTIAL — `tx('Sous-total', 'Subtotal')` (order-total row)
- **Line 296** — PARTIAL — `tx('Sous-total', 'Subtotal')` (checkout CTA line)
- **Line 296** — MISSING — `article(s)` appended literally (`{cartCount} article(s)`) with no wrapper — always renders the French word regardless of language
- **Line 300** — PARTIAL — `tx('Commander', 'Checkout')`

### `src/components/ui/LoginModal.tsx`
Otherwise fully wired to `t()`. One gap:
- **Line 105** — MISSING — `setError(apiErr.message ?? 'Something went wrong. Please try again.')` — hardcoded login-failure fallback

### `src/components/ui/OtpVerificationModal.tsx`
Never imports `useLanguage()`/`t()` — 100% hardcoded English.
- **Line 116** — MISSING — `setError(apiErr.message ?? 'Invalid verification code. Please try again.')`
- **Line 142** — MISSING — `setError(apiErr.message ?? 'Failed to resend code. Please try again.')`
- **Line 184** — MISSING — `"Verify Email"` (heading)
- **Line 187** — MISSING — `"We sent a 6-digit code to..."` / `"Enter it below to verify your account."` (subtitle)
- **Line 213** — MISSING — `"A new code has been sent to your email."`
- **Line 243** — MISSING — `'Verify'` (button label)
- **Line 248** — MISSING — `"Didn't receive the code?"`
- **Line 251** — MISSING — `"Resend in "` (countdown text)
- **Line 259** — MISSING — `'Sending...'` / `'Resend Code'`

### `src/components/ui/ReviewModal.tsx`
Never imports `useLanguage()`/`t()` — 100% hardcoded English.
- **Line 61** — MISSING — `"You've already reviewed this product. Thank you for your feedback!"`
- **Line 63** — MISSING — `apiErr.message ?? 'Something went wrong. Please try again.'`
- **Line 66** — MISSING — `'Something went wrong. Please try again.'`
- **Line 106** — MISSING — `"Review Submitted"` (success heading)
- **Line 107** — MISSING — `"Thank you for sharing your experience. It has been published."`
- **Line 113** — MISSING — `"Rate Your Experience"` (heading)
- **Line 146** — MISSING — `"Poor"` (rating label)
- **Line 147** — MISSING — `"Fair"` (rating label)
- **Line 148** — MISSING — `"Good"` (rating label)
- **Line 149** — MISSING — `"Very Good"` (rating label)
- **Line 150** — MISSING — `"Excellent"` (rating label)
- **Line 151** — MISSING — `"Select a Rating"` (rating label)
- **Line 159** — MISSING — `placeholder="Tell us what you loved about it..."`
- **Line 177** — MISSING — `'Submit Review'` (button label)

### `src/components/ui/FlagIcon.tsx`
No missing/partial translations found (pure SVG flag rendering, no text).

---

## Auth & account flows

### `src/app/login/page.tsx`
- **Line 33** — MISSING — `"Invalid credentials. Please try again."`
- **Line 58** — MISSING — `"Welcome Back"` (heading)
- **Line 60-61** — MISSING — `"Sign in to manage your orders and account."`
- **Line 88** — MISSING — `"Email address"` (placeholder)
- **Line 104** — MISSING — `"Password"` (placeholder)
- **Line 123** — MISSING — `"Forgot your password?"`
- **Line 132** — MISSING — `"Sign In"` (submit button)
- **Line 137** — MISSING — `"Don't have an account?"`
- **Line 139** — MISSING — `"Create one"` (link)

### `src/app/register/page.tsx`
- **Line 13** — MISSING — `"At least 8 characters"` (password rule)
- **Line 14** — MISSING — `"Uppercase letter"` (password rule)
- **Line 15** — MISSING — `"Lowercase letter"` (password rule)
- **Line 16** — MISSING — `"Number"` (password rule)
- **Line 44** — MISSING — `"Registration failed. Please try again."`
- **Line 74** — MISSING — `"Create Account"` (heading)
- **Line 77** — MISSING — `"Join Cafrezzo for exclusive offers and order tracking."`
- **Line 105** — MISSING — `"Full name"` (placeholder)
- **Line 124** — MISSING — `"Email address"` (placeholder)
- **Line 143** — MISSING — `"Password"` (placeholder)
- **Line 185** — MISSING — `"Confirm password"` (placeholder)
- **Line 198** — MISSING — `"Passwords do not match."`
- **Line 207** — MISSING — `"Create Account"` (submit button)
- **Line 212** — MISSING — `"Already have an account?"`
- **Line 214** — MISSING — `"Sign in"` (link)

### `src/app/forgot-password/page.tsx`
- **Line 26** — MISSING — `"Something went wrong. Please try again."`
- **Line 52** — MISSING — `"Reset Password"` (heading)
- **Line 54-56** — MISSING — `"Enter your email and we'll send you a reset link."`
- **Line 69** — MISSING — `"If an account exists for {email}, a reset link has been sent. Check your inbox."`
- **Line 72** — MISSING — `"Back to sign in"`
- **Line 99** — MISSING — `"Email address"` (placeholder)
- **Line 109** — MISSING — `"Send Reset Link"` (submit button)
- **Line 114-116** — MISSING — `"Back to sign in"` (second occurrence)

### `src/app/reset-password/page.tsx`
- **Line 30** — MISSING — `"Passwords do not match."`
- **Line 46** — MISSING — `"This reset link is invalid or has expired. Please request a new one."`
- **Line 74** — MISSING — `"Set New Password"` (heading)
- **Line 76-78** — MISSING — `"Choose a new password for {email}."` + fallback `"your account"`
- **Line 87-88** — MISSING — `"This reset link is missing required information. Please request a new one."`
- **Line 90** — MISSING — `"Request a new link"`
- **Line 102-104** — MISSING — `"Your password has been reset. Redirecting you to sign in…"`
- **Line 131** — MISSING — `"New password"` (placeholder)
- **Line 146** — MISSING — `"Confirm new password"` (placeholder)
- **Line 156** — MISSING — `"Reset Password"` (submit button)
- **Line 161-163** — MISSING — `"Back to sign in"`

### `src/app/notifications/page.tsx`
- **Line 12** — MISSING — `"Order Update"` (TYPE_META label)
- **Line 13** — MISSING — `"Promotion"` (TYPE_META label)
- **Line 14** — MISSING — `"System"` (TYPE_META label)
- **Line 31** — PARTIAL — `tx('Centre de Notifications', 'Notification Center')`
- **Line 34** — PARTIAL — `tx('Notifications', 'Notifications')`
- **Line 38** — PARTIAL — `tx(...non lue(s), ...unread)`
- **Line 39** — PARTIAL — `tx('Tout est à jour.', 'All caught up.')`
- **Line 57** — PARTIAL — `tx('Tout marquer comme lu', 'Mark all as read')`
- **Line 68** — PARTIAL — `tx('Rien pour le moment', 'Nothing here yet')`
- **Line 69** — PARTIAL — `tx('Vos notifications apparaîtront ici.', 'Your notifications will appear here.')`
- **Line 108** — MISSING — `"View →"` (link, no wrapper at all)

### `src/app/wishlist/page.tsx`
- **Line 24** — MISSING — `"Unit"` (fallback default-unit name)
- **Line 46** — PARTIAL — `tx('Mes Favoris', 'My Wishlist')`
- **Line 49** — PARTIAL — `tx('Liste de Souhaits', 'Wishlist')`
- **Line 53** — PARTIAL — `tx('Aucun produit sauvegardé.', 'No saved products yet.')`
- **Line 54** — PARTIAL — `tx(...produit(s) sauvegardé(s), ...saved product(s))`
- **Line 76** — PARTIAL — `tx('Votre liste est vide', 'Your wishlist is empty')`
- **Line 79** — PARTIAL — `tx('Sauvegardez vos produits préférés en cliquant sur le cœur.', 'Save your favourite products by clicking the heart icon.')`
- **Line 85** — PARTIAL — `tx('Explorer la boutique', 'Explore the Shop')`
- **Line 132** — PARTIAL — `tx('Ajouter', 'Add')`
- **Line 154** — PARTIAL — `tx('Vider la liste', 'Clear wishlist')`

### `src/app/order-success/page.tsx`
No translation mechanism at all.
- **Line 96** — MISSING — `PAYMENT_LABELS` map: `"Cash on Delivery"`, `"Stripe"`, `"Wise Transfer"`, `"Credit / Debit Card"`
- **Line 137** — MISSING — `"Order Confirmed"` / `"Payment Confirmed"` (eyebrow, chosen by payment method not language)
- **Line 140** — MISSING — `"Order Placed!"` (heading)
- **Line 143-145** — MISSING — `"Thank you! Please prepare the exact amount..."` / `"Thank you for your purchase. Your coffee is on its way!"`
- **Line 159** — MISSING — `"Order Number"`
- **Line 163-164** — MISSING — `"Total Due"` / `"Total Paid"`
- **Line 177** — MISSING — `"Order Date"`
- **Line 187-188** — MISSING — `"Ready for Pickup"` / `"Est. Delivery"`
- **Line 199** — MISSING — `"Delivery Method"`
- **Line 202** — MISSING — `"Free"`
- **Line 212** — MISSING — `"Payment Method"`
- **Line 215** — MISSING — `"Pay on delivery"` / `"No card details stored"`
- **Line 225** — MISSING — `"Status"`
- **Line 229** — MISSING — `"Awaiting Delivery"`
- **Line 234** — MISSING — `"Processing"`
- **Line 243** — MISSING — `"What's next?"`
- **Line 246-252** — MISSING — step list strings: `"You'll receive a confirmation email shortly"`, `"Our courier will contact you before delivery"`, `"Please have {total} ready for the courier"`, `"We'll notify you when your order ships"`, `"Track real-time status in your dashboard"`
- **Line 276** — MISSING — `"Track Order"`
- **Line 282** — MISSING — `"Continue Shopping"`

### `src/app/order-failed/page.tsx`
No translation mechanism at all.
- **Line 16** — MISSING — `"Payment Declined"` title / message (REASONS map)
- **Line 20-21** — MISSING — `"Gateway Error"` title / message
- **Line 24-25** — MISSING — `"Payment Timed Out"` title / message
- **Line 28-29** — MISSING — `"Payment Cancelled"` title / message
- **Line 58** — MISSING — `"Payment Failed"` (eyebrow)
- **Line 72** — MISSING — `"Reference"`
- **Line 81** — MISSING — `"Your cart is saved"`
- **Line 82** — MISSING — `"All items in your cart have been preserved..."`
- **Line 89** — MISSING — `"No charge was made"`
- **Line 90** — MISSING — `"You have not been charged. No payment details were stored on our servers."`
- **Line 96** — MISSING — `"Suggested actions"`
- **Line 99-101** — MISSING — 3 suggested-action bullets
- **Line 125** — MISSING — `"Try Again"`
- **Line 131** — MISSING — `"Contact Support"`
- **Line 137** — MISSING — `"Continue Shopping"`

### `src/app/orders/[id]/page.tsx`
No translation mechanism at all.
- **Line 82** — MISSING — `"Draft"` (STATUS_CONFIG label)
- **Line 83** — MISSING — `"Pending Payment"` (STATUS_CONFIG label)
- **Line 84** — MISSING — `"Payment Failed"` (STATUS_CONFIG label)
- **Line 85** — MISSING — `"Order Confirmed"` (STATUS_CONFIG label)
- **Line 86** — MISSING — `"Processing"` (STATUS_CONFIG label)
- **Line 87** — MISSING — `"Shipped"` (STATUS_CONFIG label)
- **Line 88** — MISSING — `"Ready for Pickup"` (STATUS_CONFIG label)
- **Line 89** — MISSING — `"Delivered"` (STATUS_CONFIG label)
- **Line 90** — MISSING — `"Cancelled"` (STATUS_CONFIG label)
- **Line 91** — MISSING — `"Refunded"` (STATUS_CONFIG label)
- **Line 104** — MISSING — `"Picked Up"` (status override label)
- **Line 145** — MISSING — `"No order found with that order number."`
- **Line 147** — MISSING — `"Something went wrong. Please try again."`
- **Line 175** — MISSING — `"Order Tracking"` (eyebrow)
- **Line 176** — MISSING — `"Track Your Order"` (heading)
- **Line 177** — MISSING — `"Enter your order number to see the latest status."`
- **Line 181** — MISSING — `"Order Number"` (form label)
- **Line 188** — MISSING — `"e.g. 1042"` (placeholder)
- **Line 206** — MISSING — `"Looking up..."` / `"Track Order"` (button text)
- **Line 233** — MISSING — `"Continue Shopping"`
- **Line 242** — MISSING — `"Order Number"`
- **Line 246** — MISSING — `"Grand Total"`
- **Line 256** — MISSING — `"Placed"`
- **Line 265** — MISSING — `"Status"`
- **Line 272** — MISSING — `"Email"`
- **Line 280** — MISSING — `"Phone"`
- **Line 294** — MISSING — `"Tracking Number"`
- **Line 296** — MISSING — `"via {carrier}"`
- **Line 306** — MISSING — `"Order Progress"`
- **Line 312** — MISSING — `"Picked Up"` (timeline label override)
- **Line 339** — MISSING — `"Status History"`
- **Line 349** — MISSING — `"Current"` (badge)
- **Line 369** — MISSING — `"Order Items"`
- **Line 392** — MISSING — `"Subtotal"`
- **Line 397** — MISSING — `"Discount"`
- **Line 402** — MISSING — `"Shipping"`
- **Line 403** — MISSING — `"Free"`
- **Line 406** — MISSING — `"Total"`
- **Line 411** — MISSING — `"incl. VAT"`
- **Line 424** — MISSING — `"Delivery Address"`
- **Line 439** — MISSING — `"Questions about your order?"`
- **Line 440** — MISSING — `"Contact Support"`

### `src/app/checkout/page.tsx`
Local `tx(fr, en)` helper used extensively — PARTIAL unless noted MISSING.

**MISSING:**
- **Line 124** — `"Select…"` (`<option>` placeholder, no `tx`)
- **Line 419-427** — `"Required"` (×4: firstName/email/address/postalCode/city), `"Invalid email"` — validation messages
- **Line 431-433** — `"Has uppercase"`, `"Has a number"`, `"Min 8 characters"` (PASSWORD_CHECKS labels)
- **Line 856** — `label="Email"` (hardcoded field label)
- **Line 866**, **Line 1254** — `"France"` (static shipping/billing country display)

**PARTIAL** (all `tx('fr','en')`):
- **Line 150** — `tx('Récapitulatif', 'Order Summary')`
- **Line 151** — `tx('articles', 'items')`
- **Line 184, 213** — `tx('dont', 'incl.')` / `tx('TVA', 'VAT')`
- **Line 195** — `tx('Sous-total', 'Subtotal')`
- **Line 198-199** — `tx('Livraison', 'Shipping')` / `tx('Gratuite', 'Free')`
- **Line 203** — `tx('TVA', 'VAT')`
- **Line 222-224** — `tx('Paiement 100% sécurisé', ...)`, `tx('Retour gratuit sous 14 jours', ...)`, `tx('Livré depuis la France', ...)`
- **Line 261** — `tx('Paiement échoué.', 'Payment failed.')`
- **Line 272** — `tx('Chargement du paiement sécurisé...', 'Loading secure payment...')`
- **Line 285** — `tx('Paiement crypté SSL 256-bit via Stripe...', ...)`
- **Line 301** — `tx('Retour', 'Back')`
- **Line 309, 311** — `tx('Traitement...', 'Processing...')` / `tx('Payer maintenant', 'Pay Now')`
- **Line 571, 576, 581** — payment method labels (Card/Apple Pay/Google Pay, Pay in Store, Cash on Delivery)
- **Line 652, 654, 710, 730, 751, 770** — OTP/account-creation error messages
- **Line 781-784** — empty-cart state (heading, desc, CTA)
- **Line 796, 801** — `tx('Retour', 'Back')` / `tx('Paiement sécurisé', 'Secure Checkout')`
- **Line 813-865** — shipping form section (heading, saved-addresses label, "Default" badge, all field labels: First/Last Name, Phone, Address, Postal Code, City, Country)
- **Line 882-991** — create-account/OTP flow (heading, verified state, verify-email heading, code-sent text, resend messaging, back-to-form link) — ~15 strings
- **Line 1007-1062** — password/confirm-password fields + validation + submit button — ~8 strings
- **Line 1078-1149** — delivery method section (heading, empty state, "business days", "Free", pickup store picker heading)
- **Line 1190-1257** — billing address section (heading, "same as shipping" checkbox, all field labels) — ~9 strings
- **Line 1275-1284** — `tx('Préparation...', ...)`, `tx('Paiement sécurisé', ...)`, `tx('Commande', ...)`
- **Line 1313-1386** — payment method section (heading, empty state, Stripe/Pay-in-Store/COD option labels+descriptions) — ~12 strings
- **Line 1404-1407** — terms checkbox text (4 fragments)
- **Line 1427-1428** — `tx('Confirmer la commande', 'Place Order')` / `tx('Continuer vers le paiement sécurisé', ...)`

### `src/app/account/page.tsx`
Mostly well-covered by real `t()` keys. Gaps:
- **Line 181** — MISSING — `"Upload failed"` (thrown error message)
- **Line 196** — MISSING — `"Failed to save changes."` (fallback error)
- **Line 385** — MISSING — `"France"` (static country value in address modal)
- **Line 520** — MISSING — `"Failed to load orders."` (fallback error)
- **Line 544** — MISSING — `"Failed to save address."` (fallback error)
- **Line 553** — MISSING — `"Failed to delete address."` (fallback error)
- **Line 559** — MISSING — `"Failed to update default address."` (fallback error)
- **Line 608** — MISSING — `"User"` (fallback first-name text in welcome heading)
- **Line 899** — MISSING — `"France"` (static country appended to displayed address)

### `src/components/ui/ProtectedRoute.tsx`
No missing/partial translations found (only a spinner icon, no text).

---

## Commerce category pages

### `src/app/machines/page.tsx`
Local `tx(fr, en)` helper — PARTIAL unless noted MISSING. (The `highlights` array at lines 96-99 is defined but never rendered in this file — dead code, listed for completeness.)
- **Lines 96-99** — PARTIAL — 4 highlight label/desc pairs (15 Bar Pressure, Built-in Grinder, Thermal Control, Auto-Clean)
- **Line 117** — PARTIAL — `tx('Équipement Premium', 'Premium Equipment')`
- **Line 120** — PARTIAL — `tx('Machines', 'Machines')` (identical fr/en, still only 2 of 5 languages)
- **Line 122** — MISSING — `"à Café"` — hardcoded, no wrapper at all, always French regardless of language
- **Lines 125-128** — PARTIAL — hero paragraph
- **Line 150** — PARTIAL — `alt={tx('Machine à café premium', 'Premium Coffee Machine')}`
- **Line 174** — PARTIAL — `tx('Filtres', 'Filters')`
- **Lines 188-192, 205-209** — PARTIAL — sort button + dropdown options (Relevance/Price asc/desc/Newest/Popularity) — appears twice
- **Line 236** — PARTIAL — `tx('Réinitialiser', 'Reset')`
- **Line 258** — PARTIAL — `tx('Toutes', 'All')`
- **Line 278** — PARTIAL — `tx('Toutes les Machines', 'All Machines')`
- **Line 281** — PARTIAL — `tx('résultats', 'results')`
- **Line 290** — PARTIAL — `tx('Aucune machine trouvée', 'No machines found')`
- **Line 293** — PARTIAL — `tx('Effacer les filtres', 'Clear filters')`

### `src/app/sweets/page.tsx`
Same `tx()` pattern throughout — all PARTIAL:
- **Lines 98-100** — 3 pairing label/desc pairs
- **Line 113** — `tx('Pour les fins Gourmets', 'For the Discerning Palate')`
- **Lines 116-118** — `tx('Gourman', 'Sweet')` / `tx('dises', 'Treats')`
- **Lines 121-124** — hero paragraph
- **Line 146** — `alt={tx('Gourmandises fines', 'Fine Sweet Treats')}`
- **Line 158** — `tx('Accords Parfaits', 'Perfect Pairings')`
- **Lines 193, 207-211, 224-228** — filter button + sort options (appears twice)
- **Line 255** — `tx('Réinitialiser', 'Reset')`
- **Line 277** — `tx('Tout', 'All')`
- **Line 297** — `tx('Toutes les Gourmandises', 'All Treats')`
- **Line 300** — `tx('résultats', 'results')`
- **Line 309** — `tx('Aucune gourmandise trouvée', 'No treats found')`
- **Line 312** — `tx('Effacer les filtres', 'Clear filters')`

### `src/app/accessories/page.tsx`
Same `tx()` pattern — all PARTIAL. (The `perks` array at lines 97-99 is defined but never rendered — dead code, listed for completeness.)
- **Lines 97-99** — 3 perk label/desc pairs
- **Line 111** — `tx('Complétez votre Setup', 'Complete Your Setup')`
- **Line 114** — `tx('Accessoires', 'Accessories')` (identical fr/en)
- **Lines 117-120** — hero paragraph
- **Line 142** — `alt={tx('Accessoires café', 'Coffee Accessories')}`
- **Lines 164, 178-182, 195-199** — filter button + sort options (appears twice)
- **Line 226** — `tx('Réinitialiser', 'Reset')`
- **Line 248** — `tx('Tout', 'All')`
- **Line 268** — `tx('Tous les Accessoires', 'All Accessories')`
- **Line 271** — `tx('résultats', 'results')`
- **Line 280** — `tx('Aucun accessoire trouvé', 'No accessories found')`
- **Line 283** — `tx('Effacer les filtres', 'Clear filters')`

### `src/app/wholesale/page.tsx`
No `useLanguage`/`tx()` mechanism anywhere — 100% hardcoded English.
- **Line 18** — MISSING — `"Partner With Us"` (heading)
- **Line 19** — MISSING — `"Premium wholesale coffee solutions for cafes, restaurants, and offices."`
- **Line 28** — MISSING — `"Elevate Your Coffee Program"` (heading)
- **Line 30** — MISSING — `"We offer customized wholesale programs..."`
- **Line 37-38** — MISSING — `"Freshly Roasted"` + desc (feature card)
- **Line 44-45** — MISSING — `"Expert Support"` + desc (feature card)
- **Line 51-52** — MISSING — `"Flexible Terms"` + desc (feature card)
- **Line 57** — MISSING — `"Inquire Now"` (CTA button)

### `src/app/visit-shop/page.tsx`
No `useLanguage`/`tx()` mechanism anywhere.
- **Line 37** — MISSING — `"Our Stores"` (heading)
- **Line 41** — MISSING — `"Visit ... and discover our exceptional selection in person."`
- **Line 59** — MISSING — `"No store locations available yet."`
- **Line 106** — MISSING — `"Get Directions"`
- **Line 123** — MISSING — `"Find Us"` (heading)
- **Line 124** — MISSING — `"Every cup tells a story. Come write yours at our store."`

### `src/components/ui/MobileCarousel.tsx`
- **Line 59** — MISSING — `aria-label="Previous"`
- **Line 69** — MISSING — `aria-label="Next"`
- **Line 104** — MISSING — `` aria-label={`Go to slide ${idx + 1}`} ``

### `src/components/ui/LoadMoreButton.tsx`
No `useLanguage`/`t()` usage. Machines/Sweets/Accessories pages all call this without passing `text`/`noMoreText`, so these hardcoded defaults are what actually ships.
- **Line 18** — MISSING — `text = "Load More"` (default prop)
- **Line 19** — MISSING — `noMoreText = "No more items to display"` (default prop)

### `src/components/ui/ProductSkeleton.tsx`
No missing/partial translations found (pure loading placeholder, no text).

### `src/components/ui/SectionRenderer.tsx`
No `useLanguage`/`t()` usage anywhere; all chrome labels below are static English (the dynamic `section.title`/items are backend data and correctly not flagged).
- **Line 53** — MISSING — `"Intensity"` (label)
- **Line 73** — MISSING — `"Taste Profile"` (heading)
- **Lines 75-79** — MISSING — TasteBar labels: `"Bitterness"`, `"Acidity"`, `"Roastiness"`, `"Body"`, `"Sweetness"`
- **Line 87** — MISSING — `"Aromatic Notes"` (label)
- **Line 145** — MISSING — `"⚠ Contains Allergens"` (label)
- **Line 196** — MISSING — `'✓ Yes' : '✕ No'` (boolean field rendering)

### `src/components/ui/RichText.tsx`
No missing/partial translations found (only parses/renders a dynamic `content` prop; its own markdown syntax markers aren't user-facing UI copy).

---

## Content pages

### `src/app/contact/page.tsx`
Local `t(fr, en)` helper — PARTIAL unless noted MISSING.
- **Line 142** — MISSING — `"Get Directions"` (StoreCard has no access to `t`/`language` at all)
- **Line 336** — MISSING — `"Email"` label (not wrapped)
- **Line 358** — MISSING — `"N° TVA"` label (French-only; would read "VAT No." in English)
- **Line 384** — MISSING — `placeholder="Marie"` (example first name)
- **Line 395** — MISSING — `placeholder="Dupont"` (example last name)
- **Line 399** — MISSING — `"Email"` form label (not wrapped)
- **Line 405** — MISSING — `placeholder="marie@exemple.fr"` (example email)
- **Line 194, 210, 212** — PARTIAL — form validation/rate-limit/generic error messages
- **Lines 227-234** — PARTIAL — hero eyebrow/heading/paragraph
- **Lines 251-254** — PARTIAL — store-locations eyebrow/heading
- **Line 271** — PARTIAL — `t('Tous', 'All')` filter label
- **Line 288** — PARTIAL — `t('Aucune boutique trouvée', 'No stores found')`
- **Lines 320-325** — PARTIAL — "Write to Us" heading + paragraph
- **Line 345** — PARTIAL — `t('Délai de réponse', 'Response time')`
- **Line 362** — PARTIAL — `t('Marque', 'Brand')`
- **Lines 374-430** — PARTIAL — full contact form labels/placeholders/options (First Name, Last Name, Subject + 5 options, Message + placeholder) — ~14 strings
- **Line 446** — PARTIAL — submit button (sent/default states)
- **Line 457** — PARTIAL — `t('Questions fréquentes', 'Frequently Asked Questions')`
- **Lines 33-50** — PARTIAL — `FAQS` array: 4 question/answer pairs, fr/en only
- **Lines 462-463** — PARTIAL — FAQ render via language ternary

### `src/app/faq/page.tsx`
No MISSING findings — everything routes through `tx()` or a ternary, all PARTIAL:
- **Lines 8-105** — `faqs` array: 4 category names + 12 Q&A pairs, fr/en only
- **Line 161** — `tx('Support', 'Support')`
- **Lines 164-171** — heading + subtitle
- **Line 180** — search placeholder
- **Line 192, 194** — no-results state + reset button
- **Line 209, 215-216** — category name + FAQ item via language ternary
- **Lines 229-244** — "Need help?" CTA block (eyebrow, heading, paragraph, link)

### `src/app/blog/page.tsx`
- **Line 40** — MISSING — `readTime: '5 min read'` (hardcoded, no `t()`)
- **Line 64** — MISSING — `"No articles yet"` (empty state)
(everything else correctly uses `t('blogTitle')`, `t('featuredEditorPick')`, `t('readArticle')`, `t('latestEntries')`, `t('all')`, `t('readMore')`, `t('loadMoreArticles')`, `t('youveReadEverything')`)

### `src/app/blog/[id]/page.tsx`
No missing/partial translations found (server component passthrough, no UI text).

### `src/app/blog/[id]/BlogPostClient.tsx`
Does not import `useLanguage` — no localization mechanism at all.
- **Line 50** — MISSING — `"Post Not Found"` (heading)
- **Line 51** — MISSING — `"Back to Journal"` (not-found state)
- **Line 66** — MISSING — `"Back to Journal"` (main view)
- **Line 119** — MISSING — `"This post has no content yet."`
- **Line 127** — MISSING — `"Share Article"`
- **Line 131** — MISSING — `"More Articles"`

### `src/app/our-origins/page.tsx`
Does not import `useLanguage` — entire page is English-only static content. **Largest single block of untranslated editorial copy on the site.**
- **Lines 21-22, 28-29, 35-36, 42-43, 49-50, 56-57, 63-64, 70-71, 77-78** — MISSING — 9 brand history paragraphs (Bristot, Lavazza, Carte Noire, Covim, Kimbo, Cafés Mambo, Ristora, Prolait, Delta Cafés), 40-75 words each
- **Lines 87-88, 93-94, 100-101** — MISSING — 3 Lavazza machine-system history paragraphs
- **Line 147** — MISSING — `"Our Heritage"` (eyebrow)
- **Line 150** — MISSING — `"Discover Our"` / `"Origins"` (hero heading)
- **Lines 152-156** — MISSING — hero intro paragraph
- **Lines 199-201** — MISSING — `"Lavazza Machine Systems"` (section label)

### `src/app/brew-guide/page.tsx`
Does not import `useLanguage` — all UI chrome hardcoded English. (Guide content itself — method/title/description/specs/steps — is dynamic API data, correctly not flagged.)
- **Line 64** — MISSING — `"No brew guides available"`
- **Line 80** — MISSING — `"Equipment & Technique"` (badge)
- **Line 86** — MISSING — `"The Science of / Extraction"` (hero heading)
- **Line 92** — MISSING — hero paragraph
- **Lines 127-130** — MISSING — spec labels: `"Grind Size"`, `"Ratio"`, `"Temperature"`, `"Dose"`
- **Line 154** — MISSING — `"Time:"` prefix
- **Line 159** — MISSING — `"Difficulty:"` prefix
- **Line 203** — MISSING — `"Step by Step Procedure"`
- **Line 229** — MISSING — `"Step"` prefix
- **Line 275** — MISSING — `"Pro Tip"` (heading)

### `src/components/ui/TestimonialsSection.tsx`
Imports `useLanguage` and correctly uses `t('customerStories')`, `t('testimonialFirst')`, `t('testimonialSecond')`. Other strings bypass `t()` entirely:
- **Line 118** — MISSING — `'Cafrezzo Selection'` (fallback product name)
- **Line 164** — MISSING — `"Rating"` (label)
- **Line 169** — MISSING — `"reviews"` word (`{count} reviews`)
- **Line 213** — MISSING — `"Verified Purchase"` (badge)
- **Line 272** — MISSING — fallback quote text (`` `Exceptional quality — rated ${rating} out of 5 stars.` ``)
- **Line 299** — MISSING — `"Cafrezzo Customer"` (label)

---

## Legal pages & icons

### `src/app/privacy/page.tsx`
- **Lines 9-66** — PARTIAL — 5 policy sections via `title`/`titleEn` + `content`/`contentEn` fields (Données collectées, Utilisation des données, Sécurité des données, Vos droits, Cookies)
- **Line 89** — PARTIAL — `tx('Légal', 'Legal')`
- **Line 92** — PARTIAL — H1 heading
- **Line 95** — PARTIAL — "Last updated" date line
- **Lines 103-106** — PARTIAL — GDPR intro paragraph
- **Line 149** — PARTIAL — `tx('Contact DPO', 'DPO Contact')`
- **Lines 151-154** — PARTIAL — DPO contact paragraph

### `src/app/terms/page.tsx`
- **Lines 8-58** — PARTIAL — 7 terms sections via `title`/`titleEn` + `body`/`bodyEn` fields (Objet, Commandes, Prix & Paiement, Livraison, Droit de rétractation, Responsabilité, Loi applicable & Juridiction)
- **Line 70** — PARTIAL — `tx('Légal', 'Legal')`
- **Line 73** — PARTIAL — H1 heading
- **Line 76** — PARTIAL — version-effective date line
- **Line 113** — PARTIAL — contact line

### `src/app/shipping/page.tsx`
All PARTIAL via `tx()`:
- **Line 51** — delivery estimate label
- **Line 60** — free-shipping badge
- **Lines 67-70** — 4 return-step title/desc pairs
- **Line 80** — eyebrow
- **Lines 83-90** — H1 heading + hero subtext
- **Line 98** — "Delivery Options" heading
- **Lines 148-151** — free-shipping banner
- **Line 163** — "Return Policy" heading
- **Lines 165-168** — return-policy subtext
- **Line 196** — "100% Secure Payment & Data" heading
- **Lines 198-201** — security paragraph

### `src/app/returns/page.tsx`
Heavily hardcoded — only a few top-of-page strings use `tx()`, the entire multi-step form is plain English with no mechanism at all.
- **Lines 12-18** — MISSING — `RETURN_REASONS` array (7 select options)
- **Line 47, 50-51, 54** — PARTIAL — eyebrow/heading/subtext via `tx()`
- **Line 72** — MISSING — "Preview Mode" banner text
- **Lines 79-82** — MISSING — step-indicator labels (Select Order, Details, Review, Confirmed)
- **Line 106** — PARTIAL — `tx('Sélectionner la commande', 'Select Order')` — inconsistent with plain-English step indicator for the same step at line 79
- **Lines 108-135** — MISSING — Step 1 form (Order Number label+placeholder, Reason for Return label+default option, Continue button)
- **Lines 143-180** — MISSING — Step 2 form (Description label+placeholder, Refund Method label+2 options, Back/Review Request buttons)
- **Lines 189-211** — MISSING — Step 3 review (Order/Reason/Details/Refund labels, Back/Submit Return buttons)
- **Lines 223-233** — MISSING — Confirmation step (heading, reference label, body text, My Orders/Contact Support links)
- **Lines 243-249** — MISSING — Return Policy sidebar (heading + 5 bullet points)

### `src/app/not-found.tsx`
No `useLanguage` used anywhere — 100% hardcoded English.
- **Lines 5-6** — MISSING — `metadata.title`/`metadata.description`
- **Line 17** — MISSING — `"Page Not Found"`
- **Line 20** — MISSING — `"The page you are looking for doesn't exist or has been moved."`
- **Line 26** — MISSING — `"Back to Home"`
- **Line 31** — MISSING — `"Browse Shop"`

### `src/app/error.tsx`
No `useLanguage` used anywhere — 100% hardcoded English.
- **Line 23** — MISSING — `"Oops!"`
- **Line 26** — MISSING — `"Something went wrong. Don't worry, our team has been notified."`
- **Line 33** — MISSING — `"Try Again"`
- **Line 41** — MISSING — `"Back to Home"`

### `src/components/icons/TikTokIcon.tsx`, `SocialIcons.tsx`, `CoffeeBeanIcon.tsx`, `CoffeeCupIcon.tsx`
No missing/partial translations found for any of the four — pure SVG icon components, all `aria-hidden="true"`, no visible or accessible text strings.

---

*Generated by an automated multi-pass audit (6 parallel passes covering all 60 live files). Line numbers reflect each file's state at the time of this audit — re-verify before fixing if the files have changed since.*
