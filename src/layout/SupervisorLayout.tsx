import { Link, Outlet } from 'react-router-dom';
import Header from '@/components/common/Header';

const SupervisorLayout = () => {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-100 p-4 space-y-2 hidden sm:block">
        <h2 className="font-semibold text-lg">Supervisor</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/supervisor/dashboard">Dashboard</Link>
          <Link to="/supervisor/vendors">Vendors</Link>
          <Link to="/supervisor/vehicles">Vehicles</Link>
          <Link to="/supervisor/reports">Reports</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Header />
        <div className="sm:hidden mb-4">
          <details className="border rounded">
            <summary className="px-3 py-2 cursor-pointer">Menu</summary>
            <nav className="flex flex-col gap-2 p-3">
              <Link to="/supervisor/dashboard">Dashboard</Link>
              <Link to="/supervisor/vendors">Vendors</Link>
              <Link to="/supervisor/vehicles">Vehicles</Link>
              <Link to="/supervisor/reports">Reports</Link>
            </nav>
          </details>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default SupervisorLayout;
