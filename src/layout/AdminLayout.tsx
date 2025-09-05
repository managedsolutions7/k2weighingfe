import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/common/Header';
import {
  BarChart3,
  Building2,
  Factory,
  FileText,
  LayoutDashboard,
  Truck,
  User,
  Users,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';

const AdminLayout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/entries', label: 'Entries', icon: ClipboardList },
    { to: '/admin/plants', label: 'Plants', icon: Factory },
    { to: '/admin/vendors', label: 'Vendors', icon: Building2 },
    { to: '/admin/vehicles', label: 'Vehicles', icon: Truck },
    { to: '/admin/materials', label: 'Materials', icon: Factory },
    { to: '/admin/invoices', label: 'Invoices', icon: FileText },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/profile', label: 'Profile', icon: User },
  ];

  const Nav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {links.map(({ to, label, icon: Icon }) => {
        const active = location.pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
              active ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="w-64 bg-white border-r p-4 space-y-3 hidden lg:block sticky top-0 h-screen">
        <h2 className="font-semibold text-lg">Admin</h2>
        <Nav />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white p-4 border-r space-y-3">
            <h2 className="font-semibold text-lg">Admin</h2>
            <Nav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
