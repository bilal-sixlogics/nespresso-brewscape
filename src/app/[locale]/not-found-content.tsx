"use client";

import { Button } from '@/components/atoms/Button';
import Link from '@/components/LocaleLink';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFoundContent() {
	const { t } = useLanguage();

	return (
		<div className="min-h-screen flex items-center justify-center bg-ink text-sand grain-overlay">
			<div className="text-center px-4 max-w-md">
				<h1 className="text-6xl md:text-8xl font-display font-black text-sand mb-4">
					404
				</h1>
				<p className="text-lg md:text-xl text-sand/80 mb-2 leading-relaxed">
					{t('notFoundHeading')}
				</p>
				<p className="text-sm text-cocoa mb-8">
					{t('notFoundDesc')}
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link href="/">
						<Button variant="primary" size="md" className="bg-gold text-ink hover:bg-[#b8914d] hover:scale-105">
							{t('backToHome')}
						</Button>
					</Link>
					<Link href="/shop">
						<Button variant="outline" size="md" className="border-sand/30 text-sand hover:bg-sand hover:text-ink">
							{t('browseShop')}
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
