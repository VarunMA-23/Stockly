import { LayoutDashboard, Package, CreditCard, Brain, Settings } from 'lucide-react';
import { cn } from '../components/ui/utils';

const mobileNavItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Inventory', icon: Package, href: '/inventory' },
  { name: 'POS', icon: CreditCard, href: '/pos' },
  { name: 'AI', icon: Brain, href: '/ai-forecasting' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function MobileNav({ currentPath, onNavigate }: MobileNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 min-w-0',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0')} />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
