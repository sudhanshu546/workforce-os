import React, { useState } from 'react';
import { Briefcase, Zap, Award, Navigation, ShieldCheck, Users, Loader2, ChevronRight } from 'lucide-react';
import Modal from './Modal';
import api from '../services/api';
import { useAssignWorkerMutation, useLazyGetRecommendationsQuery } from '../redux/ordersApi';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWO: any;
  workers: any[];
  onAssigned: () => void;
}

const DispatchModal: React.FC<DispatchModalProps> = ({ isOpen, onClose, selectedWO, workers, onAssigned }) => {
  const [triggerRecommendations, { data: recommendations = [], isLoading: loadingRecs }] = useLazyGetRecommendationsQuery();
  const [assignWorker, { isLoading: assigning }] = useAssignWorkerMutation();

  if (!selectedWO) return null;

  const handleAssign = async (workerId: number) => {
    try {
      await assignWorker({ workOrderId: selectedWO.id, workerId }).unwrap();
      onAssigned();
      onClose();
    } catch (err) {
      console.error('Failed to assign worker:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Technician Dispatch Control" width="950px">
      <div className="premium-form-layout">
        <div className="dispatch-header-card">
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="id-badge">#WO-{selectedWO.id + 1000}</div>
            <div>
              <div className="dispatch-customer-name">{selectedWO.customer?.name}</div>
              <div className="dispatch-service-name"><Briefcase size={14} /> {selectedWO.serviceName}</div>
            </div>
          </div>
          <button className="btn-smart-dispatch" onClick={() => triggerRecommendations(selectedWO.id)} disabled={loadingRecs}>
            {loadingRecs ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
            {loadingRecs ? 'Analyzing...' : 'Smart Suggest'}
          </button>
        </div>

        {recommendations.length > 0 && (
          <div className="smart-recs-container">
            <div className="section-title"><Award size={16} /> Top Matches (Skill & Proximity)</div>
            <div className="recs-grid">
              {recommendations.map((rec, index) => (
                <div key={rec.workerId} className={`rec-card ${index === 0 ? 'top-match' : ''}`} onClick={() => handleAssign(rec.workerId)}>
                  {index === 0 && <div className="match-ribbon">Best Match</div>}
                  <div className="rec-score">{(rec.matchScore * 100).toFixed(0)}%</div>
                  <div className="rec-info">
                    <div className="rec-name">{rec.name}</div>
                    <div className="rec-details">
                      <span className="rec-distance"><Navigation size={12} /> {rec.distanceKm ? `${rec.distanceKm.toFixed(1)} km` : 'Location N/A'}</span>
                      {rec.skillMatch && <span className="rec-skill-badge"><ShieldCheck size={12} /> Expert</span>}
                    </div>
                    <div className="rec-updated">Last active: {rec.lastUpdated}</div>
                  </div>
                  <button className="rec-assign-btn">Dispatch</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="all-workers-section">
          <div className="section-title"><Users size={16} /> All Available Technicians</div>
          <div className="worker-selection-grid-standard">
            {workers.map(worker => (
              <button
                key={worker.id}
                onClick={() => handleAssign(worker.id)}
                disabled={assigning}
                className="worker-assign-card-standard"
              >
                <div className="avatar-box-standard">
                  {worker.user?.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-h)', fontSize: '15px' }}>{worker.user?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>{worker.designation}</span>
                    <span>•</span>
                    <span className="text-success">Ready</span>
                  </div>
                </div>
                <div className="assign-action-standard">
                  {assigning ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DispatchModal;
