import NotFoundContent from './not-found-content';

export const metadata = {
	title: 'Page Not Found',
	description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
	return <NotFoundContent />;
}
