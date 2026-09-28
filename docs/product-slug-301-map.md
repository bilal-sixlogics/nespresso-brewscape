# Product slug repair — 301 map

Generated from the live catalogue (`/api/v1/products?per_page=500`).

## Why this is a backend fix, not a frontend one

The slugifier strips accented characters instead of transliterating them, so
`café` becomes `caf-`. The fix belongs where slugs are minted.

A frontend workaround was built and then discarded, for a measured reason:
re-deriving slugs from the current product name would change **100 of 113**
URLs, because 28 products have been *renamed* since their slug was created.
Only 72 are the accent bug. Churning 88% of product URLs to fix 64% of them
is a bad trade, and the frontend cannot tell the two cases apart reliably.

So: apply the 72 below, and treat the 28 renames as a separate decision.

## A. Accent-collapse only — safe to rewrite (72 URLs)

Transliterate (`é`→`e`, `à`→`a`, `ç`→`c`, `ã`→`a`, `ô`→`o`, `û`→`u`, `°`→``),
then 301 old → new.

| Current (broken) | Corrected |
|---|---|
| `bristot-americano-dark-roast` | `bristot-americano-dark-roast-1kg` |
| `bristot-bio` | `bristot-bio-1kg` |
| `bristot-classico` | `bristot-classico-1kg` |
| `bristot-decaff-moulu` | `bristot-decaffe-moulu-250g` |
| `bristot-espresso-pro` | `bristot-espresso-pro-1kg` |
| `bristot-speciale` | `bristot-speciale-1kg` |
| `bristot-sucre-en-b-chettes-1000-pcs` | `bristot-sucre-en-buchettes-1000-pcs` |
| `bristot-tiziano` | `bristot-tiziano-2kg` |
| `caprimo-noisette-boisson-instantan-e` | `caprimo-noisette-boisson-instantanee-1kg` |
| `caprimo-vanille-boisson-instantan-e` | `caprimo-vanille-boisson-instantanee-1kg` |
| `carte-noire-caf-moulu-250-g` | `carte-noire-cafe-moulu-250g` |
| `carte-noire-caf-soluble-classique-500-g` | `carte-noire-cafe-soluble-classique-500g` |
| `carte-noire-caf-soluble-en-sticks-80-sticks` | `carte-noire-cafe-soluble-en-sticks-80-sticks` |
| `carte-noire-classique-n-5-format-60` | `carte-noire-classique-n5-format-60-pods` |
| `carte-noire-compatible-nespresso-espresso-classique` | `carte-noire-compatible-nespresso-espresso-classique-x30` |
| `carte-noire-compatible-nespresso-espresso-intense` | `carte-noire-compatible-nespresso-espresso-intense-x30` |
| `carte-noire-compatible-nespresso-lungo-classique` | `carte-noire-compatible-nespresso-lungo-classique-x30` |
| `carte-noire-cors-n-7-format-60` | `carte-noire-corse-n7-format-60-pods` |
| `carte-noire-espresso-n-8-format-60` | `carte-noire-espresso-n8-format-60-pods` |
| `delta-caf-s-expresso-bar-1kg` | `delta-cafes-expresso-bar-1kg` |
| `delta-q-machine-iconiq-blanche` | `delta-q-180-capsules-machine-iconiq-blanche-offertes` |
| `delta-q-machine-iconiq-bleu` | `delta-q-180-capsules-machine-iconiq-bleue-offertes` |
| `delta-q-machine-iconiq-noire` | `delta-q-180-capsules-machine-iconiq-noire-offertes` |
| `delta-q-qalidus-n-10-pack-80-capsules` | `delta-q-qalidus-n10-pack-80-capsules` |
| `delta-q-qharacter-n-9-pack-80-capsules` | `delta-q-qharacter-n9-pack-80-capsules` |
| `lavazza-a-modo-mio-delizioso` | `lavazza-a-modo-mio-delizioso-x16` |
| `lavazza-a-modo-mio-intenso` | `lavazza-a-modo-mio-intenso-x16` |
| `lavazza-a-modo-mio-lungo-dol` | `lavazza-a-modo-mio-lungo-dolce-x16` |
| `lavazza-a-modo-mio-passionale` | `lavazza-a-modo-mio-passionale-x16` |
| `lavazza-a-modo-mio-soave` | `lavazza-a-modo-mio-soave-x16` |
| `lavazza-amandes-cacaot-es-500-pcs` | `lavazza-amandes-cacaotees-500-pcs` |
| `lavazza-biscuit-chocolat-p-pites-de-caramel-400-pcs` | `lavazza-biscuit-chocolat-pepites-de-caramel-400-pcs` |
| `lavazza-biscuit-sp-culos-400-pcs` | `lavazza-biscuit-speculoos-400-pcs` |
| `lavazza-blue-tales-of-milano` | `lavazza-capsules-blue-tales-of-milano-x100` |
| `lavazza-blue-tales-of-napoli` | `lavazza-capsules-blue-tales-of-napoli-x100` |
| `lavazza-blue-tales-of-roma` | `lavazza-capsules-blue-tales-of-roma-x100` |
| `lavazza-blue-tales-of-venezia` | `lavazza-capsules-blue-tales-of-venezia-x100` |
| `lavazza-blue-tales-of-venezia-lungo` | `lavazza-capsules-blue-tales-of-venezia-lungo-x100` |
| `lavazza-capsule-blue-choco-fondente` | `lavazza-capsule-blue-choco-fondente-x50` |
| `lavazza-capsules-blue-amabile-lungo` | `lavazza-capsules-blue-amabile-lungo-x100` |
| `lavazza-capsules-blue-bevanda-bianca` | `lavazza-capsules-blue-bevanda-bianca-x50` |
| `lavazza-capsules-blue-caff-crema` | `lavazza-capsules-blue-caffe-crema-x100` |
| `lavazza-capsules-blue-intenso-espresso` | `lavazza-capsules-blue-intenso-espresso-x100` |
| `lavazza-capsules-blue-la-reserva-de-tierra-humeco-bio-organic` | `lavazza-capsules-blue-la-reserva-de-tierra-humeco-bio-organic-x100` |
| `lavazza-capsules-blue-th-au-citron` | `lavazza-capsules-blue-the-au-citron-x50` |
| `lavazza-capsules-blue-trastevere` | `lavazza-capsules-blue-trastevere-x100` |
| `lavazza-capsules-espresso-point-crema-aroma-espresso` | `lavazza-capsules-espresso-point-crema-aroma-espresso-x100` |
| `lavazza-crema-e-aroma` | `lavazza-crema-e-aroma-1kg` |
| `lavazza-decaf` | `lavazza-decaf-250g` |
| `lavazza-di-pi-chocolat-en-poudre` | `lavazza-di-piu-chocolat-en-poudre-x50` |
| `lavazza-espresso-italiano-classico-caf-moulu` | `lavazza-espresso-italiano-classico-cafe-moulu-250g` |
| `lavazza-espresso-maestro-classico` | `lavazza-espresso-maestro-classico-x10` |
| `lavazza-espresso-maestro-lungo` | `lavazza-espresso-maestro-lungo-x10` |
| `lavazza-espresso-maestro-ristret` | `lavazza-espresso-maestro-ristretto-x10` |
| `lavazza-gold-selection` | `lavazza-gold-selection-1kg` |
| `lavazza-gran-espresso` | `lavazza-gran-espresso-1kg` |
| `lavazza-grandes-tasses-avec-sous-tasses-6pcs` | `lavazza-grandes-tasses-avec-sous-tasses-6pcs-250-ml` |
| `lavazza-il-filtro-classico-intense` | `lavazza-il-filtro-classico-intense-1kg` |
| `lavazza-machine-caf-lb1300` | `lavazza-machine-a-cafe-lb1300` |
| `lavazza-panach-de-croustilles-de-c-r-ales-enrob-es-de-chocolat-500-pcs` | `lavazza-panache-de-croustilles-de-cereales-enrobees-de-chocolat-500-pcs` |
| `lavazza-pronto-crema` | `lavazza-pronto-crema-1kg` |
| `lavazza-sucre-en-b-chettes-700-pcs` | `lavazza-sucre-en-buchettes-700-pcs` |
| `lavazza-tasse-espresso-avec-sous-tasse-12-pcs` | `lavazza-tasses-espresso-avec-sous-tasses-12-pcs-70-ml` |
| `lavazza-voix-de-la-terre-biologique-espresso-quilibr` | `lavazza-voix-de-la-terre-biologique-espresso-equilibre-1kg` |
| `machine-caf-lb1050` | `lavazza-machine-a-cafe-lb1050` |
| `machine-caf-lb300` | `lavazza-machine-a-cafe-lb300` |
| `mambo-caf-torrado-em-gr-o-1kg` | `mambo-cafe-torrado-em-grao-1kg` |
| `prolait-lait-cr-m-en-poudre-500-g` | `prolait-lait-ecreme-en-poudre-500g` |
| `ristora-chocolat-jaune` | `ristora-chocolat-jaune-1kg` |
| `ristora-chocolat-marron` | `ristora-chocolat-marron-1kg` |
| `ristora-chocolat-rouge` | `ristora-chocolat-rouge-1kg` |
| `th-la-menthe-capsules-compatibles-lavazza-blue-15-pcs` | `the-a-la-menthe-capsules-compatibles-lavazza-blue-15-pcs` |

## B. Slug no longer matches the product name (28 URLs)

These are stale slugs from product renames, **not** the accent bug. Rewriting
them is a separate editorial decision — the URLs may hold rankings under the
old name. Note the first row: the URL says Lavazza, the product is Bristot.

| Current slug | Current product name |
|---|---|
| `covim-granbar-grains` | Covim - Granbar 1kg |
| `covim-oro-crema-grains` | Covim - Oro Crema 1kg |
| `covim-prestige-grains` | Covim - Prestige 1kg |
| `crema-e-aroma-grains` | Lavazza - Crema e Aroma Vending 1kg |
| `delta-caf-s-brazil-grain-500g` | Delta Cafés - Brazil 500g |
| `delta-caf-s-chavena-grain-1kg` | Delta Cafés - Chavena 1kg |
| `delta-caf-s-colombia-grain-500g` | Delta Cafés - Colombia 500g |
| `delta-caf-s-gold-grain-500g` | Delta Cafés - Gold 500g |
| `delta-caf-s-gran-crema-grain-1kg` | Delta Cafés - Gran Crema 1kg |
| `delta-caf-s-harvest-grain-1kg` | Delta Cafés - Harvest 1kg |
| `delta-caf-s-platinum-grain-500g` | Delta Cafés - Platinum 500g |
| `delta-caf-s-signature-crema-grain-500g` | Delta Cafés - Signature Crema 1 Kg |
| `delta-caf-s-signature-intense-grain-500g` | Delta Cafés - Signature Intense 1 Kg |
| `delta-caf-s-superior-blend-grain-1kg` | Delta Cafés - Superior Blend 1kg |
| `lavazza-aroma-pi-grains` | Lavazza - Aroma Più 1kg |
| `lavazza-aroma-top-grains` | Lavazza - Aroma Top 1kg |
| `lavazza-bean-to-cup-1kg` | Bristot - Bean To Cup 1kg |
| `lavazza-capsules-blue-espresso-decaffeinato-100-arabica` | Lavazza Capsules Blue Espresso Decaffeinato x100 |
| `lavazza-capsules-espresso-point-crema-et-aroma` | Lavazza Capsules Gran Espresso Point Crema & Aroma x100 |
| `lavazza-crema-classica-grains` | Lavazza - Crema Classica 1kg |
| `lavazza-crema-ricca-grains` | Lavazza - Crema Ricca 1kg |
| `lavazza-idola-machine-capsules-a-modo-mio` | Lavazza – Machine à capsules Idola A Modo Mio |
| `lavazza-lb-2317-machine-caf-professionnelle-capsules-lavazza-blue` | Lavazza - Machine à café LB2317 |
| `lavazza-set-espresso-turin-et-naples` | Lavazza - Set Espresso Torino et Napoli |
| `lavazza-super-crema-grains-1kg` | Lavazza - Super Crema 1kg |
| `lavazza-tasses-caf-avec-sous-tasses-6pcs` | Lavazza – Tasses Cappuccino Avec Sous-Tasses ( 6pcs ) 160 ml |
| `mambo-gold-caf-en-grains-1-kg` | Mambo - Ouro Brasil 1kg |
| `set-cappuccino-rome-et-venise` | Lavazza - Set Cappuccino Roma et Venezia |
