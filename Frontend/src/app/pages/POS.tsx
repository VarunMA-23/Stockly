import { useState } from 'react';
import { Search, Barcode, CreditCard, Trash2, Plus, Minus, Tag, Package } from 'lucide-react';

const categories = ['All', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Groceries'];

const products = [
  { id: 1, name: 'Organic Milk 1L', price: 5.0, category: 'Dairy', icon: '🥛' },
  { id: 2, name: 'Wheat Bread', price: 3.0, category: 'Bakery', icon: '🍞' },
  { id: 3, name: 'Fresh Eggs 12pk', price: 4.0, category: 'Dairy', icon: '🥚' },
  { id: 4, name: 'Orange Juice', price: 7.0, category: 'Beverages', icon: '🍊' },
  { id: 5, name: 'Potato Chips', price: 2.5, category: 'Snacks', icon: '🥔' },
  { id: 6, name: 'Basmati Rice', price: 15.0, category: 'Groceries', icon: '🍚' },
  { id: 7, name: 'Greek Yogurt', price: 5.5, category: 'Dairy', icon: '🥄' },
  { id: 8, name: 'Chocolate Bar', price: 2.0, category: 'Snacks', icon: '🍫' },
];

export function POS() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const discountAmount = (subtotal + tax) * (discount / 100);
  const total = subtotal + tax - discountAmount;

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4 -m-6">
      {/* Left - Categories */}
      <div className="w-48 bg-card border-r border-border p-4 space-y-2 overflow-y-auto">
        <h3 className="font-semibold mb-4">Categories</h3>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`w-full px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'hover:bg-accent'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Center - Products */}
      <div className="flex-1 bg-card p-6 overflow-y-auto">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search or scan barcode..."
            className="w-full pl-10 pr-12 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded">
            <Barcode className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="p-4 bg-secondary/30 hover:bg-secondary/50 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="text-4xl mb-2">{product.icon}</div>
              <h4 className="font-medium text-sm mb-1">{product.name}</h4>
              <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right - Cart */}
      <div className="w-96 bg-card border-l border-border p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Current Order</h2>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Package className="w-16 h-16 mb-2 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 rounded-lg bg-background hover:bg-accent transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded-lg bg-background hover:bg-accent transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateQuantity(item.id, -item.quantity)}
                    className="w-8 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors flex items-center justify-center ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Discount */}
        <div className="mb-4 p-3 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Discount</span>
          </div>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            placeholder="0"
            className="w-full px-3 py-2 bg-background border border-input rounded-lg"
            min="0"
            max="100"
          />
        </div>

        {/* Totals */}
        <div className="space-y-2 mb-4 pb-4 border-b border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount ({discount}%)</span>
              <span className="font-medium text-destructive">-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button className="px-4 py-3 bg-background border border-input rounded-lg font-medium hover:bg-accent transition-colors">
            Cash
          </button>
          <button className="px-4 py-3 bg-background border border-input rounded-lg font-medium hover:bg-accent transition-colors">
            Card
          </button>
          <button className="px-4 py-3 bg-background border border-input rounded-lg font-medium hover:bg-accent transition-colors">
            UPI
          </button>
          <button className="px-4 py-3 bg-background border border-input rounded-lg font-medium hover:bg-accent transition-colors">
            Split
          </button>
        </div>

        <button
          disabled={cart.length === 0}
          className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-gradient-from to-emerald-gradient-to text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </button>
      </div>
    </div>
  );
}
