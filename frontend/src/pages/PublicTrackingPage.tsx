import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Phone, Star, ShieldCheck, MapPin, Clock, CheckCircle2, Navigation } from 'lucide-react';

// Component to handle map behavior and animations
const MapController: React.FC<{ workerCoords: [number, number], destCoords?: [number, number] | null }> = ({ workerCoords, destCoords }) => {
    const map = useMap();
    
    useEffect(() => {
        if (destCoords) {
            const bounds = L.latLngBounds([workerCoords, destCoords]);
            map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
        } else {
            map.setView(workerCoords, 15);
        }
    }, [workerCoords, destCoords, map]);
    
    return null;
};

const PublicTrackingPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [info, setInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [prevCoords, setPrevCoords] = useState<[number, number] | null>(null);
    const [animatedCoords, setAnimatedCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/tracking/${id}`);
                const result = await response.json();
                const data = result.data;
                setInfo(data);
                
                if (data.latitude && data.longitude) {
                    const newCoords: [number, number] = [data.latitude, data.longitude];
                    if (!animatedCoords) {
                        setAnimatedCoords(newCoords);
                    } else {
                        animateMovement(animatedCoords, newCoords);
                    }
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchInfo();
        const interval = setInterval(fetchInfo, 15000); // Faster polling for animation
        return () => clearInterval(interval);
    }, [id, animatedCoords]);

    const animateMovement = (start: [number, number], end: [number, number]) => {
        const duration = 2000; // 2 seconds animation
        const frames = 60;
        const stepLat = (end[0] - start[0]) / frames;
        const stepLon = (end[1] - start[1]) / frames;
        let currentFrame = 0;

        const animate = () => {
            currentFrame++;
            if (currentFrame <= frames) {
                setAnimatedCoords([
                    start[0] + stepLat * currentFrame,
                    start[1] + stepLon * currentFrame
                ]);
                requestAnimationFrame(animate);
            }
        };
        animate();
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>;
    if (!info) return <div>Tracking not found.</div>;

    const steps = [
        { label: 'Assigned', icon: <CheckCircle2 size={16}/>, active: true },
        { label: 'Journey', icon: <MapPin size={16}/>, active: info.status === 'IN_PROGRESS' || info.trackingStatus === 'ON_THE_WAY' },
        { label: 'On Site', icon: <Clock size={16}/>, active: info.status === 'IN_PROGRESS' },
        { label: 'Verified', icon: <ShieldCheck size={16}/>, active: info.status === 'COMPLETED' || info.status === 'AWAITING_VERIFICATION' }
    ];

    const calculateETA = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c; // distance in km
        
        const avgBikeSpeedKmH = 20; // Avg city bike speed
        const timeH = distanceKm / avgBikeSpeedKmH;
        const timeM = Math.round(timeH * 60);
        
        // Return a range to account for 5-10% error margin
        const minTime = Math.max(1, Math.round(timeM * 0.9));
        const maxTime = Math.round(timeM * 1.1);
        
        return `${minTime}-${maxTime} min`;
    };

    const workerPos = animatedCoords || (info.latitude ? [info.latitude, info.longitude] as [number, number] : null);
    const destPos = info.destinationLatitude ? [info.destinationLatitude, info.destinationLongitude] as [number, number] : null;
    
    const eta = (workerPos && destPos) ? calculateETA(workerPos[0], workerPos[1], destPos[0], destPos[1]) : 'calculating...';

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative', background: '#f8fafc', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Top Navigation & Status */}
            <header style={{ 
                background: 'white', 
                padding: '16px 24px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                zIndex: 1000,
                borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                    <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Service Track</span>
                        <h1 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0' }}>Job #{Number(info.workOrderId) + 1000}</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Estimated Arrival</p>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>{eta}</p>
                        </div>
                        <span className={`badge ${info.status === 'IN_PROGRESS' ? 'badge-success' : 'badge-primary'}`}>
                            {info.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Progress Timeline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', maxWidth: '600px', margin: '16px auto 0' }}>
                    {steps.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                            <div style={{ 
                                width: '28px', height: '28px', borderRadius: '50%', 
                                background: step.active ? 'var(--primary)' : '#e2e8f0', 
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 
                            }}>{step.icon}</div>
                            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '6px', color: step.active ? 'var(--text-h)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{step.label}</span>
                            {idx < steps.length - 1 && (
                                <div style={{ position: 'absolute', left: '50%', right: '-50%', top: '14px', height: '2px', background: steps[idx+1].active ? 'var(--primary)' : '#e2e8f0', zIndex: 1 }}></div>
                            )}
                        </div>
                    ))}
                </div>
            </header>
            
            {/* Main Content Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                {workerPos ? (
                    <MapContainer center={workerPos} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        
                        {/* Destination Marker */}
                        {destPos && (
                            <Marker position={destPos} icon={L.divIcon({
                                className: 'dest-marker',
                                html: `<div style="background: var(--text-h); width: 20px; height: 20px; border-radius: 4px; border: 3px solid white; transform: rotate(45deg); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div></div>`,
                                iconSize: [20, 20]
                            })}>
                                <Popup>Your Location</Popup>
                            </Marker>
                        )}

                        {/* Animated Worker Marker */}
                        <Marker position={workerPos} icon={L.divIcon({
                            className: 'worker-marker',
                            html: `
                                <div class="pulse-container">
                                    <div class="pulse-ring"></div>
                                    <div class="worker-dot">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                                    </div>
                                </div>
                            `,
                            iconSize: [40, 40]
                        })}>
                            <Popup><strong>{info.workerName}</strong> is moving</Popup>
                        </Marker>

                        {/* Route Line */}
                        {destPos && <Polyline positions={[workerPos, destPos]} color="var(--primary)" weight={3} dashArray="10, 10" opacity={0.6} />}
                        
                        <MapController workerCoords={workerPos} destCoords={destPos} />
                    </MapContainer>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                        <div style={{ background: 'white', padding: '48px', borderRadius: '32px', boxShadow: 'var(--shadow-lg)', textAlign: 'center', maxWidth: '400px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛡️</div>
                            <h2 style={{ fontWeight: 800, fontSize: '24px', color: 'var(--text-h)' }}>Preparing Connection</h2>
                            <p style={{ color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.6 }}>
                                <strong>{info.workerName}</strong> is getting ready. Live tracking will begin shortly.
                            </p>
                        </div>
                    </div>
                )}

                {/* Floating Info Card */}
                <div style={{ 
                    position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', 
                    width: 'calc(100% - 40px)', maxWidth: '450px', zIndex: 1000,
                    background: 'white', borderRadius: '24px', padding: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.12)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                            width: '56px', height: '56px', borderRadius: '16px', 
                            background: 'var(--primary-light)', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800
                        }}>{info.workerName.charAt(0)}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '16px' }}>{info.workerName}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#fffbeb', padding: '2px 6px', borderRadius: '6px' }}>
                                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e' }}>{info.workerRating}</span>
                                </div>
                            </div>
                            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {info.workerExperience} Exp • On the way
                            </p>
                        </div>
                        {info.workerPhone && (
                            <a href={`tel:${info.workerPhone}`} style={{ 
                                width: '44px', height: '44px', borderRadius: '50%', 
                                background: 'var(--success)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'
                            }}><Phone size={18} fill="white" /></a>
                        )}
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Navigation size={14} className="text-primary" />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Heading to your site via main road</span>
                    </div>
                </div>
            </div>
            
            <style>{`
                .worker-dot {
                    background: var(--primary); width: 30px; height: 30px; border-radius: 50%;
                    border: 3px solid white; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 10;
                }
                .pulse-container { position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; }
                .pulse-ring {
                    position: absolute; width: 100%; height: 100%; background: var(--primary);
                    border-radius: 50%; opacity: 0.4; animation: pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite;
                }
                @keyframes pulse-ring { 0% { transform: scale(0.5); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }
                .dest-marker { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
            `}</style>
        </div>
    );
};

export default PublicTrackingPage;
