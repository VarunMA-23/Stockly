import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  Truck,
  FileText,
  Warehouse,
  TrendingUp,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FolderTree
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Inventory', icon: Package, href: '/inventory' },
  { name: 'Categories', icon: FolderTree, href: '/categories' },
  { name: 'Products', icon: ShoppingCart, href: '/products' },
  { name: 'Sales', icon: TrendingUp, href: '/sales' },
  { name: 'POS / Billing', icon: CreditCard, href: '/pos' },
  { name: 'Customers', icon: Users, href: '/customers' },
  { name: 'Suppliers', icon: Truck, href: '/suppliers' },
  { name: 'Purchase Orders', icon: FileText, href: '/purchase-orders' },
  { name: 'Warehouse', icon: Warehouse, href: '/warehouse' },
  { name: 'Analytics', icon: TrendingUp, href: '/analytics' },
  { name: 'AI Forecasting', icon: Brain, href: '/ai-forecasting' },
  { name: 'Reports', icon: FileText, href: '/reports' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : '';

  return (
    <div
      className={cn(
        'h-screen bg-card border-r border-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-gradient-from to-emerald-gradient-to flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">ShelfIQ</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-accent rounded-md transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === '/'
                ? currentPath === item.href
                : currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            return (
              <button
                key={item.href}
                onClick={() => onNavigate(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.name}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 bg-accent/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-gradient-from to-emerald-gradient-to flex items-center justify-center text-white text-sm font-medium">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
