import { ProductListPage } from '@/components/admin/ui/ProductListPage';

export const metadata = { title: 'Machines' };

export default function MachinesPage() {
  return (
    <ProductListPage
      type="machine"
      title="Machines"
      typeLabel="Machine"
    />
  );
}
