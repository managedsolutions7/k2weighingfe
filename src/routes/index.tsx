import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from '@/routes/guards';
import AdminLayout from '@/layout/AdminLayout';
import SupervisorLayout from '@/layout/SupervisorLayout';
import OperatorLayout from '@/layout/OperatorLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import SupervisorDashboard from '@/pages/supervisor/Dashboard';
import OperatorDashboard from '@/pages/operator/Dashboard';
// Supervisor no access to Vendors/Vehicles
import SupervisorEntries from '@/pages/supervisor/Entries';
import Profile from '@/pages/Profile';
import PlantsPage from '@/pages/admin/Plants';
import VendorsPage from '@/pages/admin/Vendors';
import VehiclesPage from '@/pages/admin/Vehicles';
import InvoicesPage from '@/pages/admin/Invoices';
import MaterialsPage from '@/pages/admin/Materials';
import ReportsPage from '@/pages/admin/Reports';
import EntriesPage from '@/pages/operator/Entries';

const AppRoutes = () => (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route element={<RoleRoute allowed={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<Profile />} />
          <Route path="/admin/plants" element={<PlantsPage />} />
          <Route path="/admin/vendors" element={<VendorsPage />} />
          <Route path="/admin/vehicles" element={<VehiclesPage />} />
          <Route path="/admin/materials" element={<MaterialsPage />} />
          <Route path="/admin/invoices" element={<InvoicesPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute allowed={['supervisor']} />}>
        <Route element={<SupervisorLayout />}>
          <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
          <Route path="/supervisor/profile" element={<Profile />} />
          <Route path="/supervisor/entries" element={<SupervisorEntries />} />
          {/** Supervisor no longer has access to vendors/vehicles pages */}
        </Route>
      </Route>

      <Route element={<RoleRoute allowed={['operator']} />}>
        <Route element={<OperatorLayout />}>
          <Route path="/operator/dashboard" element={<OperatorDashboard />} />
          <Route path="/operator/entries" element={<EntriesPage />} />
          <Route path="/operator/profile" element={<Profile />} />
        </Route>
      </Route>
    </Route>

    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
