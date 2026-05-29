import React from 'react';
import { Layout } from '../components/Layout';
import OwnerDashboard from './dashboard/OwnerDashboard';
import WorkerDashboard from './dashboard/WorkerDashboard';
import CustomerDashboard from './dashboard/CustomerDashboard';
import { ROLES, STORAGE_KEYS } from '../utils/constants';

const Dashboard: React.FC = () => {
  const role = localStorage.getItem(STORAGE_KEYS.ROLE) || ROLES.WORKER;

  const renderDashboard = () => {
    switch (role) {
      case ROLES.OWNER:
      case ROLES.MANAGER:
        return <OwnerDashboard />;
      case ROLES.WORKER:
        return <WorkerDashboard />;
      case ROLES.CUSTOMER:
        return <CustomerDashboard />;
      default:
        return <WorkerDashboard />;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

export default Dashboard;
