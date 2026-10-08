import { describe, expect, it } from 'vitest';

import {
    articleLocale,
    cleanArticleHtml,
    cleanArticleText,
    hasAiCitationMarkers,
    readingMinutes,
} from '@/lib/article-content';

describe('cleanArticleHtml', () => {
    const fr = { title: 'Prix du Café Professionnel : Comment Calculer le Coût par Tasse ?', locale: 'fr' as const };

    it('removes both ChatGPT citation token formats', () => {
        const html =
            '<p>Un espresso italien plein de caractère</strong>. :contentReference[oaicite:5]{index=5}</p>' +
            '<p>Pour les professionnels. :chatgpt-content-reference{index="9"}</p>' +
            '<p>Encodé :chatgpt-content-reference{index=&quot;2&quot;}</p>';
        const out = cleanArticleHtml(html, fr);
        expect(out).not.toMatch(/oaicite|contentReference|chatgpt-content-reference/);
        expect(out).toContain('plein de caractère</strong>.</p>');
        expect(hasAiCitationMarkers(out)).toBe(false);
        expect(hasAiCitationMarkers(html)).toBe(true);
    });

    it('drops an opening heading that restates the title, keeps a different one', () => {
        const dup = '<h1>Prix du café professionnel : comment calculer le vrai coût par tasse ?</h1><p>Texte</p>';
        expect(cleanArticleHtml(dup, fr)).toBe('<p>Texte</p>');

        const other = '<h2>Ingrédients :</h2><p>Texte</p>';
        expect(cleanArticleHtml(other, fr)).toBe(other);
    });

    it('strips leading emoji from headings only', () => {
        const html = '<h2>🌿 1. Le café Arabica</h2><h3>🇮🇹 Naples</h3><p>☕ reste</p>';
        expect(cleanArticleHtml(html, fr)).toBe('<h2>1. Le café Arabica</h2><h3>Naples</h3><p>☕ reste</p>');
    });

    it('rewrites source-page narration into plain statements', () => {
        const a = '<p>La fiche produit explique également que le concept Bean To Cup permet un café frais.</p>';
        expect(cleanArticleHtml(a, fr)).toBe('<p>Le concept Bean To Cup permet un café frais.</p>');

        const b = '<p>Sa fiche produit met en avant un café <strong>riche</strong>.</p>';
        expect(cleanArticleHtml(b, fr)).toBe('<p>Il s’agit d’un café <strong>riche</strong>.</p>');
    });

    it('points cafrezzo.com links at the article locale, relative', () => {
        const html =
            '<a href="https://cafrezzo.com/en/shop/delta">x</a>' +
            '<a href="/de/professionnels">y</a>' +
            '<a href="https://sca.coffee/">z</a>';
        expect(cleanArticleHtml(html, fr)).toBe(
            '<a href="/fr/shop/delta">x</a><a href="/fr/professionnels">y</a><a href="https://sca.coffee/">z</a>',
        );
    });
});

describe('articleLocale', () => {
    it('detects French and English bodies', () => {
        expect(
            articleLocale({ title: 'Arabica ou Robusta', body: '<p>Le café est une boisson pour les amateurs et les professionnels.</p>' }),
        ).toBe('fr');
        expect(
            articleLocale({ title: 'Coffee wholesale', body: '<p>The right supplier is the one that fits your business and your volume.</p>' }),
        ).toBe('en');
    });

    it('honours the explicit override', () => {
        expect(
            articleLocale({
                slug: 'coffee-wholesale-in-paris-how-to-choose-the-right-supplier-for-your-business',
                body: '',
            }),
        ).toBe('en');
    });
});

describe('helpers', () => {
    it('cleans plain-text fields', () => {
        expect(cleanArticleText('Texte. :contentReference[oaicite:1]{index=1}')).toBe('Texte.');
        expect(cleanArticleText(undefined)).toBeUndefined();
    });

    it('estimates reading time', () => {
        expect(readingMinutes('<p>' + 'mot '.repeat(1100) + '</p>')).toBe(5);
        expect(readingMinutes('')).toBe(1);
    });
});
