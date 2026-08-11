'use client';

import { useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { useLanguage } from '@/context/LanguageContext';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const { t } = useLanguage();

	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			console.error(error);
		}
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-ink text-sand grain-overlay">
			<div className="text-center px-4 max-w-md">
				<h1 className="text-5xl md:text-7xl font-display font-black text-sand mb-4">
					{t('oopsHeading')}
				</h1>
				<p className="text-base md:text-lg text-sand/80 mb-2 leading-relaxed">
					{t('errorPageDesc')}
				</p>
				<p className="text-sm text-cocoa mb-8">
					{error.message && `Error: ${error.message}`}
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button onClick={() => reset()} variant="primary" size="md" className="bg-gold text-ink hover:bg-[#b8914d] hover:scale-105">
						{t('tryAgainBtn')}
					</Button>
					<Button
						onClick={() => (window.location.href = '/')}
						variant="outline"
						size="md"
						className="border-sand/30 text-sand hover:bg-sand hover:text-ink"
					>
						{t('backToHome')}
					</Button>
				</div>
			</div>
		</div>
	);
}
