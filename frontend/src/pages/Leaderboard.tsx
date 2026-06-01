import React from 'react';
import { Layout } from '../components/Layout';
import { useGetLeaderboardQuery } from '../redux/gamificationApi';
import { Trophy, Medal, Star, Target, Zap, ShieldCheck } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

const LeaderboardPage: React.FC = () => {
    const { data: leaderboard = [], isLoading } = useGetLeaderboardQuery();

    const getBadgeIcon = (key: string) => {
        switch (key) {
            case 'MILESTONE_10': return <Target size={16} className="text-primary" />;
            case 'FIVE_STAR_PRO': return <Star size={16} className="text-warning" />;
            case 'ELITE_WORKER': return <ShieldCheck size={16} className="text-success" />;
            default: return <Zap size={16} />;
        }
    };

    const getBadgeLabel = (key: string) => {
        switch (key) {
            case 'MILESTONE_10': return '10 Jobs Club';
            case 'FIVE_STAR_PRO': return '5-Star Pro';
            case 'ELITE_WORKER': return 'Elite Technician';
            default: return key;
        }
    };

    return (
        <Layout>
            <div className="leaderboard-container">
                <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary-light)', borderRadius: '20px', marginBottom: '16px' }}>
                        <Trophy size={32} className="text-primary" />
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: '900' }}>Organization Leaderboard</h1>
                    <p className="text-muted">Celebrating our top performing technicians and service excellence.</p>
                </header>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}><LoadingSpinner /></div>
                ) : (
                    <div className="leaderboard-grid">
                        {/* Top 3 Podiums */}
                        <div className="podium-section">
                            {leaderboard.slice(0, 3).map((entry, index) => (
                                <div key={entry.id} className={`podium-card rank-${index + 1}`}>
                                    <div className="rank-badge">
                                        {index === 0 ? <Trophy size={20} /> : <Medal size={20} />}
                                    </div>
                                    <div className="podium-avatar">
                                        {entry.worker.user.name[0]}
                                    </div>
                                    <h3 style={{ fontWeight: '800', marginTop: '12px' }}>{entry.worker.user.name}</h3>
                                    <div className="podium-points">{entry.totalPoints} PTS</div>
                                    <div className="podium-level">Level {entry.level}</div>
                                </div>
                            ))}
                        </div>

                        {/* Full Rankings Table */}
                        <div className="rankings-table-card">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>RANK</th>
                                        <th>TECHNICIAN</th>
                                        <th>COMPLETED</th>
                                        <th>RATING</th>
                                        <th>BADGES</th>
                                        <th>TOTAL POINTS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((entry, index) => (
                                        <tr key={entry.id}>
                                            <td style={{ fontWeight: '900', color: index < 3 ? 'var(--primary)' : 'inherit' }}>#{index + 1}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div className="table-avatar">{entry.worker.user.name[0]}</div>
                                                    <div>
                                                        <div style={{ fontWeight: '700' }}>{entry.worker.user.name}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{entry.worker.designation}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '700' }}>{entry.completedJobs} Jobs</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308', fontWeight: '800' }}>
                                                    <Star size={14} fill="currentColor" /> {entry.averageRating.toFixed(1)}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    {entry.badges.map((b: string) => (
                                                        <div key={b} className="badge-pill" title={getBadgeLabel(b)}>
                                                            {getBadgeIcon(b)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="points-tag">{entry.totalPoints} PTS</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .leaderboard-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
                .podium-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; align-items: flex-end; }
                .podium-card { background: white; border-radius: 24px; padding: 32px 24px; text-align: center; position: relative; border: 1px solid var(--border); box-shadow: var(--shadow-md); transition: transform 0.2s; }
                .podium-card:hover { transform: translateY(-8px); }
                .rank-1 { height: 320px; border: 2px solid #fbbf24; background: linear-gradient(to bottom, #fff, #fefce8); order: 2; }
                .rank-2 { height: 280px; order: 1; }
                .rank-3 { height: 260px; order: 3; }
                .rank-badge { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); width: 40px; height: 40px; background: #fbbf24; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(251, 191, 36, 0.4); }
                .rank-2 .rank-badge { background: #94a3b8; }
                .rank-3 .rank-badge { background: #92400e; }
                .podium-avatar { width: 80px; height: 80px; border-radius: 20px; background: var(--primary); color: white; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 900; }
                .podium-points { font-size: 24px; fontWeight: 900; color: var(--primary); margin-top: 12px; }
                .podium-level { font-size: 13px; fontWeight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
                .rankings-table-card { background: white; border-radius: 24px; border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow-sm); }
                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { text-align: left; padding: 20px 24px; font-size: 11px; font-weight: 900; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
                .modern-table td { padding: 20px 24px; border-bottom: 1px solid var(--border-light); }
                .table-avatar { width: 40px; height: 40px; border-radius: 10px; background: var(--surface-muted); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; }
                .badge-pill { width: 32px; height: 32px; border-radius: 8px; background: var(--surface-muted); display: flex; align-items: center; justify-content: center; }
                .points-tag { display: inline-block; padding: 6px 14px; background: var(--primary-light); color: var(--primary); border-radius: 12px; font-weight: 900; font-size: 13px; }
            `}</style>
        </Layout>
    );
};

export default LeaderboardPage;
