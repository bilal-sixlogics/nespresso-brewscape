type Variant = 'green' | 'red' | 'amber' | 'sky' | 'gray' | 'primary';

interface Props {
  variant?: Variant;
  children: React.ReactNode;
  dot?: boolean;
}

const DOT_COLORS: Record<Variant, string> = {
  green:   '#22C55E',
  red:     '#EF4444',
  amber:   '#F59E0B',
  sky:     '#38BDF8',
  gray:    'var(--color-a-text-dim)',
  primary: 'var(--color-a-green)',
};

export function AdminBadge({ variant = 'gray', children, dot }: Props) {
  return (
    <span className={`admin-badge admin-badge-${variant}`}>
      {dot && (
        <span
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: DOT_COLORS[variant], flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}

// Convenience helpers
export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, Variant> = {
    active: 'green', inactive: 'gray', published: 'green',
    pending: 'amber', processing: 'sky', shipped: 'sky',
    delivered: 'green', cancelled: 'red', refunded: 'red',
    in_stock: 'green', out_of_stock: 'red',
    super_admin: 'primary', manager: 'sky', inventory_staff: 'amber',
  };
  const normalised = status?.toLowerCase().replace(' ', '_') ?? 'gray';
  return (
    <AdminBadge variant={map[normalised] ?? 'gray'} dot>
      {status}
    </AdminBadge>
  );
};
