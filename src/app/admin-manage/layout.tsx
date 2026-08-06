'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Cake, Tag, Mail, Settings, LogOut, Bell, ChevronRight, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on login page, render children without admin sidebar
  if (pathname === '/admin-manage') {
    return <>{children}</>;
  }

  // Poll for new orders count every 15s
  useEffect(() => {
    const fetchNewOrders = () => {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data.orders) {
            const count = data.orders.filter((o: any) => o.status === 'new').length;
            setNewOrdersCount(count);
          }
        })
        .catch(() => {});
    };

    fetchNewOrders();
    const interval = setInterval(fetchNewOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin-manage');
    router.refresh();
  };

  const navItems = [
    { name: 'Overview', href: '/admin-manage/overview', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin-manage/orders', icon: ShoppingCart, badge: newOrdersCount },
    { name: 'Products Catalog', href: '/admin-manage/products', icon: Cake },
    { name: 'Occasion Offers', href: '/admin-manage/offers', icon: Tag },
    { name: 'Subscribers', href: '/admin-manage/subscribers', icon: Mail },
    { name: 'Settings', href: '/admin-manage/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bakery-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Nav */}
      <div className="md:hidden bg-bakery-chocolate text-white p-4 flex items-center justify-between border-b border-amber-900/40 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Cake className="w-6 h-6 text-amber-400" />
          <span className="font-serif font-bold text-lg">MyHomelyCake Admin</span>
        </div>
        <div className="flex items-center gap-3">
          {newOrdersCount > 0 && (
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Bell className="w-3 h-3" /> {newOrdersCount} New
            </span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-white">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 bg-bakery-chocolate text-white flex flex-col justify-between shrink-0 p-6 border-r border-amber-900/30 ${sidebarOpen ? 'block' : 'hidden md:flex'}`}>
        <div className="space-y-8">
          
          {/* Admin Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold tracking-tight">MyHomelyCake</h2>
              <span className="text-[10px] tracking-widest uppercase font-bold text-amber-400">Admin Dashboard</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-soft font-bold'
                      : 'text-bakery-200 hover:bg-bakery-chocolateLight hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-bounce">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout */}
        <div className="pt-6 border-t border-amber-900/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>

    </div>
  );
}
