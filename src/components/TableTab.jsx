import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { TEAMS } from '../data/teams';
import './TableTab.css';

const TableTab = () => {
  const { calculateTable, calculateTopScorers, matches } = useApp();

  const table = useMemo(() => calculateTable(), [calculateTable]);
  const topScorers = useMemo(() => calculateTopScorers(), [calculateTopScorers]);

  const completedMatches = matches.filter(m => m.status === 'ft' && !m.isFinal).length;

  return (
    <div className="tab-content">
      {/* League Table */}
      <section className="table-section animate-slide-up">
        <div className="section-header">
          <h2 className="section-title">STANDINGS</h2>
          <span className="section-badge">{completedMatches} PLAYED</span>
        </div>

        <div className="league-table">
          <div className="table-header">
            <span className="col-pos">#</span>
            <span className="col-team">Team</span>
            <span className="col-stat">P</span>
            <span className="col-stat">GD</span>
            <span className="col-pts">PTS</span>
          </div>

          {table.map((row, index) => {
            const team = TEAMS[row.teamId];
            if (!team) return null;

            return (
              <div
                key={row.teamId}
                className={`table-row ${index < 2 ? 'qualified' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="col-pos">
                  <span className={`position ${index < 2 ? 'top' : ''}`}>
                    {index + 1}
                  </span>
                </span>
                <span className="col-team">
                  <img src={team.logo} alt={team.name} className="table-team-logo" />
                  <span className="table-team-name">{team.shortName}</span>
                </span>
                <span className="col-stat">{row.played}</span>
                <span className="col-stat">
                  {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                </span>
                <span className="col-pts">{row.points}</span>
              </div>
            );
          })}
        </div>

        <div className="table-legend">
          <span className="legend-item qualified-legend">
            <span className="legend-dot"></span>
            Qualifies for Final
          </span>
        </div>
      </section>

      {/* Top Scorers */}
      <section className="scorers-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h2 className="section-title">TOP SCORERS</h2>
          <span className="section-badge golden">GOLDEN BOOT</span>
        </div>

        {topScorers.length > 0 ? (
          <div className="scorers-list">
            {topScorers.map((scorer, index) => {
              const team = TEAMS[scorer.team];
              return (
                <div
                  key={`${scorer.player}-${scorer.team}`}
                  className={`scorer-row ${index === 0 ? 'leader' : ''}`}
                  style={{ animationDelay: `${(index + 4) * 0.05}s` }}
                >
                  <span className="scorer-rank">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </span>
                  <div className="scorer-info">
                    <span className="scorer-name">{scorer.player}</span>
                    <span className="scorer-team">{team?.name || scorer.team}</span>
                  </div>
                  <span className="scorer-goals">{scorer.goals}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No goals scored yet</p>
          </div>
        )}
      </section>

      {/* Stats Summary */}
      <section className="stats-section animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="section-header">
          <h2 className="section-title">TOURNAMENT STATS</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">
              {matches.reduce((sum, m) => sum + (m.scoreHome || 0) + (m.scoreAway || 0), 0)}
            </span>
            <span className="stat-label">Total Goals</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{completedMatches}</span>
            <span className="stat-label">Matches Played</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {completedMatches > 0
                ? (matches.reduce((sum, m) => sum + (m.scoreHome || 0) + (m.scoreAway || 0), 0) / completedMatches).toFixed(1)
                : '0.0'
              }
            </span>
            <span className="stat-label">Goals/Match</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TableTab;
