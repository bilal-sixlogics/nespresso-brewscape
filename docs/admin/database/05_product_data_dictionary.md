# Product Data Dictionary
Complete reference for every attribute a product can have on Cafrezzo, why it exists, and which product types use it.

---

## Universal Fields (All Products)
These fields exist on **every** product regardless of type.

| Field | What It Is | Why We Use It |
|-------|-----------|---------------|
| **Name (FR)** | The primary product name in French | Default display language |
| **Name (EN)** | English translation of the name | Shown when user switches to EN |
| **Tagline** | Short punchy marketing line (e.g., "Bold. Intense. Unforgettable.") | Appears under the name on PDP |
| **Description (FR/EN)** | Markdown long-form text about the product | Story, origin, tasting notes in paragraph form |
| **Base Price** | The standard unit price in € | Shown on product card and PDP |
| **Original Price** | The "was" price — used to compute discount % | Crossed out next to current price |
| **Images** | Array of image URLs (hero + gallery) | Hover cycling on cards, gallery on PDP |
| **Category** | Which section it belongs to | Routing, filtering, admin organisation |
| **Tags** | Marketing labels, e.g., `best-seller`, `new`, `eco-friendly`, `organic` | Badges on cards, filter chips on shop page |
| **SKU** | Unique internal stock-keeping identifier | Backend inventory tracking |
| **Slug** | URL-friendly ID, e.g., `lavazza-crema-1kg` | PDP URL: `/shop/lavazza-crema-1kg` |
| **Is Featured** | Admin toggle — appears in homepage featured section | Homepage carousel control |
| **Is Published** | Admin toggle — whether it's visible on the store | Draft products stay hidden |
| **In Stock** | Boolean — shows "In Stock" / "Out of Stock" badge | Blocks "Add to Cart" if false |

---

## Sale Units / Formats
> **What is "Format"?** A format (also called a Sale Unit) is a **purchasing option** for the same product at different pack sizes or configurations. It answers the question: *"How much do you want to buy?"*

> **When to use it:** When a product can be sold in multiple quantities (e.g., 10 capsules vs. 50 capsules vs. 100 capsules). Also used for weight variants on ground coffee.

> **Why it matters:** Instead of creating 3 separate products, one product has 3 formats, each with its own price, SKU, and stock level. The customer picks their format before adding to cart.

### Sale Unit Sub-fields
| Sub-field | Example |
|-----------|---------|
| **Label (FR)** | "Boîte de 10 capsules" |
| **Label (EN)** | "Box of 10 capsules" |
| **Pack Size** | `10` (how many units in this format) |
| **Price** | `€5.99` (format-specific, overrides base price) |
| **Original Price** | `€8.99` (for showing a discount on this format) |
| **SKU Variant** | `LAV-CAP-10` |
| **Stock Quantity** | `450` |
| **Is In Stock** | `true/false` |

### Format Examples by Product Type
| Product | Formats |
|---------|---------|
| Nespresso Capsule | Box of 10 · Box of 50 · Box of 100 |
| Ground Coffee (Bag) | 250g · 500g · 1kg |
| Coffee Machine | Single unit only (no format variants) |
| Accessory (Cups) | Set of 2 · Set of 6 |
| Sweet / Treat | 100g · 200g · Gift Box |

---

## ☕ Coffee Beans & Capsules — Specific Fields

### Intensity
- **What:** A number from **1 to 13** rating the overall strength/power of the coffee. Used as a visual bar.
- **When:** All capsules and beans — never on machines or sweets.
- **Sub-options:** Integer value 1–13. Displayed as a filled progress bar.
- **Admin UI:** Slider or number input (1–13).

### Aromatic Notes (Taste Tags)
- **What:** Short descriptive flavour keywords that profile the coffee's aroma.
- **When:** Coffee beans and capsules only.
- **Why:** Helps customers quickly understand the flavour without reading the full description.
- **Sub-options (curated list, admin can add more):**
  - `Fruity` · `Citrus` · `Winey` · `Berry`
  - `Chocolate` · `Caramel` · `Hazelnut` · `Vanilla`
  - `Earthy` · `Woody` · `Smoky` · `Spicy`
  - `Floral` · `Jasmine` · `Bergamot`
  - `Cereal` · `Toasted` · `Nutty`

### Taste Profile (5-axis chart)
- **What:** Five sliders (each 1–5) that map the coffee's characteristics visually as bars on the PDP.
- **When:** Coffee beans and capsules only.
- **Why:** Allows a visual, at-a-glance comparison between two coffees — much faster than reading prose.

| Axis | What It Measures | Range |
|------|-----------------|-------|
| **Bitterness** | How bitter/sharp the finish is | 1 (mild) → 5 (very bitter) |
| **Acidity** | Brightness, tartness, citrus feel | 1 (flat) → 5 (very bright) |
| **Roastiness** | Dark/smoky roasted character | 1 (light) → 5 (dark and burnt) |
| **Body** | Weight and thickness in the mouth | 1 (watery) → 5 (full, syrupy) |
| **Sweetness** | Natural sweetness perceived | 1 (none) → 5 (very sweet) |

### Brewing Tips
- **What:** A structured list of brewing parameters.
- **When:** Coffee beans and capsules.
- **Why:** Helps enthusiasts get the perfect cup.
- **Sub-fields (each is a text field):**

| Parameter | Example Value |
|-----------|--------------|
| Water Temperature | `90–96°C` |
| Coffee-to-Water Ratio | `1:2 (coffee:water)` |
| Extraction Time | `25–30 seconds` |
| Grind Size | `Fine-Medium` |
| Recommended Cup | `Espresso / Ristretto / Lungo` |

### Key Features (Coffee)
- **What:** A freeform bullet list of key product facts.
- **When:** Coffee beans and capsules.
- **Sub-options (dynamic, admin adds/removes):**
  - Intensity (e.g., `Intensity 11/13`)
  - Blend type (e.g., `Arabica-Robusta Blend`, `100% Arabica`)
  - Roast level (e.g., `Dark Roast`, `Medium Roast`)
  - Origin (e.g., `Brazil & Uganda`, `Ethiopia`)
  - Process (e.g., `Washed & Natural`, `Sun-dried`)
  - Compatibility (e.g., `Nespresso® Original Compatible`)
  - Certification (e.g., `Rainforest Alliance`, `Fair Trade`, `Organic`)

### Origin
- **What:** Country or region of origin.
- **When:** Coffee only.
- **Examples:** `Ethiopia`, `Colombia`, `Brazil & Uganda`, `Guatemala`

### Roast Level
- **What:** Categorised roast descriptor.
- **When:** Coffee only.
- **Options:** `Light` · `Medium` · `Medium-Dark` · `Dark` · `Extra Dark`

### Cup Size Compatibility
- **What:** Which cup sizes/brewing styles this coffee is ideal for.
- **When:** Nespresso capsules mainly.
- **Options:** `Ristretto (25ml)` · `Espresso (40ml)` · `Lungo (110ml)` · `Americano`

---

## 🤖 Coffee Machines — Specific Fields

### Machine Specifications
- **What:** Technical stats for the machine.
- **When:** All coffee machine products.
- **Why:** Purchasing a machine is a considered decision — specs are key.

| Spec | Example |
|------|---------|
| **Water Tank Capacity** | `1.2 L` |
| **Pressure** | `19 Bar` |
| **Power** | `1260W` |
| **Warm-up Time** | `25 seconds` |
| **Weight** | `3.0 kg` |
| **Dimensions (W×D×H)** | `11.1 × 23.5 × 32.6 cm` |
| **Colour Options** | `Matte Black · Titanium · Red` |
| **Capsule Compatibility** | `Nespresso® Original Line` |
| **Milk System** | `Built-in frother · Aeroccino included · None` |

### Key Features (Machines)
Examples of dynamic bullet points:
- `Auto-Off after 9 minutes`
- `Programmable cup sizes`
- `Energy-saving mode`
- `Compatible with all Original Line capsules`
- `Detachable water tank`

---

## 🎁 Accessories — Specific Fields

### Accessory Specifications
| Spec | Example |
|------|---------|
| **Material** | `Stainless Steel`, `Ceramic`, `Borosilicate Glass`, `BPA-Free Plastic` |
| **Capacity / Dimensions** | `150ml`, `30cm × 15cm`, `Set of 6` |
| **Colour** | `Matte Black`, `White` |
| **Compatibility** | `All Nespresso machines`, `Universal` |
| **Dishwasher Safe** | `Yes / No` |
| **Warranty** | `2 years` |

### Key Features (Accessories)
Examples:
- `Double-wall insulation keeps coffee hot 4× longer`
- `Non-slip base`
- `Ergonomic handle`
- `Stackable design`

---

## 🍫 Sweets & Gourmandises — Specific Fields

### Sweet / Food Specifications
| Spec | Example |
|------|---------|
| **Ingredients** | `Dark chocolate (72%), cocoa butter, sugar...` |
| **Net Weight** | `100g`, `200g`, `Gift Box 350g` |
| **Allergens** | `Contains: Milk, Gluten, Nuts` |
| **Storage Instructions** | `Store in a cool dry place below 20°C` |
| **Shelf Life / Best Before** | `6 months from production` |
| **Country of Origin** | `Belgium`, `Switzerland` |
| **Pairing Suggestions** | `Best enjoyed with an Espresso or Lungo` |

---

## Dynamic Fields Summary — Admin Control Matrix

| Field | Coffee | Machine | Accessory | Sweet |
|-------|--------|---------|-----------|-------|
| Intensity (1–13) | ✅ | ❌ | ❌ | ❌ |
| Aromatic Notes | ✅ | ❌ | ❌ | ❌ |
| Taste Profile Bars | ✅ | ❌ | ❌ | ❌ |
| Brewing Tips | ✅ | ❌ | ❌ | ❌ |
| Roast Level | ✅ | ❌ | ❌ | ❌ |
| Origin | ✅ | ❌ | ❌ | ❌ |
| Cup Compatibility | ✅ | ❌ | ❌ | ❌ |
| Machine Specs | ❌ | ✅ | ❌ | ❌ |
| Capsule Compatibility | ❌ | ✅ | ✅ | ❌ |
| Material / Dimensions | ❌ | ❌ | ✅ | ❌ |
| Ingredients / Allergens | ❌ | ❌ | ❌ | ✅ |
| Pairing Suggestions | ❌ | ❌ | ❌ | ✅ |
| Formats / Sale Units | ✅ | ❌ | ✅ | ✅ |
| Key Features (bullets) | ✅ | ✅ | ✅ | ✅ |
| Tags | ✅ | ✅ | ✅ | ✅ |
| Images (gallery) | ✅ | ✅ | ✅ | ✅ |
| Description FR/EN | ✅ | ✅ | ✅ | ✅ |
| Price / Discount | ✅ | ✅ | ✅ | ✅ |
