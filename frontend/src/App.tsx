import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Workers from './pages/Workers';
import AttendanceTracker from './pages/AttendanceTracker';
import Tasks from './pages/Tasks';
import Quotations from './pages/Quotations';
import WorkOrders from './pages/WorkOrders';
import { PrivateRoute } from './components/PrivateRoute';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CustomerAddressPage from './pages/CustomerAddressPage';
import ServicesPage from './pages/ServicesPage';
import InvoicesPage from './pages/InvoicesPage';
import Inventory from './pages/Inventory';
import AnalyticsPage from './pages/AnalyticsPage';
import SchedulingCalendar from './pages/SchedulingCalendar';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import OrderVerification from './pages/OrderVerification';
import LiveOpsMap from './pages/LiveOpsMap';
import ExpensesPage from './pages/ExpensesPage';
import PayrollPage from './pages/PayrollPage';
import PublicTrackingPage from './pages/PublicTrackingPage';
import SupportPage from './pages/SupportPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track/:id" element={<PublicTrackingPage />} />
        <Route path="/tracking/:id" element={<PublicTrackingPage />} />
        <Route path="/support" element={<PrivateRoute><SupportPage /></PrivateRoute>} />
        
        {/* Customer Auth Routes */}
        <Route path="/customer/login" element={<CustomerLoginPage />} />
        <Route path="/customer/register" element={<CustomerRegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/live-ops" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><LiveOpsMap /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><InvoicesPage /></PrivateRoute>} />
        <Route path="/finance/expenses" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><ExpensesPage /></PrivateRoute>} />
        <Route path="/finance/payroll" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><PayrollPage /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute roles={['OWNER']}><AnalyticsPage /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute roles={['OWNER']}><SchedulingCalendar /></PrivateRoute>} />
        
        {/* Customer Protected Routes */}
        <Route path="/customer/profile" element={<PrivateRoute roles={['CUSTOMER']}><CustomerProfilePage /></PrivateRoute>} />
        <Route path="/customer/addresses" element={<PrivateRoute roles={['CUSTOMER']}><CustomerAddressPage /></PrivateRoute>} />
        <Route path="/customer/orders" element={<PrivateRoute roles={['CUSTOMER']}><CustomerOrdersPage /></PrivateRoute>} />
        <Route path="/customer/orders/:orderId/verify" element={<PrivateRoute roles={['CUSTOMER']}><OrderVerification /></PrivateRoute>} />

        {/* Workforce Protected Routes */}
        <Route path="/leads" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><Leads /></PrivateRoute>} />
        <Route path="/quotations" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><Quotations /></PrivateRoute>} />
        <Route path="/services" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><ServicesPage /></PrivateRoute>} />
        <Route path="/inventory" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><Inventory /></PrivateRoute>} />
        <Route path="/work-orders" element={<PrivateRoute roles={['OWNER', 'MANAGER', 'WORKER']}><WorkOrders /></PrivateRoute>} />
        <Route path="/workers" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><Workers /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><InvoicesPage /></PrivateRoute>} />
        <Route path="/attendance" element={<PrivateRoute><AttendanceTracker /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
