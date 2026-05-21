import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layout } from '../components/Layout';
import api from '../services/api';
import { Loader2, MapPin, Navigation, User, Clock } from 'lucide-react';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LiveOpsMap: React.FC = () => {
    const [markers, setMarkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMarkers();
        const interval = setInterval(fetchMarkers, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchMarkers = async () => {
        try {
            const data: any = await api.get('/work-orders/live-ops');
            setMarkers(data || []);
        } catch (err) {
            console.error('Failed to fetch map markers');
        } finally {
            setLoading(false);
        }
    };

    const MapAutoCenter = ({ markers }: { markers: any[] }) => {
        const map = useMap();
        useEffect(() => {
            if (markers.length > 0) {
                const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }, [markers, map]);
        return null;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return '#4f46e5';
            case 'ASSIGNED': return '#f59e0b';
            case 'AWAITING_VERIFICATION': return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <Layout>
            <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900' }}>Live Field Operations</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Real-time location of active technicians and job sites.</p>
                    </div>
                    {loading && <Loader2 className="animate-spin text-primary" size={24} />}
                </header>

                <div className="map-wrapper" style={{ flex: 1, borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                    {markers.length === 0 && !loading ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                            <div style={{ textAlign: 'center' }}>
                                <MapPin size={48} className="text-muted" style={{ margin: '0 auto 16px' }} />
                                <h3 style={{ fontWeight: '800' }}>No active field operations</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Technician locations appear here when jobs start.</p>
                            </div>
                        </div>
                    ) : (
                        <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <MapAutoCenter markers={markers} />
                            {markers.map((m) => (
                                <Marker key={m.workOrderId} position={[m.latitude, m.longitude]}>
                                    <Popup>
                                        <div style={{ padding: '8px', minWidth: '200px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)' }}>#WO-{m.workOrderId + 1000}</span>
                                                <span style={{ fontSize: '10px', background: getStatusColor(m.status), color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>{m.status}</span>
                                            </div>
                                            <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>{m.customerName}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                                <User size={12} /> {m.workerName}
                                            </div>
                                            <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700' }}>
                                                <Clock size={12} /> Last updated: {m.lastUpdated}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default LiveOpsMap;
