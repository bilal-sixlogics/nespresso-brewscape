import { Button } from '@/components/atoms/Button';
import Link from 'next/link';

export const metadata = {
	title: 'Page Not Found',
	description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-sb-white">
			<div className="text-center px-4 max-w-md">
				<h1 className="text-6xl md:text-8xl font-display font-black text-sb-black mb-4">
					404
				</h1>
				<p className="text-lg md:text-xl text-gray-600 mb-2 leading-relaxed">
					Page Not Found
				</p>
				<p className="text-sm text-gray-500 mb-8">
					The page you are looking for doesn't exist or has been moved.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link href="/">
						<Button variant="primary" size="md">
							Back to Home
						</Button>
					</Link>
					<Link href="/shop">
						<Button variant="outline" size="md">
							Browse Shop
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
