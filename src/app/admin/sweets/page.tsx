import { ProductListPage } from '@/components/admin/ui/ProductListPage';

export const metadata = { title: 'Treats & Sweets' };

export default function SweetsPage() {
  return (
    <ProductListPage
      type="sweet"
      title="Treats & Sweets"
      typeLabel="Treat"
    />
  );
}
