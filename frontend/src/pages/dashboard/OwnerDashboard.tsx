import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Briefcase, Users, IndianRupee, 
  ChevronRight, Package, Navigation, Calendar, Activity,
  ArrowUpRight, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ExpandableRowTable } from '../../components/ExpandableRowTable';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import './Dashboard.css';

import { API_ENDPOINTS } from '../../utils/constants';

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockMaterials, setLowStockMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const [statsData, woData, lowStockData]: any = await Promise.all([
          api.get(API_ENDPOINTS.DASHBOARD.OWNER),
          api.get(`${API_ENDPOINTS.OPERATIONS.WORK_ORDERS}?page=0&size=5`),
          api.get(API_ENDPOINTS.INVENTORY.LOW_STOCK)
        ]);
        setStats(statsData);
        setRecentOrders(woData?.content || []);
        setLowStockMaterials(lowStockData || []);
      } catch (err) {
        console.error('Failed to fetch owner dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerData();
  }, []);

  if (loading) return (
    <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-hero owner-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.03em' }}>Executive Overview</h1>
          <p style={{ opacity: 0.9, fontSize: '18px', fontWeight: '500', maxWidth: '600px' }}>Real-time intelligence and performance monitoring for your entire service organization.</p>
        </div>
        <div className="hero-accent" />
      </header>

      <div className="premium-stats-grid">
        <div className="stat-card-modern">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: '#4f46e5' }}><TrendingUp size={24} /></div>
            <div className="trend-badge positive">↑ 12%</div>
          </div>
          <div>
            <div className="stat-label-modern">Total Pipeline</div>
            <div className="stat-value-large">{stats?.totalLeads || 0} Leads</div>
          </div>
          <div className="stat-footer-text">Projected conversion this month</div>
        </div>
        
        <div className="stat-card-modern">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><Activity size={24} /></div>
            <div className="trend-badge neutral">Stable</div>
          </div>
          <div>
            <div className="stat-label-modern">Active Operations</div>
            <div className="stat-value-large">{stats?.activeWorkOrders || 0} Jobs</div>
          </div>
          <div className="stat-footer-text">Currently in field fulfillment</div>
        </div>

        <div className="stat-card-modern">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}><Users size={24} /></div>
            <div className="trend-badge positive">+2 New</div>
          </div>
          <div>
            <div className="stat-label-modern">Expert Workforce</div>
            <div className="stat-value-large">{stats?.totalWorkers || 0} Experts</div>
          </div>
          <div className="stat-footer-text">Across all service categories</div>
        </div>

        <div className="stat-card-modern" style={{ background: 'var(--text-h)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--primary)' }}><IndianRupee size={24} /></div>
            <div className="trend-badge positive">↑ 8.4%</div>
          </div>
          <div>
            <div className="stat-label-modern" style={{ color: 'rgba(255,255,255,0.6)' }}>Net Revenue</div>
            <div className="stat-value-large" style={{ color: 'white' }}>₹{stats?.totalRevenue?.toLocaleString() || 0}</div>
          </div>
          <div className="stat-footer-text" style={{ color: 'rgba(255,255,255,0.4)' }}>Realized revenue vs targets</div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="content-card">
          <div className="card-header-flex">
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-h)' }}>Recent Field Activities</h2>
              <p className="text-muted">Live dispatch and fulfillment logs.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/work-orders')}>
              Operations Command <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="premium-table-container">
            <ExpandableRowTable 
              data={recentOrders} 
              columns={[
                { header: 'Order Ref', accessor: (order: any) => <span className="id-tag">#WO-{order.id+1000}</span> },
                { header: 'Service Category', accessor: (order: any) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: 'var(--text-main)' }}>
                    <Briefcase size={14} className="text-primary" /> {order.serviceName}
                  </div>
                ) },
                { header: 'Client Entity', accessor: (order: any) => (
                  <div style={{ fontWeight: '700', color: 'var(--text-h)' }}>{order.customer?.name}</div>
                ) },
                { header: 'Fulfillment', accessor: (order: any) => {
                  const isComp = order.status === 'COMPLETED';
                  return <span className={`badge ${isComp ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '10px' }}>{order.status.replace('_', ' ')}</span>
                }},
                { header: 'Schedule', accessor: (order: any) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--text-h)' }}>
                      <Calendar size={14} className="text-muted" /> {order.scheduledDate}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{order.scheduledTime || '09:00 AM'}</div>
                  </div>
                )}
              ]}
              renderExpanded={(order: any) => (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '48px' }}>
                    <div>
                      <div className="stat-label-modern" style={{ fontSize: '10px', marginBottom: '8px' }}>Service Description</div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-h)' }}>{order.serviceName}</div>
                    </div>
                    <div>
                      <div className="stat-label-modern" style={{ fontSize: '10px', marginBottom: '8px' }}>Site Address</div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-h)' }}>{order.customer?.address || 'Site mapping pending'}</div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/work-orders?id=${order.id}`)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    <Navigation size={16} /> View in Live Ops
                  </button>
                </div>
              )}
            />
          </div>
        </div>

        <div className="content-card">
          <div className="card-header-flex">
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-h)' }}>Inventory Pulse</h2>
              <p className="text-muted">Stock level monitoring.</p>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#ef4444', width: '40px', height: '40px' }}><Package size={20} /></div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            {lowStockMaterials.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface-muted)', borderRadius: '20px', border: '1.5px dashed var(--border)' }}>
                <Package size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-h)' }}>Stock Healthy</h3>
                <p className="text-muted">All essential materials are above safety thresholds.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="alert-banner-error">
                  <AlertCircle size={18} />
                  <span>{lowStockMaterials.length} items require immediate restock</span>
                </div>
                {lowStockMaterials.map(mat => (
                  <div key={mat.id} className="inventory-list-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error)' }} />
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>{mat.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--error)', fontWeight: '900', fontSize: '16px' }}>{mat.quantity} {mat.unit}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Available</div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-secondary" style={{ marginTop: '8px', width: '100%', height: '52px' }} onClick={() => navigate('/inventory')}>
                  Procurement Center
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .hero-accent {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%);
          border-radius: 50%;
        }
        .trend-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
        }
        .trend-badge.positive { background: #dcfce7; color: #166534; }
        .trend-badge.neutral { background: #f1f5f9; color: #475569; }
        .stat-footer-text { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-top: auto; }
        .alert-banner-error { background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b; padding: 14px 18px; border-radius: 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; }
        .inventory-list-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: white; border: 1.5px solid var(--border-light); border-radius: 16px; transition: all 0.2s; }
        .inventory-list-item:hover { border-color: var(--error); transform: translateX(4px); background: #fffafb; }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
