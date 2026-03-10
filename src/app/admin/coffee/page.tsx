import { ProductListPage } from '@/components/admin/ui/ProductListPage';

export const metadata = { title: 'Coffee & Capsules' };

export default function CoffeePage() {
  return (
    <ProductListPage
      type="coffee"
      title="Coffee & Capsules"
      typeLabel="Coffee Product"
    />
  );
}
