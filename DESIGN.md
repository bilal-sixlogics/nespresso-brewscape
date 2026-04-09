# Cafrezzo Design System

Complete design reference for the Cafrezzo website — a premium French coffee brand built with Next.js 16, React 19, Tailwind v4, and Framer Motion 12.

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Breakpoints](#breakpoints)
6. [Components](#components)
7. [Animations](#animations)
8. [Navigation Structure](#navigation-structure)
9. [Page Layouts](#page-layouts)
10. [CSS Tokens & Variables](#css-tokens--variables)
11. [Visual Effects](#visual-effects)
12. [States & Feedback](#states--feedback)
13. [Accessibility](#accessibility)

---

## Brand Identity

| Property       | Value                                          |
|----------------|------------------------------------------------|
| Brand Name     | Cafrezzo                                       |
| Display Name   | CAFREZZO                                       |
| Tagline (FR)   | Votre expert en café français                  |
| Tagline (EN)   | Cafrezzo – Premium Coffee Experience           |
| Domain         | cafrezzo.com                                   |
| Email          | contact@cafrezzo.com                           |
| Phone          | +33 1 39 85 85 65                              |
| Address        | 30 rue de l'Escouvrier, 95200 Sarcelles, France |
| Hours          | Monday–Friday, 9h–17h                          |

**Social Channels:** Facebook, Instagram, Twitter, YouTube

**Hero Copy:**
- Line 1: `CAF-`
- Line 2: `REZZO`
- Subtitle: "Discover the bold and sophisticated world of Cafrezzo premium coffee."

---

## Color Palette

### Primary Brand Colors

| Token              | CSS Variable            | Hex       | Usage                        |
|--------------------|-------------------------|-----------|------------------------------|
| `sb-green`         | `--color-sb-green`      | `#3B7E5A` | Primary brand color, CTAs, header background, accents |
| `sb-dark`          | `--color-sb-dark`       | `#2C6345` | Hover state for green elements |
| `sb-black`         | `--color-sb-black`      | `#111111` | Primary text, footer background |
| `sb-white`         | `--color-sb-white`      | `#FFFFFF` | Page backgrounds, card fills |
| `sb-offwhite`      | `--color-sb-offwhite`   | `#FAF8F3` | Warm cream background, section fills |
| `sb-border`        | `--color-sb-border`     | `#E0E0E0` | Dividers, input borders, card borders |

### Semantic / Accent Colors

| Purpose              | Tailwind Class   | Notes                              |
|----------------------|------------------|------------------------------------|
| Discount / Sale      | `red-500`        | Price reduction badges             |
| In-stock indicator   | `emerald-500`    | Pulsing dot animation              |
| Bestseller badge     | `amber-400`      | Star/badge treatment               |
| Neutral surfaces     | `gray-50` – `gray-500` | UI backgrounds, muted text   |

### Tailwind Usage Pattern

All brand colors are prefixed with `sb-` in Tailwind class names:

```
bg-sb-green       text-sb-black      border-sb-border
bg-sb-dark        text-sb-white      bg-sb-offwhite
```

---

## Typography

### Font Families

| Role    | Font          | Variable         | Source                 |
|---------|---------------|------------------|------------------------|
| Display | Archivo Black | `--font-archivo` | `next/font/google`     |
| Body    | Inter         | `--font-inter`   | `next/font/google`     |

- `font-display` → Archivo Black (headings, hero, brand name)
- `font-sans` → Inter (body copy, UI labels, buttons)

### Type Scale

| Variant   | Classes                                                                 | Use Case                        |
|-----------|-------------------------------------------------------------------------|---------------------------------|
| `massive` | `font-display text-7xl md:text-9xl font-black tracking-tighter uppercase` | Hero text, splash displays    |
| `h1`      | `font-display text-5xl md:text-7xl font-black tracking-tight`           | Page titles                     |
| `h2`      | `font-display text-4xl md:text-5xl font-bold tracking-tight`            | Section headings                |
| `h3`      | `font-display text-2xl md:text-3xl font-bold`                           | Subsection headings             |
| `h4`      | `font-display text-xl font-semibold`                                    | Card headings, panel titles     |
| `body`    | `font-sans text-base leading-relaxed`                                   | Paragraphs, descriptions        |
| `small`   | `font-sans text-sm font-medium text-brand-black/70`                     | Captions, fine print, labels    |

### Font Weights Used

- Black (`font-black`) — Display headings
- Bold (`font-bold`) — Subheadings, emphasis
- Semibold (`font-semibold`) — UI labels, card titles
- Medium (`font-medium`) — Secondary text
- Regular — Body copy

---

## Spacing & Layout

### Spacing Scale

Spacing follows Tailwind's default 4px base unit. Commonly used values:

| Scale  | Value  | Common Use                            |
|--------|--------|---------------------------------------|
| `1`    | 4px    | Tight icon gaps                       |
| `2`    | 8px    | Inner padding, small gaps             |
| `3`    | 12px   | Button padding Y, list item gaps      |
| `4`    | 16px   | Standard gap, card inner padding      |
| `5`    | 20px   | Section inner spacing                 |
| `6`    | 24px   | Card padding, grid gaps               |
| `8`    | 32px   | Section padding, large gaps           |
| `10`   | 40px   | Button padding X (large)              |
| `12`   | 48px   | Section spacing                       |
| `20`   | 80px   | Large vertical section margins        |
| `40`   | 160px  | Footer top padding                    |

### Container Widths

| Context          | Max Width         |
|------------------|-------------------|
| Page content     | `max-w-[1400px]`  |
| Header           | `max-w-[1600px]`  |
| Footer           | `max-w-[1400px]`  |
| Centered default | `mx-auto`         |

### Grid System

```
Mobile:       grid-cols-1
Tablet (md):  grid-cols-2
Desktop (lg): grid-cols-3
XL:           grid-cols-4
2XL:          grid-cols-5
```

Grid gaps: `gap-4`, `gap-6`, `gap-8` depending on density context.

Mobile carousels use `50vw` width per slide for partial-peek behavior.

---

## Breakpoints

| Prefix | Min Width | Target Devices               |
|--------|-----------|------------------------------|
| `sm:`  | 640px     | Large phones, landscape       |
| `md:`  | 768px     | Tablets                       |
| `lg:`  | 1024px    | Laptops, small desktops       |
| `xl:`  | 1280px    | Large desktops                |
| `2xl:` | 1536px    | Ultra-wide / TV-scale screens |

---

## Components

### Atoms

#### Button

File: [src/components/atoms/Button.tsx](src/components/atoms/Button.tsx)

| Variant     | Style                                         |
|-------------|-----------------------------------------------|
| `primary`   | `bg-sb-green text-white`, hover: dark green + scale |
| `secondary` | Outlined, transparent bg                      |
| `ghost`     | No border, minimal style                      |
| `outline`   | Border only, no fill                          |

| Size   | Height | Padding X | Shape          |
|--------|--------|-----------|----------------|
| `sm`   | h-9    | px-4      | `rounded-full` |
| `md`   | h-12   | px-8      | `rounded-full` |
| `lg`   | h-14   | px-10     | `rounded-full` |
| `icon` | h-10 w-10 | —      | `rounded-full` |

All buttons: `transition-all duration-300`

#### Typography

File: [src/components/atoms/Typography.tsx](src/components/atoms/Typography.tsx)

- Renders semantic HTML via `as` prop override
- 6 variants (see [Type Scale](#type-scale) above)
- Forward-ref supported

---

### Molecules

#### Accordion

File: [src/components/molecules/Accordion.tsx](src/components/molecules/Accordion.tsx)

- Header uses `h4` typography variant
- ChevronDown icon rotates 180° when open (`duration: 0.3s ease-in-out`)
- Content height animates from `0` to `auto` with opacity fade
- Dividers: `border-b` with `border-brand-beige`

#### Quantity Stepper

File: [src/components/molecules/QuantityStepper.tsx](src/components/molecules/QuantityStepper.tsx)

- Plus/Minus icon buttons (circular style)
- Hover: scale + shadow elevation
- Minimum quantity: 1

---

### UI Components

#### ProductCard

File: [src/components/ui/ProductCard.tsx](src/components/ui/ProductCard.tsx)

- Container: `rounded-2xl sm:rounded-[40px]` with `p-2.5 sm:p-4`
- Image: Hover scale `1.05`, easing `[0.25, 0.46, 0.45, 0.94]`
- Badges:
  - Discount: `bg-red-500 text-white`
  - NEW: `bg-sb-black text-white`
  - Bestseller: `bg-amber-400 text-black`
- Stock: Pulsing `emerald-500` dot
- Multi-image: Hover preview of alternate product images
- Entrance: `whileInView` fade-up with staggered delay

#### ProductDetailPanel

File: [src/components/ui/ProductDetailPanel.tsx](src/components/ui/ProductDetailPanel.tsx)

- Expandable accordion sections
- Variant/size selectors: `border-2` with selected state highlight
- Add to cart button: Dynamic states (idle → loading → redirecting)
- Quantity controls with shadow elevation

#### ProductSkeleton

File: [src/components/ui/ProductSkeleton.tsx](src/components/ui/ProductSkeleton.tsx)

- Shimmer animation overlay matches ProductCard proportions
- Used during data loading states

#### CartDrawer

File: [src/components/ui/CartDrawer.tsx](src/components/ui/CartDrawer.tsx)

- Slides in from right, full-height
- Backdrop: `backdrop-blur-sm`
- Spring: `stiffness: 300, damping: 32`
- Free shipping progress bar (fills toward €150 threshold)
- Promo code input with validation feedback
- Shipping selector: Standard (€5.99) / Express (€12.99)

#### LoginModal

File: [src/components/ui/LoginModal.tsx](src/components/ui/LoginModal.tsx)

- Centered dialog overlay
- OAuth provider buttons (green + black outline variants)
- Email/password fields: `rounded-xl`
- Form validation inline feedback

#### FilterDrawer

File: [src/components/ui/FilterDrawer.tsx](src/components/ui/FilterDrawer.tsx)

- Slides in from left or right
- Price range: Dual-handle slider with gradient fill
- Toggle switches: `rounded-full` pill style
- Filter pills: Inactive = outlined, Active = `bg-sb-green text-white`

#### IntensityBar

File: [src/components/ui/IntensityBar.tsx](src/components/ui/IntensityBar.tsx)

- 13 segments, filled up to intensity level
- Color gradient: HSL from gold to deep brown
- Sizes: `card` (compact), `panel` (medium), `page` (full)
- Entrance: staggered 0.04s delay per segment

#### MobileCarousel

File: [src/components/ui/MobileCarousel.tsx](src/components/ui/MobileCarousel.tsx)

- Mobile: Horizontal scroll with snap behavior
- Desktop: Switches to standard grid layout
- Navigation dots: Active = `w-5 h-2`, Inactive = `w-2 h-2` (pill style)
- Chevron prev/next buttons

#### TestimonialsSection

File: [src/components/ui/TestimonialsSection.tsx](src/components/ui/TestimonialsSection.tsx)

- Card grid: `rounded-[20px]`
- Star rating display
- Author name + avatar

---

### Organisms / Layout

#### Header

File: [src/components/layout/Header.tsx](src/components/layout/Header.tsx)

- Background: `bg-sb-green`
- Desktop: Two navigation rows (see [Navigation Structure](#navigation-structure))
- Search: Full-page overlay modal with `backdrop-blur-sm`, `rounded-[32px]` container
- Language toggle: Dropdown with flag emojis
- Cart icon: Badge shows item count
- Account button: Greeting on sign-in
- Mobile: Full-height drawer menu, large `text-3xl` nav links

#### Footer

File: [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx)

- Background: `bg-sb-black`
- Layout: 4-column grid on `lg` screens
- Newsletter: Input + subscribe button with loading/success states
- Social icons: `rounded-full`, white fill, hover → `sb-green`
- Links: Hover → `text-sb-green`
- Padding: `pt-40 pb-10`

#### Hero

File: [src/components/organisms/Hero.tsx](src/components/organisms/Hero.tsx)

- Height: `90vh`
- Centered flex layout
- Background: Decorative blurred gradient circles
- Brand name: Split across two lines with `massive` typography variant and negative margin overlap
- Scroll indicator at bottom

#### SiteChrome

File: [src/components/layout/SiteChrome.tsx](src/components/layout/SiteChrome.tsx)

Wraps every page:
```
PromoStrip  →  Header  →  <main>  →  Footer
```

#### SectionRenderer

File: [src/components/ui/SectionRenderer.tsx](src/components/ui/SectionRenderer.tsx)

- Dynamically renders page sections from CMS/config data
- Handles section type switching (Hero, Products, Testimonials, etc.)

---

## Animations

### Framer Motion Patterns

#### Entrance (whileInView)

```js
initial: { opacity: 0, y: -30 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.4, ease: 'easeInOut' }
viewport: { once: true, margin: '-80px' }
```

#### Stagger Children

```js
// Parent
transition: { staggerChildren: 0.08 }

// Child
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
```

#### Product Image Hover

```js
animate: { scale: isHovered ? 1.05 : 1 }
transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }
```

#### Drawer Slide-In (Spring)

```js
initial: { x: '100%' }
animate: { x: 0 }
transition: { type: 'spring', stiffness: 300, damping: 32 }
```

#### Accordion Open/Close

```js
initial: { height: 0, opacity: 0 }
animate: { height: 'auto', opacity: 1 }
transition: { duration: 0.3, ease: 'easeInOut' }
```

#### Icon Rotate (Chevron)

```js
animate: { rotate: isOpen ? 180 : 0 }
transition: { duration: 0.2 }
```

#### IntensityBar Segment Stagger

```js
transition: { delay: index * 0.04, duration: 0.3 }
```

### CSS Animations (globals.css)

| Animation     | Behavior                              | Duration |
|---------------|---------------------------------------|----------|
| `shimmer`     | Horizontal sweep for skeleton screens | Looping  |
| `marquee-ltr` | Brand logos scroll left-to-right      | 40s loop |
| `marquee-rtl` | Brand logos scroll right-to-left      | 35s loop |

All marquee animations pause on hover (`animation-play-state: paused`).

### Duration Reference

| Context                 | Duration   |
|-------------------------|------------|
| Icon state change       | 0.2s       |
| Hover transitions       | 0.3s       |
| Content reveals         | 0.4–0.55s  |
| Drawer/modal entry      | Spring     |
| Page section entrances  | 0.4s + stagger |

---

## Navigation Structure

### Desktop — Two-Row Header

**Top Row**
| Label     | Path          |
|-----------|---------------|
| Home      | `/`           |
| Machines  | `/machines`   |
| Sweets    | `/sweets`     |
| Contact   | `/contact`    |

**Bottom Row**
| Label       | Path            |
|-------------|-----------------|
| Shop        | `/shop`         |
| Accessories | `/accessories`  |
| Brew Guide  | `/brew-guide`   |
| Blog        | `/blog`         |

### Mobile — Drawer Menu

- Full-height panel drawer
- Sections: "Discover" + "Shop"
- Nav links: `text-3xl`, stacked vertically
- Language toggle at drawer footer

### Additional Routes

| Path                   | Description             |
|------------------------|-------------------------|
| `/account`             | User account dashboard  |
| `/wishlist`            | Saved items             |
| `/checkout`            | Checkout flow           |
| `/order-success`       | Post-purchase success   |
| `/order-failed`        | Payment failure         |
| `/shop/[slug]`         | Product detail page     |
| `/blog/[id]`           | Blog post               |
| `/faq`                 | FAQ                     |
| `/shipping`            | Shipping info           |
| `/returns`             | Returns policy          |
| `/privacy`             | Privacy policy          |
| `/terms`               | Terms & conditions      |
| `/loyalty`             | Loyalty program         |
| `/notifications`       | Notification settings   |

---

## Page Layouts

### Universal Page Wrapper

Every page is wrapped in `SiteChrome`:

```
┌────────────────────────────────┐
│  PromoStrip (announcement)     │
├────────────────────────────────┤
│  Header (bg-sb-green)          │
├────────────────────────────────┤
│  <main> (min-h-screen)         │
│    Page content here           │
├────────────────────────────────┤
│  Footer (bg-sb-black)          │
└────────────────────────────────┘
```

### Section Patterns

| Section              | Pattern                                             |
|----------------------|-----------------------------------------------------|
| Hero                 | 90vh, centered, split display text, blurred BG     |
| Product Grid         | Responsive grid with ProductCard components         |
| Featured Machines    | Carousel with title + subtitle + CTA               |
| Brands Marquee       | Auto-scrolling logo strip with fade-edge masks     |
| Testimonials         | Card grid with star ratings                         |
| Section Transitions  | SVG "torn paper" dividers between sections          |

### Torn Paper Dividers

CSS classes for seamless section joins:

| Class                      | Use                              |
|----------------------------|----------------------------------|
| `.torn-paper-white-up`     | White section top edge           |
| `.torn-paper-white-down`   | White section bottom edge        |
| `.torn-paper-green-up`     | Green section top edge           |
| `.torn-paper-green-down`   | Green section bottom edge        |
| `.torn-paper-black-up`     | Black section top edge           |
| `.torn-paper-cream-down`   | Cream section bottom edge        |

All use SVG background patterns at `300px × 30px` with `-29px` negative offset for seamless joins.

---

## CSS Tokens & Variables

### Color Tokens

```css
--color-sb-green:    #3B7E5A;
--color-sb-dark:     #2C6345;
--color-sb-black:    #111111;
--color-sb-white:    #FFFFFF;
--color-sb-offwhite: #FAF8F3;
--color-sb-border:   #E0E0E0;
```

### Typography Tokens

```css
--font-sans:    var(--font-inter);
--font-display: var(--font-archivo);
```

### Semantic Tokens

```css
--background:   var(--color-sb-white);
--foreground:   var(--color-sb-black);
```

### Utility Classes

| Class              | Behavior                                        |
|--------------------|-------------------------------------------------|
| `.no-scrollbar`    | Hides scrollbar while preserving scroll ability |
| `.torn-paper-*`    | SVG torn-paper section dividers (6 variants)    |

---

## Visual Effects

### Shadows

| Class         | Use                                     |
|---------------|-----------------------------------------|
| `shadow-sm`   | Subtle card lift                        |
| `shadow-md`   | Dropdowns, popovers                     |
| `shadow-lg`   | Drawers, modals                         |
| `shadow-2xl`  | Elevated floating elements              |

### Border Radius

| Context           | Radius                       |
|-------------------|------------------------------|
| Buttons           | `rounded-full`               |
| Cards             | `rounded-2xl sm:rounded-[40px]` |
| Inputs            | `rounded-xl`                 |
| Search container  | `rounded-[32px]`             |
| Modal             | `rounded-[24px]`             |
| Testimonial cards | `rounded-[20px]`             |
| Social icons      | `rounded-full`               |

### Backdrop Effects

- Modals & overlays: `backdrop-blur-sm`
- Marquee edge fade: Linear gradient mask to transparent

### Gradients

- Hero background: Decorative blurred radial gradient circles
- IntensityBar: HSL color sweep from gold (`hsl(45, 85%, 55%)`) to deep brown (`hsl(15, 60%, 30%)`)

---

## States & Feedback

### Interactive States

| State    | Style                                        |
|----------|----------------------------------------------|
| Hover    | `scale-105` or color shift to `sb-dark`      |
| Active   | `scale-95`                                   |
| Disabled | `opacity-50 pointer-events-none`             |
| Focus    | `outline: 2px solid var(--color-sb-green) outline-offset: 2px` |

### Loading States

- Skeleton screens with shimmer animation
- Spinner: Lucide `Loader2` with `animate-spin`
- Button loading: Text changes + spinner replaces icon

### Button State Flow (Add to Cart)

```
Idle  →  Loading (spinner)  →  Redirecting  →  Complete
```

### Form Validation

- Error: Red text below field, red border on input
- Success: Green checkmark icon, border turns green
- Inline messaging, no page reload

### Promotional System

| Promo         | Type          | Value               |
|---------------|---------------|---------------------|
| Sitewide      | Auto-applied  | 10% off all orders  |
| CAFREZZO20    | Promo code    | 20% off             |
| BIENVENUE     | Promo code    | €10 off             |

Free shipping threshold: **€150**

---

## Accessibility

### Focus Management

```css
:focus-visible {
  outline: 2px solid var(--color-sb-green);
  outline-offset: 2px;
}
```

### Touch Targets

- Minimum interactive target size: **44×44px** on mobile
- Icon buttons: `h-10 w-10` minimum
- Navigation links: Full-width tap areas on mobile

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

All Framer Motion animations respect this preference.

### Semantic HTML

- `Typography` component renders correct HTML elements (`h1`–`h4`, `p`, `span`)
- Navigation uses `<nav>` with `aria-label`
- Modals use `role="dialog"` and `aria-modal="true"`
- Images include descriptive `alt` attributes
- Form inputs have associated `<label>` elements

### Color Contrast

- Primary green `#3B7E5A` on white: Meets WCAG AA (4.5:1+ ratio)
- White text on `#3B7E5A` header: Meets WCAG AA
- All body text on white/offwhite backgrounds: Meets WCAG AA

---

## Tech Stack Reference

| Layer           | Technology                     |
|-----------------|-------------------------------|
| Framework       | Next.js 16 (App Router)        |
| UI Library      | React 19                       |
| Styling         | Tailwind CSS v4                |
| Animations      | Framer Motion 12               |
| State           | Zustand                        |
| Language        | TypeScript                     |
| Icons           | Lucide React                   |
| Fonts           | next/font/google (Inter + Archivo Black) |
