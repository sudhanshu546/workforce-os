import { UI_CONSTANTS } from '../utils/ui-constants';
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { IndianRupee, TrendingUp, Target, BarChart3, PieChart, Activity, Download, FileText, Loader2, Users } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/ToastProvider';
import api from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const AnalyticsPage: React.FC = () => {
    const showToast = useToast();
    const [profitData, setProfitData] = useState<any[]>([]);
    const [ownerStats, setOwnerStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingReport, setDownloadingReport] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleDownloadReport = async () => {
        setDownloadingReport(true);
        try {
            const response = await api.get('/analytics/report-pdf', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response as any]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `performance-report-${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download report:', err);
            showToast('Failed to generate report', 'error');
        } finally {
            setDownloadingReport(false);
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [profitRes, ownerRes]: any = await Promise.all([
                api.get('/analytics/profitability'),
                api.get('/analytics/owner')
            ]);
            setProfitData(profitRes || []);
            setOwnerStats(ownerRes || null);
        } catch (e) {
            console.error('Failed to fetch analytics', e);
        } finally {
            setLoading(false);
        }
    };

    const revenueChartData = {
        labels: ownerStats ? Object.keys(ownerStats.monthlyRevenue) : [],
        datasets: [
            {
                label: 'Monthly Revenue (₹)',
                data: ownerStats ? Object.values(ownerStats.monthlyRevenue) : [],
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderRadius: 8,
            },
        ],
    };

    const statusChartData = {
        labels: ownerStats ? Object.keys(ownerStats.tasksByStatus) : [],
        datasets: [
            {
                data: ownerStats ? Object.values(ownerStats.tasksByStatus) : [],
                backgroundColor: [
                    '#10b981', // SUCCESS
                    '#4f46e5', // PRIMARY
                    '#f59e0b', // WARNING
                    '#ef4444', // ERROR
                    '#64748b', // MUTED
                ],
                borderWidth: 0,
            },
        ],
    };

    return (
        <Layout>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: UI_CONSTANTS.header.marginBottom, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900' }}>Business Intelligence Dashboard</h1>
                        <p className="text-muted">Real-time insights into revenue trends and job profitability.</p>
                    </div>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleDownloadReport} 
                        disabled={downloadingReport}
                        style={{ background: 'var(--text-h)', borderColor: 'var(--text-h)' }}
                    >
                        {downloadingReport ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                        {downloadingReport ? 'Generating Report...' : 'Download Performance Report'}
                    </button>
                </header>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '20px' }}>
                            <div className="card-premium">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <TrendingUp className="text-primary" />
                                    <h3 style={{ fontWeight: '800' }}>Revenue Trends</h3>
                                </div>
                                <div style={{ height: '250px' }}>
                                    <Bar 
                                        data={revenueChartData} 
                                        options={{ 
                                            responsive: true, 
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } }
                                        }} 
                                    />
                                </div>
                            </div>

                            <div className="card-premium">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <PieChart className="text-primary" />
                                    <h3 style={{ fontWeight: '800' }}>Job Distribution</h3>
                                </div>
                                <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                                    <Doughnut 
                                        data={statusChartData} 
                                        options={{ 
                                            responsive: true, 
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'right' } }
                                        }} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Users className="text-primary" />
                                <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Worker Utilization & Performance</h2>
                            </div>
                        </div>

                        <div className="card-premium" style={{ padding: '0', overflow: 'hidden' }}>
                            <table className="table-premium">
                                <thead>
                                    <tr>
                                        <th>Technician</th>
                                        <th>Total Hours</th>
                                        <th>Job Hours</th>
                                        <th>Utilization</th>
                                        <th>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ownerStats?.workerUtilization?.map((w: any) => (
                                        <tr key={w.workerId}>
                                            <td style={{ fontWeight: '800' }}>{w.workerName}</td>
                                            <td>{w.totalHours.toFixed(1)}h</td>
                                            <td>{w.jobHours.toFixed(1)}h</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${w.utilizationRate}%`, height: '100%', background: w.utilizationRate > 70 ? 'var(--success)' : 'var(--warning)' }}></div>
                                                    </div>
                                                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{w.utilizationRate.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '700' }}>⭐ {w.averageRating.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default AnalyticsPage;
