"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, Loader2 } from 'lucide-react';
import Link from '@/components/LocaleLink';
import DOMPurify from 'isomorphic-dompurify';
import { Endpoints } from '@/lib/api/endpoints';
import { useLanguage } from '@/context/LanguageContext';
import { articleLocale, cleanArticleHtml, readingMinutes } from '@/lib/article-content';
import { journalCategoryLabel } from '@/lib/journal-seo';
import { LOCALE_META } from '@/lib/i18n';

interface BlogPost {
    id: number; title: string; slug?: string; category?: string; excerpt?: string | null;
    body?: string | null; featured_image?: string | null; author_name?: string | null;
    published_at?: string | null;
}

/**
 * @param initialPost Article fetched on the server.
 *
 * Without it this component rendered a spinner into the initial HTML and only
 * fetched the body once React had hydrated — so the server response for every
 * journal URL contained an Article JSON-LD block describing text that was not
 * in the document. Crawlers that do not run JavaScript (which includes most of
 * the AI retrieval bots robots.txt deliberately invites) saw an empty article.
 * Seeded here, the prose is in the HTML on first byte.
 */
/**
 * Demotes any <h1> inside an article body to <h2>.
 *
 * The page already renders the post title as its <h1>, and the rich-text
 * bodies coming out of the admin editor typically open by repeating that
 * title as an <h1> of their own. That put two <h1>s on every journal URL.
 *
 * It only became visible once the body started server-rendering — while the
 * prose was fetched on the client, the second heading was never in the HTML a
 * crawler saw, so the duplicate was latent rather than new.
 *
 * Applied to already-sanitised markup, and limited to swapping the tag name:
 * multiple <h2>s in one document are perfectly valid, so nothing below needs
 * to shift.
 */
function demoteBodyHeadings(html: string): string {
    return html.replace(/<(\/?)h1(\s|>)/gi, '<$1h2$2');
}

export default function BlogPostClient({
    slug,
    initialPost = null,
}: {
    slug: string;
    initialPost?: BlogPost | null;
}) {
    const { t, language } = useLanguage();
    const [post, setPost] = useState<BlogPost | null>(initialPost);
    // Already have the article: nothing to wait for, nothing to fetch.
    const [loading, setLoading] = useState(!initialPost);
    const [notFound, setNotFound] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: post?.title ?? '', url });
        } else {
            await navigator.clipboard.writeText(url);
        }
    };

    useEffect(() => {
        // Server already supplied the article — re-fetching it would only
        // repaint identical content and burn a request on every visit.
        if (initialPost) return;

        fetch(Endpoints.blogPost(slug))
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(json => setPost(json?.data ?? null))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [slug, initialPost]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ink">
                <Loader2 size={32} className="animate-spin text-gold" />
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ink">
                <h2 className="font-display text-3xl uppercase text-sand">{t('postNotFound')}</h2>
                <Link href="/journal" className="text-gold font-bold hover:underline text-sm">{t('backToJournal')}</Link>
            </div>
        );
    }

    // The article's own language, which is also the page locale once the
    // server has redirected any other-language URL.
    const lang = articleLocale(post);
    const publishDate = post.published_at
        ? new Date(post.published_at).toLocaleDateString(LOCALE_META[language].hreflang, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : '';
    // Idempotent, so the server-cleaned body passes through unchanged; this is
    // for the client-fetch fallback, which receives raw CMS HTML.
    const bodyHtml = post.body
        ? demoteBodyHeadings(cleanArticleHtml(DOMPurify.sanitize(post.body), { title: post.title, locale: lang }))
        : '';
    const minutes = readingMinutes(post.body);

    return (
        <div className="w-full relative bg-ink text-sand overflow-x-hidden min-h-screen grain-overlay">
            {/* No entrance animation: the wrapper used to start at opacity 0, so
                the server-rendered article stayed invisible until JavaScript
                had loaded and the fade had run — a full second added to LCP. */}
            <div>
                <div className="pt-20 lg:pt-32 px-4 lg:px-8 max-w-[1000px] mx-auto">
                    <Link href="/journal" className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-cocoa hover:text-gold transition-colors mb-12 group">
                        <ArrowLeft size={16} className="mr-3 transform group-hover:-translate-x-2 transition-transform" />
                        {t('backToJournal')}
                    </Link>

                    <div className="flex items-center gap-4 text-xs font-semibold text-cocoa mb-8 uppercase tracking-widest flex-wrap">
                        {post.category && (
                            <span className="text-gold bg-gold/15 px-3 py-1 rounded-full">
                                {journalCategoryLabel(post.category, language)}
                            </span>
                        )}
                        {publishDate && (
                            <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-cocoa/50" />
                                <time dateTime={post.published_at ?? undefined}>{publishDate}</time>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Clock size={14} className="text-cocoa/50" />
                            {t('readTimeMinutes').replace('{{min}}', String(minutes))}
                        </div>
                        {post.author_name && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-sand/20" />
                                <span>{post.author_name}</span>
                            </>
                        )}
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-sand mb-12 leading-[1.05]">
                        {post.title}
                    </h1>
                </div>

                {post.featured_image && (
                    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 mb-16">
                        <div className="rounded-[40px] overflow-hidden aspect-[21/9] lg:aspect-[3/1] bg-sand/10 relative shadow-2xl">
                            {/* The likely LCP element: optimised (AVIF/WebP,
                                sized per viewport) and fetched at high priority
                                instead of a raw 870px remote JPEG. */}
                            <Image
                                src={post.featured_image}
                                alt={post.title}
                                fill
                                priority
                                sizes="(min-width: 1400px) 1336px, (min-width: 1024px) calc(100vw - 64px), calc(100vw - 32px)"
                                className="object-cover"
                            />
                        </div>
                    </div>
                )}

                <div className="max-w-[800px] mx-auto px-4 lg:px-8 pb-32">
                    <div className="flex items-start gap-8">
                        <div className="hidden lg:flex flex-col gap-4 sticky top-40 text-cocoa">
                            <button onClick={handleShare} className="w-10 h-10 rounded-full border border-sand/15 flex items-center justify-center hover:bg-gold hover:text-ink hover:border-gold transition-all shadow-sm">
                                <Share2 size={16} />
                            </button>
                            <button onClick={() => setBookmarked(b => !b)} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-sm ${bookmarked ? 'bg-gold text-ink border-gold' : 'border-sand/15 hover:bg-gold hover:text-ink hover:border-gold'}`}>
                                <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                            </button>
                        </div>

                        <div className="flex-1">
                            {post.excerpt && (
                                <p className="text-2xl lg:text-3xl text-sand font-display uppercase tracking-tight leading-tight mb-12">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Render HTML body from admin — sanitized */}
                            {post.body ? (
                                <div
                                    className="prose prose-lg prose-invert max-w-none text-sand/70 leading-[1.9] prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-sand prose-a:text-gold prose-blockquote:border-gold prose-blockquote:font-display prose-blockquote:italic prose-li:marker:text-gold"
                                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                                />
                            ) : (
                                <p className="text-cocoa italic">{t('noContentYet')}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-24 pt-12 border-t border-sand/15">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-sand">
                                <span>{t('shareArticle')}</span>
                                <button onClick={handleShare} className="w-10 h-10 rounded-full bg-sand/10 flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"><Share2 size={16} /></button>
                            </div>
                            <Link href="/journal" className="bg-gold text-ink px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#b8914d] transition-colors">
                                {t('moreArticles')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
