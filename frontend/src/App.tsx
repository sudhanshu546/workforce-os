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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Customer Auth Routes */}
        <Route path="/customer/login" element={<CustomerLoginPage />} />
        <Route path="/customer/register" element={<CustomerRegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        
        {/* Customer Protected Routes */}
        <Route path="/customer/profile" element={<PrivateRoute roles={['CUSTOMER']}><CustomerProfilePage /></PrivateRoute>} />
        <Route path="/customer/addresses" element={<PrivateRoute roles={['CUSTOMER']}><CustomerAddressPage /></PrivateRoute>} />

        {/* Workforce Protected Routes */}
        <Route path="/leads" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><Leads /></PrivateRoute>} />
        <Route path="/quotations" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><Quotations /></PrivateRoute>} />
        <Route path="/services" element={<PrivateRoute roles={['OWNER', 'MANAGER']}><ServicesPage /></PrivateRoute>} />
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
