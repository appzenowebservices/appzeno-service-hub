'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  User, ShoppingBag, MapPin, Wallet, Gift, Heart,
  ShoppingCart, Settings, HelpCircle, Menu, X, LogOut,
  Bell, ChevronRight, Home, PanelLeftClose, PanelLeftOpen,
  Star, CreditCard, MessageSquare
} from 'lucide-react';

// Enhanced Initials with dynamic colors
function getInitials(name?: string): string {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Grouped Navigation for better Cognitive Load management
const navGroups = [
  {
    label: 'Personal',
    items: [
      { name: 'Profile', href: '/user/profile', icon: User, description: 'Personal details' },
      { name: 'Addresses', href: '/user/addresses', icon: MapPin, description: 'Shipping points' },
      { name: 'Wallet', href: '/user/wallet', icon: Wallet, description: 'Credits & Cards' },
    ]
  },
  {
    label: 'Commerce',
    items: [
      { name: 'Orders', href: '/user/ordershistory', icon: ShoppingBag, badge: '3' },
      { name: 'Cart', href: '/user/cart', icon: ShoppingCart, badge: '5' },
      { name: 'Favorites', href: '/user/favorites', icon: Heart },
    ]
  },
  {
    label: 'Social & Support',
    items: [
      { name: 'Loyalty', href: '/user/loyalty', icon: Gift },
      { name: 'Reviews', href: '/user/reviews', icon: MessageSquare },
      { name: 'Support', href: '/user/support', icon: HelpCircle },
    ]
  }
];

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    localStorage.setItem('sidebarCollapsed', String(!collapsed));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-slate-900 tracking-tight">Dashboard</span>
        <div className="flex items-center gap-2">
           <button className="p-2 relative text-slate-600"><Bell className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 transition-all duration-500 ease-in-out ${collapsed ? 'w-[88px]' : 'w-[280px]'}`}>
          <div className="flex flex-col h-full">
            
            {/* Logo Section */}
            <div className={`h-20 flex items-center px-6 mb-2 border-b border-slate-50 ${collapsed ? 'justify-center' : 'justify-between'}`}>
              <button onClick={toggleCollapse} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </button>
            </div>

            {/* User Profile Card */}
            <div className={`px-4 mb-6 transition-all duration-500 ${collapsed ? 'opacity-100' : 'opacity-100'}`}>
              <div className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-blue-100">
                  {getInitials(session?.user?.name)}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1">{session?.user?.name || 'Guest'}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      <Star size={10} fill="currentColor" /> Pro Member
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-8">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-2">
                  {!collapsed && <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{group.label}</p>}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                            isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-blue-600'} />
                          {!collapsed && (
                            <div className="flex-1 flex items-center justify-between overflow-hidden">
                              <span className="font-bold text-sm truncate">{item.name}</span>
                              {item.badge && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                          {collapsed && (
                            <div className="fixed left-24 px-3 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 uppercase tracking-widest">
                              {item.name}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 space-y-2">
              <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all ${collapsed ? 'justify-center' : ''}`}>
                <Home size={20} />
                {!collapsed && <span className="text-sm font-bold text-slate-900">Storefront</span>}
              </Link>
              <button 
                onClick={() => signOut()}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all ${collapsed ? 'justify-center' : ''}`}
              >
                <LogOut size={20} />
                {!collapsed && <span className="text-sm font-bold">Log out</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className={`flex-1 min-h-screen transition-all duration-500 ease-in-out ${collapsed ? 'lg:pl-[88px]' : 'lg:pl-[280px]'}`}>
          <div className="p-6 md:p-10 lg:p-12 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer (Condensed logic for brevity) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-slate-50">
              <span className="font-black text-xl text-blue-600">GEMINI.</span>
              <button onClick={() => setSidebarOpen(false)}><X /></button>
            </div>
            {/* Render items similarly to desktop nav */}
            <div className="p-4 flex-1">
              {navGroups.map(g => (
                <div key={g.label} className="mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">{g.label}</p>
                  {g.items.map(i => (
                    <Link key={i.name} href={i.href} onClick={() => setSidebarOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl text-slate-600 active:bg-slate-100">
                      <i.icon size={22} />
                      <span className="font-bold">{i.name}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}