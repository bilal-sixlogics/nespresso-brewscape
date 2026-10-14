import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

/**
 * Leads vs. contact clicks.
 *
 * GA4 `generate_lead` must mean an enquiry the server accepted. Tapping a
 * phone number or email link is intent only and reports as `contact_click`.
 */

const { post, get, trackLead } = vi.hoisted(() => ({
    post: vi.fn(),
    get: vi.fn(),
    trackLead: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({ apiClient: { post, get } }));
vi.mock('@/lib/tracking', async importOriginal => ({
    ...(await importOriginal<typeof import('@/lib/tracking')>()),
    trackLead,
}));
vi.mock('@/context/LanguageContext', () => ({ useLanguage: () => ({ t: (k: string) => k }) }));
vi.mock('@/context/SiteSettingsContext', () => ({
    useSiteSettings: () => ({ contact_email: 'boutique@cafrezzo.com', contact_response_time: '24h' }),
}));
vi.mock('../app/[locale]/contact/StoreGallery', () => ({ StoreGallery: () => null }));
// jsdom has no IntersectionObserver, which whileInView needs. Render plain tags.
vi.mock('framer-motion', () => {
    const strip = (props: Record<string, unknown>) => {
        const rest = { ...props };
        for (const k of ['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'layout']) delete rest[k];
        return rest;
    };
    const motion = new Proxy({}, {
        get: (_, tag: string) => {
            const Plain = React.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) =>
                React.createElement(tag, { ...strip(props), ref }),
            );
            Plain.displayName = `motion.${tag}`;
            return Plain;
        },
    });
    return { motion, AnimatePresence: ({ children }: { children: React.ReactNode }) => children };
});

import { trackContact } from '@/lib/tracking';
import ContactPage from '../app/[locale]/contact/page';

describe('tracking events', () => {
    afterEach(() => {
        delete (window as { gtag?: unknown }).gtag;
    });

    it('reports a phone tap as contact_click, never as generate_lead', () => {
        const gtag = vi.fn();
        (window as { gtag?: unknown }).gtag = gtag;
        trackContact('phone');
        expect(gtag).toHaveBeenCalledWith('event', 'contact_click', { method: 'phone' });
        expect(gtag).not.toHaveBeenCalledWith('event', 'generate_lead', expect.anything());
    });

    it('reports an accepted enquiry as generate_lead', async () => {
        const { trackLead: realTrackLead } = await vi.importActual<typeof import('@/lib/tracking')>('@/lib/tracking');
        const gtag = vi.fn();
        (window as { gtag?: unknown }).gtag = gtag;
        realTrackLead('contact', 'wholesale');
        expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', { form_name: 'contact', lead_type: 'wholesale' });
    });
});

describe('contact form', () => {
    beforeEach(() => {
        post.mockReset().mockResolvedValue({});
        get.mockReset().mockResolvedValue({ data: [] });
        trackLead.mockReset();
    });
    afterEach(() => {
        cleanup();
        window.history.pushState({}, '', '/');
    });

    const fill = () => {
        // getByLabelText only resolves when <label htmlFor> matches the field id.
        fireEvent.change(screen.getByLabelText('firstName'), { target: { value: 'Marie' } });
        fireEvent.change(screen.getByLabelText('email'), { target: { value: 'marie@example.com' } });
        fireEvent.change(screen.getByLabelText('message'), { target: { value: 'Tarifs pour un restaurant' } });
    };

    it('preselects the trade subject from ?subject=wholesale and counts the submission as a lead', async () => {
        window.history.pushState({}, '', '/fr/contact?subject=wholesale');
        render(<ContactPage />);
        await waitFor(() => expect(screen.getByLabelText('subjectLabel')).toHaveValue('wholesale'));

        fill();
        fireEvent.click(screen.getByRole('button', { name: /sendMessage/ }));

        await waitFor(() => expect(trackLead).toHaveBeenCalledWith('contact', 'wholesale'));
        expect(post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ subject: 'wholesale' }));
        expect(screen.getByRole('status')).toHaveTextContent('messageSentConfirm');
    });

    it('ignores an unknown ?subject= value', async () => {
        window.history.pushState({}, '', '/fr/contact?subject=<script>');
        render(<ContactPage />);
        await waitFor(() => expect(get).toHaveBeenCalled());
        expect(screen.getByLabelText('subjectLabel')).toHaveValue('');
    });

    it('does not count an order-tracking request as a lead', async () => {
        window.history.pushState({}, '', '/fr/contact?subject=order');
        render(<ContactPage />);
        await waitFor(() => expect(screen.getByLabelText('subjectLabel')).toHaveValue('order'));

        fill();
        fireEvent.click(screen.getByRole('button', { name: /sendMessage/ }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(trackLead).not.toHaveBeenCalled();
    });

    it('does not count a failed submission as a lead', async () => {
        post.mockRejectedValue({ status: 500, message: 'down' });
        render(<ContactPage />);
        fill();
        fireEvent.click(screen.getByRole('button', { name: /sendMessage/ }));

        expect(await screen.findByRole('alert')).toHaveTextContent('down');
        expect(trackLead).not.toHaveBeenCalled();
    });

    it('blocks an incomplete form before calling the API', async () => {
        render(<ContactPage />);
        fireEvent.click(screen.getByRole('button', { name: /sendMessage/ }));

        expect(await screen.findByRole('alert')).toHaveTextContent('contactRequiredFieldsError');
        expect(post).not.toHaveBeenCalled();
        expect(trackLead).not.toHaveBeenCalled();
    });
});
