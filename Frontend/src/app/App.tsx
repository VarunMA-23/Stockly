import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './components/MainLayout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { POS } from './pages/POS';
import { AIForecasting } from './pages/AIForecasting';
import { Settings } from './pages/Settings';
import { Categories } from './pages/Categories';
import { ProductForm } from './pages/ProductForm';
import { Customers } from './pages/Customers';
import { Sales } from './pages/Sales';
import { SaleDetail } from './pages/SaleDetail';
import { ComingSoon } from './pages/ComingSoon';
import { Users, Truck, FileText, Warehouse, TrendingUp, ShoppingCart } from 'lucide-react';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && currentPath !== '/login' && currentPath !== '/signup') {
      setCurrentPath('/login');
    }
  }, [isLoading, isAuthenticated, currentPath]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-gradient-from to-emerald-gradient-to flex items-center justify-center">
            <svg className="w-6 h-6 text-white animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (currentPath === '/login') {
      return <Login onNavigate={handleNavigate} />;
    }
    if (currentPath === '/signup') {
      return <Signup onNavigate={handleNavigate} />;
    }
    return null;
  }

  const renderPage = () => {
    if (currentPath === '/inventory/new') {
      return <ProductForm mode="create" onNavigate={handleNavigate} />;
    }

    if (currentPath.startsWith('/inventory/edit/')) {
      const productId = currentPath.replace('/inventory/edit/', '');
      return <ProductForm mode="edit" productId={productId} onNavigate={handleNavigate} />;
    }

    if (currentPath.startsWith('/sales/')) {
      const saleId = currentPath.replace('/sales/', '');
      return <SaleDetail saleId={saleId} onNavigate={handleNavigate} />;
    }

    switch (currentPath) {
      case '/':
        return <Dashboard />;
      case '/inventory':
        return <Inventory onNavigate={handleNavigate} />;
      case '/products':
        return <ComingSoon title="Product Catalog" description="Browse and manage your complete product catalog with advanced filtering and bulk operations." icon={ShoppingCart} />;
      case '/sales':
        return <Sales onNavigate={handleNavigate} />;
      case '/pos':
        return <POS onNavigate={handleNavigate} />;
      case '/customers':
        return <Customers />;
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
      case '/categories':
        return <Categories />;
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
