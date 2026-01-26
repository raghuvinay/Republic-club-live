import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { TEAMS } from '../data/teams';
import { formatMatchTime } from '../data/schedule';
import AdminModal from './AdminModal';
import './MatchCard.css';

const MatchCard = ({ match }) => {
  const { isAdmin } = useApp();
  const [showAdminModal, setShowAdminModal] = useState(false);

  const homeTeam = TEAMS[match.home] || { name: 'TBD', shortName: 'TBD', logo: null };
  const awayTeam = TEAMS[match.away] || { name: 'TBD', shortName: 'TBD', logo: null };

  const getStatusClass = () => {
    switch (match.status) {
      case 'live': return 'status-live';
      case 'ft': return 'status-ft';
      default: return 'status-upcoming';
    }
  };

  const getStatusText = () => {
    switch (match.status) {
      case 'live': return 'LIVE';
      case 'ft': return 'FT';
      default: return formatMatchTime(match.time);
    }
  };

  // Get goal scorers for display
  const getGoalScorers = (teamId) => {
    return (match.goals || [])
      .filter(g => g.team === teamId)
      .map(g => g.player.split(' ')[0]) // First name only
      .join(', ');
  };

  return (
    <>
      <div className={`match-card ${match.status} ${match.isFinal ? 'final' : ''}`}>
        {match.isFinal && (
          <div className="final-badge">FINAL</div>
        )}

        <div className="match-header">
          <span className="match-number">Match {match.matchNumber}</span>
          <span className={`match-status ${getStatusClass()}`}>
            {match.status === 'live' && <span className="live-dot"></span>}
            {getStatusText()}
          </span>
        </div>

        <div className="match-body">
          {/* Home Team */}
          <div className="team home-team">
            <div className="team-logo-wrapper">
              {homeTeam.logo ? (
                <img src={homeTeam.logo} alt={homeTeam.name} className="team-logo" />
              ) : (
                <div className="team-logo-placeholder">?</div>
              )}
            </div>
            <span className="team-name">{homeTeam.shortName}</span>
            {match.status !== 'upcoming' && (
              <span className="goal-scorers">{getGoalScorers(match.home)}</span>
            )}
          </div>

          {/* Score */}
          <div className="score-container">
            {match.status === 'upcoming' ? (
              <span className="vs-text">VS</span>
            ) : (
              <div className="score">
                <span className="score-home">{match.scoreHome}</span>
                <span className="score-separator">-</span>
                <span className="score-away">{match.scoreAway}</span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="team away-team">
            <div className="team-logo-wrapper">
              {awayTeam.logo ? (
                <img src={awayTeam.logo} alt={awayTeam.name} className="team-logo" />
              ) : (
                <div className="team-logo-placeholder">?</div>
              )}
            </div>
            <span className="team-name">{awayTeam.shortName}</span>
            {match.status !== 'upcoming' && (
              <span className="goal-scorers">{getGoalScorers(match.away)}</span>
            )}
          </div>
        </div>

        {isAdmin && (
          <button
            className="edit-button"
            onClick={() => setShowAdminModal(true)}
          >
            Edit
          </button>
        )}
      </div>

      {showAdminModal && (
        <AdminModal
          match={match}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </>
  );
};

export default MatchCard;
