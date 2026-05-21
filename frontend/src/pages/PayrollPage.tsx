import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { 
    IndianRupee, User, Calendar, CheckCircle2, 
    Loader2, Search, Filter, AlertCircle,
    Download, Printer, RefreshCw, ArrowRight
} from 'lucide-react';
import api from '../services/api';

const PayrollPage: React.FC = () => {
    const [payroll, setPayroll] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [workers, setWorkers] = useState<any[]>([]);

    useEffect(() => {
        fetchWorkers();
        fetchPayroll();
    }, [selectedMonth]);

    const fetchWorkers = async () => {
        try {
            const data: any = await api.get('/workers?size=100');
            setWorkers(data.content || []);
        } catch (e) { console.error(e); }
    };

    const fetchPayroll = async () => {
        setLoading(true);
        try {
            const data: any = await api.get(`/finance/payroll?monthYear=${selectedMonth}-01`);
            setPayroll(data || []);
        } catch (err) {
            console.error('Failed to fetch payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAll = async () => {
        setGenerating(true);
        try {
            for (const worker of workers) {
                await api.post('/finance/payroll/generate', {
                    workerId: worker.id,
                    monthYear: `${selectedMonth}-01`
                });
            }
            fetchPayroll();
        } catch (e) { alert('Failed to generate payroll'); }
        finally { setGenerating(false); }
    };

    const handlePay = async (id: number) => {
        if (!window.confirm('Mark this payroll as PAID? This will also mark all included expenses as reimbursed.')) return;
        try {
            await api.patch(`/finance/payroll/${id}/pay`);
            fetchPayroll();
        } catch (e) { alert('Failed to update status'); }
    };

    return (
        <Layout>
            <div className="payroll-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
                <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-h)', marginBottom: '4px' }}>Payroll Settlements</h1>
                        <p className="text-muted" style={{ fontSize: '13px' }}>Consolidated salary processing for {selectedMonth}.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)', alignItems: 'center' }}>
                        <div className="input-group" style={{ padding: '0 8px' }}>
                            <Calendar size={14} className="text-muted" />
                            <input 
                                type="month" 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={{ 
                                    border: 'none', 
                                    background: 'none', 
                                    outline: 'none', 
                                    fontWeight: '800', 
                                    fontSize: '12px', 
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    width: '100px'
                                }}
                            />
                        </div>
                        <button 
                            onClick={handleGenerateAll} 
                            className="btn btn-primary"
                            style={{ borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '800' }}
                            disabled={generating || workers.length === 0}
                        >
                            {generating ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                            Generate
                        </button>
                    </div>
                </header>

                <div className="grid-3" style={{ marginBottom: '20px', gap: '16px' }}>
                    {[
                        { label: 'Salary Liability', value: payroll.reduce((acc, p) => acc + (p.baseSalary || 0), 0), color: '#0369a1', bg: '#f0f9ff' },
                        { label: 'Reimbursements', value: payroll.reduce((acc, p) => acc + (p.approvedReimbursements || 0), 0), color: '#15803d', bg: '#f0fdf4' },
                        { label: 'Total Payout', value: payroll.reduce((acc, p) => acc + (p.totalPayout || 0), 0), color: '#a21caf', bg: '#fdf4ff' }
                    ].map((stat, i) => (
                        <div key={i} className="card-premium" style={{ padding: '16px', background: stat.bg, borderColor: 'transparent', borderRadius: '16px' }}>
                            <div style={{ color: stat.color, marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '800' }}>{stat.label}</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-h)' }}>₹{stat.value.toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                <div className="card-premium" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '800' }}>Technician</th>
                                <th style={{ padding: '16px', fontWeight: '800' }}>Base</th>
                                <th style={{ padding: '16px', fontWeight: '800' }}>Reimb.</th>
                                <th style={{ padding: '16px', fontWeight: '800' }}>Total</th>
                                <th style={{ padding: '16px', fontWeight: '800' }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: '800' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" size={24} color="var(--primary)" /></td></tr>
                            ) : payroll.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No records found. Select month and generate.</td></tr>
                            ) : (
                                [...payroll].sort((a, b) => (a.workerName || '').localeCompare(b.workerName || '')).map(p => (
                                    <tr key={p.id} className="table-row-hover" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: 'var(--primary)' }}>{p.worker?.user?.name[0]}</div>
                                                <div>
                                                    <div style={{ fontWeight: '800', color: 'var(--text-h)' }}>{p.worker?.user?.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.worker?.designation}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: '700' }}>₹{p.baseSalary?.toLocaleString()}</td>
                                        <td style={{ padding: '16px', color: 'var(--success)', fontWeight: '700' }}>₹{p.approvedReimbursements?.toLocaleString()}</td>
                                        <td style={{ padding: '16px', fontWeight: '900' }}>₹{p.totalPayout?.toLocaleString()}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '4px 8px', borderRadius: '6px' }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            {p.status !== 'PAID' ? (
                                                <button onClick={() => handlePay(p.id)} className="btn btn-primary" style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>
                                                    Pay
                                                </button>
                                            ) : (
                                                <CheckCircle2 size={16} className="text-success" />
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default PayrollPage;
