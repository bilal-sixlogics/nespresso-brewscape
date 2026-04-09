'use client';

import { useEffect } from 'react';
import { Button } from '@/components/atoms/Button';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			console.error(error);
		}
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-sb-white">
			<div className="text-center px-4 max-w-md">
				<h1 className="text-5xl md:text-7xl font-display font-black text-sb-black mb-4">
					Oops!
				</h1>
				<p className="text-base md:text-lg text-gray-600 mb-2 leading-relaxed">
					Something went wrong. Don't worry, our team has been notified.
				</p>
				<p className="text-sm text-gray-500 mb-8">
					{error.message && `Error: ${error.message}`}
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button onClick={() => reset()} variant="primary" size="md">
						Try Again
					</Button>
					<Button
						onClick={() => (window.location.href = '/')}
						variant="outline"
						size="md"
					>
						Back to Home
					</Button>
				</div>
			</div>
		</div>
	);
}
