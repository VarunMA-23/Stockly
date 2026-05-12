import { Search, Bell, Moon, Sun, Plus, Building2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../components/ui/utils';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

export function Topbar({ onThemeToggle, isDark }: TopbarProps) {
  const { user } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className={cn('relative flex items-center transition-all duration-200', searchFocused && 'scale-[1.02]')}>
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="absolute right-3 px-2 py-0.5 text-xs text-muted-foreground bg-background border border-border rounded hidden sm:block">⌘K</kbd>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1 lg:gap-2 ml-2">
        <button className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-lg transition-colors">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium hidden lg:block">{user?.store && typeof user.store === 'object' ? user.store.name : 'Main Store'}</span>
        </button>
        <button className="hidden sm:block p-2 hover:bg-accent rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
        </button>
        <button className="px-3 py-2 bg-gradient-to-r from-emerald-gradient-from to-emerald-gradient-to text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity hidden lg:block">
          AI Assistant
        </button>
        <button className="relative p-2 hover:bg-accent rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <button onClick={onThemeToggle} className="p-2 hover:bg-accent rounded-lg transition-colors hidden sm:block">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="flex items-center gap-2 px-2 lg:px-3 py-2 hover:bg-accent rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-gradient-from to-emerald-gradient-to flex items-center justify-center text-white text-sm font-medium">{initials}</div>
        </button>
      </div>
    </div>
  );
}
