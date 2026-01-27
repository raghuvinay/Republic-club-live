import { useState } from 'react';
import { TEAMS } from '../data/teams';
import './Modal.css';
import './GoalModal.css';

const GoalModal = ({ teamId, otherTeamId, isHome, onSelect, onClose }) => {
  const team = TEAMS[teamId];
  const otherTeam = TEAMS[otherTeamId];
  const [selectedScorer, setSelectedScorer] = useState(null);
  const [step, setStep] = useState('scorer'); // 'scorer' | 'assist'

  if (!team) return null;

  const handleScorerSelect = (player) => {
    if (player === 'Own Goal') {
      // Own goals don't have assists
      onSelect(player, teamId, null);
    } else {
      setSelectedScorer(player);
      setStep('assist');
    }
  };

  const handleAssistSelect = (assistPlayer) => {
    onSelect(selectedScorer, teamId, assistPlayer);
  };

  // Get players from same team only for assist selection (can't assist yourself)
  const assistPlayers = (team?.players || [])
    .filter(p => p !== selectedScorer)
    .map(p => ({ name: p, team: teamId, teamName: team.shortName }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content goal-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{step === 'scorer' ? 'Who Scored?' : 'Who Assisted?'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="goal-modal-content">
          {step === 'scorer' ? (
            <>
              <div className="goal-team-header">
                <img src={team.logo} alt={team.name} className="goal-team-logo" />
                <span className="goal-team-name">{team.name}</span>
              </div>

              <div className="player-grid">
                {team.players.map(player => (
                  <button
                    key={player}
                    className="player-btn"
                    onClick={() => handleScorerSelect(player)}
                  >
                    <span className="player-initial">{player.charAt(0)}</span>
                    <span className="player-name">{player}</span>
                  </button>
                ))}

                <button
                  className="player-btn own-goal"
                  onClick={() => handleScorerSelect('Own Goal')}
                >
                  <span className="player-initial">OG</span>
                  <span className="player-name">Own Goal</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="assist-header">
                <span className="scorer-info">Goal: <strong>{selectedScorer}</strong></span>
              </div>

              <div className="player-grid assist-grid">
                <button
                  className="player-btn no-assist"
                  onClick={() => handleAssistSelect(null)}
                >
                  <span className="player-initial">-</span>
                  <span className="player-name">No Assist</span>
                </button>

                {assistPlayers.map(player => (
                  <button
                    key={`${player.name}-${player.team}`}
                    className="player-btn"
                    onClick={() => handleAssistSelect(player.name)}
                  >
                    <span className="player-initial">{player.name.charAt(0)}</span>
                    <span className="player-name">{player.name}</span>
                    <span className="player-team-tag">{player.teamName}</span>
                  </button>
                ))}
              </div>

              <button className="back-btn" onClick={() => setStep('scorer')}>
                ← Back to scorer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
