# Cafrezzo Rebrand — Black & Beige Artisanal Theme

**Status: Planning only. No code has been touched. This document is for review — implementation starts only after you approve/adjust it.**

---

## 1. What this rebrand actually changes

The current site is a green-on-white theme (`sb-green #3B7E5A` as the primary accent, white/off-white backgrounds throughout). The brief asks for a fundamentally different palette — black as the *primary* background (not just banners), beige for cards/surfaces, gold/caramel for CTAs and price, roasted brown for secondary text — plus serif display type, bean-shaped intensity indicators, cup-shaped separators, grain texture, and a restructured product page.

This is not a coat of paint. Green is currently the accent color on ~every interactive element (buttons, active filter chips, price text, badges, focus rings, category pills, the hero circle, the newsletter button). The brief's CTA/price color is gold, not green. **I'm treating this as green being retired as the primary accent**, with the open question below confirming that before implementation.

---

## 2. Current state (confirmed by direct code inspection)

| Area | File | Current value |
|---|---|---|
| Color tokens | `src/app/globals.css:1-13` (`@theme inline`) | `sb-green #3B7E5A`, `sb-dark #2C6345`, `sb-black #111111`, `sb-white #FFFFFF`, `sb-offwhite #FAFAF7`, `sb-border #E0E0E0` |
| Fonts | `src/app/layout.tsx:2-15` | Inter (`--font-inter`, sans) + Archivo Black (`--font-archivo`, display/headings). **No serif loaded anywhere.** |
| Intensity indicator | `src/components/ui/IntensityBar.tsx` (68 lines) | 13 vertical gradient bars (gold→red hue ramp), not beans. **A second, duplicate hand-rolled intensity meter also exists inline in `ProductCard.tsx:202-222`** — pre-existing inconsistency, worth fixing while we're in this code anyway. |
| Product card | `src/components/ui/ProductCard.tsx` (253 lines) | White card, `#f7f4f0` image zone, green price/CTA, green aromatic-note chips |
| Section separators | `src/app/globals.css:28-131` | "Torn-paper" SVG divider utility, 8 variants (`torn-paper-{white,green,offwhite,cream,black}-{up,down}`), used on 12+ pages. **This is the site's one and only separator convention today — no beige variant, no cup shape.** |
| Filters | `src/components/ui/FilterDrawer.tsx` (335 lines) | White panel, green active-state chips, gray-100 inactive states |
| Hero | `src/app/page.tsx:162-338` | White background, solid green circle behind a floating cup PNG, frosted-glass white cards |
| Shop page | `src/app/shop/page.tsx` (358 lines) | Green hero banner → white body → product grid, green active category pills |
| Product detail page | `src/app/shop/[slug]/ProductDetailPageClient.tsx` (547 lines) | `#FAF9F6` background throughout, two-column grid already exists but both columns are the same off-white — left is **not** beige, right is **not** black. Green accent blocks (image frame, price, add-to-cart, aromatic-notes card). One plain text line for shipping info — no trust-indicator component. |
| Footer newsletter | `src/components/layout/Footer.tsx:107-155` | Black footer, green submit button. A small "Free Shipping" mini-card exists (146-154) — closest existing thing to a trust badge, but it's not beige and not reused anywhere else. |
| Background texture | — | **Does not exist.** No grain/noise/paper effect anywhere in the codebase today. |
| Trust indicators (product page) | — | **Does not exist as a component.** One inline text line on the PDP, one inline mini-card in the footer. Needs to be built. |

---

## 3. Proposed design tokens

New CSS custom properties to add to `src/app/globals.css`'s `@theme inline` block, alongside (or replacing — see open question #1) the existing `sb-*` set:

```css
--color-ink:      #1A1614;  /* Deep Black — primary background, replaces sb-white as the page bg */
--color-sand:     #EDE3D3;  /* Beige — cards, newsletter banner, accents */
--color-gold:     #C9A05A;  /* Gold/Caramel — CTAs, prices, key accents */
--color-cocoa:    #8B5E34;  /* Roasted Brown — secondary text */
```

Naming: kept generic (`ink`/`sand`/`gold`/`cocoa`) rather than `sb-black-new` etc., since `sb-black` (`#111111`) already exists and is a *different, darker-but-not-quite-matching* black than the requested `#1A1614` — reusing the old name for a new hex would be confusing in a diff. Happy to rename to whatever convention you prefer before implementation.

**Explicitly prohibited going forward** (per the brief): cool grey (`gray-*` Tailwind utilities used throughout today — e.g. `gray-100` borders, `gray-400` secondary text, `gray-50` backgrounds — all need auditing), blue (none currently used, low risk), pure white (`#FFFFFF` / `sb-white` — currently the *primary background of the entire site* outside the black footer, so this is the single largest-surface-area change in the whole rebrand).

---

## 4. Typography plan

- Add a serif display font via `next/font/google` in `layout.tsx` — brief suggests Georgia or **Playfair Display**. Playfair Display is the stronger pick for an "artisanal premium" feel and pairs well with a warm palette; Georgia is a system-font fallback with zero visual distinction, not really "elegant serif" in practice. Recommend Playfair Display, need your confirmation.
- Replace `font-display` (currently Archivo Black, a bold grotesque sans) with the new serif for headings/section titles. This is a single token swap in `globals.css`, but touches every page since `font-display` is used everywhere for H1/H2/product names/prices.
- Section titles get letter-spacing + uppercase treatment (`tracking-[0.3em] uppercase` — the codebase already uses this pattern in places like the FAQ hero, so it's an existing convention to extend, not invent).
- Body copy (product descriptions, filters, general UI) stays sans-serif (Inter) — brief explicitly asks for sans-serif here, so no change to `--font-sans`.

---

## 5. Component-by-component changes

### IntensityBar (`src/components/ui/IntensityBar.tsx`)
Replace the 13-segment gradient bar with a coffee-bean glyph row (full bean = filled/gold, empty bean = outline/beige-on-black or brown-on-beige depending on context). Needs a custom inline SVG bean shape (same approach used recently for the TikTok social icon — no suitable bean icon exists in lucide-react). Scale: brief doesn't specify a max count; current system uses 1–13. Recommend keeping the 1–13 range but as beans instead of bars, OR compressing to a simpler 1–5 legend for readability — **open question #2**.
Also fixes the pre-existing bug: `ProductCard.tsx` has its own duplicate hand-rolled intensity meter instead of using this shared component — the rebrand touches both anyway, so this is a good time to consolidate to one component.

### ProductCard (`src/components/ui/ProductCard.tsx`)
Card background → beige (`sand`). Card sits on the new black page background, so the beige card becomes a clear beige-on-black element per the brief's "filters and cards should be beige elements on the black background." Price → gold. Aromatic-note chips, badges, and CTA button need re-coloring off green (badges like "NEW"/discount currently use `sb-black`/red — those can likely stay conceptually, just re-mapped to the new ink/gold palette). Intensity meter → shared bean component (see above).

### Separators (`globals.css` torn-paper utilities)
Add a new cup-shaped SVG divider utility (e.g. `cup-separator-{sand,ink}-{up,down}`) following the exact same pattern as the existing torn-paper set (repeating SVG data-URI background, 8 color/direction variants). This is additive — the torn-paper utilities can stay in the file for reference/rollback, with pages migrated to the new cup separator one at a time.

### FilterDrawer (`src/components/ui/FilterDrawer.tsx`)
Panel background → black (`ink`), currently white. Active-state chips → gold (currently green/black). Inactive chips → beige-on-black instead of gray-on-white. This is a full re-theme of every color in the file (line-by-line: header, section titles, chips, range slider track/fill, toggle switch, footer buttons) — not a token swap, since the current implementation uses explicit Tailwind gray/green utility classes rather than semantic tokens.

### Background texture (new)
No existing mechanism. Needs a subtle grain/noise overlay applied to black backgrounds — typically done via a repeating SVG `feTurbulence` filter or a small tiling PNG/WebP grain asset with `mix-blend-mode: overlay` and low opacity, applied as a `::before` pseudo-element or a shared wrapper component so it's not hand-applied per page. Recommend a shared `<GrainOverlay />` component or a `.bg-ink-grain` utility class in `globals.css`, applied wherever the black background is used (which, per the brief, is now *every page*, not just banners).

### Trust indicators (new component)
Doesn't exist today. Needs a new small component (icon + label, e.g. "Free delivery over €150" / "Roasted fresh, shipped within 48h") for the product page's bottom section. The footer's existing "Free Shipping" mini-card (`Footer.tsx:146-154`) is the closest visual reference and could be extracted into a shared component used in both places.

---

## 6. Page-by-page changes

### Homepage (`src/app/page.tsx`)
Background → black (page-wide, not just hero — this is the biggest single-page change). Hero imagery direction shifts to high-contrast/atmospheric (brief's photography requirement) instead of the current flat white/frosted-glass look. Solid green circle behind the hero cup → needs a new treatment (gold ring? removed in favor of dramatic lighting per the photography brief?) — **open question #3**. Section titles → serif + letter-spacing. Brands marquee (currently solid green band) needs re-coloring.

### Shop page (`src/app/shop/page.tsx`)
Brief says "maintain the current grid structure, apply the full theme" — this is the most mechanical page: swap the green hero banner → black/beige, swap active-pill green → gold, product grid inherits the re-themed `ProductCard`, filter button/sort dropdown/reset button re-colored, torn-paper divider → cup separator.

### Product detail page (`src/app/shop/[slug]/ProductDetailPageClient.tsx`)
Currently a two-column grid where both sides share one off-white background — structurally close to what's needed, but needs: left column background → beige (currently shares the page's `#FAF9F6`), right column background → black (currently also `#FAF9F6`), and a new full-width trust-indicator row at the bottom (currently just one plain text line). Green accent blocks (image frame, price, add-to-cart button, aromatic-notes card) all need re-mapping to gold/beige/black. This page has the most layout-level (not just color) work of the whole rebrand.

### Footer (`src/components/layout/Footer.tsx`)
Already black — stays black, now consistent with the rest of the site instead of being the one dark page element. Newsletter banner specifically → beige (currently a translucent-white-on-black input/button treatment, needs to literally become a beige block per the brief). Submit button → gold.

---

## 7. Photography direction (process note, not a code change)
The brief's lighting/packshot requirements (high-contrast, dark background, no flat-white packshots) are an asset/content requirement, not something I can implement in code — it depends on what product photography is available. Current product images (per `ProductCard`/PDP review) sit on a light `#f7f4f0` zone; if existing packshots are shot on white/light backgrounds, they may look inconsistent against the new dark UI until reshot or re-composited. Flagging this as a dependency, not blocking the UI work, but worth knowing before/during rollout.

---

## 8. Open questions (need your answer before implementation starts)

1. **Is `sb-green` fully retired**, or kept as a tertiary accent somewhere (e.g. an "in stock" indicator, a small detail)? The brief's CTA/price color is gold, and "strict prohibitions" doesn't mention green explicitly — but green is currently everywhere, so I want this explicit rather than guessing site-by-site.
2. **Intensity scale range**: keep the existing 1–13 scale (rendered as beans), or simplify to a shorter scale (e.g. 1–5) now that it's a visual bean legend rather than a numeric bar? 13 individual bean icons in a row may look cluttered at small card sizes.
3. **Hero's green circle replacement**: the brief wants high-contrast/atmospheric imagery — should the solid color circle behind the hero cup go away entirely in favor of lighting/photography doing that work, or keep a shape but in gold?
4. **Serif font**: confirm Playfair Display (recommended) vs. Georgia (brief's other suggestion, but a plain system font with much less "premium" impact) vs. something else.
5. **Scope check**: the brief covers Home, Shop, Product Detail, and Footer explicitly. Should this same theme extend to the other ~15 pages in the site (FAQ, Contact, Blog, Brew Guide, Machines, Accessories, Sweets, Wholesale, Returns, cart/checkout, account pages, the new Our Origins page, etc.), or is this rebrand intentionally scoped to just the four called-out areas for now, with the rest following later?
6. **Torn-paper separator**: brief says "replace standard line separators with cup-shaped separators" — does this mean the *existing torn-paper dividers* should become cup-shaped instead, or are these two different things (torn-paper stays as its own effect, and a new cup separator is added elsewhere)? I've assumed the former above.

---

## 9. Suggested rollout order (for when you approve — not started)

1. Design tokens + font loading (foundational, low risk, everything else depends on it)
2. Shared components: `IntensityBar` (beans), `ProductCard`, `FilterDrawer`, new `GrainOverlay`, new `TrustIndicators` — these are reused across pages, so fixing them first means page-level work is mostly composition
3. Cup-shaped separator utility (additive, no risk to existing torn-paper usages until pages are migrated)
4. Homepage
5. Shop page
6. Product detail page (largest structural change)
7. Footer newsletter banner
8. Everything else, if in scope per open question #5
