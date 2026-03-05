const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'lib', 'translations.ts');
let content = fs.readFileSync(file, 'utf8');

// The keys we want to ensure EXIST and are NOT duplicated
const keysToAdd = {
    fr: { inStock: "En stock", outOfStock: "Rupture de stock" },
    en: { inStock: "In Stock", outOfStock: "Out of Stock" },
    de: { inStock: "Auf Lager", outOfStock: "Nicht vorrätig" },
    ru: { inStock: "В наличии", outOfStock: "Нет в наличии" },
    nl: { inStock: "Op voorraad", outOfStock: "Niet op voorraad" },
};

// 1. Remove all existing instances of inStock: "...", and outOfStock: "...",
content = content.replace(/^[ \t]*inStock[ \t]*:[^\n]*\n/gm, '');
content = content.replace(/^[ \t]*outOfStock[ \t]*:[^\n]*\n/gm, '');

// 2. Insert them correctly right under bestSeller: "..."
content = content.replace(/(bestSeller[ \t]*:[ \t]*".*?",\n)/g, (match) => {
    // We figure out which language block we are in based on the translation value of bestSeller
    if (match.includes('Meilleures Ventes')) {
        return match + `        inStock: "${keysToAdd.fr.inStock}",\n        outOfStock: "${keysToAdd.fr.outOfStock}",\n`;
    } else if (match.includes('Best Seller')) {
        return match + `        inStock: "${keysToAdd.en.inStock}",\n        outOfStock: "${keysToAdd.en.outOfStock}",\n`;
    } else if (match.includes('Хит продаж')) {
        return match + `        inStock: "${keysToAdd.ru.inStock}",\n        outOfStock: "${keysToAdd.ru.outOfStock}",\n`;
    } else if (match.includes('Bestseller')) { // DE and NL share "Bestseller"
        // Check the context around it to distinguish DE and NL.
        // Actually we can just do a second pass. For now let's insert a placeholder.
        return match + `        inStock: "TMP_STOCK",\n        outOfStock: "TMP_OUT",\n`;
    }
    return match;
});

// Since DE and NL both use "Bestseller", we need to fix the placeholders.
// DE block has "Neu" right above Bestseller
content = content.replace(/new: "Neu",\n[ \t]*bestSeller: "Bestseller",\n[ \t]*inStock: "TMP_STOCK",\n[ \t]*outOfStock: "TMP_OUT",\n/g,
    `new: "Neu",\n        bestSeller: "Bestseller",\n        inStock: "${keysToAdd.de.inStock}",\n        outOfStock: "${keysToAdd.de.outOfStock}",\n`);

// NL block has "Nieuw" right above Bestseller
content = content.replace(/new: "Nieuw",\n[ \t]*bestSeller: "Bestseller",\n[ \t]*inStock: "TMP_STOCK",\n[ \t]*outOfStock: "TMP_OUT",\n/g,
    `new: "Nieuw",\n        bestSeller: "Bestseller",\n        inStock: "${keysToAdd.nl.inStock}",\n        outOfStock: "${keysToAdd.nl.outOfStock}",\n`);


fs.writeFileSync(file, content);
console.log("Translations fixed.");
