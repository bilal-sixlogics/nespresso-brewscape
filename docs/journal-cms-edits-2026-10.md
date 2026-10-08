# Journal: CMS edits after the October 2026 SEO audit

**For:** whoever edits journal articles in the admin panel, plus one backend task.
**Date:** 8 October 2026

The storefront now fixes the most visible problems when it renders a page, so nothing below is an emergency. But the CMS still holds the raw text. Anything that reads the API directly, such as a future app or an export, still gets the uncleaned version. Several items also need facts only the business has.

## What the storefront now handles on its own

You don't need to do anything for these. They are listed so you know why the live page can differ from what the CMS shows.

| Problem in the CMS | What the storefront does now |
|---|---|
| ChatGPT citation tokens (`:contentReference[oaicite:5]{index=5}`, `:chatgpt-content-reference{index="2"}`) in 10 articles | Strips them before rendering |
| "La fiche produit explique que…" / "Sa fiche produit met en avant…" | Rewrites them as plain statements |
| Body opens by repeating the title as a heading | Drops that heading; the page title is the only H1 |
| Emoji at the start of headings (☕, 🌿, 👃…) | Strips them from headings only; emoji in body text stay |
| Product articles linking to `/en/shop/…` from French pages | Rewrites cafrezzo.com links to the article's own language |
| Every article published at /fr, /en, /de, /ru and /nl | Each article now lives at one URL, in its own language; other-language URLs redirect (308) |
| Numbered slugs (`-1` … `-5`) | Served under clean slugs; old URLs redirect (308). See the table below |
| Empty `meta_title` and `meta_description` on every post | Fallback titles and descriptions written to fit Google's limits (`src/lib/journal-seo.ts`). A value you enter in the CMS always wins |
| Posts under 300 words | `noindex` and left out of the sitemap; indexed again automatically once expanded past 300 words |
| "L'équipe Brewscape" byline | Displayed as "L'équipe Cafrezzo" |
| Category names in English on the French journal | Translated for display |

### Public slugs

| Old URL (CMS slug, still works and redirects) | New URL |
|---|---|
| `prix-du-cafe-professionnel-comment-calculer-le-cout-par-tasse-5` | `/fr/journal/prix-cafe-professionnel-cout-par-tasse` |
| `prix-machine-a-cafe-professionnelle-quel-budget-prevoir-4` | `/fr/journal/prix-machine-a-cafe-professionnelle` |
| `fournisseur-cafe-entreprise-quelle-machine-choisir-2` | `/fr/journal/fournisseur-cafe-entreprise` |
| `fournisseur-cafe-coffee-shop-comment-bien-choisir-3` | `/fr/journal/fournisseur-cafe-coffee-shop` |
| `fournisseur-cafe-restaurant-a-paris-comment-choisir-1` | `/fr/journal/fournisseur-cafe-restaurant-paris` |
| `meilleurs-grossistes-de-cafe-a-paris-guide-2026-pour-les-professionnels` | `/fr/journal/comment-choisir-grossiste-cafe-paris` |

**Do not rename these slugs in the CMS.** The mapping lives in `JOURNAL_SLUG_ALIASES` (`src/lib/seo-redirects.ts`). If you do rename one, delete its entry there in the same release, or the article will 404.

**For future articles:** set the slug by hand before publishing so the CMS never adds a number.

## 1. Remove the AI citation tokens from the CMS text

Search each body for `oaicite`, `contentReference` and `chatgpt-content-reference`, and delete each token. The surrounding sentence stays.

| Article | Tokens |
|---|---|
| Coffee Wholesale in Paris (English) | 13 |
| Lavazza Tales of Napoli | 7 |
| Bristot Bean To Cup | 6 |
| Delta Cafés Gran Crema | 6 |
| Carte Noire Café Moulu | 6 |
| Prix machine à café professionnelle | 3 |
| Fournisseur café restaurant | 2 |
| Fournisseur café entreprise | 2 |
| Prix du café professionnel | 2 |
| Fournisseur café coffee shop | 1 |

Also rewrite in the CMS:
- **Bristot:** "La fiche produit explique également que le concept…" → "Le concept…"
- **Carte Noire:** "Sa fiche produit met en avant un café…" → "C'est un café…"

**When pasting from ChatGPT in future,** use "Copy" on the response, not a selection of the rendered page, and search for `oaicite` before saving. Item 6 below makes the admin panel reject these tokens.

## 2. "Meilleurs grossistes" → "Comment choisir un grossiste de café à Paris"

The storefront already shows the new headline and meta. To make the CMS match:

- **Title:** `Comment choisir un grossiste de café à Paris`
- **Meta title:** `Comment choisir un grossiste de café à Paris`
- **Meta description:** `Torréfacteur, distributeur ou plateforme B2B ? Les critères pour comparer les grossistes de café à Paris : prix, livraison, machines et service.`
- **Body:**
  - Replace the first heading with the new title, or delete it.
  - Reword any sentence that promises a ranking ("les meilleurs grossistes", "notre classement") into criteria ("les critères pour comparer").
  - The FAQ "Quel est le meilleur grossiste café à Paris ?" can stay; its answer already says there is no single best.
- **Optional, but the strongest E-E-A-T fix:** add a short neutral table of supplier *types* (local roaster, multi-brand distributor, national B2B platform, cash & carry). Give each its typical minimum order, delivery lead time and machine offer. Keep Cafrezzo's own row factual.

## 3. "Prix machine à café professionnelle": add actual prices

The article's title asks "Quel budget prévoir ?" and the body gives no euro figure. Add a section like the one below.

- **Real figures:** the catalogue prices, including VAT, as of 8 October 2026. Check them before publishing.
- **Placeholders** marked `[À COMPLÉTER]` are for figures only the business has. Fill them in or delete the line. **Do not publish a placeholder.**

> ### Combien coûte une machine à café professionnelle ?
>
> Le budget dépend d'abord du type de machine et du volume servi chaque jour. Voici les fourchettes constatées dans notre catalogue (prix TTC) :
>
> | Type de machine | Usage typique | Prix chez Cafrezzo |
> |---|---|---|
> | Machine à capsules (Lavazza Blue, A Modo Mio, Delta Q) | Bureaux, petits volumes, jusqu'à ~30 tasses/jour | 135 € à 260 € (LB300 170 €, LB1050 260 €, LB1300 220 €, Idola 180 €) |
> | Machine à capsules grande capacité (Lavazza Blue LB2317) | Espaces de pause fréquentés | 950 € |
> | Machine automatique à grains | Bureaux et restaurants, 50 à 150 tasses/jour | [À COMPLÉTER : fourchette] |
> | Machine expresso traditionnelle 1 à 2 groupes | Cafés, restaurants, coffee shops | [À COMPLÉTER : fourchette] |
>
> À cela s'ajoutent l'entretien (détartrage, joints, révision) et les consommables. [À COMPLÉTER : coût annuel d'entretien typique, et si Cafrezzo propose location ou leasing, le loyer mensuel indicatif.]

Then make the FAQ answer quotable on its own. For example: *"Chez Cafrezzo, une machine à capsules professionnelle coûte de 135 € à 950 € TTC ; une machine automatique à grains de [X] à [Y] €."*

## 4. "Arabica ou Robusta": add figures and sources

AI answers to this query cite pages that carry numbers. Add a comparison table under the introduction.

**Have someone check every figure against the linked sources before publishing.** These are the commonly published ranges, not Cafrezzo measurements.

> | | Arabica | Robusta |
> |---|---|---|
> | Espèce botanique | *Coffea arabica* | *Coffea canephora* |
> | Teneur en caféine (grain vert) | environ 1,2 à 1,5 % | environ 2,2 à 2,7 % |
> | Altitude de culture | environ 600 à 2 000 m | du niveau de la mer à environ 800 m |
> | Part de la production mondiale | environ 55 à 60 % | environ 40 à 45 % |
> | Profil en tasse | doux, acidulé, aromatique | corsé, amer, crème épaisse |
>
> Sources : Organisation internationale du café (ico.org), World Coffee Research (worldcoffeeresearch.org), Specialty Coffee Association (sca.coffee).

Also:
- **Put a two-sentence direct answer** right under the title. For example: *"L'Arabica est plus doux et plus aromatique ; le Robusta contient environ deux fois plus de caféine et donne un café plus corsé. Les assemblages pour expresso associent souvent les deux."*
- **Expand the caffeine FAQ answer** beyond "En général, oui." into two full sentences that use the figures above.
- **Link the closing "Découvrez notre sélection"** to `/fr/cafe-en-grains`.

## 5. Authors, categories and old posts

**Authors.** Set every post's author to **Subhan W**, as decided on 8 October 2026. Posts still on stock personas:

| Persona | Posts |
|---|---|
| Chef Sophie | crème brûlée, cheesecake |
| Alex Chen | 5 coffees, milk foam |
| Marie Laurent | Viennese cafés, coffee bans |
| L'équipe Brewscape | winter sale, new year |

The Delta Cafés article has no author at all.

**Categories.** Add a category such as **Guides professionnels** and move these into it. They are currently filed under "Offers" or "Recipes":
- The B2B guides: restaurant, coffee shop, entreprise, prix café, prix machine, comment choisir, coffee wholesale.
- The four product articles: Delta, Bristot, Lavazza, Carte Noire. These could go under a "Nos cafés" category instead.

**The 8 pre-launch posts (95–151 words)** are now noindexed automatically. For each one, choose one of:
- **Expand** past 300 words with an original recipe and your own photo. It then returns to search automatically.
- **Leave it as it is**, readable on the site but not in Google.
- **Unpublish it.** Do this for `winter-sale-up-to-eur75-off-your-order`, an expired January promotion, and `happy-new-year-2026…`, which is credited to the wrong brand.

**Hotlinked images.** Replace featured images taken from other sites with your own uploads:
- mrcuisto.com (cheesecake)
- carolinescooking.com (crème brûlée)
- les-as-de-l-info.s3.amazonaws.com (new year)

Using them is a copyright risk, and they break if the other site moves them.

## 6. Backend: reject AI tokens when an article is saved

This needs the backend repository, which is not in this repo. In the blog post FormRequest (Laravel, `app/Modules/…`), add a closure rule on `body`, `excerpt`, `meta_title` and `meta_description`:

```php
use Closure;

$noAiTokens = function (string $attribute, mixed $value, Closure $fail) {
    if (is_string($value) && preg_match('/oaicite|contentReference|chatgpt-content-reference/i', $value)) {
        $fail(__('validation.ai_citation_markers'));
    }
};

// in rules():
'body' => ['required', 'string', $noAiTokens],
'excerpt' => ['nullable', 'string', $noAiTokens],
```

Add the message to `lang/{en,ar,fr}/validation.php`:

| File | Message |
|---|---|
| `en` | `'ai_citation_markers' => 'The text contains ChatGPT citation tokens (oaicite / contentReference). Remove them before saving.'` |
| `fr` | `'ai_citation_markers' => 'Le texte contient des marqueurs de citation ChatGPT (oaicite / contentReference). Supprimez-les avant d’enregistrer.'` |
| `ar` | `'ai_citation_markers' => 'يحتوي النص على علامات استشهاد من ChatGPT ‏(oaicite / contentReference). احذفها قبل الحفظ.'` |

## 7. Catalogue slugs (product team)

- `/fr/shop/lavazza-bean-to-cup-1kg` is a **Bristot** product. Rename it to `bristot-bean-to-cup-1kg` and add the old slug to the 301 map in `docs/product-slug-301-map.md`.
- The brand slug `/fr/marques/carte-noir` is missing its final "e". Rename it with a redirect.
