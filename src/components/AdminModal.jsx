import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { TEAMS } from '../data/teams';
import { updateMatch } from '../firebase';
import GoalModal from './GoalModal';
import './Modal.css';
import './AdminModal.css';

const AdminModal = ({ match, onClose }) => {
  const { predictions } = useApp();
  const [status, setStatus] = useState(match.status);
  const [showGoalModal, setShowGoalModal] = useState(null); // 'home' | 'away' | null
  const [updating, setUpdating] = useState(false);
  const [selectedMoM, setSelectedMoM] = useState(match.manOfTheMatch || '');

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

  const handleGoalScored = async (player, team, assist, isHome) => {
    setUpdating(true);

    const newGoal = {
      player,
      team,
      assist: assist || null,
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

  // Get predictions for this match, sorted by submission time (first entry first)
  const matchPredictions = useMemo(() => {
    return predictions
      .filter(p => p.matchId === match.id)
      .sort((a, b) => {
        const timeA = a.submittedAt?.toDate?.() || new Date(a.submittedAt);
        const timeB = b.submittedAt?.toDate?.() || new Date(b.submittedAt);
        return timeA - timeB;
      });
  }, [predictions, match.id]);

  // Track first entry per user (for "first entry wins" rule)
  const firstEntryByUser = useMemo(() => {
    const seen = new Set();
    return matchPredictions.map(pred => {
      const normalizedName = pred.userName?.toLowerCase().trim();
      const isFirst = !seen.has(normalizedName);
      seen.add(normalizedName);
      return { ...pred, isFirstEntry: isFirst };
    });
  }, [matchPredictions]);

  // Get unique goal scorers from the match
  const goalScorers = useMemo(() => {
    const scorers = {};
    (match.goals || []).forEach(goal => {
      const key = `${goal.player}-${goal.team}`;
      if (!scorers[key]) {
        scorers[key] = { player: goal.player, team: goal.team, goals: 0 };
      }
      scorers[key].goals++;
    });
    return Object.values(scorers).sort((a, b) => b.goals - a.goals);
  }, [match.goals]);

  // Handle Man of the Match selection and publish
  const handlePublishMoM = async () => {
    if (!selectedMoM) {
      alert('Please select a Man of the Match');
      return;
    }

    setUpdating(true);

    // Find valid winners (first entry per user who predicted the MoM)
    const validPredictions = firstEntryByUser.filter(
      p => p.isFirstEntry && p.predictedPlayer === selectedMoM
    );

    const winners = validPredictions.map(p => p.userName);

    await updateMatch(match.id, {
      manOfTheMatch: selectedMoM,
      momWinners: winners,
      momPublishedAt: new Date().toISOString()
    });

    setUpdating(false);
    alert(`Man of the Match: ${selectedMoM}\nWinners: ${winners.length > 0 ? winners.join(', ') : 'No correct predictions'}`);
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

            {/* Lock Predictions Toggle */}
            <div className="admin-section">
              <label>Predictions Lock (2 PM Rule)</label>
              <button
                className={`lock-btn ${match.predictionsLocked ? 'locked' : ''}`}
                onClick={async () => {
                  setUpdating(true);
                  await updateMatch(match.id, { predictionsLocked: !match.predictionsLocked });
                  setUpdating(false);
                }}
                disabled={updating}
              >
                {match.predictionsLocked ? '🔒 Predictions Locked' : '🔓 Predictions Open'}
              </button>
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
                        {goal.assist && (
                          <span className="goal-assist">A: {goal.assist}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Man of the Match Selection (only when match is finished) */}
            {status === 'ft' && (
              <div className="admin-section mom-section">
                <label>Man of the Match</label>
                {goalScorers.length > 0 ? (
                  <>
                    <select
                      className="mom-select"
                      value={selectedMoM}
                      onChange={(e) => setSelectedMoM(e.target.value)}
                      disabled={updating || match.momPublishedAt}
                    >
                      <option value="">-- Select Man of the Match --</option>
                      {goalScorers.map(scorer => {
                        const team = TEAMS[scorer.team];
                        return (
                          <option key={`${scorer.player}-${scorer.team}`} value={scorer.player}>
                            {scorer.player} ({team?.shortName}) - {scorer.goals} goal{scorer.goals > 1 ? 's' : ''}
                          </option>
                        );
                      })}
                      <option value="referee_decision">Referee Decision (0-0 Draw)</option>
                    </select>
                    {!match.momPublishedAt ? (
                      <button
                        className="publish-btn"
                        onClick={handlePublishMoM}
                        disabled={updating || !selectedMoM}
                      >
                        Publish Winner
                      </button>
                    ) : (
                      <div className="mom-published">
                        Published: {match.manOfTheMatch}
                        {match.momWinners?.length > 0 && (
                          <span className="mom-winners">
                            Winners: {match.momWinners.join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="no-goals-msg">No goals scored yet. Add goals or select "Referee Decision".</p>
                )}
              </div>
            )}

            {/* Predictions for this match */}
            {firstEntryByUser.length > 0 && (
              <div className="admin-section">
                <label>Predictions ({firstEntryByUser.length}) - Sorted by submission time (earliest first)</label>
                <div className="predictions-log">
                  {firstEntryByUser.map((pred, index) => {
                    const submittedTime = pred.submittedAt?.toDate?.() || new Date(pred.submittedAt);
                    const timeStr = submittedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div
                        key={pred.id}
                        className={`prediction-log-item ${!pred.isFirstEntry ? 'duplicate' : ''} ${pred.predictedPlayer === selectedMoM ? 'winner' : ''}`}
                      >
                        <span className="pred-index">{index + 1}.</span>
                        <span className="pred-time">{timeStr}</span>
                        <span className="pred-user">{pred.userName}</span>
                        <span className="pred-arrow">→</span>
                        <span className="pred-player">{pred.predictedPlayer}</span>
                        {!pred.isFirstEntry && <span className="pred-dup-badge">DUP</span>}
                        {pred.isFirstEntry && pred.predictedPlayer === selectedMoM && <span className="pred-win-badge">WIN</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset Options */}
            <div className="admin-section">
              <label>Reset Options</label>
              <div className="reset-buttons">
                <button
                  className="reset-btn"
                  onClick={handleResetScore}
                  disabled={updating}
                >
                  Reset Score (0-0)
                </button>
                <button
                  className="reset-btn danger"
                  onClick={async () => {
                    if (window.confirm('Reset ALL match data? This will clear score, goals, and MoM. Predictions will remain.')) {
                      setUpdating(true);
                      await updateMatch(match.id, {
                        scoreHome: 0,
                        scoreAway: 0,
                        goals: [],
                        manOfTheMatch: null,
                        momWinners: null,
                        momPublishedAt: null,
                        status: 'upcoming',
                        predictionsLocked: false
                      });
                      setStatus('upcoming');
                      setSelectedMoM('');
                      setUpdating(false);
                    }
                  }}
                  disabled={updating}
                >
                  Reset All Match Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGoalModal && (
        <GoalModal
          teamId={showGoalModal === 'home' ? match.home : match.away}
          otherTeamId={showGoalModal === 'home' ? match.away : match.home}
          isHome={showGoalModal === 'home'}
          onSelect={(player, team, assist) => handleGoalScored(player, team, assist, showGoalModal === 'home')}
          onClose={() => setShowGoalModal(null)}
        />
      )}
    </>
  );
};

export default AdminModal;
