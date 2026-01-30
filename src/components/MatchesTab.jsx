import { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatMatchDate, getMatchday } from '../data/schedule';
import MatchCard from './MatchCard';
import './MatchesTab.css';

const MatchesTab = () => {
  const { matches, loading } = useApp();
  const [collapsedMatchdays, setCollapsedMatchdays] = useState({});

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
      .map(([date, dateMatches]) => {
        const matchday = getMatchday(date);
        const sortedMatches = dateMatches.sort((a, b) => a.time.localeCompare(b.time));

        // Calculate matchday stats
        const completedMatches = sortedMatches.filter(m => m.status === 'ft');
        const liveMatches = sortedMatches.filter(m => m.status === 'live');
        const totalGoals = completedMatches.reduce((sum, m) => sum + (m.scoreHome || 0) + (m.scoreAway || 0), 0);
        const isComplete = completedMatches.length === sortedMatches.length;
        const isLive = liveMatches.length > 0;
        const hasStarted = completedMatches.length > 0 || isLive;

        return {
          date,
          dateLabel: formatMatchDate(date),
          matchday,
          matches: sortedMatches,
          stats: {
            total: sortedMatches.length,
            completed: completedMatches.length,
            live: liveMatches.length,
            totalGoals,
            isComplete,
            isLive,
            hasStarted
          }
        };
      });
  }, [matches]);

  // Get live matches first
  const liveMatches = matches.filter(m => m.status === 'live');

  // Tournament progress
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === 'ft').length;
  const progressPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  // Determine which matchdays should be collapsed by default
  // Completed matchdays are collapsed, current/upcoming are expanded
  const getDefaultCollapsed = (matchday, isComplete, hasStarted) => {
    // If user has explicitly toggled, use their preference
    if (collapsedMatchdays[matchday] !== undefined) {
      return collapsedMatchdays[matchday];
    }
    // Default: collapse completed matchdays
    return isComplete;
  };

  const toggleMatchday = (matchday) => {
    setCollapsedMatchdays(prev => ({
      ...prev,
      [matchday]: !getDefaultCollapsed(matchday, groupedMatches.find(g => g.matchday.name === matchday)?.stats.isComplete, true)
    }));
  };

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
      {/* Tournament Progress */}
      <section className="tournament-progress animate-slide-up">
        <div className="progress-header">
          <span className="progress-title">SCAPIA OFFSIDE CUP 2026</span>
          <span className="progress-count">{completedMatches}/{totalMatches} matches</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="progress-percent">{progressPercent}%</span>
        </div>
      </section>

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
      {groupedMatches.map((group, groupIndex) => {
        const isCollapsed = getDefaultCollapsed(group.matchday.name, group.stats.isComplete, group.stats.hasStarted);

        return (
          <section
            key={group.date}
            className={`matchday-section ${group.stats.isComplete ? 'completed' : ''} ${group.stats.isLive ? 'has-live' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            style={{ animationDelay: `${0.05 + groupIndex * 0.05}s` }}
          >
            <div
              className="matchday-header clickable"
              onClick={() => toggleMatchday(group.matchday.name)}
            >
              <div className="matchday-info">
                <span className="matchday-icon">{group.matchday.icon}</span>
                <div className="matchday-text">
                  <span className="matchday-name">{group.matchday.name}</span>
                  <span className="matchday-date">{group.dateLabel}</span>
                </div>
              </div>
              <div className="matchday-meta">
                <span className="ground-name">{group.matchday.ground}</span>
                {group.stats.hasStarted && (
                  <div className="matchday-stats">
                    {group.stats.isComplete ? (
                      <span className="stat-badge complete">
                        <span className="stat-icon">✓</span>
                        {group.stats.totalGoals} goals
                      </span>
                    ) : group.stats.isLive ? (
                      <span className="stat-badge live">
                        <span className="live-dot"></span>
                        {group.stats.live} LIVE
                      </span>
                    ) : (
                      <span className="stat-badge partial">
                        {group.stats.completed}/{group.stats.total}
                      </span>
                    )}
                  </div>
                )}
                <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>▼</span>
              </div>
            </div>

            {/* Matches with timeline - only show when not collapsed */}
            {!isCollapsed && (
              <div className="matchday-matches">
                {group.matches.map((match, index) => (
                  <div key={match.id} className="match-timeline-item">
                    {/* Timeline connector */}
                    <div className="timeline-connector">
                      <div className={`timeline-dot ${match.status}`}></div>
                      {index < group.matches.length - 1 && (
                        <div className="timeline-line"></div>
                      )}
                    </div>
                    <div className="match-content">
                      <MatchCard match={match} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

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
