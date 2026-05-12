import { useState, useEffect } from 'react';
import { MainLayout } from './components/MainLayout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { POS } from './pages/POS';
import { AIForecasting } from './pages/AIForecasting';
import { Settings } from './pages/Settings';
import { ComingSoon } from './pages/ComingSoon';
import { Users, Truck, FileText, Warehouse, TrendingUp, ShoppingCart } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (path === '/' && !isAuthenticated) {
      setIsAuthenticated(true);
    }
  };

  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  if (!isAuthenticated && currentPath === '/login') {
    return <Login onNavigate={handleNavigate} />;
  }

  if (!isAuthenticated && currentPath === '/signup') {
    return <Signup onNavigate={handleNavigate} />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard />;
      case '/inventory':
        return <Inventory />;
      case '/products':
        return <ComingSoon title="Product Catalog" description="Browse and manage your complete product catalog with advanced filtering and bulk operations." icon={ShoppingCart} />;
      case '/sales':
        return <ComingSoon title="Sales Analytics" description="Deep dive into sales trends, performance metrics, and revenue analysis." icon={TrendingUp} />;
      case '/pos':
        return <POS />;
      case '/customers':
        return <ComingSoon title="Customer Management" description="Manage customer profiles, loyalty programs, and purchase history." icon={Users} />;
      case '/suppliers':
        return <ComingSoon title="Supplier Management" description="Track supplier performance, manage relationships, and optimize procurement." icon={Truck} />;
      case '/purchase-orders':
        return <ComingSoon title="Purchase Orders" description="Create, track, and manage purchase orders with intelligent automation." icon={FileText} />;
      case '/warehouse':
        return <ComingSoon title="Warehouse Management" description="Optimize warehouse operations with real-time tracking and analytics." icon={Warehouse} />;
      case '/analytics':
        return <ComingSoon title="Advanced Analytics" description="Comprehensive business intelligence and custom reporting dashboard." icon={TrendingUp} />;
      case '/ai-forecasting':
        return <AIForecasting />;
      case '/reports':
        return <ComingSoon title="Reports" description="Generate detailed reports for revenue, inventory, taxes, and compliance." icon={FileText} />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout
      currentPath={currentPath}
      onNavigate={handleNavigate}
      onThemeToggle={handleThemeToggle}
      isDark={isDark}
    >
      {renderPage()}
    </MainLayout>
  );
}