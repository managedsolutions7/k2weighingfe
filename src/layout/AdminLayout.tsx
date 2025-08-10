import { Link, Outlet } from 'react-router-dom';
import Header from '@/components/common/Header';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-100 p-4 space-y-2 hidden sm:block">
        <h2 className="font-semibold text-lg">Admin</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/plants">Plants</Link>
          <Link to="/admin/vendors">Vendors</Link>
          <Link to="/admin/vehicles">Vehicles</Link>
          <Link to="/admin/invoices">Invoices</Link>
          <Link to="/admin/reports">Reports</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Header />
        <div className="sm:hidden mb-4">
          <details className="border rounded">
            <summary className="px-3 py-2 cursor-pointer">Menu</summary>
            <nav className="flex flex-col gap-2 p-3">
              <Link to="/admin/dashboard">Dashboard</Link>
              <Link to="/admin/plants">Plants</Link>
              <Link to="/admin/vendors">Vendors</Link>
              <Link to="/admin/vehicles">Vehicles</Link>
              <Link to="/admin/invoices">Invoices</Link>
              <Link to="/admin/reports">Reports</Link>
            </nav>
          </details>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
