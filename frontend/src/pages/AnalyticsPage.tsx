import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { IndianRupee, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';

const AnalyticsPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfitability();
    }, []);

    const fetchProfitability = async () => {
        setLoading(true);
        try {
            const response: any = await api.get('/analytics/profitability');
            setData(response || []);
        } catch (e) {
            console.error('Failed to fetch analytics', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '900' }}>Job Profitability Dashboard</h1>
                    <p className="text-muted">Analyze the "True Profit" of each job after labor and material overheads.</p>
                </header>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="card-premium" style={{ padding: '0', overflow: 'hidden' }}>
                        <table className="table-premium">
                            <thead>
                                <tr>
                                    <th>Work Order</th>
                                    <th>Revenue</th>
                                    <th>Material Cost</th>
                                    <th>Labor Cost</th>
                                    <th>Net Profit</th>
                                    <th>Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(item => (
                                    <tr key={item.workOrderId}>
                                        <td style={{ fontWeight: '800' }}>#WO-{item.workOrderId + 1000} <span className="text-muted" style={{ fontWeight: 'normal' }}>({item.customerName})</span></td>
                                        <td>₹{item.revenue.toFixed(2)}</td>
                                        <td style={{ color: 'var(--error)' }}>- ₹{item.materialCost.toFixed(2)}</td>
                                        <td style={{ color: 'var(--error)' }}>- ₹{item.estimatedLaborCost.toFixed(2)}</td>
                                        <td style={{ fontWeight: '900', color: item.netProfit > 0 ? 'var(--success)' : 'var(--error)' }}>
                                            ₹{item.netProfit.toFixed(2)}
                                        </td>
                                        <td>
                                            <div className={`badge ${item.profitMargin > 20 ? 'badge-success' : 'badge-warning'}`}>
                                                {item.profitMargin.toFixed(1)}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AnalyticsPage;
