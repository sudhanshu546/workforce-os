import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Loader2, TrendingUp, CheckCircle, Clock } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data: any = await api.get('/analytics/owner');
        setData(data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={48} /></div></Layout>;

  const revenueData = {
    labels: Object.keys(data.monthlyRevenue),
    datasets: [{
      label: 'Monthly Revenue (₹)',
      data: Object.values(data.monthlyRevenue),
      backgroundColor: '#4f46e5',
      borderRadius: 8
    }]
  };

  const statusData = {
    labels: Object.keys(data.tasksByStatus),
    datasets: [{
      data: Object.values(data.tasksByStatus),
      backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b']
    }]
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <header style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-h)' }}>Advanced Analytics</h1>
            <p style={{ color: 'var(--text-muted)' }}>Data-driven insights for your industrial operations.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div className="content-card">
                <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Revenue Trends</h2>
                <Bar data={revenueData} />
            </div>
            <div className="content-card">
                <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Operational Throughput</h2>
                <Pie data={statusData} />
            </div>
        </div>

        <div style={{ marginTop: '24px' }} className="content-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <TrendingUp size={32} className="text-primary" />
                <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Average Worker Efficiency</div>
                    <div style={{ fontSize: '24px', fontWeight: '900' }}>{data.averageWorkerEfficiency} hours / task</div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
