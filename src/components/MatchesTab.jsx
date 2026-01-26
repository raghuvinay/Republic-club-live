import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatMatchDate } from '../data/schedule';
import MatchCard from './MatchCard';

const MatchesTab = () => {
  const { matches, loading } = useApp();

  // Group matches by date
  const groupedMatches = useMemo(() => {
    const groups = {};

    matches.forEach(match => {
      const dateKey = match.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(match);
    });

    // Sort dates
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, dateMatches]) => ({
        date,
        dateLabel: formatMatchDate(date),
        matches: dateMatches.sort((a, b) => a.time.localeCompare(b.time))
      }));
  }, [matches]);

  // Get live matches first
  const liveMatches = matches.filter(m => m.status === 'live');

  if (loading) {
    return (
      <div className="tab-content">
        <div className="loading-container" style={{ minHeight: '200px' }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <section className="live-section animate-fade-in">
          <div className="section-header">
            <h2 className="section-title">PLAYING NOW</h2>
            <span className="section-badge live-badge">
              {liveMatches.length} LIVE
            </span>
          </div>
          {liveMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </section>
      )}

      {/* All Matches by Date */}
      {groupedMatches.map(group => (
        <section key={group.date}>
          <div className="date-divider">
            <span className="date-label">{group.dateLabel}</span>
          </div>
          {group.matches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </section>
      ))}

      {matches.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">⚽</div>
          <h3>No Matches Yet</h3>
          <p>Check back when the tournament begins!</p>
        </div>
      )}
    </div>
  );
};

export default MatchesTab;
