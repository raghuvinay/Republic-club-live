import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { TEAMS } from '../data/teams';
import './TableTab.css';

const TableTab = () => {
  const { calculateTable, calculateTopScorers, matches, predictions } = useApp();

  const table = useMemo(() => calculateTable(), [calculateTable]);
  const topScorers = useMemo(() => calculateTopScorers(), [calculateTopScorers]);

  const completedMatches = matches.filter(m => m.status === 'ft' && !m.isFinal).length;

  // Calculate top assists (only from completed matches)
  const topAssists = useMemo(() => {
    const assists = {};
    matches
      .filter(m => m.status === 'ft')
      .forEach(match => {
        (match.goals || []).forEach(goal => {
          if (goal.assist) {
            const key = goal.assist;
            if (!assists[key]) {
              assists[key] = { player: goal.assist, assists: 0 };
            }
            assists[key].assists++;
          }
        });
      });
    return Object.values(assists)
      .sort((a, b) => b.assists - a.assists)
      .slice(0, 5);
  }, [matches]);

  // Calculate clean sheets by team
  const cleanSheets = useMemo(() => {
    const sheets = {};
    Object.keys(TEAMS).forEach(teamId => {
      sheets[teamId] = 0;
    });

    matches.filter(m => m.status === 'ft').forEach(match => {
      if (match.scoreAway === 0 && sheets[match.home] !== undefined) {
        sheets[match.home]++;
      }
      if (match.scoreHome === 0 && sheets[match.away] !== undefined) {
        sheets[match.away]++;
      }
    });

    return Object.entries(sheets)
      .map(([teamId, count]) => ({ teamId, count }))
      .sort((a, b) => b.count - a.count);
  }, [matches]);

  // Calculate poll leaderboard (total coins won per person)
  const PRIZE_POOL = 1000;
  const pollLeaderboard = useMemo(() => {
    const earnings = {};

    matches.filter(m => m.momPublishedAt && m.momWinners?.length > 0).forEach(match => {
      const coinsPerWinner = Math.floor(PRIZE_POOL / match.momWinners.length);
      match.momWinners.forEach(winner => {
        if (!earnings[winner]) {
          earnings[winner] = { name: winner, coins: 0, wins: 0 };
        }
        earnings[winner].coins += coinsPerWinner;
        earnings[winner].wins++;
      });
    });

    return Object.values(earnings)
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 10);
  }, [matches]);

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
            <span className="col-stat col-wdl">W</span>
            <span className="col-stat col-wdl">D</span>
            <span className="col-stat col-wdl">L</span>
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
                  <span className="table-team-name">{team.name}</span>
                </span>
                <span className="col-stat">{row.played}</span>
                <span className="col-stat col-wdl">{row.won}</span>
                <span className="col-stat col-wdl">{row.drawn}</span>
                <span className="col-stat col-wdl">{row.lost}</span>
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
          <h2 className="section-title">GOLDEN BOOT</h2>
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

      {/* Top Assists */}
      {topAssists.length > 0 && (
        <section className="scorers-section animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="section-header">
            <h2 className="section-title">TOP ASSISTS</h2>
          </div>

          <div className="scorers-list">
            {topAssists.map((player, index) => (
              <div
                key={player.player}
                className={`scorer-row ${index === 0 ? 'leader assist-leader' : ''}`}
                style={{ animationDelay: `${(index + 4) * 0.05}s` }}
              >
                <span className="scorer-rank">
                  {index === 0 ? '🎯' : index + 1}
                </span>
                <div className="scorer-info">
                  <span className="scorer-name">{player.player}</span>
                </div>
                <span className="scorer-goals assist-count">{player.assists}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clean Sheets */}
      <section className="scorers-section animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="section-header">
          <h2 className="section-title">CLEAN SHEETS</h2>
        </div>

        <div className="scorers-list">
          {cleanSheets.map((item, index) => {
            const team = TEAMS[item.teamId];
            if (!team) return null;
            return (
              <div
                key={item.teamId}
                className={`scorer-row ${index === 0 && item.count > 0 ? 'leader clean-leader' : ''}`}
                style={{ animationDelay: `${(index + 4) * 0.05}s` }}
              >
                <span className="scorer-rank">
                  {index === 0 && item.count > 0 ? '🛡️' : index + 1}
                </span>
                <div className="scorer-info">
                  <img src={team.logo} alt={team.name} className="table-team-logo" />
                  <span className="scorer-name">{team.name}</span>
                </div>
                <span className="scorer-goals">{item.count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Summary */}
      <section className="stats-section animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <div className="section-header">
          <h2 className="section-title">TOURNAMENT STATS</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">
              {matches.filter(m => m.status === 'ft').reduce((sum, m) => sum + (m.scoreHome || 0) + (m.scoreAway || 0), 0)}
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
                ? (matches.filter(m => m.status === 'ft').reduce((sum, m) => sum + (m.scoreHome || 0) + (m.scoreAway || 0), 0) / completedMatches).toFixed(1)
                : '0.0'
              }
            </span>
            <span className="stat-label">Goals/Match</span>
          </div>
        </div>
      </section>

      {/* Poll Leaderboard */}
      {pollLeaderboard.length > 0 && (
        <section className="scorers-section poll-leaderboard animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="section-header">
            <h2 className="section-title">POLL LEADERBOARD</h2>
            <span className="section-badge coins-badge">COINS</span>
          </div>

          <div className="scorers-list">
            {pollLeaderboard.map((player, index) => (
              <div
                key={player.name}
                className={`scorer-row ${index === 0 ? 'leader coins-leader' : ''}`}
                style={{ animationDelay: `${(index + 4) * 0.05}s` }}
              >
                <span className="scorer-rank">
                  {index === 0 ? '💰' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </span>
                <div className="scorer-info">
                  <span className="scorer-name">{player.name}</span>
                  <span className="scorer-team">{player.wins} win{player.wins !== 1 ? 's' : ''}</span>
                </div>
                <span className="scorer-goals coins-value">{player.coins}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TableTab;
