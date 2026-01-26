import { useState } from 'react';
import { TEAMS } from '../data/teams';
import { updateMatch } from '../firebase';
import GoalModal from './GoalModal';
import './Modal.css';
import './AdminModal.css';

const AdminModal = ({ match, onClose }) => {
  const [status, setStatus] = useState(match.status);
  const [showGoalModal, setShowGoalModal] = useState(null); // 'home' | 'away' | null
  const [updating, setUpdating] = useState(false);

  const homeTeam = TEAMS[match.home] || { name: 'TBD', shortName: 'TBD' };
  const awayTeam = TEAMS[match.away] || { name: 'TBD', shortName: 'TBD' };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await updateMatch(match.id, { status: newStatus });
    setStatus(newStatus);
    setUpdating(false);
  };

  const handleResetScore = async () => {
    if (window.confirm('Are you sure you want to reset the score to 0-0?')) {
      setUpdating(true);
      await updateMatch(match.id, {
        scoreHome: 0,
        scoreAway: 0,
        goals: []
      });
      setUpdating(false);
    }
  };

  const handleGoalScored = async (player, team, isHome) => {
    setUpdating(true);

    const newGoal = {
      player,
      team,
      timestamp: new Date().toISOString()
    };

    const newGoals = [...(match.goals || []), newGoal];

    // Calculate new scores
    const newScoreHome = newGoals.filter(g => g.team === match.home).length;
    const newScoreAway = newGoals.filter(g => g.team === match.away).length;

    await updateMatch(match.id, {
      goals: newGoals,
      scoreHome: newScoreHome,
      scoreAway: newScoreAway
    });

    setShowGoalModal(null);
    setUpdating(false);
  };

  const handleRemoveLastGoal = async (isHome) => {
    const teamId = isHome ? match.home : match.away;
    const teamGoals = (match.goals || []).filter(g => g.team === teamId);

    if (teamGoals.length === 0) return;

    // Remove the last goal for this team
    const lastGoalIndex = match.goals.map(g => g.team).lastIndexOf(teamId);
    const newGoals = match.goals.filter((_, i) => i !== lastGoalIndex);

    const newScoreHome = newGoals.filter(g => g.team === match.home).length;
    const newScoreAway = newGoals.filter(g => g.team === match.away).length;

    setUpdating(true);
    await updateMatch(match.id, {
      goals: newGoals,
      scoreHome: newScoreHome,
      scoreAway: newScoreAway
    });
    setUpdating(false);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content admin-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Edit Match {match.matchNumber}</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <div className="admin-content">
            {/* Match Info */}
            <div className="admin-match-info">
              <div className="admin-team">
                {homeTeam.logo && <img src={homeTeam.logo} alt={homeTeam.name} />}
                <span>{homeTeam.shortName}</span>
              </div>
              <div className="admin-score">
                <span>{match.scoreHome}</span>
                <span className="admin-score-sep">-</span>
                <span>{match.scoreAway}</span>
              </div>
              <div className="admin-team">
                {awayTeam.logo && <img src={awayTeam.logo} alt={awayTeam.name} />}
                <span>{awayTeam.shortName}</span>
              </div>
            </div>

            {/* Status Controls */}
            <div className="admin-section">
              <label>Match Status</label>
              <div className="status-buttons">
                {['upcoming', 'live', 'ft'].map(s => (
                  <button
                    key={s}
                    className={`status-btn ${status === s ? 'active' : ''} status-${s}`}
                    onClick={() => handleStatusChange(s)}
                    disabled={updating}
                  >
                    {s === 'upcoming' ? 'Upcoming' : s === 'live' ? 'Live' : 'Full Time'}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Controls */}
            <div className="admin-section">
              <label>Add Goal</label>
              <div className="goal-buttons">
                <button
                  className="goal-btn home"
                  onClick={() => setShowGoalModal('home')}
                  disabled={updating || match.home === 'tbd'}
                >
                  + Goal {homeTeam.shortName}
                </button>
                <button
                  className="goal-btn away"
                  onClick={() => setShowGoalModal('away')}
                  disabled={updating || match.away === 'tbd'}
                >
                  + Goal {awayTeam.shortName}
                </button>
              </div>
            </div>

            {/* Remove Last Goal */}
            <div className="admin-section">
              <label>Remove Last Goal</label>
              <div className="goal-buttons">
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveLastGoal(true)}
                  disabled={updating || !(match.goals || []).some(g => g.team === match.home)}
                >
                  - {homeTeam.shortName}
                </button>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveLastGoal(false)}
                  disabled={updating || !(match.goals || []).some(g => g.team === match.away)}
                >
                  - {awayTeam.shortName}
                </button>
              </div>
            </div>

            {/* Goal Log */}
            {match.goals && match.goals.length > 0 && (
              <div className="admin-section">
                <label>Goal Log</label>
                <div className="goal-log">
                  {match.goals.map((goal, index) => {
                    const team = TEAMS[goal.team];
                    return (
                      <div key={index} className="goal-log-item">
                        <span className="goal-time">{index + 1}.</span>
                        <span className="goal-player">{goal.player}</span>
                        <span className="goal-team">({team?.shortName})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset */}
            <div className="admin-section">
              <button
                className="reset-btn"
                onClick={handleResetScore}
                disabled={updating}
              >
                Reset Score (0-0)
              </button>
            </div>
          </div>
        </div>
      </div>

      {showGoalModal && (
        <GoalModal
          teamId={showGoalModal === 'home' ? match.home : match.away}
          isHome={showGoalModal === 'home'}
          onSelect={(player, team) => handleGoalScored(player, team, showGoalModal === 'home')}
          onClose={() => setShowGoalModal(null)}
        />
      )}
    </>
  );
};

export default AdminModal;
