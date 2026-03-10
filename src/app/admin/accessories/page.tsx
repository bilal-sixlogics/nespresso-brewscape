import { ProductListPage } from '@/components/admin/ui/ProductListPage';

export const metadata = { title: 'Accessories' };

export default function AccessoriesPage() {
  return (
    <ProductListPage
      type="accessory"
      title="Accessories"
      typeLabel="Accessory"
    />
  );
}
